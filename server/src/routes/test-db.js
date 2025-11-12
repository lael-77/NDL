import express from 'express';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();

/**
 * Test database connection endpoint
 * GET /api/test-db
 * Tests connection to Aiven database using mysql2 directly
 */
router.get('/', async (req, res) => {
  let connection = null;
  
  try {
    // Get database URL from environment
    const databaseUrl = process.env.AIVEN_DATABASE_URL || process.env.DATABASE_URL;
    
    if (!databaseUrl) {
      return res.status(500).json({ 
        success: false, 
        error: 'DATABASE_URL or AIVEN_DATABASE_URL not set in environment variables' 
      });
    }

    console.log('Testing database connection...');
    console.log('Database URL:', databaseUrl.replace(/:[^:@]+@/, ':****@')); // Hide password in logs

    // Create connection
    connection = await mysql.createConnection(databaseUrl);
    console.log('✅ Database connection established');

    // Test query - get first 5 profiles (or any table that exists)
    // Using profiles table as it's likely to have data
    const [rows] = await connection.execute("SELECT * FROM profiles LIMIT 5");
    
    console.log(`✅ Query successful. Found ${rows.length} rows`);

    // Get table info
    const [tables] = await connection.execute("SHOW TABLES");
    const tableNames = tables.map(t => Object.values(t)[0]);

    await connection.end();
    console.log('✅ Connection closed');

    res.status(200).json({ 
      success: true, 
      message: 'Database connection successful!',
      data: {
        rowCount: rows.length,
        sampleRows: rows,
        availableTables: tableNames,
        connectionInfo: {
          host: databaseUrl.match(/@([^:]+)/)?.[1] || 'hidden',
          database: databaseUrl.match(/\/([^?]+)/)?.[1] || 'hidden'
        }
      }
    });

  } catch (err) {
    console.error('❌ Database connection error:', err);
    
    // Close connection if it exists
    if (connection) {
      try {
        await connection.end();
      } catch (closeErr) {
        console.error('Error closing connection:', closeErr);
      }
    }

    // Provide detailed error information
    const errorInfo = {
      success: false,
      error: err.message,
      code: err.code,
      errno: err.errno,
      sqlState: err.sqlState,
      sqlMessage: err.sqlMessage,
    };

    // Common error codes and their meanings
    if (err.code === 'ER_ACCESS_DENIED_ERROR') {
      errorInfo.hint = 'Wrong username or password. Check your AIVEN_DATABASE_URL credentials.';
    } else if (err.code === 'ENOTFOUND' || err.code === 'ETIMEDOUT') {
      errorInfo.hint = 'Cannot reach database host. Check your AIVEN_DATABASE_URL host/port.';
    } else if (err.code === 'ER_BAD_DB_ERROR') {
      errorInfo.hint = 'Database does not exist. Check the database name in AIVEN_DATABASE_URL.';
    } else if (err.code === 'ECONNREFUSED') {
      errorInfo.hint = 'Connection refused. Check if the database server is running and accessible.';
    }

    res.status(500).json(errorInfo);
  }
});

/**
 * Test specific table query
 * GET /api/test-db/table/:tableName
 * Tests querying a specific table
 */
router.get('/table/:tableName', async (req, res) => {
  let connection = null;
  
  try {
    const { tableName } = req.params;
    const databaseUrl = process.env.AIVEN_DATABASE_URL || process.env.DATABASE_URL;
    
    if (!databaseUrl) {
      return res.status(500).json({ 
        success: false, 
        error: 'DATABASE_URL or AIVEN_DATABASE_URL not set' 
      });
    }

    connection = await mysql.createConnection(databaseUrl);
    
    // Sanitize table name to prevent SQL injection
    // Only allow alphanumeric, underscore, and dash
    if (!/^[a-zA-Z0-9_-]+$/.test(tableName)) {
      throw new Error('Invalid table name');
    }

    const [rows] = await connection.execute(`SELECT * FROM ${tableName} LIMIT 10`);
    const [columns] = await connection.execute(`DESCRIBE ${tableName}`);
    
    await connection.end();

    res.status(200).json({ 
      success: true, 
      table: tableName,
      rowCount: rows.length,
      columns: columns.map(col => col.Field),
      data: rows
    });

  } catch (err) {
    if (connection) {
      try {
        await connection.end();
      } catch (closeErr) {
        console.error('Error closing connection:', closeErr);
      }
    }

    res.status(500).json({ 
      success: false, 
      error: err.message,
      code: err.code,
      hint: err.code === 'ER_NO_SUCH_TABLE' 
        ? `Table "${req.params.tableName}" does not exist. Available tables might be: profiles, schools, teams, matches, etc.`
        : undefined
    });
  }
});

export default router;

