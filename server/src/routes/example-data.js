/**
 * Example Express API Route using MySQL Connection Utility
 * 
 * This demonstrates server-side data fetching with secure Aiven MySQL connection.
 * 
 * Endpoints:
 *   GET /api/example-data/users - Get all users
 *   GET /api/example-data/users/:id - Get user by ID
 *   POST /api/example-data/users - Create new user
 */

import express from 'express';
import db from '../utils/db.js';

const router = express.Router();

/**
 * GET /api/example-data/users
 * Fetch all users from the database (server-side only)
 */
router.get('/users', async (req, res) => {
  let connection = null;
  
  try {
    // Get connection from pool
    connection = await db.getConnection();
    
    // Execute query - all data fetching happens server-side
    const [rows] = await connection.execute(
      'SELECT id, email, full_name, role, created_at FROM profiles LIMIT 100'
    );
    
    res.json({
      success: true,
      count: rows.length,
      data: rows
    });
    
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      code: error.code
    });
  } finally {
    // Always release connection back to pool
    if (connection) {
      await connection.release();
    }
  }
});

/**
 * GET /api/example-data/users/:id
 * Fetch a single user by ID
 */
router.get('/users/:id', async (req, res) => {
  let connection = null;
  
  try {
    const { id } = req.params;
    connection = await db.getConnection();
    
    // Use parameterized query to prevent SQL injection
    const [rows] = await connection.execute(
      'SELECT id, email, full_name, role, created_at FROM profiles WHERE id = ?',
      [id]
    );
    
    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }
    
    res.json({
      success: true,
      data: rows[0]
    });
    
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  } finally {
    if (connection) {
      await connection.release();
    }
  }
});

/**
 * POST /api/example-data/users
 * Create a new user (example - adjust fields as needed)
 */
router.post('/users', async (req, res) => {
  let connection = null;
  
  try {
    const { email, fullName, role } = req.body;
    
    if (!email || !fullName) {
      return res.status(400).json({
        success: false,
        error: 'Email and fullName are required'
      });
    }
    
    connection = await db.getConnection();
    
    // Insert new user
    const [result] = await connection.execute(
      'INSERT INTO profiles (email, full_name, role) VALUES (?, ?, ?)',
      [email, fullName, role || 'player']
    );
    
    // Fetch the created user
    const [rows] = await connection.execute(
      'SELECT id, email, full_name, role, created_at FROM profiles WHERE id = ?',
      [result.insertId]
    );
    
    res.status(201).json({
      success: true,
      data: rows[0]
    });
    
  } catch (error) {
    console.error('Error creating user:', error);
    
    // Handle duplicate email error
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({
        success: false,
        error: 'Email already exists'
      });
    }
    
    res.status(500).json({
      success: false,
      error: error.message
    });
  } finally {
    if (connection) {
      await connection.release();
    }
  }
});

/**
 * GET /api/example-data/test
 * Test database connection
 */
router.get('/test', async (req, res) => {
  try {
    const result = await db.testConnection();
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;

