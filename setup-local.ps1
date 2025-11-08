# Setup Local MySQL for NDL

Write-Host "===================================" -ForegroundColor Cyan
Write-Host "  NDL - Local MySQL Setup" -ForegroundColor Cyan
Write-Host "===================================" -ForegroundColor Cyan
Write-Host ""

$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptPath

# Check if MySQL is installed
Write-Host "🔍 Checking MySQL installation..." -ForegroundColor Yellow
$mysqlInstalled = Get-Command mysql -ErrorAction SilentlyContinue
if (-not $mysqlInstalled) {
    Write-Host "❌ MySQL is not installed!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please install MySQL using one of these methods:" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Option 1 - MySQL Installer (Recommended):" -ForegroundColor Cyan
    Write-Host "  Download from: https://dev.mysql.com/downloads/installer/" -ForegroundColor White
    Write-Host "  Choose 'Developer Default' during installation" -ForegroundColor Gray
    Write-Host ""
    Write-Host "Option 2 - XAMPP (Includes MySQL):" -ForegroundColor Cyan
    Write-Host "  Download from: https://www.apachefriends.org/" -ForegroundColor White
    Write-Host ""
    Write-Host "Option 3 - Docker:" -ForegroundColor Cyan
    Write-Host "  Download Docker Desktop and use: docker compose up -d mysql" -ForegroundColor White
    Write-Host ""
    Write-Host "See INSTALL_MYSQL_WINDOWS.md for detailed instructions." -ForegroundColor Yellow
    exit 1
}
Write-Host "✅ MySQL is installed" -ForegroundColor Green

# Check if MySQL service is running
Write-Host "🔍 Checking MySQL service..." -ForegroundColor Yellow
$mysqlService = Get-Service -Name "*mysql*" -ErrorAction SilentlyContinue
if ($mysqlService) {
    if ($mysqlService.Status -ne 'Running') {
        Write-Host "⚠️  MySQL service is not running. Starting..." -ForegroundColor Yellow
        try {
            Start-Service $mysqlService.Name
            Write-Host "✅ MySQL service started" -ForegroundColor Green
        } catch {
            Write-Host "❌ Failed to start MySQL service. Please start it manually." -ForegroundColor Red
            Write-Host "   Run: Start-Service MySQL80" -ForegroundColor Yellow
        }
    } else {
        Write-Host "✅ MySQL service is running" -ForegroundColor Green
    }
} else {
    Write-Host "⚠️  MySQL service not found. Please check MySQL installation." -ForegroundColor Yellow
    Write-Host "   You may need to install MySQL as a Windows service." -ForegroundColor Yellow
}

Write-Host ""

# Create .env file if it doesn't exist
Write-Host "🔧 Setting up environment variables..." -ForegroundColor Yellow
if (-not (Test-Path ".env")) {
    if (Test-Path ".env.example") {
        Copy-Item ".env.example" ".env"
        Write-Host "✅ Created .env file from .env.example" -ForegroundColor Green
        Write-Host "⚠️  Please update .env file with your MySQL credentials" -ForegroundColor Yellow
    } else {
        Write-Host "❌ .env.example not found!" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "✅ .env file already exists" -ForegroundColor Green
}

Write-Host ""

# Install server dependencies
Write-Host "📦 Installing server dependencies..." -ForegroundColor Yellow
Set-Location "server"
if (-not (Test-Path "node_modules")) {
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Failed to install server dependencies" -ForegroundColor Red
        Set-Location ".."
        exit 1
    }
} else {
    Write-Host "✅ Server dependencies already installed" -ForegroundColor Green
}

# Generate Prisma client
Write-Host "🔧 Generating Prisma client..." -ForegroundColor Yellow
npm run prisma:generate
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to generate Prisma client" -ForegroundColor Red
    Set-Location ".."
    exit 1
}

# Check database connection and run migrations
Write-Host "🔍 Checking database connection..." -ForegroundColor Yellow
Write-Host "⚠️  Make sure you have:" -ForegroundColor Yellow
Write-Host "   1. Created the database: CREATE DATABASE ndl_db;" -ForegroundColor White
Write-Host "   2. Created the user: CREATE USER 'ndl_user'@'localhost' IDENTIFIED BY 'ndl_password';" -ForegroundColor White
Write-Host "   3. Granted privileges: GRANT ALL PRIVILEGES ON ndl_db.* TO 'ndl_user'@'localhost';" -ForegroundColor White
Write-Host ""

$runMigrations = Read-Host "Do you want to run database migrations now? (y/n)"
if ($runMigrations -eq "y" -or $runMigrations -eq "Y") {
    Write-Host "🚀 Running database migrations..." -ForegroundColor Yellow
    npm run prisma:migrate
    if ($LASTEXITCODE -ne 0) {
        Write-Host "⚠️  Migration failed. You can try:" -ForegroundColor Yellow
        Write-Host "   npm run prisma:push  (to push schema without migrations)" -ForegroundColor White
    }
}

Set-Location ".."

Write-Host ""
Write-Host "===================================" -ForegroundColor Green
Write-Host "  Setup Complete!" -ForegroundColor Green
Write-Host "===================================" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "  1. Make sure MySQL is running" -ForegroundColor White
Write-Host "  2. Verify .env file has correct DATABASE_URL" -ForegroundColor White
Write-Host "  3. Start the servers:" -ForegroundColor White
Write-Host "     - Backend: cd server && npm run dev" -ForegroundColor Gray
Write-Host "     - Frontend: cd client && npm run dev" -ForegroundColor Gray
Write-Host ""

