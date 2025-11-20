import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

// Get local database URL from environment
const DATABASE_URL = process.env.DATABASE_URL || process.env.LOCAL_DATABASE_URL || 'mysql://root:@localhost:3306/ndl_db';

// Create Prisma client for local database
const prismaClient = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
});

// Simple database service - uses local database only
class DatabaseService {
  constructor() {
    this.primary = prismaClient;
  }

  // Get the default database - acts like a regular Prisma client
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
  // Judge system models
  get matchJudge() { return this.primary.matchJudge; }
  get lineup() { return this.primary.lineup; }
  get autoScore() { return this.primary.autoScore; }
  get judgeScore() { return this.primary.judgeScore; }
  get playerScore() { return this.primary.playerScore; }
  get matchFeedback() { return this.primary.matchFeedback; }
  get matchTimer() { return this.primary.matchTimer; }
  get teamFeedback() { return this.primary.teamFeedback; }
  
  // Prisma methods
  get $connect() { return this.primary.$connect.bind(this.primary); }
  get $disconnect() { return this.primary.$disconnect.bind(this.primary); }
  get $queryRaw() { return this.primary.$queryRaw.bind(this.primary); }
  get $executeRaw() { return this.primary.$executeRaw.bind(this.primary); }
  get $transaction() { return this.primary.$transaction.bind(this.primary); }

  // Health check for database
  async healthCheck() {
    const health = {
      status: 'unknown',
      error: null,
      url: DATABASE_URL.replace(/:[^:@]+@/, ':****@'),
    };

    try {
      await this.primary.$queryRaw`SELECT 1`;
      health.status = 'connected';
    } catch (error) {
      health.status = 'disconnected';
      health.error = error.message;
    }

    return health;
  }

  // Disconnect database
  async disconnect() {
    await this.primary.$disconnect();
  }
}

// Create singleton instance
const db = new DatabaseService();

// Export the database service
export default db;

// Export as 'prisma' for backward compatibility
// This allows: import prisma from './services/database.js'
export const prisma = db;

// For direct model access: db.profile.findMany() works just like prisma.profile.findMany()
// The db object proxies all Prisma model methods to the local database
