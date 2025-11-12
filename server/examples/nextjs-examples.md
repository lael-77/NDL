# Next.js Examples for Aiven MySQL Connection

These examples show how to use the MySQL connection utility in a Next.js application.

## Prerequisites

1. Install dependencies:
```bash
npm install mysql2
```

2. Copy the database utility to your Next.js project:
   - Copy `server/src/utils/db.js` to `lib/db.js` in your Next.js project

## Example 1: Server-Side Rendering (getServerSideProps)

### pages/users.js

```javascript
import db from '../lib/db';

export default function UsersPage({ users, error }) {
  if (error) {
    return (
      <div>
        <h1>Error</h1>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div>
      <h1>Users</h1>
      <ul>
        {users.map((user) => (
          <li key={user.id}>
            {user.full_name} ({user.email}) - {user.role}
          </li>
        ))}
      </ul>
    </div>
  );
}

// Server-side data fetching - runs on the server, never exposed to client
export async function getServerSideProps(context) {
  let connection = null;
  
  try {
    // Get connection from pool
    connection = await db.getConnection();
    
    // Execute query - this happens on the server only
    const [rows] = await connection.execute(
      'SELECT id, email, full_name, role, created_at FROM profiles LIMIT 100'
    );
    
    return {
      props: {
        users: rows,
      },
    };
  } catch (error) {
    console.error('Error fetching users:', error);
    
    return {
      props: {
        users: [],
        error: error.message,
      },
    };
  } finally {
    // Always release connection
    if (connection) {
      await connection.release();
    }
  }
}
```

## Example 2: API Route

### pages/api/users.js

```javascript
import db from '../../lib/db';

export default async function handler(req, res) {
  // Only allow GET and POST methods
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  let connection = null;

  try {
    connection = await db.getConnection();

    if (req.method === 'GET') {
      // Fetch all users
      const [rows] = await connection.execute(
        'SELECT id, email, full_name, role, created_at FROM profiles LIMIT 100'
      );

      return res.status(200).json({
        success: true,
        count: rows.length,
        data: rows,
      });
    }

    if (req.method === 'POST') {
      // Create new user
      const { email, fullName, role } = req.body;

      if (!email || !fullName) {
        return res.status(400).json({
          success: false,
          error: 'Email and fullName are required',
        });
      }

      const [result] = await connection.execute(
        'INSERT INTO profiles (email, full_name, role) VALUES (?, ?, ?)',
        [email, fullName, role || 'player']
      );

      // Fetch the created user
      const [rows] = await connection.execute(
        'SELECT id, email, full_name, role, created_at FROM profiles WHERE id = ?',
        [result.insertId]
      );

      return res.status(201).json({
        success: true,
        data: rows[0],
      });
    }
  } catch (error) {
    console.error('Database error:', error);

    // Handle duplicate email
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({
        success: false,
        error: 'Email already exists',
      });
    }

    return res.status(500).json({
      success: false,
      error: error.message,
    });
  } finally {
    if (connection) {
      await connection.release();
    }
  }
}
```

## Example 3: Using the Query Helper

### pages/api/users-simple.js

```javascript
import db from '../../lib/db';

export default async function handler(req, res) {
  try {
    // Use the query helper - automatically manages connections
    const users = await db.query(
      'SELECT id, email, full_name, role FROM profiles LIMIT 100'
    );

    return res.status(200).json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (error) {
    console.error('Database error:', error);
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}
```

## Example 4: Dynamic Route with Parameter

### pages/api/users/[id].js

```javascript
import db from '../../../lib/db';

export default async function handler(req, res) {
  const { id } = req.query;

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  let connection = null;

  try {
    connection = await db.getConnection();

    // Use parameterized query to prevent SQL injection
    const [rows] = await connection.execute(
      'SELECT id, email, full_name, role, created_at FROM profiles WHERE id = ?',
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
      });
    }

    return res.status(200).json({
      success: true,
      data: rows[0],
    });
  } catch (error) {
    console.error('Database error:', error);
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  } finally {
    if (connection) {
      await connection.release();
    }
  }
}
```

## Important Notes

1. **Never import db utilities in client-side code** - Only use in:
   - `getServerSideProps`
   - `getStaticProps`
   - API routes (`pages/api/`)
   - Server Components (Next.js 13+ App Router)

2. **Always release connections** - Use try-finally blocks to ensure connections are returned to the pool

3. **Use parameterized queries** - Always use `?` placeholders to prevent SQL injection

4. **Environment variables** - Make sure `DATABASE_URL` is set in:
   - `.env.local` for local development
   - Vercel Environment Variables for production

