# How to Switch Between Local and Aiven Database

Your `.env` file now contains both database configurations. Here's how to switch between them.

## Current Configuration

The `.env` file includes:
- **LOCAL_DATABASE_URL** - For local MySQL development
- **AIVEN_DATABASE_URL** - For Aiven MySQL production
- **DATABASE_URL** - The active database (currently set to Aiven)

## Switch to Local Database

1. Open `.env` file
2. Find the `DATABASE_URL` line (near the bottom)
3. Change it to:
   ```env
   DATABASE_URL="mysql://root:@localhost:3306/ndl_db"
   ```
4. Save the file
5. Restart your server

## Switch to Aiven Database

1. Open `.env` file
2. Find the `DATABASE_URL` line (near the bottom)
3. Change it to:
   ```env
   DATABASE_URL="mysql://avnadmin:YOUR_AIVEN_PASSWORD@ndldb-ndldb.k.aivencloud.com:24600/defaultdb?ssl=true"
   ```
4. Save the file
5. Restart your server

## Quick Reference

### Local Database (Development)
```env
DATABASE_URL="mysql://root:@localhost:3306/ndl_db"
```
- **Use when**: Developing locally
- **Requires**: Local MySQL server running (XAMPP, MySQL, etc.)
- **Database**: `ndl_db`

### Aiven Database (Production)
```env
DATABASE_URL="mysql://avnadmin:YOUR_AIVEN_PASSWORD@ndldb-ndldb.k.aivencloud.com:24600/defaultdb?ssl=true"
```
**Note**: Replace `YOUR_AIVEN_PASSWORD` with your actual Aiven database password from the Aiven console.

- **Use when**: Testing with production database or deploying
- **Requires**: Internet connection, Aiven database running
- **Database**: `defaultdb`
- **SSL**: Enabled

## Verify Current Database

To check which database you're currently using:
```bash
# Windows PowerShell
Get-Content .env | Select-String "DATABASE_URL="

# Or check the server logs when it starts
```

## Testing the Connection

### Test Local Database
```bash
# Make sure MySQL is running locally
# Update DATABASE_URL to local
# Then test:
node test-connection.js
```

### Test Aiven Database
```bash
# Make sure you have internet connection
# Update DATABASE_URL to Aiven
# Then test:
node test-connection.js
```

## For Vercel Deployment

When deploying to Vercel, set the `DATABASE_URL` environment variable in Vercel dashboard to the Aiven connection string. Vercel will use that instead of the `.env` file.

## Troubleshooting

### Local Database Connection Failed
- ✅ Check if MySQL is running (XAMPP Control Panel, MySQL service)
- ✅ Verify database `ndl_db` exists
- ✅ Check username and password in `LOCAL_DATABASE_URL`
- ✅ Verify port 3306 is not blocked

### Aiven Database Connection Failed
- ✅ Check internet connection
- ✅ Verify Aiven database is running (Aiven console)
- ✅ Check credentials in `AIVEN_DATABASE_URL`
- ✅ Verify SSL is enabled (`?ssl=true`)

### Server Not Connecting
- ✅ Restart server after changing `DATABASE_URL`
- ✅ Check server logs for connection errors
- ✅ Verify `DATABASE_URL` is correctly formatted
- ✅ Ensure no extra spaces or quotes in the connection string

## Quick Switch Script

You can also create a simple script to switch databases:

### Switch to Local
```powershell
# In PowerShell
(Get-Content .env) -replace 'DATABASE_URL=".*"', 'DATABASE_URL="mysql://root:@localhost:3306/ndl_db"' | Set-Content .env
```

### Switch to Aiven
```powershell
# In PowerShell
(Get-Content .env) -replace 'DATABASE_URL=".*"', 'DATABASE_URL="mysql://avnadmin:YOUR_AIVEN_PASSWORD@ndldb-ndldb.k.aivencloud.com:24600/defaultdb?ssl=true"' | Set-Content .env
```

## Notes

- ⚠️ Always restart the server after changing `DATABASE_URL`
- ⚠️ Never commit `.env` file to git
- ⚠️ Keep database passwords secure
- ⚠️ Use local database for development to avoid charges
- ⚠️ Use Aiven database for production and testing

