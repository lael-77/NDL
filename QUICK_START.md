# Quick Start Guide

## Prerequisites Check

Before starting, make sure you have:
- ✅ Node.js (v20 or higher) - [Download](https://nodejs.org/)
- ✅ MySQL installed - See `INSTALL_MYSQL_WINDOWS.md` if not installed
- ✅ Git (optional, for cloning)

## Step-by-Step Setup

### 0. XAMPP Users (Skip to Step 2)

If you have XAMPP installed, use the XAMPP setup script:
```powershell
.\setup-xampp.ps1
```

This will automatically:
- Detect XAMPP MySQL
- Create database and user
- Set up environment variables
- Run migrations

Then skip to Step 4. See `SETUP_XAMPP.md` for detailed XAMPP instructions.

### 1. Install MySQL (If Not Installed)

**Easiest Method - MySQL Installer:**
1. Download from: https://dev.mysql.com/downloads/installer/
2. Install with "Developer Default" option
3. Set root password during installation
4. Start MySQL service:
   ```powershell
   Start-Service MySQL80
   ```

**Or use XAMPP:**
- Download from: https://www.apachefriends.org/
- Start MySQL from XAMPP Control Panel

### 2. Create Database

Open MySQL Command Line or MySQL Workbench:

```sql
-- Login as root
mysql -u root -p

-- Create database
CREATE DATABASE ndl_db;

-- Create user
CREATE USER 'ndl_user'@'localhost' IDENTIFIED BY 'ndl_password';

-- Grant privileges
GRANT ALL PRIVILEGES ON ndl_db.* TO 'ndl_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### 3. Run Setup Script

```powershell
# Navigate to project directory
cd "C:\Users\TECH ALLIANCE LTD\Desktop\NDL-main\NDL-main"

# Run automated setup
.\setup-local.ps1
```

This will:
- Check MySQL installation
- Create .env file
- Install dependencies
- Generate Prisma client
- Run database migrations

### 4. Start the Servers

**Option A: Using Start Script (Recommended)**
```powershell
.\start.ps1
```

**Option B: Manual Start**

Terminal 1 - Backend:
```powershell
cd server
npm run dev
```

Terminal 2 - Frontend:
```powershell
cd client
npm run dev
```

### 5. Access the Application

- **Frontend**: http://localhost:8080
- **Backend API**: http://localhost:3001
- **API Health Check**: http://localhost:3001/health

## Troubleshooting

### MySQL Not Found

If `mysql` command is not recognized:
1. Add MySQL to PATH: `C:\Program Files\MySQL\MySQL Server 8.0\bin`
2. Or use full path: `"C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe"`

### MySQL Service Not Running

```powershell
# Check status
Get-Service MySQL80

# Start service
Start-Service MySQL80

# Or use XAMPP Control Panel if using XAMPP
```

### Connection Errors

1. Verify MySQL is running: `Get-Service MySQL80`
2. Check .env file has correct DATABASE_URL
3. Test connection: `mysql -u ndl_user -pndl_password -h localhost ndl_db`

### Port Already in Use

If port 3306 is in use:
```powershell
# Check what's using it
netstat -ano | findstr :3306

# Stop the service or change MySQL port
```

### Prisma Migration Errors

```powershell
cd server

# Reset database (⚠️ deletes all data)
npx prisma migrate reset

# Or push schema directly
npm run prisma:push
```

## Common Commands

```powershell
# Start MySQL service
Start-Service MySQL80

# Stop MySQL service
Stop-Service MySQL80

# Check MySQL status
Get-Service MySQL80

# Test MySQL connection
mysql -u ndl_user -pndl_password -h localhost ndl_db

# Run database migrations
cd server
npm run prisma:migrate

# Generate Prisma client
npm run prisma:generate

# Open Prisma Studio (database GUI)
npm run prisma:studio
```

## Next Steps

After setup is complete:
1. ✅ Verify backend is running: http://localhost:3001/health
2. ✅ Verify frontend is running: http://localhost:8080
3. ✅ Test API endpoints using Postman or curl
4. ✅ Check database using Prisma Studio: `cd server && npm run prisma:studio`

## Need Help?

- Check `INSTALL_MYSQL_WINDOWS.md` for MySQL installation
- Check `SETUP_LOCAL.md` for detailed setup instructions
- Check `docs/MYSQL_SETUP.md` for MySQL-specific documentation
- Check `README.md` for general project information

## File Structure

```
NDL-main/
├── client/          # Frontend React app
├── server/          # Backend Express API
├── docs/            # Documentation
├── .env             # Environment variables (create from .env.example)
├── setup-local.ps1  # Automated setup script
├── start.ps1        # Start both servers
├── start-server.ps1 # Start backend only
└── start-client.ps1 # Start frontend only
```

