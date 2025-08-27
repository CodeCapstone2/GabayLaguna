# Gabay Laguna Backend - Deployment Guide

## Overview

This guide provides comprehensive instructions for deploying the Gabay Laguna backend API to various environments, from local development to production.

## Prerequisites

### System Requirements
- **PHP**: 8.2 or higher
- **Composer**: Latest version
- **MySQL**: 8.0 or higher (or PostgreSQL 13+)
- **Redis**: 6.0 or higher (for caching and queues)
- **Node.js**: 18+ (for asset compilation)
- **NPM**: Latest version

### Server Requirements
- **Web Server**: Apache 2.4+ or Nginx 1.18+
- **SSL Certificate**: For production (Let's Encrypt recommended)
- **Domain**: Configured and pointing to your server

## Environment Setup

### 1. Local Development Environment

#### Step 1: Clone and Setup
```bash
# Clone the repository
git clone <repository-url>
cd gabay-laguna-backend

# Install PHP dependencies
composer install

# Install Node.js dependencies
npm install

# Copy environment file
cp .env.example .env

# Generate application key
php artisan key:generate
```

#### Step 2: Database Configuration
```bash
# Update .env file with database credentials
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=gabay_laguna_dev
DB_USERNAME=root
DB_PASSWORD=your_password

# Run migrations
php artisan migrate

# Seed database with sample data
php artisan db:seed
```

#### Step 3: Configure Services
```bash
# Update .env with service configurations
PAYPAL_CLIENT_ID=your_paypal_client_id
PAYPAL_SECRET=your_paypal_secret
PAYPAL_MODE=sandbox

PAYMONGO_SECRET_KEY=your_paymongo_secret_key
PAYMONGO_PUBLIC_KEY=your_paymongo_public_key

GOOGLE_MAPS_API_KEY=your_google_maps_api_key

# For SMS notifications (optional)
SMS_ENABLED=true
TWILIO_SID=your_twilio_sid
TWILIO_TOKEN=your_twilio_token
TWILIO_FROM=your_twilio_phone_number
```

#### Step 4: Start Development Server
```bash
# Start Laravel development server
php artisan serve

# In another terminal, start queue worker
php artisan queue:work

# In another terminal, start asset compilation
npm run dev
```

### 2. Staging Environment

#### Step 1: Server Preparation
```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Install required packages
sudo apt install -y nginx mysql-server php8.2-fpm php8.2-mysql php8.2-xml php8.2-mbstring php8.2-curl php8.2-redis php8.2-zip unzip git composer redis-server
```

#### Step 2: Database Setup
```bash
# Create database and user
sudo mysql -u root -p
CREATE DATABASE gabay_laguna_staging;
CREATE USER 'gabay_user'@'localhost' IDENTIFIED BY 'secure_password';
GRANT ALL PRIVILEGES ON gabay_laguna_staging.* TO 'gabay_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

#### Step 3: Application Deployment
```bash
# Create application directory
sudo mkdir -p /var/www/gabay-laguna-staging
sudo chown -R $USER:$USER /var/www/gabay-laguna-staging

# Clone repository
cd /var/www/gabay-laguna-staging
git clone <repository-url> .

# Install dependencies
composer install --optimize-autoloader --no-dev
npm install
npm run build

# Set permissions
sudo chown -R www-data:www-data /var/www/gabay-laguna-staging
sudo chmod -R 755 /var/www/gabay-laguna-staging
sudo chmod -R 775 /var/www/gabay-laguna-staging/storage
sudo chmod -R 775 /var/www/gabay-laguna-staging/bootstrap/cache
```

#### Step 4: Environment Configuration
```bash
# Copy and configure environment file
cp .env.example .env
nano .env

# Update with staging configurations
APP_ENV=staging
APP_DEBUG=false
APP_URL=https://staging.gabaylaguna.com

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=gabay_laguna_staging
DB_USERNAME=gabay_user
DB_PASSWORD=secure_password

CACHE_DRIVER=redis
QUEUE_CONNECTION=redis
SESSION_DRIVER=redis

# Generate application key
php artisan key:generate

# Run migrations
php artisan migrate --force

# Seed database
php artisan db:seed --force
```

#### Step 5: Nginx Configuration
```bash
# Create Nginx configuration
sudo nano /etc/nginx/sites-available/gabay-laguna-staging

# Add configuration
server {
    listen 80;
    server_name staging.gabaylaguna.com;
    root /var/www/gabay-laguna-staging/public;

    add_header X-Frame-Options "SAMEORIGIN";
    add_header X-Content-Type-Options "nosniff";

    index index.php;

    charset utf-8;

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location = /favicon.ico { access_log off; log_not_found off; }
    location = /robots.txt  { access_log off; log_not_found off; }

    error_page 404 /index.php;

    location ~ \.php$ {
        fastcgi_pass unix:/var/run/php/php8.2-fpm.sock;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        include fastcgi_params;
    }

    location ~ /\.(?!well-known).* {
        deny all;
    }
}

# Enable site
sudo ln -s /etc/nginx/sites-available/gabay-laguna-staging /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

#### Step 6: SSL Configuration
```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Obtain SSL certificate
sudo certbot --nginx -d staging.gabaylaguna.com

# Test auto-renewal
sudo certbot renew --dry-run
```

#### Step 7: Queue Worker Setup
```bash
# Create systemd service for queue worker
sudo nano /etc/systemd/system/gabay-laguna-queue.service

# Add configuration
[Unit]
Description=Gabay Laguna Queue Worker
After=network.target

[Service]
Type=simple
User=www-data
Group=www-data
WorkingDirectory=/var/www/gabay-laguna-staging
ExecStart=/usr/bin/php artisan queue:work --sleep=3 --tries=3 --max-time=3600
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target

# Enable and start service
sudo systemctl enable gabay-laguna-queue
sudo systemctl start gabay-laguna-queue
```

### 3. Production Environment

#### Step 1: Server Preparation
```bash
# Use a cloud provider (AWS, DigitalOcean, etc.)
# Recommended: Ubuntu 22.04 LTS with at least 2GB RAM

# Update system
sudo apt update && sudo apt upgrade -y

# Install required packages
sudo apt install -y nginx mysql-server php8.2-fpm php8.2-mysql php8.2-xml php8.2-mbstring php8.2-curl php8.2-redis php8.2-zip unzip git composer redis-server supervisor
```

#### Step 2: Security Hardening
```bash
# Configure firewall
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
sudo ufw enable

# Secure MySQL
sudo mysql_secure_installation

# Configure PHP security
sudo nano /etc/php/8.2/fpm/php.ini
# Set: expose_php = Off
# Set: max_execution_time = 60
# Set: memory_limit = 256M
# Set: upload_max_filesize = 10M
# Set: post_max_size = 10M

sudo systemctl restart php8.2-fpm
```

#### Step 3: Database Setup
```bash
# Create production database
sudo mysql -u root -p
CREATE DATABASE gabay_laguna_prod;
CREATE USER 'gabay_prod_user'@'localhost' IDENTIFIED BY 'very_secure_password';
GRANT ALL PRIVILEGES ON gabay_laguna_prod.* TO 'gabay_prod_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;

# Configure MySQL for performance
sudo nano /etc/mysql/mysql.conf.d/mysqld.cnf
# Add:
# innodb_buffer_pool_size = 1G
# max_connections = 200
# query_cache_size = 64M

sudo systemctl restart mysql
```

#### Step 4: Application Deployment
```bash
# Create application directory
sudo mkdir -p /var/www/gabay-laguna
sudo chown -R $USER:$USER /var/www/gabay-laguna

# Clone repository
cd /var/www/gabay-laguna
git clone <repository-url> .

# Install dependencies
composer install --optimize-autoloader --no-dev
npm install
npm run build

# Set permissions
sudo chown -R www-data:www-data /var/www/gabay-laguna
sudo chmod -R 755 /var/www/gabay-laguna
sudo chmod -R 775 /var/www/gabay-laguna/storage
sudo chmod -R 775 /var/www/gabay-laguna/bootstrap/cache
```

#### Step 5: Environment Configuration
```bash
# Configure production environment
cp .env.example .env
nano .env

# Production settings
APP_ENV=production
APP_DEBUG=false
APP_URL=https://api.gabaylaguna.com

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=gabay_laguna_prod
DB_USERNAME=gabay_prod_user
DB_PASSWORD=very_secure_password

CACHE_DRIVER=redis
QUEUE_CONNECTION=redis
SESSION_DRIVER=redis

# Production payment settings
PAYPAL_MODE=live
PAYPAL_CLIENT_ID=your_live_paypal_client_id
PAYPAL_SECRET=your_live_paypal_secret

# Generate key and optimize
php artisan key:generate
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Run migrations
php artisan migrate --force
```

#### Step 6: Nginx Configuration
```bash
# Create production Nginx configuration
sudo nano /etc/nginx/sites-available/gabay-laguna

# Add configuration
server {
    listen 80;
    server_name api.gabaylaguna.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name api.gabaylaguna.com;
    root /var/www/gabay-laguna/public;

    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/api.gabaylaguna.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.gabaylaguna.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;

    # Security Headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;

    index index.php;
    charset utf-8;

    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    limit_req zone=api burst=20 nodelay;

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location = /favicon.ico { access_log off; log_not_found off; }
    location = /robots.txt  { access_log off; log_not_found off; }

    error_page 404 /index.php;

    location ~ \.php$ {
        fastcgi_pass unix:/var/run/php/php8.2-fpm.sock;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        include fastcgi_params;
        fastcgi_hide_header X-Powered-By;
    }

    location ~ /\.(?!well-known).* {
        deny all;
    }

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied expired no-cache no-store private must-revalidate auth;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/javascript;
}

# Enable site
sudo ln -s /etc/nginx/sites-available/gabay-laguna /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

#### Step 7: SSL Certificate
```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Obtain SSL certificate
sudo certbot --nginx -d api.gabaylaguna.com

# Set up auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

#### Step 8: Supervisor Configuration
```bash
# Configure supervisor for queue workers
sudo nano /etc/supervisor/conf.d/gabay-laguna.conf

# Add configuration
[program:gabay-laguna-worker]
process_name=%(program_name)s_%(process_num)02d
command=php /var/www/gabay-laguna/artisan queue:work --sleep=3 --tries=3 --max-time=3600
autostart=true
autorestart=true
stopasgroup=true
killasgroup=true
user=www-data
numprocs=2
redirect_stderr=true
stdout_logfile=/var/www/gabay-laguna/storage/logs/worker.log
stopwaitsecs=3600

# Start supervisor
sudo supervisorctl reread
sudo supervisorctl update
sudo supervisorctl start gabay-laguna-worker:*
```

#### Step 9: Monitoring and Logging
```bash
# Install monitoring tools
sudo apt install -y htop iotop nethogs

# Configure log rotation
sudo nano /etc/logrotate.d/gabay-laguna

# Add configuration
/var/www/gabay-laguna/storage/logs/*.log {
    daily
    missingok
    rotate 52
    compress
    delaycompress
    notifempty
    create 644 www-data www-data
    postrotate
        supervisorctl restart gabay-laguna-worker:*
    endscript
}
```

## Deployment Scripts

### Automated Deployment Script
```bash
#!/bin/bash
# deploy.sh

set -e

echo "Starting deployment..."

# Pull latest changes
git pull origin main

# Install dependencies
composer install --optimize-autoloader --no-dev
npm install
npm run build

# Clear and cache configurations
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Run migrations
php artisan migrate --force

# Restart services
sudo supervisorctl restart gabay-laguna-worker:*
sudo systemctl reload nginx

echo "Deployment completed successfully!"
```

### Backup Script
```bash
#!/bin/bash
# backup.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/var/backups/gabay-laguna"

# Create backup directory
mkdir -p $BACKUP_DIR

# Database backup
mysqldump -u gabay_prod_user -p gabay_laguna_prod > $BACKUP_DIR/db_backup_$DATE.sql

# Application backup
tar -czf $BACKUP_DIR/app_backup_$DATE.tar.gz /var/www/gabay-laguna

# Clean old backups (keep last 7 days)
find $BACKUP_DIR -name "*.sql" -mtime +7 -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete

echo "Backup completed: $DATE"
```

## Performance Optimization

### 1. Database Optimization
```sql
-- Add indexes for better performance
ALTER TABLE bookings ADD INDEX idx_tour_date (tour_date);
ALTER TABLE bookings ADD INDEX idx_status (status);
ALTER TABLE tour_guides ADD INDEX idx_city_experience (city_id, experience_years);
ALTER TABLE reviews ADD INDEX idx_guide_rating (tour_guide_id, rating);
```

### 2. Redis Configuration
```bash
# Optimize Redis for caching
sudo nano /etc/redis/redis.conf

# Set:
maxmemory 256mb
maxmemory-policy allkeys-lru
save 900 1
save 300 10
save 60 10000
```

### 3. PHP-FPM Optimization
```bash
# Configure PHP-FPM pools
sudo nano /etc/php/8.2/fpm/pool.d/www.conf

# Set:
pm = dynamic
pm.max_children = 50
pm.start_servers = 5
pm.min_spare_servers = 5
pm.max_spare_servers = 35
pm.max_requests = 500
```

## Security Checklist

- [ ] SSL certificate installed and configured
- [ ] Firewall configured and enabled
- [ ] Database secured with strong passwords
- [ ] File permissions set correctly
- [ ] Environment variables secured
- [ ] Rate limiting configured
- [ ] Security headers implemented
- [ ] Regular backups scheduled
- [ ] Monitoring and logging configured
- [ ] Updates and patches applied regularly

## Monitoring and Maintenance

### 1. Health Checks
```bash
# Create health check endpoint
php artisan make:command HealthCheck

# Add to crontab for regular checks
*/5 * * * * curl -f https://api.gabaylaguna.com/health || echo "API is down"
```

### 2. Performance Monitoring
```bash
# Install monitoring tools
sudo apt install -y prometheus node-exporter

# Configure monitoring dashboard
# Use tools like Grafana for visualization
```

### 3. Regular Maintenance
```bash
# Weekly maintenance script
#!/bin/bash
# maintenance.sh

# Clear old logs
php artisan log:clear

# Clear old cache
php artisan cache:clear

# Optimize database
php artisan db:optimize

# Check for updates
composer outdated
npm outdated
```

## Troubleshooting

### Common Issues

1. **500 Internal Server Error**
   - Check file permissions
   - Verify .env configuration
   - Check error logs: `tail -f /var/log/nginx/error.log`

2. **Database Connection Issues**
   - Verify database credentials
   - Check MySQL service status
   - Test connection: `mysql -u user -p database`

3. **Queue Worker Issues**
   - Check supervisor status: `sudo supervisorctl status`
   - Restart workers: `sudo supervisorctl restart gabay-laguna-worker:*`

4. **SSL Certificate Issues**
   - Check certificate validity: `sudo certbot certificates`
   - Renew if needed: `sudo certbot renew`

### Log Locations
- **Nginx**: `/var/log/nginx/`
- **PHP-FPM**: `/var/log/php8.2-fpm.log`
- **Application**: `/var/www/gabay-laguna/storage/logs/`
- **Supervisor**: `/var/log/supervisor/`

## Support

For deployment issues and support:
1. Check the troubleshooting section above
2. Review application logs
3. Contact the development team
4. Create an issue in the repository

---

**Last Updated**: August 14, 2025

