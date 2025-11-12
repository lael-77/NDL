# Aiven MySQL Setup Guide

This guide explains how to use the Aiven MySQL database connection in your application.

## Connection String

Your Aiven MySQL connection string format:

```
mysql://avnadmin:<YOUR_AIVEN_PASSWORD>@ndldb-ndldb.k.aivencloud.com:24600/defaultdb?ssl-mode=REQUIRED
```

**Note**: Replace `<YOUR_AIVEN_PASSWORD>` with your actual Aiven database password.

## Quick Start

### 1. Local Development

Create a `.env` file in the `server/` directory:

```env
DATABASE_URL=mysql://avnadmin:<YOUR_AIVEN_PASSWORD>@ndldb-ndldb.k.aivencloud.com:24600/defaultdb?ssl-mode=REQUIRED
NODE_ENV=development
JWT_SECRET=your_local_jwt_secret
CLIENT_URL=http://localhost:5173
```

### 2. Vercel Deployment

1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add `DATABASE_URL` with the connection string above
3. Enable for Production, Preview, and Development
4. Redeploy your application

See `VERCEL_ENV_SETUP.md` for detailed instructions.

## Using the Database Utility

### Import the Utility

```javascript
import db from './utils/db.js';
```

### Method 1: Using Connection Pool (Recommended)

```javascript
let connection = null;

try {
  // Get connection from pool
  connection = await db.getConnection();
  
  // Execute queries
  const [rows] = await connection.execute(
    'SELECT * FROM profiles WHERE id = ?',
    [userId]
  );
  
  // Always release connection
} finally {
  if (connection) {
    await connection.release();
  }
}
```

### Method 2: Using Query Helper (Simpler)

```javascript
// Automatically manages connections
const users = await db.query('SELECT * FROM profiles LIMIT 100');
```

## Example API Routes

### Express Route Example

See `server/src/routes/example-data.js` for complete examples:

```javascript
import express from 'express';
import db from '../utils/db.js';

const router = express.Router();

router.get('/users', async (req, res) => {
  let connection = null;
  
  try {
    connection = await db.getConnection();
    const [rows] = await connection.execute(
      'SELECT * FROM profiles LIMIT 100'
    );
    
    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ error: error.message });
  } finally {
    if (connection) {
      await connection.release();
    }
  }
});

export default router;
```

### Next.js API Route Example

See `server/examples/nextjs-examples.md` for Next.js examples:

```javascript
// pages/api/users.js
import db from '../../lib/db';

export default async function handler(req, res) {
  let connection = null;
  
  try {
    connection = await db.getConnection();
    const [rows] = await connection.execute(
      'SELECT * FROM profiles LIMIT 100'
    );
    
    return res.status(200).json({ success: true, data: rows });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  } finally {
    if (connection) {
      await connection.release();
    }
  }
}
```

### Next.js getServerSideProps Example

```javascript
// pages/users.js
import db from '../lib/db';

export async function getServerSideProps() {
  let connection = null;
  
  try {
    connection = await db.getConnection();
    const [rows] = await connection.execute(
      'SELECT * FROM profiles LIMIT 100'
    );
    
    return { props: { users: rows } };
  } catch (error) {
    return { props: { users: [], error: error.message } };
  } finally {
    if (connection) {
      await connection.release();
    }
  }
}
```

## Security Features

✅ **SSL/TLS Encryption**: All connections use SSL with `ssl-mode=REQUIRED`

✅ **Server-Side Only**: Database credentials never exposed to client

✅ **Connection Pooling**: Efficient connection management for serverless

✅ **Parameterized Queries**: Prevents SQL injection attacks

✅ **Environment Variables**: Credentials stored securely in Vercel

## Testing the Connection

### Test Endpoint

Visit: `https://your-app.vercel.app/api/test-db`

This will test the connection and return database information.

### Programmatic Test

```javascript
import db from './utils/db.js';

const result = await db.testConnection();
console.log(result);
// { success: true, message: 'Database connection successful' }
```

## Important Notes

1. **Never commit `.env` files** - They contain sensitive credentials
2. **Always use parameterized queries** - Use `?` placeholders, never string concatenation
3. **Always release connections** - Use try-finally blocks
4. **Server-side only** - Never import database utilities in client-side code
5. **Connection pooling** - The utility automatically manages connection pools

## Troubleshooting

### Connection Errors

- **ER_ACCESS_DENIED_ERROR**: Check username/password in connection string
- **ENOTFOUND**: Check hostname and port
- **ETIMEDOUT**: Check network connectivity and firewall settings
- **SSL errors**: Ensure `ssl-mode=REQUIRED` is in the connection string

### Vercel Deployment Issues

- Verify `DATABASE_URL` is set in Vercel Environment Variables
- Check that it's enabled for the correct environment
- Redeploy after adding environment variables
- Check Vercel deployment logs for specific errors

## Files Created

- `server/src/utils/db.js` - Reusable MySQL connection utility
- `server/src/routes/example-data.js` - Example Express API routes
- `server/src/routes/test-db.js` - Database connection test endpoint
- `server/examples/nextjs-examples.md` - Next.js usage examples
- `server/VERCEL_ENV_SETUP.md` - Vercel environment variable setup guide

## Support

For issues:
1. Check Vercel deployment logs
2. Test connection using `/api/test-db` endpoint
3. Verify environment variables are set correctly
4. Check Aiven console to ensure database is running

