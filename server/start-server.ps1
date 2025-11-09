# Start Backend Server
# This script should be run from the server directory

Write-Host "🚀 Starting NDL Backend Server..." -ForegroundColor Cyan
Write-Host "Server will run on: http://localhost:3001" -ForegroundColor Green
Write-Host ""

# Check if MySQL is running
Write-Host "Checking MySQL connection..." -ForegroundColor Yellow
$mysqlRunning = $false

# Check for MySQL service
$mysqlService = Get-Service -Name "*mysql*" -ErrorAction SilentlyContinue | Where-Object { $_.Status -eq 'Running' }
if ($mysqlService) {
    $mysqlRunning = $true
    Write-Host "✅ MySQL service is running" -ForegroundColor Green
}

# Check for XAMPP MySQL process
if (-not $mysqlRunning) {
    $mysqlProcess = Get-Process -Name "mysqld" -ErrorAction SilentlyContinue
    if ($mysqlProcess) {
        $mysqlRunning = $true
        Write-Host "✅ MySQL process found (XAMPP)" -ForegroundColor Green
    }
}

if (-not $mysqlRunning) {
    Write-Host "❌ MySQL is NOT running!" -ForegroundColor Red
    Write-Host ""
    Write-Host "⚠️  ACTION REQUIRED:" -ForegroundColor Yellow
    Write-Host "   Please start MySQL before starting the server:" -ForegroundColor White
    Write-Host "   1. Open XAMPP Control Panel" -ForegroundColor Gray
    Write-Host "   2. Click 'Start' next to MySQL" -ForegroundColor Gray
    Write-Host "   3. Wait for green 'Running' status" -ForegroundColor Gray
    Write-Host "   4. Then run this script again" -ForegroundColor Gray
    Write-Host ""
    Write-Host "Press any key to exit..." -ForegroundColor Yellow
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    exit 1
}

if (-not (Test-Path "node_modules")) {
    Write-Host "Installing dependencies..." -ForegroundColor Yellow
    npm install
}

if (-not (Test-Path "node_modules\.prisma")) {
    Write-Host "Generating Prisma client..." -ForegroundColor Yellow
    npm run prisma:generate
}

Write-Host ""
Write-Host "Starting server..." -ForegroundColor Yellow
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Gray
Write-Host ""
npm run dev

