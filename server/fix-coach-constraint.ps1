# Fix Coach Constraint - Remove unique constraint on school_id
Write-Host "`n[FIX] Fixing Coach constraint to allow multiple coaches per school...`n" -ForegroundColor Cyan

# Try to find MySQL path
$mysqlPath = $null
$possiblePaths = @(
    "C:\xampp\mysql\bin\mysql.exe",
    "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe",
    "C:\Program Files\MySQL\MySQL Server 8.1\bin\mysql.exe",
    "mysql.exe"
)

foreach ($path in $possiblePaths) {
    if (Test-Path $path) {
        $mysqlPath = $path
        break
    }
    # Try in PATH
    try {
        $result = Get-Command mysql -ErrorAction SilentlyContinue
        if ($result) {
            $mysqlPath = "mysql"
            break
        }
    } catch {
        continue
    }
}

if (-not $mysqlPath) {
    Write-Host "[ERROR] MySQL not found. Please install MySQL or XAMPP." -ForegroundColor Red
    Write-Host "`nTrying to read .env for connection details..." -ForegroundColor Yellow
    
    # Try to read DATABASE_URL from .env
    if (Test-Path ".env") {
        $envContent = Get-Content ".env" | Where-Object { $_ -match "DATABASE_URL" }
        if ($envContent) {
            Write-Host "Found DATABASE_URL in .env" -ForegroundColor Green
            Write-Host "Please run this SQL manually in your MySQL client:" -ForegroundColor Yellow
            Write-Host "   ALTER TABLE coaches DROP INDEX coaches_school_id_key;" -ForegroundColor White
            exit 1
        }
    }
    
    exit 1
}

Write-Host "[OK] Found MySQL at: $mysqlPath" -ForegroundColor Green

# Read .env for database connection
$dbUser = "root"
$dbPass = ""
$dbName = "ndl_db"

if (Test-Path ".env") {
    $envContent = Get-Content ".env"
    foreach ($line in $envContent) {
        if ($line -match "DATABASE_URL=mysql://([^:]+):([^@]+)@([^:]+):(\d+)/(.+)") {
            $dbUser = $matches[1]
            $dbPass = $matches[2]
            $dbName = $matches[5]
            break
        }
    }
}

Write-Host "Connecting to database: $dbName as $dbUser" -ForegroundColor Cyan

# Create SQL commands - need to drop foreign key first, then index
$sqlCommands = @(
    "SET FOREIGN_KEY_CHECKS = 0;",
    "ALTER TABLE coaches DROP FOREIGN KEY IF EXISTS coaches_school_id_fkey;",
    "ALTER TABLE coaches DROP INDEX IF EXISTS coaches_school_id_key;",
    "SET FOREIGN_KEY_CHECKS = 1;"
)
$sqlCommand = $sqlCommands -join " "

# Execute SQL
try {
    if ($dbPass) {
        $result = & $mysqlPath -u $dbUser -p$dbPass $dbName -e $sqlCommand 2>&1
    } else {
        $result = & $mysqlPath -u $dbUser $dbName -e $sqlCommand 2>&1
    }
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "[OK] Constraint removed successfully!`n" -ForegroundColor Green
        Write-Host "Now run: npm run prisma:push" -ForegroundColor Yellow
    } else {
        Write-Host "[WARNING] Result: $result" -ForegroundColor Yellow
        if ($result -match "Unknown table" -or $result -match "doesn't exist") {
            Write-Host "`n[OK] Table doesn't exist yet - this is fine. Run: npm run prisma:push" -ForegroundColor Green
        } elseif ($result -match "Duplicate key name" -or $result -match "doesn't exist") {
            Write-Host "`n[OK] Constraint already removed or doesn't exist. Run: npm run prisma:push" -ForegroundColor Green
        } else {
            Write-Host "`n[WARNING] Please check the error above and run the SQL manually if needed." -ForegroundColor Yellow
        }
    }
} catch {
    Write-Host "[ERROR] Error: $_" -ForegroundColor Red
    Write-Host "`nPlease run this SQL manually:" -ForegroundColor Yellow
    Write-Host "   ALTER TABLE coaches DROP INDEX coaches_school_id_key;" -ForegroundColor White
}

