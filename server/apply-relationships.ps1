# Apply Database Relationships and Authority System
Write-Host "`n🔗 Applying Database Relationships and Authority System...`n" -ForegroundColor Cyan

# Navigate to server directory
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptPath

Write-Host "Step 1: Updating database schema..." -ForegroundColor Yellow
try {
    npx prisma db push --accept-data-loss
    Write-Host "✅ Schema updated successfully`n" -ForegroundColor Green
} catch {
    Write-Host "❌ Error updating schema: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host "Step 2: Reseeding database with new relationships..." -ForegroundColor Yellow
try {
    node prisma/seed.js
    Write-Host "✅ Database reseeded successfully`n" -ForegroundColor Green
} catch {
    Write-Host "❌ Error reseeding database: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Relationships and Authority System Applied Successfully!`n" -ForegroundColor Green
Write-Host "📋 Summary:" -ForegroundColor Cyan
Write-Host "   - All students are now linked to schools, teams, and coaches" -ForegroundColor White
Write-Host "   - RBAC system is active" -ForegroundColor White
Write-Host "   - Management endpoints are available`n" -ForegroundColor White
Write-Host "🔄 Next: Restart your server to load the new routes`n" -ForegroundColor Yellow

