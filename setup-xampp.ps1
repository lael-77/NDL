# Setup NDL with XAMPP MySQL

Write-Host "===================================" -ForegroundColor Cyan
Write-Host "  NDL - XAMPP MySQL Setup" -ForegroundColor Cyan
Write-Host "===================================" -ForegroundColor Cyan
Write-Host ""

$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptPath

# Check if XAMPP MySQL exists
Write-Host "[*] Checking XAMPP MySQL..." -ForegroundColor Yellow
$xamppMysqlPath = "C:\xampp\mysql\bin\mysql.exe"
if (Test-Path $xamppMysqlPath) {
    Write-Host "[OK] XAMPP MySQL found at: $xamppMysqlPath" -ForegroundColor Green
} else {
    Write-Host "[!] XAMPP MySQL not found at default location" -ForegroundColor Yellow
    Write-Host "   Looking for XAMPP in common locations..." -ForegroundColor Yellow
    
    # Try to find XAMPP
    $possiblePaths = @(
        "C:\xampp\mysql\bin\mysql.exe",
        "D:\xampp\mysql\bin\mysql.exe",
        "$env:ProgramFiles\xampp\mysql\bin\mysql.exe",
        "$env:ProgramFiles(x86)\xampp\mysql\bin\mysql.exe"
    )
    
    $xamppFound = $false
    foreach ($path in $possiblePaths) {
        if (Test-Path $path) {
            $xamppMysqlPath = $path
            Write-Host "[OK] Found XAMPP MySQL at: $xamppMysqlPath" -ForegroundColor Green
            $xamppFound = $true
            break
        }
    }
    
    if (-not $xamppFound) {
        Write-Host "[ERROR] XAMPP MySQL not found!" -ForegroundColor Red
        Write-Host "   Please make sure XAMPP is installed." -ForegroundColor Yellow
        Write-Host "   Download from: https://www.apachefriends.org/" -ForegroundColor White
        exit 1
    }
}

# Check if MySQL is running
Write-Host "[*] Checking if MySQL is running..." -ForegroundColor Yellow
try {
    $mysqlProcess = Get-Process -Name "mysqld" -ErrorAction SilentlyContinue
    if ($mysqlProcess) {
        Write-Host "[OK] MySQL is running" -ForegroundColor Green
    } else {
        Write-Host "[!] MySQL is not running!" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "Please start MySQL from XAMPP Control Panel:" -ForegroundColor Cyan
        Write-Host "  1. Open XAMPP Control Panel" -ForegroundColor White
        Write-Host "  2. Click 'Start' next to MySQL" -ForegroundColor White
        Write-Host "  3. Wait for status to show 'Running'" -ForegroundColor White
        Write-Host ""
        $continue = Read-Host "Continue anyway? (y/n)"
        if ($continue -ne "y" -and $continue -ne "Y") {
            exit 1
        }
    }
} catch {
    Write-Host "[!] Could not check MySQL status" -ForegroundColor Yellow
}

Write-Host ""

# Test MySQL connection
Write-Host "[*] Testing MySQL connection..." -ForegroundColor Yellow
try {
    $testConnection = & $xamppMysqlPath -u root -e "SELECT 1;" 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "[OK] MySQL connection successful" -ForegroundColor Green
    } else {
        Write-Host "[!] Could not connect to MySQL" -ForegroundColor Yellow
        Write-Host "   Make sure MySQL is running in XAMPP Control Panel" -ForegroundColor Yellow
    }
} catch {
    Write-Host "[!] Could not test MySQL connection" -ForegroundColor Yellow
}

Write-Host ""

