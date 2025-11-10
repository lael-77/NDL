import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

// Get database URLs from environment
const LOCAL_DATABASE_URL = process.env.LOCAL_DATABASE_URL || 'mysql://root:@localhost:3306/ndl_db';
const AIVEN_DATABASE_URL = process.env.AIVEN_DATABASE_URL || process.env.DATABASE_URL || '';

// Create a Prisma client instance with a specific database URL
// We need to set process.env.DATABASE_URL before importing/creating PrismaClient
// Since Prisma reads it at module load time, we'll create clients in separate scopes

let localPrisma, aivenPrisma;

// Create local Prisma client
(function() {
  const originalUrl = process.env.DATABASE_URL;
  process.env.DATABASE_URL = LOCAL_DATABASE_URL;
  
  // Create client - it will use LOCAL_DATABASE_URL
  localPrisma = new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });
  
  // Mark this client
  localPrisma._dbType = 'local';
  localPrisma._dbUrl = LOCAL_DATABASE_URL;
  
  // Restore (though it won't affect the already-created client)
  process.env.DATABASE_URL = originalUrl;
})();

// Create Aiven Prisma client
(function() {
  const originalUrl = process.env.DATABASE_URL;
  process.env.DATABASE_URL = AIVEN_DATABASE_URL;
  
  // Create client - it will use AIVEN_DATABASE_URL
  aivenPrisma = new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });
  
  // Mark this client
  aivenPrisma._dbType = 'aiven';
  aivenPrisma._dbUrl = AIVEN_DATABASE_URL;
  
  // Restore
  process.env.DATABASE_URL = originalUrl;
})();

// Set default DATABASE_URL for any other Prisma usage
process.env.DATABASE_URL = AIVEN_DATABASE_URL || LOCAL_DATABASE_URL;

// Database configuration
const DB_CONFIG = {
  // Primary database (default: Aiven for production, Local for development)
  primary: process.env.PRIMARY_DB || (process.env.NODE_ENV === 'production' ? 'aiven' : 'local'),
  // Enable dual database mode (access both simultaneously)
  dualMode: process.env.DUAL_DB_MODE !== 'false', // Default to true
  // Fallback mode (try primary, if fails use secondary)
  fallbackMode: process.env.DB_FALLBACK_MODE === 'true', // Default to false
};

// Get the primary database client
const getPrimaryDb = () => {
  return DB_CONFIG.primary === 'local' ? localPrisma : aivenPrisma;
};

// Get the secondary database client
const getSecondaryDb = () => {
  return DB_CONFIG.primary === 'local' ? aivenPrisma : localPrisma;
};

// Smart database router - uses primary by default, can access both
class DatabaseService {
  constructor() {
    this.primary = getPrimaryDb();
    this.secondary = getSecondaryDb();
    this.local = localPrisma;
    this.aiven = aivenPrisma;
  }

  // Get the default database (primary) - acts like a regular Prisma client
  // This allows drop-in replacement: const prisma = db;
  get profile() { return this.primary.profile; }
  get school() { return this.primary.school; }
  get team() { return this.primary.team; }
  get match() { return this.primary.match; }
  get coach() { return this.primary.coach; }
  get challenge() { return this.primary.challenge; }
  get notification() { return this.primary.notification; }
  get message() { return this.primary.message; }
  get academyProgress() { return this.primary.academyProgress; }
  get challengeSubmission() { return this.primary.challengeSubmission; }
  get arena() { return this.primary.arena; }
  get arenaApplication() { return this.primary.arenaApplication; }
  get teamMember() { return this.primary.teamMember; }
  
  // Prisma methods
  get $connect() { return this.primary.$connect.bind(this.primary); }
  get $disconnect() { return this.disconnect.bind(this); }
  get $queryRaw() { return this.primary.$queryRaw.bind(this.primary); }
  get $executeRaw() { return this.primary.$executeRaw.bind(this.primary); }
  get $transaction() { return this.primary.$transaction.bind(this.primary); }

