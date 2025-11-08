# Setting Up NDL with XAMPP

This guide will help you set up the NDL project using XAMPP's MySQL.

## Prerequisites

- ✅ XAMPP installed (you have this!)
- ✅ Node.js (v20 or higher)
- ✅ npm (comes with Node.js)

## Step 1: Start MySQL in XAMPP

1. **Open XAMPP Control Panel**
   - Find XAMPP Control Panel in your Start Menu
   - Or navigate to: `C:\xampp\xampp-control.exe`

2. **Start MySQL Service**
   - Click the **"Start"** button next to MySQL
   - Wait for the status to show "Running" (green)
   - Note: Apache doesn't need to be running for this project

## Step 2: Access MySQL

XAMPP's MySQL is usually configured with:
- **Host**: `localhost`
- **Port**: `3306`
- **Root User**: `root`
- **Root Password**: *(empty/blank by default)*

## Step 3: Create Database and User

### Option A: Using XAMPP's phpMyAdmin (Easiest)

1. **Open phpMyAdmin**
   - In XAMPP Control Panel, click **"Admin"** next to MySQL
   - Or go to: http://localhost/phpmyadmin
   - Login with:
     - Username: `root`
     - Password: *(leave blank)*

2. **Create Database**
   - Click on **"New"** in the left sidebar
   - Database name: `ndl_db`
   - Collation: `utf8mb4_unicode_ci`
   - Click **"Create"**

3. **Create User**
   - Click on **"User accounts"** tab
   - Click **"Add user account"**
   - Username: `ndl_user`
   - Host name: `localhost`
   - Password: `ndl_password` (or your preferred password)
   - Under **"Database for user account"**:
     - Select **"Grant all privileges on database 'ndl_db'"**
   - Click **"Go"**

### Option B: Using MySQL Command Line

1. **Open MySQL Command Line**
   - Open Command Prompt or PowerShell
   - Navigate to XAMPP MySQL: `cd C:\xampp\mysql\bin`
   - Run: `mysql.exe -u root -p`
   - Press Enter when prompted for password (leave blank)

2. **Create Database and User**
   ```sql
   -- Create database
   CREATE DATABASE ndl_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   
   -- Create user
   CREATE USER 'ndl_user'@'localhost' IDENTIFIED BY 'ndl_password';
   
   -- Grant privileges
   GRANT ALL PRIVILEGES ON ndl_db.* TO 'ndl_user'@'localhost';
   
   -- Flush privileges
   FLUSH PRIVILEGES;
   
   -- Verify
   SHOW DATABASES;
   EXIT;
   ```

## Step 4: Update Environment Variables

1. **Create or Update `.env` file** in the project root:
   ```env
   PORT=3001
   NODE_ENV=development
   
   # MySQL Connection String (XAMPP)
   DATABASE_URL=mysql://ndl_user:ndl_password@localhost:3306/ndl_db
   
   # JWT Configuration
   JWT_SECRET=your-super-secret-jwt-key-change-in-production
   
   # Client Configuration (for client/.env)
   VITE_API_BASE_URL=http://localhost:3001/api
   ```

2. **If using root user** (not recommended for production):
   ```env
   DATABASE_URL=mysql://root:@localhost:3306/ndl_db
   ```
   *(Note: empty password after the colon)*

## Step 5: Add XAMPP MySQL to PATH (Optional)

To use `mysql` command directly:

1. **Add to PATH**
   - Open **System Properties** → **Environment Variables**
   - Under **System Variables**, find **Path** and click **Edit**
   - Click **New** and add: `C:\xampp\mysql\bin`
   - Click **OK** on all windows
   - Restart PowerShell/Command Prompt

2. **Verify**
   ```powershell
   mysql --version
   ```

## Step 6: Run Setup Script

```powershell
# Navigate to project directory
cd "C:\Users\TECH ALLIANCE LTD\Desktop\NDL-main\NDL-main"

# Run setup script
.\setup-local.ps1
```

