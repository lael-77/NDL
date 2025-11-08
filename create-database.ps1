# Create Database and User for NDL in XAMPP MySQL

Write-Host "Creating NDL database and user..." -ForegroundColor Cyan
Write-Host ""

# Find XAMPP MySQL
$xamppMysqlPath = "C:\xampp\mysql\bin\mysql.exe"
if (-not (Test-Path $xamppMysqlPath)) {
    $possiblePaths = @(
        "C:\xampp\mysql\bin\mysql.exe",
        "D:\xampp\mysql\bin\mysql.exe",
        "$env:ProgramFiles\xampp\mysql\bin\mysql.exe",
        "$env:ProgramFiles(x86)\xampp\mysql\bin\mysql.exe"
    )
    
    foreach ($path in $possiblePaths) {
        if (Test-Path $path) {
            $xamppMysqlPath = $path
            break
        }
    }
}

if (-not (Test-Path $xamppMysqlPath)) {
    Write-Host "[ERROR] XAMPP MySQL not found!" -ForegroundColor Red
    Write-Host "Please make sure XAMPP is installed and MySQL is running." -ForegroundColor Yellow
    exit 1
}

Write-Host "[OK] Found MySQL at: $xamppMysqlPath" -ForegroundColor Green
Write-Host ""

# SQL script to create database and user
$sqlScript = @"
CREATE DATABASE IF NOT EXISTS ndl_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS 'ndl_user'@'localhost' IDENTIFIED BY 'ndl_password';
GRANT ALL PRIVILEGES ON ndl_db.* TO 'ndl_user'@'localhost';
FLUSH PRIVILEGES;
SHOW DATABASES LIKE 'ndl_db';
"@

Write-Host "Creating database and user..." -ForegroundColor Yellow
Write-Host "Database: ndl_db" -ForegroundColor White
Write-Host "User: ndl_user" -ForegroundColor White
Write-Host "Password: ndl_password" -ForegroundColor White
Write-Host ""

try {
    $result = $sqlScript | & $xamppMysqlPath -u root 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "[OK] Database and user created successfully!" -ForegroundColor Green
        Write-Host ""
        Write-Host "You can now run:" -ForegroundColor Cyan
        Write-Host "  cd server" -ForegroundColor White
        Write-Host "  npm run prisma:push" -ForegroundColor White
    } else {
        Write-Host "[ERROR] Failed to create database/user" -ForegroundColor Red
        Write-Host "Error output:" -ForegroundColor Yellow
        Write-Host $result -ForegroundColor Red
        Write-Host ""
        Write-Host "Make sure:" -ForegroundColor Yellow
        Write-Host "  1. MySQL is running in XAMPP Control Panel" -ForegroundColor White
        Write-Host "  2. You have root access (default XAMPP root has no password)" -ForegroundColor White
    }
} catch {
    Write-Host "[ERROR] Exception occurred: $_" -ForegroundColor Red
}

Write-Host ""