  // Execute query on primary database (default behavior)
  async query(operation) {
    try {
      return await operation(this.primary);
    } catch (error) {
      if (DB_CONFIG.fallbackMode) {
        console.warn('Primary database query failed, trying secondary...', error.message);
        try {
          return await operation(this.secondary);
        } catch (fallbackError) {
          console.error('Both databases failed:', fallbackError);
          throw fallbackError;
        }
      }
      throw error;
    }
  }

  // Execute query on both databases and merge results
  async queryBoth(operation, mergeFn = (localResult, aivenResult) => {
    // Default: return primary result, merge with secondary if needed
    return aivenResult || localResult;
  }) {
    if (!DB_CONFIG.dualMode) {
      return await operation(this.primary);
    }

    try {
      const [localResult, aivenResult] = await Promise.allSettled([
        operation(this.local).catch(err => {
          console.warn('Local database query failed:', err.message);
          return null;
        }),
        operation(this.aiven).catch(err => {
          console.warn('Aiven database query failed:', err.message);
          return null;
        }),
      ]);

      const local = localResult.status === 'fulfilled' ? localResult.value : null;
      const aiven = aivenResult.status === 'fulfilled' ? aivenResult.value : null;

      // If both succeeded, merge results
      if (local !== null && aiven !== null) {
        return mergeFn(local, aiven);
      }

      // Return whichever succeeded
      return aiven !== null ? aiven : local;
    } catch (error) {
      console.error('Error in dual database query:', error);
      throw error;
    }
  }

  // Execute query on local database only
  async queryLocal(operation) {
    return await operation(this.local);
  }

  // Execute query on Aiven database only
  async queryAiven(operation) {
    return await operation(this.aiven);
  }

  // Write to both databases (for synchronization)
  async writeBoth(operation) {
    if (!DB_CONFIG.dualMode) {
      return await operation(this.primary);
    }

    try {
      const [localResult, aivenResult] = await Promise.allSettled([
        operation(this.local),
        operation(this.aiven),
      ]);

      // If primary (Aiven) succeeded, return its result
      if (aivenResult.status === 'fulfilled') {
        // If local also succeeded, great. If not, log warning but continue
        if (localResult.status === 'rejected') {
          console.warn('Write to local database failed, but Aiven succeeded');
        }
        return aivenResult.value;
      }

      // If only local succeeded, log warning
      if (localResult.status === 'fulfilled') {
        console.warn('Write to Aiven failed, only written to local database');
        return localResult.value;
      }

      // Both failed
      throw new Error('Write to both databases failed');
    } catch (error) {
      console.error('Error in dual database write:', error);
      throw error;
    }
  }

  // Health check for both databases
  async healthCheck() {
    const health = {
      local: { status: 'unknown', error: null, url: LOCAL_DATABASE_URL.replace(/:[^:@]+@/, ':****@') },
      aiven: { status: 'unknown', error: null, url: AIVEN_DATABASE_URL.replace(/:[^:@]+@/, ':****@') },
      primary: DB_CONFIG.primary,
      dualMode: DB_CONFIG.dualMode,
    };

    try {
      await this.local.$queryRaw`SELECT 1`;
      health.local.status = 'connected';
    } catch (error) {
      health.local.status = 'disconnected';
      health.local.error = error.message;
    }

    try {
      await this.aiven.$queryRaw`SELECT 1`;
      health.aiven.status = 'connected';
    } catch (error) {
      health.aiven.status = 'disconnected';
      health.aiven.error = error.message;
    }

    return health;
  }

  // Disconnect both databases
  async disconnect() {
    await Promise.allSettled([
      this.local.$disconnect(),
      this.aiven.$disconnect(),
    ]);
  }
}

// Create singleton instance
const db = new DatabaseService();

// Export the database service
export default db;

// Export individual clients for direct access if needed
export { localPrisma, aivenPrisma };

// Export as 'prisma' for backward compatibility
// This allows: import prisma from './services/database.js'
export const prisma = db;

// For direct model access: db.profile.findMany() works just like prisma.profile.findMany()
// The db object proxies all Prisma model methods to the primary database
