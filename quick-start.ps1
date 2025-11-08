# Quick Start Guide for NDL Project

Write-Host "===================================" -ForegroundColor Cyan
Write-Host "  NDL - Quick Start Guide" -ForegroundColor Cyan
Write-Host "===================================" -ForegroundColor Cyan
Write-Host ""

$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptPath

Write-Host "This script will help you set up the NDL project." -ForegroundColor Yellow
Write-Host ""

# Check Node.js
Write-Host "🔍 Checking Node.js..." -ForegroundColor Yellow
$nodeVersion = node --version 2>$null
if ($nodeVersion) {
    Write-Host "✅ Node.js is installed: $nodeVersion" -ForegroundColor Green
} else {
    Write-Host "❌ Node.js is not installed!" -ForegroundColor Red
    Write-Host "   Please install Node.js from: https://nodejs.org/" -ForegroundColor Yellow
    exit 1
}

# Check npm
Write-Host "🔍 Checking npm..." -ForegroundColor Yellow
$npmVersion = npm --version 2>$null
if ($npmVersion) {
    Write-Host "✅ npm is installed: $npmVersion" -ForegroundColor Green
} else {
    Write-Host "❌ npm is not installed!" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Check MySQL
Write-Host "🔍 Checking MySQL..." -ForegroundColor Yellow
$mysqlInstalled = Get-Command mysql -ErrorAction SilentlyContinue
$mysqlService = Get-Service -Name "*mysql*" -ErrorAction SilentlyContinue

if ($mysqlInstalled) {
    Write-Host "✅ MySQL is installed" -ForegroundColor Green
    if ($mysqlService) {
        if ($mysqlService.Status -eq 'Running') {
            Write-Host "✅ MySQL service is running" -ForegroundColor Green
        } else {
            Write-Host "⚠️  MySQL service is not running" -ForegroundColor Yellow
            $start = Read-Host "Do you want to start MySQL service? (y/n)"
            if ($start -eq "y" -or $start -eq "Y") {
                Start-Service $mysqlService.Name
                Write-Host "✅ MySQL service started" -ForegroundColor Green
            }
        }
    }
} else {
    Write-Host "❌ MySQL is not installed" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please install MySQL using one of these methods:" -ForegroundColor Yellow
    Write-Host "  1. Download MySQL Installer: https://dev.mysql.com/downloads/installer/" -ForegroundColor White
    Write-Host "  2. Use winget: winget install Oracle.MySQL" -ForegroundColor White
    Write-Host "  3. See INSTALL_MYSQL_WINDOWS.md for detailed instructions" -ForegroundColor White
    Write-Host ""
    $continue = Read-Host "Do you want to continue setup anyway? (y/n)"
    if ($continue -ne "y" -and $continue -ne "Y") {
        exit 1
    }
}

Write-Host ""

# Check Docker (optional)
Write-Host "🔍 Checking Docker..." -ForegroundColor Yellow
$dockerInstalled = Get-Command docker -ErrorAction SilentlyContinue
if ($dockerInstalled) {
    Write-Host "✅ Docker is installed (optional)" -ForegroundColor Green
} else {
    Write-Host "ℹ️  Docker is not installed (optional - you can use local MySQL instead)" -ForegroundColor Gray
}

Write-Host ""

# Setup choice
Write-Host "Choose setup method:" -ForegroundColor Cyan
Write-Host "  1. Local MySQL (recommended if MySQL is installed)" -ForegroundColor White
Write-Host "  2. Docker (requires Docker Desktop)" -ForegroundColor White
Write-Host "  3. Skip database setup (manual setup later)" -ForegroundColor White
Write-Host ""

$choice = Read-Host "Enter your choice (1/2/3)"

switch ($choice) {
    "1" {
        Write-Host ""
        Write-Host "🚀 Running local MySQL setup..." -ForegroundColor Cyan
        if (Test-Path "setup-local.ps1") {
            & ".\setup-local.ps1"
        } else {
            Write-Host "⚠️  setup-local.ps1 not found. Running manual setup..." -ForegroundColor Yellow
            # Manual setup steps
            Write-Host "Please ensure:" -ForegroundColor Yellow
            Write-Host "  1. MySQL is running" -ForegroundColor White
            Write-Host "  2. Database 'ndl_db' is created" -ForegroundColor White
            Write-Host "  3. User 'ndl_user' with password 'ndl_password' exists" -ForegroundColor White
            Write-Host "  4. .env file is configured" -ForegroundColor White
        }
    }
    "2" {
        if ($dockerInstalled) {
            Write-Host ""
            Write-Host "🚀 Starting MySQL with Docker..." -ForegroundColor Cyan
            docker compose up -d mysql
            if ($LASTEXITCODE -eq 0) {
                Write-Host "✅ MySQL container started" -ForegroundColor Green
                Write-Host "   Waiting for MySQL to be ready..." -ForegroundColor Yellow
                Start-Sleep -Seconds 10
            } else {
                Write-Host "❌ Failed to start MySQL container" -ForegroundColor Red
            }
        } else {
            Write-Host "❌ Docker is not installed. Please install Docker Desktop first." -ForegroundColor Red
            exit 1
        }
    }
    "3" {
        Write-Host "⏭️  Skipping database setup" -ForegroundColor Yellow
    }
    default {
        Write-Host "❌ Invalid choice" -ForegroundColor Red
        exit 1
    }
}

Write-Host ""

# Install dependencies
Write-Host "📦 Installing dependencies..." -ForegroundColor Cyan

# Server dependencies
Write-Host "  Installing server dependencies..." -ForegroundColor Yellow
Set-Location "server"
if (-not (Test-Path "node_modules")) {
    npm install
} else {
    Write-Host "  ✅ Server dependencies already installed" -ForegroundColor Green
}
Set-Location ".."

# Client dependencies
Write-Host "  Installing client dependencies..." -ForegroundColor Yellow
Set-Location "client"
if (-not (Test-Path "node_modules")) {
    npm install
} else {
    Write-Host "  ✅ Client dependencies already installed" -ForegroundColor Green
}
Set-Location ".."

Write-Host ""

# Generate Prisma client
Write-Host "🔧 Setting up Prisma..." -ForegroundColor Cyan
Set-Location "server"
npm run prisma:generate
Set-Location ".."

Write-Host ""

# Final instructions
Write-Host "===================================" -ForegroundColor Green
Write-Host "  Setup Complete!" -ForegroundColor Green
Write-Host "===================================" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Make sure your .env file is configured:" -ForegroundColor Yellow
Write-Host "   DATABASE_URL=mysql://ndl_user:ndl_password@localhost:3306/ndl_db" -ForegroundColor White
Write-Host ""
Write-Host "2. Run database migrations:" -ForegroundColor Yellow
Write-Host "   cd server" -ForegroundColor White
Write-Host "   npm run prisma:migrate" -ForegroundColor White
Write-Host "   # Or: npm run prisma:push (for development)" -ForegroundColor Gray
Write-Host ""
Write-Host "3. Start the servers:" -ForegroundColor Yellow
Write-Host "   Terminal 1: cd server && npm run dev" -ForegroundColor White
Write-Host "   Terminal 2: cd client && npm run dev" -ForegroundColor White
Write-Host ""
Write-Host "   Or use the start scripts:" -ForegroundColor Yellow
Write-Host "   .\start.ps1          # Starts both servers" -ForegroundColor White
Write-Host "   .\start-server.ps1   # Starts backend only" -ForegroundColor White
Write-Host "   .\start-client.ps1   # Starts frontend only" -ForegroundColor White
Write-Host ""
Write-Host "4. Access the application:" -ForegroundColor Yellow
Write-Host "   Frontend: http://localhost:8080" -ForegroundColor White
Write-Host "   Backend:  http://localhost:3001" -ForegroundColor White
Write-Host ""

