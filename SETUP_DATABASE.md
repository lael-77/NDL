# Setting Up Database in XAMPP

## Quick Setup

### Option 1: Using phpMyAdmin (Easiest)

1. **Start Apache and MySQL in XAMPP Control Panel**

2. **Open phpMyAdmin**
   - Go to: http://localhost/phpmyadmin
   - Login: `root` (leave password blank)

3. **Create Database**
   - Click "New" in left sidebar
   - Database name: `ndl_db`
   - Collation: `utf8mb4_unicode_ci`
   - Click "Create"

4. **Create User**
   - Click "User accounts" tab
   - Click "Add user account"
   - Username: `ndl_user`
   - Host name: `localhost`
   - Password: `ndl_password`
   - Under "Database for user account":
     - Select "Grant all privileges on database 'ndl_db'"
   - Click "Go"

### Option 2: Using MySQL Command Line

1. **Open Command Prompt or PowerShell**

2. **Navigate to XAMPP MySQL**
   ```powershell
   cd C:\xampp\mysql\bin
   ```

3. **Connect to MySQL**
   ```powershell
   mysql.exe -u root
   ```
   (Press Enter when asked for password - XAMPP root has no password by default)

4. **Run SQL Commands**
   ```sql
   CREATE DATABASE ndl_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   CREATE USER 'ndl_user'@'localhost' IDENTIFIED BY 'ndl_password';
   GRANT ALL PRIVILEGES ON ndl_db.* TO 'ndl_user'@'localhost';
   FLUSH PRIVILEGES;
   EXIT;
   ```

### Option 3: Using Script (If MySQL is Working)

```powershell
.\create-database.ps1
```

## Troubleshooting

### Error: "Read page with wrong checksum"

This is a common XAMPP MySQL issue. Fix it:

1. **Stop MySQL** in XAMPP Control Panel

2. **Repair MySQL**:
   ```powershell
   cd C:\xampp\mysql\bin
   mysqlcheck.exe -u root --repair --all-databases
   ```

3. **Or reinstall XAMPP MySQL** (if repair doesn't work)

### Error: "Access denied"

1. Make sure MySQL is running
2. Try using root user (no password in XAMPP)
3. Check if user already exists:
   ```sql
   SELECT User, Host FROM mysql.user;
   ```

### Error: "Database already exists"

If database exists but user doesn't:
```sql
CREATE USER 'ndl_user'@'localhost' IDENTIFIED BY 'ndl_password';
GRANT ALL PRIVILEGES ON ndl_db.* TO 'ndl_user'@'localhost';
FLUSH PRIVILEGES;
```

### Using Root User (Temporary - Not Recommended)

If you can't create a user, you can temporarily use root:

Update `.env` file:
```env
DATABASE_URL=mysql://root:@localhost:3306/ndl_db
```

(Note: Empty password after the colon)

## Verify Setup

Test connection:
```powershell
cd C:\xampp\mysql\bin
mysql.exe -u ndl_user -pndl_password ndl_db
```

If you can connect, setup is correct!

## After Database is Created

Run Prisma migrations:
```powershell
cd server
npm run prisma:push
```

Or:
```powershell
cd server
npm run prisma:migrate
```

