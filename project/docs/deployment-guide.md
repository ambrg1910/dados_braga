# Deployment Guide

## System Requirements

### Production Environment

- **Operating System**: Linux (Ubuntu 20.04 LTS recommended)
- **Node.js**: v14.x or higher
- **PostgreSQL**: v12.x or higher
- **Memory**: Minimum 4GB RAM
- **Storage**: Minimum 20GB available disk space
- **Nginx**: v1.18 or higher (for reverse proxy)

### Development Environment

- **Node.js**: v14.x or higher
- **PostgreSQL**: v12.x or higher
- **Git**: v2.x or higher

## Backend Deployment

### 1. Clone Repository

```bash
git clone <repository-url>
cd project/backend
```

### 2. Install Dependencies

```bash
npm install --production
```

### 3. Configure Environment Variables

Create a `.env` file in the backend directory with the following variables:

```
NODE_ENV=production
PORT=3001

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=card_operations
DB_USER=postgres
DB_PASSWORD=your_secure_password

# JWT Configuration
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRATION=24h

# File Upload Configuration
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=10485760 # 10MB
```

### 4. Set Up Database

```bash
# Create database
psql -U postgres -c "CREATE DATABASE card_operations;"

# Run migrations
npx sequelize-cli db:migrate

# Seed initial data (admin user)
npx sequelize-cli db:seed:all
```

### 5. Start Application

#### Using PM2 (Recommended for Production)

```bash
# Install PM2 globally
npm install -g pm2

# Start application with PM2
pm2 start ecosystem.config.js

# Ensure application starts on system reboot
pm2 startup
pm2 save
```

#### Using Node.js Directly

```bash
node index.js
```

## Frontend Deployment

### 1. Navigate to Frontend Directory

```bash
cd ../frontend
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env` file in the frontend directory with the following variables:

```
REACT_APP_API_URL=http://your-api-domain:3001/api
REACT_APP_ENV=production
```

### 4. Build for Production

```bash
npm run build
```

This will create a `build` directory with optimized production files.

### 5. Deploy Static Files

#### Using Nginx (Recommended)

Install Nginx:

```bash
sudo apt update
sudo apt install nginx
```

Configure Nginx:

```bash
sudo nano /etc/nginx/sites-available/card-operations
```

Add the following configuration:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    # Frontend static files
    location / {
        root /path/to/project/frontend/build;
        index index.html;
        try_files $uri $uri/ /index.html;
    }

    # Backend API proxy
    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable the site and restart Nginx:

```bash
sudo ln -s /etc/nginx/sites-available/card-operations /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

#### Using Serve (Alternative)

```bash
npm install -g serve
serve -s build -l 3000
```

## SSL Configuration (Recommended)

### Using Let's Encrypt with Certbot

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

Follow the prompts to complete SSL certificate installation.

## Database Backup Strategy

### Automated Daily Backups

Create a backup script:

```bash
#!/bin/bash
BACKUP_DIR="/path/to/backups"
DATETIME=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="$BACKUP_DIR/card_operations_$DATETIME.sql"

# Create backup directory if it doesn't exist
mkdir -p $BACKUP_DIR

# Perform backup
pg_dump -U postgres card_operations > $BACKUP_FILE

# Compress backup
gzip $BACKUP_FILE

# Remove backups older than 30 days
find $BACKUP_DIR -name "card_operations_*.sql.gz" -mtime +30 -delete
```

Make the script executable and add to crontab:

```bash
chmod +x backup_script.sh
crontab -e
```

Add the following line to run daily at 2 AM:

```
0 2 * * * /path/to/backup_script.sh
```

## Monitoring

### PM2 Monitoring

```bash
pm2 monit
```

### Log Management

Backend logs are stored in:
- PM2 logs: `~/.pm2/logs/`
- Application logs: `/path/to/project/backend/logs/`

Nginx logs are stored in:
- `/var/log/nginx/access.log`
- `/var/log/nginx/error.log`

## Troubleshooting

### Common Issues

1. **Database Connection Errors**
   - Verify PostgreSQL is running: `sudo systemctl status postgresql`
   - Check database credentials in `.env` file
   - Ensure database user has proper permissions

2. **API Endpoint Not Found**
   - Check Nginx configuration for proper proxy settings
   - Verify backend server is running
   - Check for correct API URL in frontend environment variables

3. **File Upload Issues**
   - Ensure upload directory exists and has proper permissions
   - Check file size limits in both backend and Nginx configurations

4. **JWT Authentication Problems**
   - Verify JWT_SECRET is properly set
   - Check token expiration settings
   - Clear browser cookies and local storage

### Restart Services

```bash
# Restart backend
pm2 restart all

# Restart Nginx
sudo systemctl restart nginx

# Restart PostgreSQL
sudo systemctl restart postgresql
```

## Scaling Considerations

### Horizontal Scaling

- Deploy multiple backend instances behind a load balancer
- Use a connection pool for database connections
- Consider using Redis for session management and caching

### Vertical Scaling

- Increase server resources (CPU, RAM) as needed
- Optimize database queries and add appropriate indexes
- Implement pagination for large data sets

## Security Best Practices

1. **Keep Dependencies Updated**
   ```bash
   npm audit
   npm update
   ```

2. **Implement Rate Limiting**
   Add rate limiting middleware to prevent abuse

3. **Regular Security Audits**
   Perform regular security scans and code reviews

4. **Data Encryption**
   Ensure sensitive data is encrypted at rest and in transit

5. **Firewall Configuration**
   ```bash
   sudo ufw allow 22
   sudo ufw allow 80
   sudo ufw allow 443
   sudo ufw enable
   ```

## Maintenance Procedures

### Regular Updates

1. Pull latest changes from repository
2. Install any new dependencies
3. Run database migrations if needed
4. Rebuild frontend if needed
5. Restart services

### Database Maintenance

```bash
# Connect to PostgreSQL
psql -U postgres -d card_operations

# Analyze and vacuum database
VACUUM ANALYZE;

# Check for bloated tables
SELECT relname, n_dead_tup, n_live_tup FROM pg_stat_user_tables ORDER BY n_dead_tup DESC;
```