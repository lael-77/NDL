# Deploying NDL Server to Vercel with Aiven MySQL

This guide walks you through deploying the NDL backend server to Vercel with Aiven MySQL database.

## Prerequisites

1. ✅ Aiven MySQL database configured (already set up)
2. ✅ Vercel account
3. ✅ GitHub repository with your code

## Step 1: Prepare Your Repository

Make sure your code is pushed to GitHub and includes:
- `server/` directory with all backend code
- `server/vercel.json` configuration file
- `server/package.json` with build scripts

## Step 2: Create Vercel Project

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **Add New Project**
3. Import your GitHub repository
4. Configure the project:
   - **Root Directory**: `server` (important!)
   - **Framework Preset**: Other
   - **Build Command**: `npm run build`
   - **Output Directory**: Leave empty (server-side only)
   - **Install Command**: `npm install`

## Step 3: Configure Environment Variables

In your Vercel project settings, add these environment variables:

### Required Variables

```bash
# Database Connection (Aiven MySQL)
DATABASE_URL=mysql://avnadmin:YOUR_AIVEN_PASSWORD@ndldb-ndldb.k.aivencloud.com:24600/defaultdb?ssl=true

# Server Configuration
PORT=3001
NODE_ENV=production

# Client URL (Update with your frontend Vercel URL)
CLIENT_URL=https://your-frontend-app.vercel.app

# JWT Secret (Generate a secure random string)
JWT_SECRET=your_secure_random_string_here
```

### How to Add Environment Variables

1. Go to your Vercel project → **Settings** → **Environment Variables**
2. Add each variable:
   - **Key**: `DATABASE_URL`
   - **Value**: `mysql://avnadmin:YOUR_AIVEN_PASSWORD@ndldb-ndldb.k.aivencloud.com:24600/defaultdb?ssl=true`
   - **Note**: Replace `YOUR_AIVEN_PASSWORD` with your actual Aiven database password from the Aiven console
   - **Environment**: Select `Production`, `Preview`, and `Development`
3. Repeat for all variables

## Step 4: Run Database Migrations

Before your first deployment, run Prisma migrations:

### Option 1: Using Vercel CLI (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Link your project
cd server
vercel link

# Pull environment variables
vercel env pull .env

# Run migrations
npx prisma migrate deploy
```

### Option 2: Using Vercel Build Command

Add to your `package.json`:

```json
{
  "scripts": {
    "build": "prisma generate && prisma migrate deploy"
  }
}
```

This will run migrations automatically on each deployment.

## Step 5: Deploy

1. Push your code to GitHub
2. Vercel will automatically deploy
3. Check deployment logs for any errors
4. Test your API endpoints

## Step 6: Configure Custom Domain (Optional)

1. Go to your Vercel project → **Settings** → **Domains**
2. Add your custom domain
3. Update `CLIENT_URL` environment variable with your domain

## Step 7: Update Frontend API URL

Update your frontend to point to the Vercel backend URL:

1. Go to your frontend Vercel project
2. Add environment variable:
   ```
   VITE_API_BASE_URL=https://your-backend-app.vercel.app/api
   ```
3. Redeploy frontend

## Troubleshooting

### Database Connection Errors

- ✅ Verify `DATABASE_URL` is correct in Vercel environment variables
- ✅ Check that Aiven database is running
- ✅ Ensure SSL is enabled (`?ssl=true` in connection string)
- ✅ Verify database credentials are correct

### Migration Errors

- ✅ Run `prisma generate` before migrations
- ✅ Check that Prisma schema is up to date
- ✅ Verify database permissions

### Build Errors

- ✅ Check that `vercel.json` is in the `server/` directory
- ✅ Verify `package.json` has a `build` script
- ✅ Check Vercel build logs for specific errors

### CORS Errors

- ✅ Update `CLIENT_URL` environment variable with your frontend URL
- ✅ Check that CORS is configured in `src/index.js`

## Environment Variables Reference

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | Aiven MySQL connection string | `mysql://user:pass@host:port/db?ssl=true` |
| `PORT` | Server port | `3001` |
| `NODE_ENV` | Environment | `production` |
| `CLIENT_URL` | Frontend URL for CORS | `https://your-app.vercel.app` |
| `JWT_SECRET` | JWT signing secret | Random secure string |

## Security Best Practices

1. ⚠️ Never commit `.env` files to git
2. ⚠️ Use strong, random `JWT_SECRET`
3. ⚠️ Enable Vercel's environment variable protection
4. ⚠️ Use different secrets for production and development
5. ⚠️ Regularly rotate database passwords
6. ⚠️ Enable Aiven database backups

## Monitoring

1. Check Vercel deployment logs
2. Monitor Aiven database metrics
3. Set up error tracking (e.g., Sentry)
4. Monitor API response times

## Support

- [Vercel Documentation](https://vercel.com/docs)
- [Aiven MySQL Documentation](https://docs.aiven.io/docs/products/mysql)
- [Prisma Documentation](https://www.prisma.io/docs)

## Next Steps

1. ✅ Database connection is working
2. ✅ Environment variables configured
3. ⏭️ Deploy to Vercel
4. ⏭️ Run database migrations
5. ⏭️ Update frontend API URL
6. ⏭️ Test all endpoints
7. ⏭️ Set up monitoring

