# Local Setup Guide (Without Docker)

Since Docker is not installed, here's how to set up the NDL project locally with MySQL.

## Option 1: Install MySQL Locally (Recommended)

### Step 1: Install MySQL

**Windows (Recommended - MySQL Installer):**
1. Download MySQL Installer from [MySQL Official Website](https://dev.mysql.com/downloads/installer/)
   - Choose the **full installer** (mysql-installer-community-*.msi)
2. Run the installer and choose **"Developer Default"**
3. During installation:
   - Set root password (remember this!)
   - Choose port 3306 (default)
   - Install as Windows Service
4. After installation, verify MySQL is in PATH:
   ```powershell
   mysql --version
   ```
   If not found, add `C:\Program Files\MySQL\MySQL Server 8.0\bin` to your PATH

**Alternative Options:**
- **XAMPP**: Includes MySQL, Apache, PHP - Download from [Apache Friends](https://www.apachefriends.org/)
- **Docker**: Use Docker Desktop and run MySQL in a container
- **Chocolatey**: First install Chocolatey, then `choco install mysql`

See `INSTALL_MYSQL_WINDOWS.md` for detailed installation instructions.

### Step 2: Start MySQL Service

```powershell
# Start MySQL service
Start-Service MySQL80

# Or check if it's running
Get-Service MySQL80
```

### Step 3: Create Database and User

Open MySQL command line or MySQL Workbench:

```sql
-- Login as root
mysql -u root -p

-- Create database
CREATE DATABASE ndl_db;

-- Create user
CREATE USER 'ndl_user'@'localhost' IDENTIFIED BY 'ndl_password';

-- Grant privileges
GRANT ALL PRIVILEGES ON ndl_db.* TO 'ndl_user'@'localhost';

-- Flush privileges
FLUSH PRIVILEGES;

-- Verify
SHOW DATABASES;
```

### Step 4: Update Environment Variables

Create or update `.env` file in the project root:

```env
PORT=3001
NODE_ENV=development

# MySQL Connection String
DATABASE_URL=mysql://ndl_user:ndl_password@localhost:3306/ndl_db

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-in-production

# Client Configuration (for client/.env)
VITE_API_BASE_URL=http://localhost:3001/api
```

### Step 5: Install Dependencies and Run Migrations

```powershell
# Navigate to server directory
cd server

# Install dependencies
npm install

# Generate Prisma client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# Or push schema directly (for development)
npm run prisma:push
```

### Step 6: Start the Servers

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

## Option 2: Install Docker Desktop (Alternative)

If you prefer using Docker:

1. **Download Docker Desktop for Windows**
   - Visit: https://www.docker.com/products/docker-desktop/
   - Download and install Docker Desktop
   - Restart your computer after installation

2. **Start Docker Desktop**
   - Open Docker Desktop application
   - Wait for it to start (whale icon in system tray)

3. **Use Docker Compose**
   ```powershell
   # Newer Docker versions use 'docker compose' (without hyphen)
   docker compose up -d mysql
   
   # Or if you have older version with docker-compose
   docker-compose up -d mysql
   ```

4. **Continue with Step 4-6 above**

## Troubleshooting

### MySQL Connection Issues

**Check if MySQL is running:**
```powershell
Get-Service MySQL80
```

**Start MySQL if not running:**
```powershell
Start-Service MySQL80
```

**Test connection:**
```powershell
mysql -u ndl_user -p -h localhost
# Enter password: ndl_password
```

### Port Already in Use

If port 3306 is already in use:
1. Check what's using it:
   ```powershell
   netstat -ano | findstr :3306
   ```
2. Either stop the service using that port, or change MySQL port in my.ini

### Prisma Migration Issues

If migrations fail:
```powershell
cd server

# Reset database (⚠️ This deletes all data)
npx prisma migrate reset

# Or push schema directly
npm run prisma:push
```

### Cannot Connect to MySQL

1. **Check MySQL service:**
   ```powershell
   Get-Service MySQL80
   ```

2. **Check MySQL is listening on port 3306:**
   ```powershell
   netstat -ano | findstr :3306
   ```

3. **Verify credentials in .env file**

4. **Test connection manually:**
   ```powershell
   mysql -u ndl_user -pndl_password -h localhost ndl_db
   ```

## Quick Start Script

Save this as `setup-local.ps1`:

```powershell
# Setup Local MySQL for NDL

Write-Host "Setting up NDL with local MySQL..." -ForegroundColor Cyan

# Check if MySQL is installed
$mysqlInstalled = Get-Command mysql -ErrorAction SilentlyContinue
if (-not $mysqlInstalled) {
    Write-Host "MySQL is not installed!" -ForegroundColor Red
    Write-Host "Please install MySQL from: https://dev.mysql.com/downloads/installer/" -ForegroundColor Yellow
    exit 1
}

# Check if MySQL service is running
$mysqlService = Get-Service -Name "*mysql*" -ErrorAction SilentlyContinue
if ($mysqlService) {
    if ($mysqlService.Status -ne 'Running') {
        Write-Host "Starting MySQL service..." -ForegroundColor Yellow
        Start-Service $mysqlService.Name
    }
    Write-Host "MySQL service is running" -ForegroundColor Green
} else {
    Write-Host "MySQL service not found. Please check MySQL installation." -ForegroundColor Yellow
}

# Create .env file if it doesn't exist
if (-not (Test-Path ".env")) {
    Write-Host "Creating .env file..." -ForegroundColor Yellow
    Copy-Item ".env.example" ".env"
    Write-Host "Please update .env file with your MySQL credentials" -ForegroundColor Yellow
}

# Install server dependencies
Write-Host "Installing server dependencies..." -ForegroundColor Yellow
Set-Location "server"
if (-not (Test-Path "node_modules")) {
    npm install
}

# Generate Prisma client
Write-Host "Generating Prisma client..." -ForegroundColor Yellow
npm run prisma:generate

# Run migrations
Write-Host "Running database migrations..." -ForegroundColor Yellow
npm run prisma:migrate

Set-Location ".."

Write-Host "Setup complete!" -ForegroundColor Green
Write-Host "Now you can start the servers:" -ForegroundColor Cyan
Write-Host "  Terminal 1: cd server && npm run dev" -ForegroundColor White
Write-Host "  Terminal 2: cd client && npm run dev" -ForegroundColor White
```

## Next Steps

1. Install MySQL (if not installed)
2. Create database and user
3. Update `.env` file
4. Run `npm install` in both server and client directories
5. Run migrations: `cd server && npm run prisma:migrate`
6. Start servers using the scripts or manually

## Need Help?

- Check `docs/MYSQL_SETUP.md` for detailed MySQL setup
- Check `README.md` for general project setup
- Verify your `.env` file has correct DATABASE_URL

