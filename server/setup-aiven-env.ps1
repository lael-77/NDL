# Setup Aiven Database Environment Variables
# This script updates the .env file with Aiven MySQL credentials
# For local development, create a .env.local file with local database settings

Write-Host "Setting up Aiven MySQL Database Configuration..." -ForegroundColor Cyan
Write-Host "Note: This will replace the .env file with Aiven production settings." -ForegroundColor Yellow
Write-Host "For local development, create a .env.local file with local MySQL settings." -ForegroundColor Yellow
Write-Host ""

# Aiven Database Credentials (from Aiven Console)
# IMPORTANT: Replace YOUR_AIVEN_PASSWORD with your actual Aiven database password from Aiven console
$DB_HOST = "ndldb-ndldb.k.aivencloud.com"
$DB_USER = "avnadmin"
$DB_PASSWORD = "YOUR_AIVEN_PASSWORD"  # Replace with your actual password from Aiven console
$DB_NAME = "defaultdb"
$DB_PORT = "24600"

# Construct DATABASE_URL for Prisma
# Prisma MySQL connector (mysql2) supports SSL through ssl parameter
# For Aiven, we use ssl=true to enable SSL connections
$DATABASE_URL = "mysql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}?ssl=true"

Write-Host "Updating .env file..." -ForegroundColor Yellow

# Read existing .env or create new one
$envContent = @()

# Check if .env exists and preserve other variables
if (Test-Path ".env") {
    $existingContent = Get-Content ".env"
    $envContent = $existingContent | Where-Object { 
        $_ -notmatch "^DATABASE_URL=" -and 
        $_ -notmatch "^DB_HOST=" -and 
        $_ -notmatch "^DB_USER=" -and 
        $_ -notmatch "^DB_PASSWORD=" -and 
        $_ -notmatch "^DB_NAME=" -and 
        $_ -notmatch "^DB_PORT=" -and
        $_ -notmatch "^CA_CERT_PATH=" -and
        $_ -notmatch "^CLIENT_URL="
    }
}

# Add database configuration
$envContent += ""
$envContent += "# Aiven MySQL Database Configuration"
$envContent += "DATABASE_URL=`"$DATABASE_URL`""
$envContent += ""
$envContent += "# Individual Database Variables"
$envContent += "DB_HOST=$DB_HOST"
$envContent += "DB_USER=$DB_USER"
$envContent += "DB_PASSWORD=$DB_PASSWORD"
$envContent += "DB_NAME=$DB_NAME"
$envContent += "DB_PORT=$DB_PORT"
$envContent += ""

# Add/Update PORT if not exists
if (-not ($envContent -match "^PORT=")) {
    $envContent += "# Server Configuration"
    $envContent += "PORT=3001"
    $envContent += ""
}

# Add/Update NODE_ENV if not exists
if (-not ($envContent -match "^NODE_ENV=")) {
    $envContent += "NODE_ENV=production"
    $envContent += ""
}

# Add CLIENT_URL for Vercel (update with your actual Vercel URL)
if (-not ($envContent -match "^CLIENT_URL=")) {
    $envContent += "# Client URL (Update with your Vercel frontend URL)"
    $envContent += "CLIENT_URL=https://your-frontend-app.vercel.app"
    $envContent += ""
}

# Add JWT_SECRET if not exists
if (-not ($envContent -match "^JWT_SECRET=")) {
    $envContent += "# JWT Secret (generate a secure random string)"
    $envContent += "JWT_SECRET=$(New-Guid)"
    $envContent += ""
}

# Write to .env file
$envContent | Out-File -FilePath ".env" -Encoding utf8 -Force

Write-Host ".env file updated successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "Configuration Summary:" -ForegroundColor Cyan
Write-Host "   Database Host: $DB_HOST" -ForegroundColor White
Write-Host "   Database Port: $DB_PORT" -ForegroundColor White
Write-Host "   Database Name: $DB_NAME" -ForegroundColor White
Write-Host "   SSL Mode: REQUIRED" -ForegroundColor White
Write-Host ""
Write-Host "Important Notes:" -ForegroundColor Yellow
Write-Host "   1. The DATABASE_URL includes SSL configuration for Aiven" -ForegroundColor White
Write-Host "   2. For Vercel deployment, add these environment variables in Vercel dashboard" -ForegroundColor White
Write-Host "   3. Update CLIENT_URL with your actual Vercel frontend URL" -ForegroundColor White
Write-Host "   4. Keep JWT_SECRET secure and use the same value in Vercel" -ForegroundColor White
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Cyan
Write-Host "   1. Test the connection: npm run dev" -ForegroundColor White
Write-Host "   2. Run Prisma migrations: npx prisma migrate deploy" -ForegroundColor White
Write-Host "   3. Generate Prisma client: npm run prisma:generate" -ForegroundColor White
Write-Host ""

