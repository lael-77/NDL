# Repair XAMPP MySQL Database

Write-Host "Repairing XAMPP MySQL..." -ForegroundColor Cyan
Write-Host ""

$xamppMysqlPath = "C:\xampp\mysql\bin\mysql.exe"
if (-not (Test-Path $xamppMysqlPath)) {
    Write-Host "[ERROR] XAMPP MySQL not found!" -ForegroundColor Red
    exit 1
}

Write-Host "[*] Stopping MySQL (if running)..." -ForegroundColor Yellow
Write-Host "Please stop MySQL from XAMPP Control Panel, then press Enter to continue..."
Read-Host

Write-Host ""
Write-Host "[*] Repairing MySQL system tables..." -ForegroundColor Yellow

# Repair mysql database
$repairScript = @"
REPAIR TABLE mysql.db;
REPAIR TABLE mysql.user;
REPAIR TABLE mysql.tables_priv;
REPAIR TABLE mysql.columns_priv;
REPAIR TABLE mysql.procs_priv;
"@

try {
    $result = $repairScript | & $xamppMysqlPath -u root mysql 2>&1
    Write-Host $result
} catch {
    Write-Host "[!] Could not repair via MySQL client" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "[*] Alternative: Use mysqlcheck utility..." -ForegroundColor Yellow
$xamppMysqlCheck = "C:\xampp\mysql\bin\mysqlcheck.exe"
if (Test-Path $xamppMysqlCheck) {
    Write-Host "Running mysqlcheck..." -ForegroundColor Yellow
    & $xamppMysqlCheck -u root --repair --all-databases
}

Write-Host ""
Write-Host "[OK] Repair process completed" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "  1. Start MySQL from XAMPP Control Panel" -ForegroundColor White
Write-Host "  2. Run: .\create-database.ps1" -ForegroundColor White

