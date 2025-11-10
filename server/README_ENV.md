# Environment Variables Setup

## Overview

This project supports two database configurations:
1. **Local Development** - Uses local MySQL database
2. **Production (Aiven)** - Uses Aiven MySQL cloud database

## File Structure

- `.env` - Production environment (Aiven MySQL) - **DO NOT COMMIT**
- `.env.local` - Local development environment - **DO NOT COMMIT**
- `.env.example` - Example template for production
- `.env.local.example` - Example template for local development

## Setup Instructions

### For Local Development

1. Copy `.env.local.example` to `.env.local`:
   ```bash
   cp .env.local.example .env.local
   ```

2. Update `.env.local` with your local MySQL credentials:
   ```env
   DATABASE_URL="mysql://root:@localhost:3306/ndl_db"
   PORT=3001
   NODE_ENV=development
   JWT_SECRET=local-development-secret-key
   CLIENT_URL=http://localhost:8080
   ```

3. Start your local MySQL server (XAMPP, MySQL, etc.)

4. Run the server:
   ```bash
   npm run dev
   ```

### For Production (Aiven)

1. Run the setup script:
   ```powershell
   .\setup-aiven-env.ps1
   ```

   This will update `.env` with Aiven MySQL credentials.

2. Or manually update `.env`:
   ```env
   DATABASE_URL="mysql://avnadmin:YOUR_AIVEN_PASSWORD@ndldb-ndldb.k.aivencloud.com:24600/defaultdb?ssl=true"
   PORT=3001
   NODE_ENV=production
   JWT_SECRET=your-production-secret-key
   CLIENT_URL=https://your-frontend-app.vercel.app
   ```

## Environment Variable Priority

The application will use environment variables in this order:
1. System environment variables (highest priority)
2. `.env.local` (for local development)
3. `.env` (for production)

## Switching Between Local and Production

### Use Local Database
1. Make sure `.env.local` exists with local MySQL settings
2. The application will automatically use `.env.local` if it exists

### Use Aiven Database
1. Run `.\setup-aiven-env.ps1` to update `.env` with Aiven credentials
2. Or manually update `.env` with Aiven connection string
3. Remove or rename `.env.local` if you want to use production settings

## For Vercel Deployment

Vercel uses environment variables set in the Vercel dashboard, not `.env` files.

1. Go to Vercel project → Settings → Environment Variables
2. Add all required variables (see `vercel-env-setup.md`)
3. Deploy - Vercel will use the environment variables from the dashboard

## Security Notes

- ⚠️ Never commit `.env` or `.env.local` files to git
- ⚠️ Use different `JWT_SECRET` for local and production
- ⚠️ Keep database passwords secure
- ⚠️ Use `.env.example` files as templates only (no real credentials)

## Current Configuration

To check which database you're currently using:
```bash
# Check .env file
cat .env | grep DATABASE_URL

# Check .env.local file (if exists)
cat .env.local | grep DATABASE_URL
```

## Troubleshooting

### Connection Refused
- **Local**: Check if MySQL is running (XAMPP, MySQL service)
- **Aiven**: Verify database is running in Aiven console

### Wrong Database
- Check which `.env` file is being used
- Verify `DATABASE_URL` in the active `.env` file
- Restart the server after changing `.env` files

