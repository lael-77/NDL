// Re-export database service for easy access
// This file provides a drop-in replacement for direct PrismaClient usage

import db from '../services/database.js';

// Export the database service as the default Prisma client
// This allows existing code to work with minimal changes
export default db;

// Export as 'prisma' for backward compatibility
export const prisma = db;

// Export individual database clients
export { localPrisma, aivenPrisma } from '../services/database.js';

