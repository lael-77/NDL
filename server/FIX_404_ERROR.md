# Fixing 404 Error for /api/test-db on Vercel

If you're seeing a 404 error for `/api/test-db` in Vercel logs, follow these steps:

## Issue: Route Not Found (404)

The route exists in your code but Vercel can't find it. This usually means:

1. **Vercel project root directory is not set correctly**
2. **Latest code hasn't been deployed**
3. **Build configuration issue**

## Solution Steps

### Step 1: Verify Vercel Project Root Directory

1. **Go to Vercel Dashboard**
   - Visit [vercel.com/dashboard](https://vercel.com/dashboard)
   - Select your project (`ndl1`)

2. **Check Root Directory Setting**
   - Go to **Settings** → **General**
   - Scroll down to **Root Directory**
   - **It should be set to:** `server`
   - If it's empty or set to something else, change it to `server`

3. **Save and Redeploy**
   - After changing the root directory, Vercel will prompt you to redeploy
   - Click **Redeploy** or push a new commit

### Step 2: Verify vercel.json Location

Make sure `vercel.json` is in the `server/` directory:

```
NDL-main/
└── server/
    ├── vercel.json          ← Should be here
    ├── package.json
    └── src/
        └── index.js
```

### Step 3: Check Build Configuration

1. **Go to Settings → General**
2. **Verify Build Settings:**
   - **Framework Preset:** Other (or leave empty)
   - **Root Directory:** `server`
   - **Build Command:** `npm run build` (or leave empty)
   - **Output Directory:** (leave empty - serverless)
   - **Install Command:** `npm install`

### Step 4: Force a New Deployment

1. **Option A: Redeploy from Dashboard**
   - Go to **Deployments** tab
   - Click **⋯** (three dots) on latest deployment
   - Click **Redeploy**

2. **Option B: Push a New Commit**
   ```bash
   # Make a small change (like adding a comment)
   git commit --allow-empty -m "Trigger Vercel redeploy"
   git push
   ```

### Step 5: Check Deployment Logs

1. **Go to Deployments** tab
2. **Click on the latest deployment**
3. **Check Build Logs:**
   - Look for: `✅ [Server] Test DB routes mounted at /api/test-db`
   - If you see this, the route is registered
   - If you don't see it, the code might not be deployed

4. **Check Function Logs:**
   - Look for any errors during function initialization
   - Check for import errors or missing dependencies

### Step 6: Verify Route Registration

Check that the route is actually in your code:

1. **Verify `server/src/index.js` contains:**
   ```javascript
   import testDbRoutes from './routes/test-db.js';
   // ...
   app.use('/api/test-db', testDbRoutes);
   ```

2. **Verify `server/src/routes/test-db.js` exists**

## Quick Fix Checklist

- [ ] Root Directory is set to `server` in Vercel Settings
- [ ] `vercel.json` exists in `server/` directory
- [ ] Latest code is pushed to GitHub
- [ ] Latest deployment completed successfully
- [ ] Build logs show route registration
- [ ] No errors in function logs

## Alternative: Check if Routes Are Working

Test other routes to see if it's a general routing issue:

- `https://ndl1.vercel.app/` - Should show API info
- `https://ndl1.vercel.app/health` - Should show health check
- `https://ndl1.vercel.app/api/test-db` - Should show database test

If `/` and `/health` work but `/api/test-db` doesn't, it's a route-specific issue.

## Still Getting 404?

If you've tried everything above and still get 404:

1. **Check Vercel Function Logs** for runtime errors
2. **Verify the route file exists** in the deployed code
3. **Check if there's a typo** in the route path
4. **Try accessing via different method:**
   ```bash
   curl https://ndl1.vercel.app/api/test-db
   ```

## Expected Behavior After Fix

Once fixed, visiting `https://ndl1.vercel.app/api/test-db` should return:

```json
{
  "success": true,
  "message": "Database connection successful!",
  "data": { ... }
}
```

Or if DATABASE_URL is not set:

```json
{
  "success": false,
  "error": "DATABASE_URL or AIVEN_DATABASE_URL not set in environment variables"
}
```

Both responses mean the route is working (404 means route not found at all).

