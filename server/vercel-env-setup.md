# Vercel Environment Variables Setup for Aiven MySQL

This guide explains how to configure your Aiven MySQL database for Vercel deployment.

## Environment Variables for Vercel

Add these environment variables in your Vercel project settings:

### 1. Database Connection (Required)

```
DATABASE_URL=mysql://avnadmin:YOUR_AIVEN_PASSWORD@ndldb-ndldb.k.aivencloud.com:24600/defaultdb?ssl=true
```
**Note**: Replace `YOUR_AIVEN_PASSWORD` with your actual Aiven database password from the Aiven console.

### 2. Server Configuration (Required)

```
PORT=3001
NODE_ENV=production
```

### 3. Client URL (Required - Update with your frontend URL)

```
CLIENT_URL=https://your-frontend-app.vercel.app
```

### 4. JWT Secret (Required - Generate a secure random string)

```
JWT_SECRET=your_secure_random_string_here
```

## How to Add Environment Variables in Vercel

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add each variable:
   - **Key**: `DATABASE_URL`
   - **Value**: `mysql://avnadmin:YOUR_AIVEN_PASSWORD@ndldb-ndldb.k.aivencloud.com:24600/defaultdb?ssl=true`
   - **Note**: Replace `YOUR_AIVEN_PASSWORD` with your actual Aiven database password from the Aiven console
   - **Environment**: Select `Production`, `Preview`, and `Development` as needed
4. Repeat for all variables listed above

## SSL Certificate (Optional)

Aiven MySQL requires SSL connections. The connection string above includes `sslmode=REQUIRED` which should work with Prisma's MySQL connector.

If you encounter SSL certificate validation errors, you may need to:

1. Download the CA certificate from Aiven Console
2. Store it as an environment variable or in your project
3. Reference it in the connection string

However, for most cases, `sslmode=REQUIRED` should be sufficient.

## Testing the Connection

After setting up environment variables in Vercel:

1. Deploy your project
2. Check the deployment logs for any connection errors
3. Test your API endpoints

## Prisma Migrations on Vercel

For Vercel deployments, you'll need to run Prisma migrations. You can do this:

1. **Option 1**: Add a build script in `package.json`:
   ```json
   {
     "scripts": {
       "build": "prisma generate && prisma migrate deploy && node src/index.js"
     }
   }
   ```

2. **Option 2**: Use Vercel's build command:
   ```
   npx prisma generate && npx prisma migrate deploy
   ```

## Security Notes

- ⚠️ Never commit `.env` files to git
- ⚠️ Keep your database password secure
- ⚠️ Use different JWT secrets for production and development
- ⚠️ Enable Vercel's environment variable protection
- ⚠️ Use Vercel's preview deployments to test before production

## Troubleshooting

### Connection Refused
- Check that your Aiven database is running
- Verify the host, port, and credentials are correct
- Ensure your Vercel IP is whitelisted in Aiven (if IP restrictions are enabled)

### SSL Errors
- Verify `sslmode=REQUIRED` is in the connection string
- Check Aiven console for SSL certificate requirements
- Ensure Prisma client is up to date: `npm update @prisma/client`

### Authentication Errors
- Verify database username and password
- Check that the user has proper permissions
- Ensure the database name is correct

## Support

For Aiven-specific issues, refer to:
- [Aiven MySQL Documentation](https://docs.aiven.io/docs/products/mysql)
- [Aiven SSL Configuration](https://docs.aiven.io/docs/products/mysql/howto/connect-mysql-ssl)

For Prisma-specific issues, refer to:
- [Prisma MySQL Connection](https://www.prisma.io/docs/concepts/database-connectors/mysql)

