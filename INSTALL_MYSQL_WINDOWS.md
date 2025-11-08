# Installing MySQL on Windows

## Option 1: MySQL Installer (Recommended - Easiest)

### Step 1: Download MySQL Installer
1. Go to: https://dev.mysql.com/downloads/installer/
2. Download **MySQL Installer for Windows** (the larger file, ~400MB)
   - Choose the **full installer** (mysql-installer-community-*.msi)
   - Or the **web installer** (smaller download, downloads components during installation)

### Step 2: Install MySQL
1. Run the downloaded installer
2. Choose **"Developer Default"** (includes MySQL Server, MySQL Workbench, etc.)
3. Click **"Execute"** to install required components
4. Click **"Next"** after components are installed
5. Click **"Execute"** again to configure components
6. Configure MySQL Server:
   - **Standalone MySQL Server**
   - **Config Type**: Development Computer
   - **Port**: 3306 (default)
   - **Authentication**: Use Strong Password Encryption
   - Set **Root Password** (remember this!)
   - Click **"Execute"** to apply configuration
7. Complete the installation

### Step 3: Verify Installation
1. Open **Command Prompt** or **PowerShell** as Administrator
2. Test MySQL:
   ```powershell
   mysql --version
   ```
3. If MySQL is not recognized, add it to PATH:
   - MySQL is usually installed in: `C:\Program Files\MySQL\MySQL Server 8.0\bin`
   - Add this to your system PATH environment variable

### Step 4: Start MySQL Service
```powershell
# Check if MySQL service is running
Get-Service MySQL80

# Start MySQL service (if not running)
Start-Service MySQL80
```

## Option 2: Install Chocolatey First (Then MySQL)

### Step 1: Install Chocolatey
1. Open PowerShell as **Administrator**
2. Run:
   ```powershell
   Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))
   ```
3. Verify installation:
   ```powershell
   choco --version
   ```

### Step 2: Install MySQL via Chocolatey
```powershell
choco install mysql -y
```

## Option 3: Use XAMPP (Includes MySQL)

XAMPP includes MySQL, Apache, PHP, and phpMyAdmin:

1. Download XAMPP: https://www.apachefriends.org/
2. Install XAMPP
3. Start MySQL from XAMPP Control Panel
4. MySQL will be available on port 3306
5. Default root password is empty (blank)

## Option 4: Use Docker Desktop

1. Download Docker Desktop: https://www.docker.com/products/docker-desktop/
2. Install and restart computer
3. Start Docker Desktop
4. Run:
   ```powershell
   docker run --name ndl-mysql -e MYSQL_ROOT_PASSWORD=root_password -e MYSQL_DATABASE=ndl_db -e MYSQL_USER=ndl_user -e MYSQL_PASSWORD=ndl_password -p 3306:3306 -d mysql:8.0
   ```

## After Installation

### Create Database and User

1. Open MySQL Command Line Client or MySQL Workbench
2. Login as root:
   ```sql
   mysql -u root -p
   ```
   (Enter your root password)

3. Create database and user:
   ```sql
   CREATE DATABASE ndl_db;
   CREATE USER 'ndl_user'@'localhost' IDENTIFIED BY 'ndl_password';
   GRANT ALL PRIVILEGES ON ndl_db.* TO 'ndl_user'@'localhost';
   FLUSH PRIVILEGES;
   EXIT;
   ```

### Verify Connection

```powershell
mysql -u ndl_user -pndl_password -h localhost ndl_db
```

If this works, you're ready to proceed with the NDL setup!

## Troubleshooting

### MySQL Command Not Found

**Add MySQL to PATH:**
1. Open **System Properties** → **Environment Variables**
2. Under **System Variables**, find **Path** and click **Edit**
3. Click **New** and add: `C:\Program Files\MySQL\MySQL Server 8.0\bin`
4. Click **OK** on all windows
5. Restart PowerShell/Command Prompt

### Service Won't Start

1. Open **Services** (services.msc)
2. Find **MySQL80** service
3. Right-click → **Properties**
4. Set **Startup type** to **Automatic**
5. Click **Start**

### Port 3306 Already in Use

1. Check what's using the port:
   ```powershell
   netstat -ano | findstr :3306
   ```
2. Stop the service using that port, or change MySQL port in `my.ini`

### Can't Connect to MySQL

1. Check MySQL service is running:
   ```powershell
   Get-Service MySQL80
   ```
2. Check firewall allows MySQL
3. Verify credentials
4. Check MySQL is listening on correct port

## Next Steps

After MySQL is installed and running:

1. Run the setup script:
   ```powershell
   cd "C:\Users\TECH ALLIANCE LTD\Desktop\NDL-main\NDL-main"
   .\setup-local.ps1
   ```

2. Or manually:
   ```powershell
   cd server
   npm install
   npm run prisma:generate
   npm run prisma:migrate
   ```

## Quick Reference

- **MySQL Default Port**: 3306
- **MySQL Installation Path**: `C:\Program Files\MySQL\MySQL Server 8.0\`
- **MySQL Data Path**: `C:\ProgramData\MySQL\MySQL Server 8.0\Data\`
- **MySQL Config File**: `C:\ProgramData\MySQL\MySQL Server 8.0\my.ini`
