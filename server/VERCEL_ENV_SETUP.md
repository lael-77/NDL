# Setting Up Environment Variables in Vercel for Aiven MySQL

This guide explains how to configure your Aiven MySQL database connection in Vercel.

## Your Aiven Connection String

Use this connection string format (replace `<YOUR_AIVEN_PASSWORD>` with your actual password):

```
mysql://avnadmin:<YOUR_AIVEN_PASSWORD>@ndldb-ndldb.k.aivencloud.com:24600/defaultdb?ssl-mode=REQUIRED
```

## Step 1: Add Environment Variable in Vercel

1. **Go to your Vercel Dashboard**
   - Visit [vercel.com/dashboard](https://vercel.com/dashboard)
   - Select your project

2. **Navigate to Settings**
   - Click on your project
   - Go to **Settings** → **Environment Variables**

3. **Add the DATABASE_URL Variable**
   - Click **Add New**
   - **Key**: `DATABASE_URL`
   - **Value**: 
     ```
     mysql://avnadmin:<YOUR_AIVEN_PASSWORD>@ndldb-ndldb.k.aivencloud.com:24600/defaultdb?ssl-mode=REQUIRED
     ```
   - **Important**: Replace `<YOUR_AIVEN_PASSWORD>` with your actual Aiven database password
   - **Environment**: Select all three:
     - ☑ Production
     - ☑ Preview
     - ☑ Development
   - Click **Save**

## Step 2: Add Other Required Variables

**NODE_ENV**
- Key: `NODE_ENV`
- Value: `production`
- Environment: Production only

**JWT_SECRET**
- Key: `JWT_SECRET`
- Value: Generate a secure random string
- Environment: All

**CLIENT_URL**
- Key: `CLIENT_URL`
- Value: Your frontend URL (e.g., `https://your-frontend.vercel.app`)
- Environment: All

## Step 3: Redeploy Your Application

After adding environment variables:

1. Go to **Deployments** tab
2. Click the **⋯** (three dots) on the latest deployment
3. Select **Redeploy**
4. Or push a new commit to trigger automatic deployment

## Step 4: Test the Connection

After deployment, test your database connection:

1. Visit: `https://your-app.vercel.app/api/test-db`
2. You should see a JSON response with database information

**📋 For detailed verification steps, see `VERIFY_VERCEL_SETUP.md`**

## Local Development Setup

Create a `.env` file in the `server/` directory:

```env
DATABASE_URL=mysql://avnadmin:<YOUR_AIVEN_PASSWORD>@ndldb-ndldb.k.aivencloud.com:24600/defaultdb?ssl-mode=REQUIRED
NODE_ENV=development
JWT_SECRET=your_local_jwt_secret
CLIENT_URL=http://localhost:5173
```

**Important**: Never commit the `.env` file to git. It's already in `.gitignore`.

## Troubleshooting

### Error: "DATABASE_URL is not set"
- Make sure you added `DATABASE_URL` in Vercel Environment Variables
- Verify it's enabled for the correct environment

### Error: "ER_ACCESS_DENIED_ERROR"
- Check that your password in the connection string is correct
- Verify the username is `avnadmin`

### Error: "ENOTFOUND" or "ETIMEDOUT"
- Verify the hostname and port in your connection string
- Check that your Aiven service is running

### Connection works locally but not on Vercel
- Double-check the environment variable is set in Vercel (not just `.env.local`)
- Make sure you redeployed after adding the variable
- Check Vercel deployment logs for specific error messages
