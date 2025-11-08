# NDL Start Script
# This script starts both the backend server and frontend client

Write-Host "===================================" -ForegroundColor Cyan
Write-Host "  NDL - Starting Development Server" -ForegroundColor Cyan
Write-Host "===================================" -ForegroundColor Cyan
Write-Host ""

# Get the script directory
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptPath

# Check if .env exists
if (-not (Test-Path ".env")) {
    Write-Host "⚠️  .env file not found. Creating from .env.example..." -ForegroundColor Yellow
    if (Test-Path ".env.example") {
        Copy-Item ".env.example" ".env"
        Write-Host "✅ .env file created. Please update it with your configuration." -ForegroundColor Green
    } else {
        Write-Host "❌ .env.example not found!" -ForegroundColor Red
        exit 1
    }
}

# Check if server dependencies are installed
Write-Host "📦 Checking server dependencies..." -ForegroundColor Yellow
Set-Location "server"
if (-not (Test-Path "node_modules")) {
    Write-Host "Installing server dependencies..." -ForegroundColor Yellow
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Failed to install server dependencies" -ForegroundColor Red
        exit 1
    }
}
Set-Location ".."

# Check if client dependencies are installed
Write-Host "📦 Checking client dependencies..." -ForegroundColor Yellow
Set-Location "client"
if (-not (Test-Path "node_modules")) {
    Write-Host "Installing client dependencies..." -ForegroundColor Yellow
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Failed to install client dependencies" -ForegroundColor Red
        exit 1
    }
}
Set-Location ".."

# Check if Prisma client is generated
Write-Host "🔧 Checking Prisma setup..." -ForegroundColor Yellow
Set-Location "server"
if (-not (Test-Path "node_modules\.prisma")) {
    Write-Host "Generating Prisma client..." -ForegroundColor Yellow
    npm run prisma:generate
}

# Check if database is set up
Write-Host "🔍 Checking database connection..." -ForegroundColor Yellow
$env:Content = Get-Content "../.env" -ErrorAction SilentlyContinue
if (-not $env:Content) {
    Write-Host "⚠️  .env file not found. Please create it from .env.example" -ForegroundColor Yellow
    Write-Host "⚠️  Make sure MySQL is running and DATABASE_URL is set correctly" -ForegroundColor Yellow
} else {
    Write-Host "✅ .env file found" -ForegroundColor Green
}
Set-Location ".."

Write-Host ""
Write-Host "✅ Dependencies ready!" -ForegroundColor Green
Write-Host ""
Write-Host "🚀 Starting servers..." -ForegroundColor Cyan
Write-Host ""
Write-Host "Backend will run on: http://localhost:3001" -ForegroundColor Green
Write-Host "Frontend will run on: http://localhost:8080" -ForegroundColor Green
Write-Host ""
Write-Host "Press Ctrl+C to stop all servers" -ForegroundColor Yellow
Write-Host ""

# Start backend server in a new window
Write-Host "Starting backend server..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$scriptPath\server'; npm run dev"

# Wait a moment for backend to start
Start-Sleep -Seconds 3

# Start frontend client in a new window
Write-Host "Starting frontend client..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$scriptPath\client'; npm run dev"

Write-Host ""
Write-Host "✅ Servers started in separate windows!" -ForegroundColor Green
Write-Host ""
Write-Host "You can now:" -ForegroundColor Cyan
Write-Host "  - Access frontend at http://localhost:8080" -ForegroundColor White
Write-Host "  - Access backend API at http://localhost:3001" -ForegroundColor White
Write-Host "  - Check backend health at http://localhost:3001/health" -ForegroundColor White
Write-Host ""

