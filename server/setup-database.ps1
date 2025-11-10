# Setup Database Schema - Create tables in Aiven database
Write-Host "Setting up database schema..." -ForegroundColor Cyan
Write-Host ""

# Check if .env exists
if (-not (Test-Path ".env")) {
    Write-Host "❌ .env file not found!" -ForegroundColor Red
    Write-Host "Please run setup-aiven-env.ps1 first" -ForegroundColor Yellow
    exit 1
}

Write-Host "Step 1: Generating Prisma Client..." -ForegroundColor Yellow
npm run prisma:generate
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to generate Prisma client" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Prisma client generated" -ForegroundColor Green
Write-Host ""

Write-Host "Step 2: Pushing schema to database..." -ForegroundColor Yellow
Write-Host "This will create all tables in your Aiven database" -ForegroundColor Gray
npm run prisma:push
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to push schema to database" -ForegroundColor Red
    Write-Host "Check your DATABASE_URL in .env file" -ForegroundColor Yellow
    exit 1
}
Write-Host "✅ Schema pushed to database" -ForegroundColor Green
Write-Host ""

Write-Host "Step 3: (Optional) Seeding database..." -ForegroundColor Yellow
Write-Host "Do you want to seed the database with sample data? (y/n)" -ForegroundColor Cyan
$seed = Read-Host
if ($seed -eq "y" -or $seed -eq "Y") {
    npm run prisma:seed
    if ($LASTEXITCODE -ne 0) {
        Write-Host "⚠️  Seeding failed, but database schema is created" -ForegroundColor Yellow
    } else {
        Write-Host "✅ Database seeded" -ForegroundColor Green
    }
}
Write-Host ""

Write-Host "✅ Database setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "  1. Restart your server" -ForegroundColor White
Write-Host "  2. Test the API endpoints" -ForegroundColor White
Write-Host ""