The script will:
- Check MySQL installation
- Create .env file (if not exists)
- Install dependencies
- Generate Prisma client
- Run database migrations

## Step 7: Start the Servers

### Option A: Using Start Script
```powershell
.\start.ps1
```

### Option B: Manual Start

**Terminal 1 - Backend:**
```powershell
cd server
npm run dev
```

**Terminal 2 - Frontend:**
```powershell
cd client
npm install  # If not already installed
npm run dev
```

## Step 8: Access the Application

- **Frontend**: http://localhost:8080
- **Backend API**: http://localhost:3001
- **API Health Check**: http://localhost:3001/health
- **phpMyAdmin**: http://localhost/phpmyadmin (if Apache is running)

## Troubleshooting

### MySQL Won't Start in XAMPP

1. **Check if port 3306 is in use**
   ```powershell
   netstat -ano | findstr :3306
   ```
2. **Stop conflicting services**
   - Check if another MySQL service is running
   - Stop it from Services (services.msc)

### Connection Refused

1. **Verify MySQL is running**
   - Check XAMPP Control Panel
   - Status should show "Running"

2. **Check connection string in .env**
   - Verify DATABASE_URL is correct
   - For root with no password: `mysql://root:@localhost:3306/ndl_db`

### Access Denied Error

1. **Verify user exists**
   - Open phpMyAdmin
   - Go to User accounts
   - Check if `ndl_user` exists

2. **Reset password**
   ```sql
   ALTER USER 'ndl_user'@'localhost' IDENTIFIED BY 'ndl_password';
   FLUSH PRIVILEGES;
   ```

### Database Not Found

1. **Create database manually**
   - Open phpMyAdmin
   - Create database `ndl_db`
   - Or run: `CREATE DATABASE ndl_db;`

### Prisma Migration Errors

```powershell
cd server

# Reset database (⚠️ deletes all data)
npx prisma migrate reset

# Or push schema directly
npm run prisma:push
```

## XAMPP MySQL Default Settings

- **Installation Path**: `C:\xampp\mysql\`
- **Data Directory**: `C:\xampp\mysql\data\`
- **Config File**: `C:\xampp\mysql\bin\my.ini`
- **Port**: `3306`
- **Root Password**: *(empty by default)*
- **Socket**: `MySQL` (Windows named pipe)

## Using phpMyAdmin

phpMyAdmin is included with XAMPP and provides a web interface for MySQL:

1. **Start Apache** (if not running)
   - XAMPP Control Panel → Start Apache

2. **Access phpMyAdmin**
   - Go to: http://localhost/phpmyadmin
   - Login with root (no password by default)

3. **Useful Features**
   - Create databases
   - Create users
   - Run SQL queries
   - View/edit data
   - Import/export databases

## Quick Commands

```powershell
# Start MySQL (using XAMPP Control Panel)
# Or via command line:
& "C:\xampp\mysql\bin\mysqld.exe" --defaults-file="C:\xampp\mysql\bin\my.ini" --standalone --console

# Connect to MySQL
& "C:\xampp\mysql\bin\mysql.exe" -u root

# Connect with user
& "C:\xampp\mysql\bin\mysql.exe" -u ndl_user -pndl_password ndl_db

# Check MySQL version
& "C:\xampp\mysql\bin\mysql.exe" --version
```

## Next Steps

After setup is complete:
1. ✅ Verify MySQL is running in XAMPP
2. ✅ Verify backend is running: http://localhost:3001/health
3. ✅ Verify frontend is running: http://localhost:8080
4. ✅ Test database connection using Prisma Studio: `cd server && npm run prisma:studio`

## Security Notes

⚠️ **For Development Only:**
- XAMPP's default root password is empty - this is fine for local development
- For production, always set strong passwords
- The `ndl_user` account is sufficient for development

## Need Help?

- Check `QUICK_START.md` for general setup
- Check `SETUP_LOCAL.md` for alternative setup methods
- Check `docs/MYSQL_SETUP.md` for MySQL-specific documentation

