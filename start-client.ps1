# Start Frontend Client Only
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location "$scriptPath\client"

Write-Host "🚀 Starting NDL Frontend Client..." -ForegroundColor Cyan
Write-Host "Client will run on: http://localhost:8080" -ForegroundColor Green
Write-Host ""

if (-not (Test-Path "node_modules")) {
    Write-Host "Installing dependencies..." -ForegroundColor Yellow
    npm install
}

Write-Host "Starting client..." -ForegroundColor Yellow
npm run dev

