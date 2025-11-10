# Update .env file with both Local and Aiven database configurations
# This allows easy switching between local development and production

Write-Host "Updating .env file with both Local and Aiven database configurations..." -ForegroundColor Cyan
Write-Host ""

# Aiven Database Credentials (Production)
# IMPORTANT: Replace YOUR_AIVEN_PASSWORD with your actual Aiven database password from Aiven console
$AIVEN_DB_HOST = "ndldb-ndldb.k.aivencloud.com"
$AIVEN_DB_USER = "avnadmin"
$AIVEN_DB_PASSWORD = "YOUR_AIVEN_PASSWORD"  # Replace with your actual password from Aiven console
$AIVEN_DB_NAME = "defaultdb"
$AIVEN_DB_PORT = "24600"
$AIVEN_DATABASE_URL = "mysql://${AIVEN_DB_USER}:${AIVEN_DB_PASSWORD}@${AIVEN_DB_HOST}:${AIVEN_DB_PORT}/${AIVEN_DB_NAME}?ssl=true"

# Local Database Credentials (Development)
$LOCAL_DB_USER = "root"
$LOCAL_DB_PASSWORD = ""
$LOCAL_DB_HOST = "localhost"
$LOCAL_DB_PORT = "3306"
$LOCAL_DB_NAME = "ndl_db"
$LOCAL_DATABASE_URL = "mysql://${LOCAL_DB_USER}:${LOCAL_DB_PASSWORD}@${LOCAL_DB_HOST}:${LOCAL_DB_PORT}/${LOCAL_DB_NAME}"

# Read existing .env to preserve other variables
$envContent = @()

if (Test-Path ".env") {
    $existingContent = Get-Content ".env"
    $envContent = $existingContent | Where-Object { 
        $_ -notmatch "^DATABASE_URL=" -and 
        $_ -notmatch "^#.*Database" -and
        $_ -notmatch "^DB_HOST=" -and 
        $_ -notmatch "^DB_USER=" -and 
        $_ -notmatch "^DB_PASSWORD=" -and 
        $_ -notmatch "^DB_NAME=" -and 
        $_ -notmatch "^DB_PORT=" -and
        $_ -notmatch "^#.*Aiven" -and
        $_ -notmatch "^#.*Local" -and
        $_ -notmatch "^AIVEN_" -and
        $_ -notmatch "^LOCAL_"
    }
}

# Build new .env content
$newContent = @()

# Add existing non-database variables first
$newContent += $envContent

# Add database configuration section
$newContent += ""
$newContent += "# ============================================"
$newContent += "# DATABASE CONFIGURATION"
$newContent += "# ============================================"
$newContent += ""
$newContent += "# To switch between databases, change the DATABASE_URL below"
$newContent += "# Uncomment the one you want to use and comment out the other"
$newContent += ""
$newContent += "# LOCAL DATABASE (Development)"
$newContent += "# Use this for local development with MySQL on your machine"
$newContent += "LOCAL_DATABASE_URL=`"$LOCAL_DATABASE_URL`""
$newContent += "LOCAL_DB_HOST=$LOCAL_DB_HOST"
$newContent += "LOCAL_DB_USER=$LOCAL_DB_USER"
$newContent += "LOCAL_DB_PASSWORD=$LOCAL_DB_PASSWORD"
$newContent += "LOCAL_DB_NAME=$LOCAL_DB_NAME"
$newContent += "LOCAL_DB_PORT=$LOCAL_DB_PORT"
$newContent += ""
$newContent += "# AIVEN DATABASE (Production)"
$newContent += "# Use this for production with Aiven MySQL cloud database"
$newContent += "AIVEN_DATABASE_URL=`"$AIVEN_DATABASE_URL`""
$newContent += "AIVEN_DB_HOST=$AIVEN_DB_HOST"
$newContent += "AIVEN_DB_USER=$AIVEN_DB_USER"
$newContent += "AIVEN_DB_PASSWORD=$AIVEN_DB_PASSWORD"
$newContent += "AIVEN_DB_NAME=$AIVEN_DB_NAME"
$newContent += "AIVEN_DB_PORT=$AIVEN_DB_PORT"
$newContent += ""
$newContent += "# ACTIVE DATABASE URL"
$newContent += "# Change this to switch between local and Aiven"
$newContent += "# For LOCAL: DATABASE_URL=`"$LOCAL_DATABASE_URL`""
$newContent += "# For AIVEN: DATABASE_URL=`"$AIVEN_DATABASE_URL`""
$newContent += "DATABASE_URL=`"$AIVEN_DATABASE_URL`""
$newContent += ""

# Add/Update PORT if not exists
if (-not ($newContent -match "^PORT=")) {
    $newContent += "# Server Configuration"
    $newContent += "PORT=3001"
    $newContent += ""
}

# Add/Update NODE_ENV if not exists
if (-not ($newContent -match "^NODE_ENV=")) {
    $newContent += "NODE_ENV=development"
    $newContent += ""
}

# Add CLIENT_URL if not exists
if (-not ($newContent -match "^CLIENT_URL=")) {
    $newContent += "# Client URL (Frontend)"
    $newContent += "# For local development: http://localhost:8080"
    $newContent += "# For production: https://your-frontend-app.vercel.app"
    $newContent += "CLIENT_URL=http://localhost:8080"
    $newContent += ""
}

# Add JWT_SECRET if not exists
if (-not ($newContent -match "^JWT_SECRET=")) {
    $newContent += "# JWT Secret"
    $newContent += "JWT_SECRET=your-super-secret-jwt-key-change-in-production"
    $newContent += ""
}

# Write to .env file
$newContent | Out-File -FilePath ".env" -Encoding utf8 -Force

Write-Host ".env file updated successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "Configuration Summary:" -ForegroundColor Cyan
Write-Host "  Local Database: $LOCAL_DATABASE_URL" -ForegroundColor White
Write-Host "  Aiven Database: $AIVEN_DATABASE_URL" -ForegroundColor White
Write-Host "  Active Database: AIVEN (Production)" -ForegroundColor Yellow
Write-Host ""
Write-Host "To switch databases:" -ForegroundColor Cyan
Write-Host "  1. Open .env file" -ForegroundColor White
Write-Host "  2. Find the DATABASE_URL line" -ForegroundColor White
Write-Host "  3. Change it to:" -ForegroundColor White
Write-Host "     - For LOCAL: DATABASE_URL=`"$LOCAL_DATABASE_URL`"" -ForegroundColor Green
Write-Host "     - For AIVEN: DATABASE_URL=`"$AIVEN_DATABASE_URL`"" -ForegroundColor Green
Write-Host ""

