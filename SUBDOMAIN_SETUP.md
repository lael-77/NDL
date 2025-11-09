# Admin Subdomain Setup Guide

## Current Implementation

The admin dashboard is accessible via:
1. **Direct path**: `http://localhost:8080/admin` (works in development)
2. **Subdomain**: `http://admin.localhost:8080` or `http://admin.ndl` (requires configuration)

## Development Setup

### Option 1: Use Direct Path (Easiest)
Just navigate to: `http://localhost:8080/admin`
- No configuration needed
- Works immediately
- Admin users will be redirected here automatically

### Option 2: Use admin.localhost (For Testing Subdomain)
1. Edit your hosts file:
   - Windows: `C:\Windows\System32\drivers\etc\hosts`
   - Add line: `127.0.0.1 admin.localhost`
2. Access: `http://admin.localhost:8080/admin`

## Production Setup

### DNS Configuration
1. Add an A record or CNAME record:
   - `admin.ndl` → Your server IP
   - Or `admin.yourdomain.com` → Your server IP

### Server Configuration (Nginx Example)
```nginx
# Main domain
server {
    listen 80;
    server_name ndl.com www.ndl.com;
    
    location / {
        proxy_pass http://localhost:8080;
    }
}

# Admin subdomain
server {
    listen 80;
    server_name admin.ndl.com;
    
    location / {
        proxy_pass http://localhost:8080;
    }
}
```

### Server Configuration (Apache Example)
```apache
# Main domain
<VirtualHost *:80>
    ServerName ndl.com
    ProxyPass / http://localhost:8080/
    ProxyPassReverse / http://localhost:8080/
</VirtualHost>

# Admin subdomain
<VirtualHost *:80>
    ServerName admin.ndl.com
    ProxyPass / http://localhost:8080/
    ProxyPassReverse / http://localhost:8080/
</VirtualHost>
```

## How It Works

- The app checks `window.location.hostname` to detect if you're on an admin subdomain
- If hostname starts with `admin.` or equals `admin.localhost`, it's treated as admin subdomain
- Admin users are automatically redirected to `/admin` path
- Non-admin users are blocked from accessing admin routes

## Testing

1. **Development**: Use `http://localhost:8080/admin` directly
2. **Local Subdomain Test**: Configure hosts file and use `http://admin.localhost:8080/admin`
3. **Production**: Use `http://admin.ndl/admin` after DNS is configured

