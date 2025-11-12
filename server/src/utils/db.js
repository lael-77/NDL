/**
 * Reusable MySQL Connection Utility for Aiven
 * 
 * This utility provides secure MySQL connections with SSL support for Aiven.
 * Works both locally (using .env.local) and on Vercel (using Environment Variables).
 * 
 * Usage:
 *   import db from './utils/db.js';
 *   const connection = await db.getConnection();
 *   const [rows] = await connection.execute('SELECT * FROM users');
 *   await connection.end();
 */

import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

/**
 * Parse DATABASE_URL and extract connection parameters
 * Supports both standard MySQL URLs and Aiven-specific formats
 */
function parseDatabaseUrl(url) {
  if (!url) {
    throw new Error('DATABASE_URL is not set in environment variables');
  }

  try {
    // Parse MySQL connection string
    // Format: mysql://user:password@host:port/database?params
    const urlPattern = /^mysql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/([^?]+)(\?.*)?$/;
    const match = url.match(urlPattern);

    if (!match) {
      throw new Error('Invalid DATABASE_URL format');
    }

    const [, user, password, host, port, database, queryString] = match;

    // Parse query parameters for SSL configuration
    const params = new URLSearchParams(queryString || '');
    const sslParam = params.get('ssl');
    const sslMode = params.get('ssl-mode');
    
    let ssl = false;
    
    // Handle SSL configuration - support multiple formats
    if (sslMode === 'REQUIRED' || sslMode === 'required') {
      // Aiven format: ssl-mode=REQUIRED
      ssl = { rejectUnauthorized: true };
    } else if (sslParam) {
      try {
        // If ssl is a JSON string, parse it
        ssl = JSON.parse(sslParam);
      } catch {
        // If it's just "true" or a simple value
        if (sslParam === 'true' || sslParam === '1') {
          ssl = { rejectUnauthorized: true };
        } else {
          ssl = { rejectUnauthorized: true };
        }
      }
    } else {
      // Default SSL for Aiven (always require SSL)
      ssl = { rejectUnauthorized: true };
    }

    return {
      host,
      port: parseInt(port, 10),
      user,
      password,
      database,
      ssl,
      // Connection pool settings
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      // Timeout settings
      connectTimeout: 10000, // 10 seconds
      // Enable keep-alive
      enableKeepAlive: true,
      keepAliveInitialDelay: 0,
    };
  } catch (error) {
    throw new Error(`Failed to parse DATABASE_URL: ${error.message}`);
  }
}

/**
 * Create a MySQL connection pool
 * This is the recommended approach for serverless environments like Vercel
 */
let pool = null;

function createPool() {
  if (pool) {
    return pool;
  }

  const databaseUrl = process.env.DATABASE_URL || process.env.AIVEN_DATABASE_URL;
  
  if (!databaseUrl) {
    throw new Error(
      'DATABASE_URL or AIVEN_DATABASE_URL must be set in environment variables'
    );
  }

  const config = parseDatabaseUrl(databaseUrl);

  pool = mysql.createPool(config);

  // Handle pool errors
  pool.on('error', (err) => {
    console.error('MySQL pool error:', err);
    if (err.code === 'PROTOCOL_CONNECTION_LOST') {
      // Recreate pool if connection is lost
      pool = null;
    }
  });

  return pool;
}

/**
 * Get a connection from the pool
 * Always use this in try-finally to ensure connection is released
 */
export async function getConnection() {
  const pool = createPool();
  return await pool.getConnection();
}

/**
 * Execute a query using the connection pool
 * This automatically handles connection management
 */
export async function query(sql, params = []) {
  const pool = createPool();
  const [rows] = await pool.execute(sql, params);
  return rows;
}

/**
 * Execute a query and return the full result (with metadata)
 */
export async function queryWithMetadata(sql, params = []) {
  const pool = createPool();
  return await pool.execute(sql, params);
}

/**
 * Test the database connection
 */
export async function testConnection() {
  try {
    const connection = await getConnection();
    await connection.execute('SELECT 1 as test');
    await connection.release();
    return { success: true, message: 'Database connection successful' };
  } catch (error) {
    return {
      success: false,
      message: error.message,
      code: error.code,
      errno: error.errno,
    };
  }
}

/**
 * Close the connection pool
 * Useful for graceful shutdown
 */
export async function closePool() {
  if (pool) {
    await pool.end();
    pool = null;
  }
}

/**
 * Get connection pool statistics
 */
export function getPoolStats() {
  if (!pool) {
    return null;
  }
  return {
    totalConnections: pool.pool._allConnections.length,
    freeConnections: pool.pool._freeConnections.length,
    queuedRequests: pool.pool._connectionQueue.length,
  };
}

// Default export: connection pool
export default {
  getConnection,
  query,
  queryWithMetadata,
  testConnection,
  closePool,
  getPoolStats,
  // Direct pool access (advanced usage)
  get pool() {
    return createPool();
  },
};
