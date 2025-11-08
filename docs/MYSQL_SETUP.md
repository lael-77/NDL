# MySQL Setup Guide

## Overview

The NDL project uses MySQL as the database with Prisma ORM. This guide will help you set up MySQL for development.

## Prerequisites

- MySQL 8.0 or higher installed locally, OR
- Docker (for using MySQL in a container)

## Setup Options

### Option 1: Using Docker (Recommended)

The easiest way to set up MySQL is using Docker Compose:

```bash
# Start MySQL container
docker-compose up -d mysql

# Check if MySQL is running
docker ps
```

The MySQL container will be available at:
- Host: `localhost`
- Port: `3306`
- Database: `ndl_db`
- Username: `ndl_user`
- Password: `ndl_password`

### Option 2: Local MySQL Installation

1. **Install MySQL**
   - Download from [MySQL Official Website](https://dev.mysql.com/downloads/mysql/)
   - Or use a package manager:
     ```bash
     # Windows (using Chocolatey)
     choco install mysql
     
     # macOS (using Homebrew)
     brew install mysql
     
     # Ubuntu/Debian
     sudo apt-get install mysql-server
     ```

2. **Create Database and User**
   ```sql
   CREATE DATABASE ndl_db;
   CREATE USER 'ndl_user'@'localhost' IDENTIFIED BY 'ndl_password';
   GRANT ALL PRIVILEGES ON ndl_db.* TO 'ndl_user'@'localhost';
   FLUSH PRIVILEGES;
   ```

3. **Update .env file**
   ```env
   DATABASE_URL=mysql://ndl_user:ndl_password@localhost:3306/ndl_db
   ```

## Database Migrations

After setting up MySQL, run Prisma migrations:

```bash
cd server

# Generate Prisma Client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# Or push schema without migrations (for development)
npm run prisma:push
```

## Connection String Format

The MySQL connection string format is:
```
mysql://[username]:[password]@[host]:[port]/[database]
```

Example:
```
mysql://ndl_user:ndl_password@localhost:3306/ndl_db
```

## MySQL vs PostgreSQL Differences

### Schema Differences

1. **UUID Generation**
   - MySQL uses `UUID()` function in Prisma
   - Works the same as PostgreSQL

2. **String Types**
   - Use `@db.VarChar(255)` for shorter strings
   - Use `@db.Text` for longer text fields

3. **Enums**
   - MySQL stores enums as strings
   - Works the same way in Prisma

4. **Dates**
   - MySQL uses `DATETIME` type
   - Works seamlessly with Prisma's `DateTime`

## Troubleshooting

### Connection Issues

If you encounter connection errors:

1. **Check MySQL is running**
   ```bash
   # Docker
   docker ps | grep mysql
   
   # Local MySQL
   # Windows: Check Services
   # macOS/Linux: sudo systemctl status mysql
   ```

2. **Verify credentials**
   - Check `.env` file has correct DATABASE_URL
   - Verify username and password

3. **Check firewall/ports**
   - Ensure port 3306 is not blocked
   - For Docker, check port mapping

### Migration Issues

If migrations fail:

1. **Reset database** (⚠️ This will delete all data)
   ```bash
   cd server
   npx prisma migrate reset
   ```

2. **Push schema directly** (for development)
   ```bash
   npm run prisma:push
   ```

### Prisma Client Generation

If Prisma Client generation fails:

```bash
cd server
rm -rf node_modules/.prisma
npm run prisma:generate
```

## Using Prisma Studio

To view and edit data in MySQL:

```bash
cd server
npm run prisma:studio
```

This will open Prisma Studio in your browser at `http://localhost:5555`

## Production Considerations

For production:

1. **Use connection pooling**
   - Prisma handles this automatically
   - Configure pool size in DATABASE_URL if needed

2. **Use environment variables**
   - Never commit `.env` file
   - Use secure password management

3. **Backup database regularly**
   ```bash
   # MySQL dump
   mysqldump -u ndl_user -p ndl_db > backup.sql
   ```

4. **Use SSL connections**
   ```
   DATABASE_URL=mysql://user:password@host:3306/db?sslaccept=strict
   ```

## Additional Resources

- [Prisma MySQL Documentation](https://www.prisma.io/docs/concepts/database-connectors/mysql)
- [MySQL Official Documentation](https://dev.mysql.com/doc/)
- [Docker MySQL Image](https://hub.docker.com/_/mysql)

