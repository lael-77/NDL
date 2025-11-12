# Verifying Vercel Environment Variable Setup

This guide helps you verify that your Aiven MySQL connection is properly configured in Vercel.

## Step 1: Check Environment Variables in Vercel Dashboard

1. **Go to Vercel Dashboard**
   - Visit [vercel.com/dashboard](https://vercel.com/dashboard)
   - Select your project (e.g., `ndl1` or your project name)

2. **Navigate to Environment Variables**
   - Click on **Settings** (left sidebar)
   - Click on **Environment Variables** (under Configuration)

3. **Verify DATABASE_URL exists**
   - Look for `DATABASE_URL` in the list
   - Check that it's enabled for:
     - ☑ Production
     - ☑ Preview  
     - ☑ Development (optional, for preview deployments)

4. **Verify the Value Format**
   - Click on `DATABASE_URL` to view (it will show masked)
   - The format should be:
     ```
     mysql://avnadmin:YOUR_PASSWORD@ndldb-ndldb.k.aivencloud.com:24600/defaultdb?ssl-mode=REQUIRED
     ```
   - Make sure:
     - Username is `avnadmin`
     - Host is `ndldb-ndldb.k.aivencloud.com`
     - Port is `24600`
     - Database is `defaultdb`
     - Includes `?ssl-mode=REQUIRED`

## Step 2: Check Recent Deployments

1. **Go to Deployments Tab**
   - Click on **Deployments** (left sidebar)
   - Look at the latest deployment

2. **Check Deployment Status**
   - ✅ Green checkmark = Deployment successful
   - ❌ Red X = Deployment failed (check logs)

3. **View Build Logs**
   - Click on the latest deployment
   - Click on **Build Logs** or **Function Logs**
   - Look for any database connection errors

## Step 3: Test the Database Connection

### Option A: Test via API Endpoint (Recommended)

1. **Visit the test endpoint:**
   ```
   https://your-app.vercel.app/api/test-db
   ```
   Replace `your-app` with your actual Vercel app URL (e.g., `ndl1.vercel.app`)

2. **Expected Success Response:**
   ```json
   {
     "success": true,
     "message": "Database connection successful!",
     "data": {
       "rowCount": 5,
       "sampleRows": [...],
       "availableTables": ["profiles", "schools", "teams", ...],
       "connectionInfo": {
         "host": "ndldb-ndldb.k.aivencloud.com",
         "database": "defaultdb"
       }
     }
   }
   ```

3. **If You See an Error:**
   - `DATABASE_URL is not set` → Environment variable not configured
   - `ER_ACCESS_DENIED_ERROR` → Wrong password or username
   - `ENOTFOUND` → Wrong hostname
   - `ETIMEDOUT` → Network/firewall issue

### Option B: Test via Health Endpoint

1. **Visit the health endpoint:**
   ```
   https://your-app.vercel.app/health
   ```

2. **Expected Response:**
   ```json
   {
     "status": "ok",
     "message": "NDL Server is running",
     "databases": {
       "aiven": {
         "status": "connected",
         "url": "mysql://avnadmin:****@ndldb-ndldb.k.aivencloud.com:24600/defaultdb"
       }
     }
   }
   ```

## Step 4: Check Vercel Function Logs

1. **Go to Vercel Dashboard → Your Project**
2. **Click on "Functions" or "Logs" tab**
3. **Look for recent function invocations**
4. **Check for any error messages related to:**
   - Database connection
   - Environment variables
   - MySQL connection errors

## Common Issues and Solutions

### Issue 1: "DATABASE_URL is not set"

**Solution:**
1. Go to Settings → Environment Variables
2. Add `DATABASE_URL` with your connection string
3. Make sure it's enabled for Production
4. Redeploy your application

### Issue 2: "ER_ACCESS_DENIED_ERROR"

**Solution:**
1. Verify your Aiven password is correct
2. Check the username is `avnadmin`
3. Get fresh credentials from Aiven Console if needed
4. Update the environment variable and redeploy

### Issue 3: "ENOTFOUND" or "ETIMEDOUT"

**Solution:**
1. Verify the hostname: `ndldb-ndldb.k.aivencloud.com`
2. Verify the port: `24600`
3. Check that your Aiven service is running
4. Check Aiven Console for the correct connection details

### Issue 4: Connection works locally but not on Vercel

**Solution:**
1. Double-check environment variable is set in Vercel (not just `.env.local`)
2. Make sure you redeployed after adding the variable
3. Check that the variable is enabled for the correct environment
4. Verify the connection string format matches exactly

## Quick Verification Checklist

- [ ] `DATABASE_URL` exists in Vercel Environment Variables
- [ ] Environment variable is enabled for Production
- [ ] Connection string format is correct
- [ ] Latest deployment is successful (green checkmark)
- [ ] `/api/test-db` endpoint returns success
- [ ] No database errors in Vercel logs
- [ ] Health endpoint shows database as "connected"

## Testing Commands

### Using curl (if you have it installed):

```bash
# Test database connection
curl https://your-app.vercel.app/api/test-db

# Test health endpoint
curl https://your-app.vercel.app/health
```

### Using Browser:

Just visit the URLs directly:
- `https://your-app.vercel.app/api/test-db`
- `https://your-app.vercel.app/health`

## Next Steps

Once verification is complete:

1. ✅ Your app should be able to connect to Aiven MySQL
2. ✅ All API routes using the database should work
3. ✅ You can start using the database utility in your code

If you're still having issues, check:
- Vercel deployment logs
- Aiven Console to ensure database is running
- Network connectivity from Vercel to Aiven