# Create .env file if it doesn't exist
Write-Host "[*] Setting up environment variables..." -ForegroundColor Yellow
if (-not (Test-Path ".env")) {
    if (Test-Path ".env.example") {
        Copy-Item ".env.example" ".env"
        Write-Host "[OK] Created .env file from .env.example" -ForegroundColor Green
        
        # Update DATABASE_URL for XAMPP
        Write-Host "[*] Updating DATABASE_URL for XAMPP..." -ForegroundColor Yellow
        $envContent = Get-Content ".env"
        $envContent = $envContent -replace 'DATABASE_URL=.*', 'DATABASE_URL=mysql://ndl_user:ndl_password@localhost:3306/ndl_db'
        $envContent | Set-Content ".env"
        Write-Host "[OK] Updated DATABASE_URL" -ForegroundColor Green
    } else {
        Write-Host "[ERROR] .env.example not found!" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "[OK] .env file already exists" -ForegroundColor Green
}

Write-Host ""

# Check if database and user need to be created
Write-Host "[*] Checking database setup..." -ForegroundColor Yellow
Write-Host "[!] Make sure you have created:" -ForegroundColor Yellow
Write-Host "   1. Database: ndl_db" -ForegroundColor White
Write-Host "   2. User: ndl_user with password: ndl_password" -ForegroundColor White
Write-Host "   3. Granted privileges to ndl_user on ndl_db" -ForegroundColor White
Write-Host ""
Write-Host "You can do this using:" -ForegroundColor Cyan
Write-Host "   - phpMyAdmin: http://localhost/phpmyadmin (if Apache is running)" -ForegroundColor White
Write-Host "   - MySQL Command Line: $xamppMysqlPath -u root" -ForegroundColor White
Write-Host ""

$createDb = Read-Host "Do you want to create the database and user now? (y/n)"
if ($createDb -eq "y" -or $createDb -eq "Y") {
    Write-Host "Creating database and user..." -ForegroundColor Yellow
    
    $sqlScript = @"
CREATE DATABASE IF NOT EXISTS ndl_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS 'ndl_user'@'localhost' IDENTIFIED BY 'ndl_password';
GRANT ALL PRIVILEGES ON ndl_db.* TO 'ndl_user'@'localhost';
FLUSH PRIVILEGES;
"@
    
    try {
        $sqlScript | & $xamppMysqlPath -u root 2>&1 | Out-Null
        if ($LASTEXITCODE -eq 0) {
            Write-Host "[OK] Database and user created successfully" -ForegroundColor Green
        } else {
            Write-Host "[!] Some errors occurred. Please check manually." -ForegroundColor Yellow
        }
    } catch {
        Write-Host "[!] Could not create database automatically" -ForegroundColor Yellow
        Write-Host "   Please create manually using phpMyAdmin or MySQL command line" -ForegroundColor Yellow
    }
}

Write-Host ""

# Install server dependencies
Write-Host "[*] Installing server dependencies..." -ForegroundColor Yellow
Set-Location "server"
if (-not (Test-Path "node_modules")) {
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "[ERROR] Failed to install server dependencies" -ForegroundColor Red
        Set-Location ".."
        exit 1
    }
} else {
    Write-Host "[OK] Server dependencies already installed" -ForegroundColor Green
}

# Generate Prisma client
Write-Host "[*] Generating Prisma client..." -ForegroundColor Yellow
npm run prisma:generate
if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERROR] Failed to generate Prisma client" -ForegroundColor Red
    Set-Location ".."
    exit 1
}

# Run migrations
Write-Host "[*] Ready to run database migrations..." -ForegroundColor Yellow
Write-Host ""
$runMigrations = Read-Host "Do you want to run database migrations now? (y/n)"
if ($runMigrations -eq "y" -or $runMigrations -eq "Y") {
    Write-Host "[*] Running database migrations..." -ForegroundColor Yellow
    npm run prisma:migrate
    if ($LASTEXITCODE -ne 0) {
        Write-Host "[!] Migration failed. You can try:" -ForegroundColor Yellow
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
Write-Host "  1. Make sure MySQL is running in XAMPP Control Panel" -ForegroundColor White
Write-Host "  2. Verify .env file has correct DATABASE_URL" -ForegroundColor White
Write-Host "  3. Start the servers:" -ForegroundColor White
Write-Host "     - Backend: cd server; npm run dev" -ForegroundColor Gray
Write-Host "     - Frontend: cd client; npm run dev" -ForegroundColor Gray
Write-Host "     - Or use: .\start.ps1" -ForegroundColor Gray
Write-Host ""
Write-Host "Access points:" -ForegroundColor Cyan
Write-Host "  - Frontend: http://localhost:8080" -ForegroundColor White
Write-Host "  - Backend: http://localhost:3001" -ForegroundColor White
Write-Host "  - phpMyAdmin: http://localhost/phpmyadmin (if Apache is running)" -ForegroundColor White
Write-Host ""
