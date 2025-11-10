# Dual Database Setup - Access Both Local and Aiven Simultaneously

## Overview

The system now supports accessing both Local MySQL and Aiven MySQL databases **simultaneously** without needing to switch between them. Both databases are always connected and available.

## How It Works

1. **Dual Prisma Clients**: Two separate Prisma Client instances are created:
   - `localPrisma` - Connected to local MySQL database
   - `aivenPrisma` - Connected to Aiven MySQL database

2. **Database Service**: A unified `DatabaseService` provides:
   - Primary database (default: Aiven for production, Local for development)
   - Direct access to both databases
   - Smart query routing
   - Dual database queries (query both at once)

3. **Drop-in Replacement**: The service acts as a drop-in replacement for PrismaClient, so existing code continues to work.

## Configuration

### Environment Variables

Add these to your `.env` file:

```env
# Local Database (Development)
LOCAL_DATABASE_URL="mysql://root:@localhost:3306/ndl_db"

# Aiven Database (Production)
AIVEN_DATABASE_URL="mysql://avnadmin:YOUR_AIVEN_PASSWORD@ndldb-ndldb.k.aivencloud.com:24600/defaultdb?ssl=true"
# Note: Replace YOUR_AIVEN_PASSWORD with your actual Aiven database password

# Primary Database (which one to use by default)
PRIMARY_DB=aiven  # or "local"

# Dual Database Mode (access both simultaneously)
DUAL_DB_MODE=true  # Set to "false" to disable dual mode

# Fallback Mode (try primary, if fails use secondary)
DB_FALLBACK_MODE=false  # Set to "true" to enable fallback
```

## Usage

### Basic Usage (Primary Database)

```javascript
import db from './services/database.js';

// Works exactly like PrismaClient
const users = await db.profile.findMany();
const teams = await db.team.findMany();
```

### Query Local Database Only

```javascript
import db from './services/database.js';

const localUsers = await db.queryLocal(async (prisma) => {
  return await prisma.profile.findMany();
});
```

### Query Aiven Database Only

```javascript
import db from './services/database.js';

const aivenUsers = await db.queryAiven(async (prisma) => {
  return await prisma.profile.findMany();
});
```

### Query Both Databases Simultaneously

```javascript
import db from './services/database.js';

// Query both and merge results
const allUsers = await db.queryBoth(
  async (prisma) => {
    return await prisma.profile.findMany();
  },
  (localResult, aivenResult) => {
    // Merge results (e.g., combine arrays, deduplicate, etc.)
    const combined = [...(localResult || []), ...(aivenResult || [])];
    // Remove duplicates by email
    const unique = Array.from(
      new Map(combined.map(user => [user.email, user])).values()
    );
    return unique;
  }
);
```

### Write to Both Databases

```javascript
import db from './services/database.js';

// Write to both databases (synchronization)
await db.writeBoth(async (prisma) => {
  return await prisma.profile.create({
    data: {
      email: 'user@example.com',
      fullName: 'Test User',
      role: 'player',
    },
  });
});
```

### Health Check

```javascript
import db from './services/database.js';

const health = await db.healthCheck();
console.log(health);
// {
//   local: { status: 'connected', error: null },
//   aiven: { status: 'connected', error: null },
//   primary: 'aiven',
//   dualMode: true
// }
```

## Migration Guide

### Step 1: Update Imports

**Before:**
```javascript
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
```

**After:**
```javascript
import db from './services/database.js';
// or
import { prisma } from './services/database.js';
```

### Step 2: Update Code (Minimal Changes)

The database service is a drop-in replacement, so most code doesn't need changes:

**Before:**
```javascript
const users = await prisma.profile.findMany();
```

**After:**
```javascript
const users = await db.profile.findMany();
// or (same thing)
const users = await prisma.profile.findMany();
```

### Step 3: Test

Run the test script:
```bash
node test-dual-db.js
```

## API Endpoints

### Health Check

```bash
GET /health
```

Returns:
```json
{
  "status": "ok",
  "message": "NDL Server is running",
  "databases": {
    "local": {
      "status": "connected",
      "error": null,
      "url": "mysql://root:****@localhost:3306/ndl_db"
    },
    "aiven": {
      "status": "connected",
      "error": null,
      "url": "mysql://avnadmin:****@ndldb-ndldb.k.aivencloud.com:24600/defaultdb?ssl=true"
    },
    "primary": "aiven",
    "dualMode": true
  }
}
```

## Benefits

1. ✅ **No Switching Required**: Both databases are always available
2. ✅ **Zero Downtime**: If one database fails, the other can be used
3. ✅ **Data Synchronization**: Write to both databases simultaneously
4. ✅ **Development Flexibility**: Test with local, deploy with Aiven
5. ✅ **Backward Compatible**: Existing code works without changes

## Use Cases

### 1. Development with Local, Production with Aiven
- Local database for fast development
- Aiven database for production
- Both available simultaneously

### 2. Data Synchronization
- Write to both databases
- Keep local and cloud in sync
- Backup and redundancy

### 3. Fallback Mode
- Primary database fails? Automatically use secondary
- High availability
- Zero downtime

### 4. Data Aggregation
- Query both databases
- Merge results
- Aggregate data from multiple sources

## Troubleshooting

### Both Databases Not Connecting

1. Check `.env` file has both `LOCAL_DATABASE_URL` and `AIVEN_DATABASE_URL`
2. Verify MySQL is running locally
3. Verify Aiven database is running
4. Check network connection for Aiven

### Primary Database Not Working

1. Check `PRIMARY_DB` environment variable
2. Verify the specified database is accessible
3. Enable fallback mode: `DB_FALLBACK_MODE=true`

### Performance Issues

1. Disable dual mode if not needed: `DUAL_DB_MODE=false`
2. Use primary database only for reads
3. Use dual mode only when necessary

## Testing

Run the test script:
```bash
node test-dual-db.js
```

This will test:
- ✅ Health check
- ✅ Primary database query
- ✅ Local database query
- ✅ Aiven database query
- ✅ Dual database query
- ✅ Model access

## Next Steps

1. ✅ Both databases are configured
2. ✅ Database service is created
3. ⏭️ Update controllers to use new database service (optional)
4. ⏭️ Test with your application
5. ⏭️ Deploy to production

## Notes

- The database service maintains connections to both databases
- Queries are routed to the primary database by default
- Both databases must have the same schema for best results
- Local database is optional (system works with just Aiven)
- Aiven database is optional (system works with just local)

