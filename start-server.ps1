# Start Backend Server Only
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location "$scriptPath\server"

Write-Host "🚀 Starting NDL Backend Server..." -ForegroundColor Cyan
Write-Host "Server will run on: http://localhost:3001" -ForegroundColor Green
Write-Host ""

if (-not (Test-Path "node_modules")) {
    Write-Host "Installing dependencies..." -ForegroundColor Yellow
    npm install
}

if (-not (Test-Path "node_modules\.prisma")) {
    Write-Host "Generating Prisma client..." -ForegroundColor Yellow
    npm run prisma:generate
}

Write-Host "Starting server..." -ForegroundColor Yellow
npm run dev

