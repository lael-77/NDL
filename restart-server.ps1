# Restart NDL Backend Server
Write-Host "`n🔄 Restarting NDL Backend Server...`n" -ForegroundColor Cyan

# Navigate to server directory
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location "$scriptPath\NDL-main\server"

# Stop any running Node processes (be careful with this)
Write-Host "Stopping existing server processes..." -ForegroundColor Yellow
Get-Process -Name "node" -ErrorAction SilentlyContinue | Where-Object { 
    $_.Path -like "*NDL*" -or $_.CommandLine -like "*index.js*" 
} | Stop-Process -Force -ErrorAction SilentlyContinue

Start-Sleep -Seconds 2

# Start the server
Write-Host "Starting server...`n" -ForegroundColor Green
Write-Host "Server will run on: http://localhost:3001" -ForegroundColor Cyan
Write-Host "Press Ctrl+C to stop the server`n" -ForegroundColor Gray
Write-Host "========================================`n" -ForegroundColor Cyan

node src/index.js

