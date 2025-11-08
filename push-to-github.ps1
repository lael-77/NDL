# PowerShell script to push NDL project to GitHub
# Make sure Git is installed and configured before running this script

Write-Host "===================================" -ForegroundColor Cyan
Write-Host "  Pushing NDL to GitHub" -ForegroundColor Cyan
Write-Host "===================================" -ForegroundColor Cyan
Write-Host ""

$repoPath = "C:\Users\TECH ALLIANCE LTD\Desktop\NDL-main\NDL-main"
$remoteUrl = "https://github.com/lael-77/NDL.git"

# Navigate to project directory
Set-Location $repoPath

# Check if git is available
try {
    $gitVersion = git --version
    Write-Host "[OK] Git found: $gitVersion" -ForegroundColor Green
} catch {
    Write-Host "[ERROR] Git is not installed or not in PATH" -ForegroundColor Red
    Write-Host "Please install Git from: https://git-scm.com/download/win" -ForegroundColor Yellow
    exit 1
}

# Check if .git exists, if not initialize
if (-not (Test-Path ".git")) {
    Write-Host "[INFO] Initializing git repository..." -ForegroundColor Yellow
    git init
}

# Check remote
$remoteExists = git remote get-url origin 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "[INFO] Adding remote repository..." -ForegroundColor Yellow
    git remote add origin $remoteUrl
} else {
    Write-Host "[INFO] Remote already exists: $remoteExists" -ForegroundColor Green
    Write-Host "[INFO] Updating remote URL..." -ForegroundColor Yellow
    git remote set-url origin $remoteUrl
}

# Create .gitignore if it doesn't exist
if (-not (Test-Path ".gitignore")) {
    Write-Host "[INFO] Creating .gitignore..." -ForegroundColor Yellow
    @"
# Dependencies
node_modules/
/.pnp
.pnp.js

# Testing
/coverage

# Production
/build
/dist

# Misc
.DS_Store
.env.local
.env.development.local
.env.test.local
.env.production.local

# Logs
npm-debug.log*
yarn-debug.log*
yarn-error.log*
lerna-debug.log*

# IDE
.vscode/
.idea/
*.swp
*.swo
*~

# OS
Thumbs.db

# Environment variables
.env
.env.example

# Database
*.db
*.sqlite

# Prisma
prisma/migrations/
"@ | Out-File -FilePath ".gitignore" -Encoding UTF8
}

# Add all files
Write-Host "[INFO] Adding all files..." -ForegroundColor Yellow
git add .

# Check if there are changes to commit
$status = git status --porcelain
if ($status) {
    Write-Host "[INFO] Committing changes..." -ForegroundColor Yellow
    git commit -m "Complete NDL frontend and backend implementation

- Added LiveScore-style frontend with all backend functionalities
- Implemented Socket.io for real-time updates
- Created Player Dashboard, Admin Dashboard, and Judge Panel
- Added Fixtures/Arenas page with list and map views
- Enhanced Team Profile with tabs (Players, Match History, Awards)
- Integrated Framer Motion animations
- Set up complete authentication system
- Added notification system with real-time updates
- Configured MySQL database with Prisma ORM
- Added comprehensive documentation and setup scripts"
    
    Write-Host "[INFO] Pushing to GitHub..." -ForegroundColor Yellow
    git branch -M main
    git push -u origin main
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "" -ForegroundColor Green
        Write-Host "===================================" -ForegroundColor Green
        Write-Host "  Successfully pushed to GitHub!" -ForegroundColor Green
        Write-Host "===================================" -ForegroundColor Green
        Write-Host ""
        Write-Host "Repository: $remoteUrl" -ForegroundColor Cyan
    } else {
        Write-Host "[ERROR] Failed to push. You may need to authenticate." -ForegroundColor Red
        Write-Host "Try: git push -u origin main" -ForegroundColor Yellow
    }
} else {
    Write-Host "[INFO] No changes to commit. Everything is up to date." -ForegroundColor Green
}

Write-Host ""

