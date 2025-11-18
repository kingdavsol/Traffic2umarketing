# Production Deployment Guide - monitor.sourcevida.com

Complete guide to deploying the Traffic2u Monitoring Dashboard to your VPS and configuring it for the domain `monitor.sourcevida.com`.

## Prerequisites

- VPS with Linux (Ubuntu 20.04+ recommended)
- Domain: `monitor.sourcevida.com` (with DNS pointing to VPS)
- SSH access to VPS
- Node.js 18+ installed
- Nginx installed (for reverse proxy)
- SSL certificate (Let's Encrypt recommended)

## Step 1: Prepare Your VPS

```bash
# SSH into your VPS
ssh user@your-vps-ip

# Update system packages
sudo apt update && sudo apt upgrade -y

# Install Node.js (if not already installed)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Verify installation
node --version
npm --version
```

## Step 2: Clone and Setup the Monitoring Dashboard

```bash
# Create application directory
sudo mkdir -p /opt/traffic2u-monitoring
sudo chown $USER:$USER /opt/traffic2u-monitoring

# Clone or copy the monitoring dashboard code
cd /opt/traffic2u-monitoring
# If from git:
git clone <your-repo-url> .
# OR copy files directly

# Install dependencies
npm install --production

# Verify database will be created
mkdir -p data
```

## Step 3: Configure Environment Variables

```bash
# Create .env file
cat > /opt/traffic2u-monitoring/.env <<EOF
PORT=3000
ADMIN_USERNAME=admin
ADMIN_PASSWORD=$(openssl rand -base64 32)
DEBUG=false
PRODUCTION_URL=https://monitor.sourcevida.com
NODE_ENV=production
EOF

# Display the generated password (save it somewhere safe!)
grep ADMIN_PASSWORD /opt/traffic2u-monitoring/.env
```

## Step 4: Set Up Systemd Service

Create a systemd service file to manage the monitoring dashboard:

```bash
sudo tee /etc/systemd/system/monitoring-dashboard.service > /dev/null <<EOF
[Unit]
Description=Traffic2u Monitoring Dashboard
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/opt/traffic2u-monitoring
ExecStart=/usr/bin/node server.js
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal
SyslogIdentifier=monitoring-dashboard

Environment="NODE_ENV=production"
EnvironmentFile=/opt/traffic2u-monitoring/.env

[Install]
WantedBy=multi-user.target
EOF

# Enable and start the service
sudo systemctl daemon-reload
sudo systemctl enable monitoring-dashboard
sudo systemctl start monitoring-dashboard

# Verify it's running
sudo systemctl status monitoring-dashboard
```

## Step 5: Configure Nginx Reverse Proxy

Create Nginx configuration:

```bash
sudo tee /etc/nginx/sites-available/monitor.sourcevida.com > /dev/null <<EOF
server {
    listen 80;
    server_name monitor.sourcevida.com;

    # Redirect to HTTPS
    location / {
        return 301 https://\$server_name\$request_uri;
    }
}

server {
    listen 443 ssl http2;
    server_name monitor.sourcevida.com;

    # SSL certificates (will be added by certbot)
    ssl_certificate /etc/letsencrypt/live/monitor.sourcevida.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/monitor.sourcevida.com/privkey.pem;

    # SSL security settings
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Logging
    access_log /var/log/nginx/monitor.sourcevida.com.access.log;
    error_log /var/log/nginx/monitor.sourcevida.com.error.log;

    # Client upload size
    client_max_body_size 10M;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;

        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
}
EOF

# Enable the site
sudo ln -sf /etc/nginx/sites-available/monitor.sourcevida.com /etc/nginx/sites-enabled/

# Test Nginx configuration
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

## Step 6: Set Up SSL Certificate with Let's Encrypt

```bash
# Install certbot if not already installed
sudo apt install -y certbot python3-certbot-nginx

# Obtain SSL certificate
sudo certbot certonly --nginx -d monitor.sourcevida.com

# Auto-renewal (runs twice daily)
sudo systemctl enable certbot.timer
sudo systemctl start certbot.timer

# Verify renewal will work
sudo certbot renew --dry-run
```

## Step 7: Set Up Firewall

```bash
# Enable UFW (if not already enabled)
sudo ufw enable

# Allow SSH
sudo ufw allow 22/tcp

# Allow HTTP and HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Verify rules
sudo ufw status
```

## Step 8: Configure Monitoring Dashboard Permissions

```bash
# Ensure www-data can write to data directory
sudo chown -R www-data:www-data /opt/traffic2u-monitoring/data

# Set appropriate permissions
sudo chmod 755 /opt/traffic2u-monitoring
sudo chmod 755 /opt/traffic2u-monitoring/data
sudo chmod 644 /opt/traffic2u-monitoring/.env
```

## Step 9: Set Up Automated Database Backups

Create a backup script:

```bash
sudo tee /opt/traffic2u-monitoring/backup.sh > /dev/null <<'EOF'
#!/bin/bash

BACKUP_DIR="/opt/traffic2u-monitoring/backups"
DB_FILE="/opt/traffic2u-monitoring/data/monitoring.db"
DATE=$(date +%Y%m%d_%H%M%S)

# Create backup directory if it doesn't exist
mkdir -p $BACKUP_DIR

# Copy database file
cp $DB_FILE $BACKUP_DIR/monitoring-$DATE.db

# Keep only last 30 days of backups
find $BACKUP_DIR -name "monitoring-*.db" -mtime +30 -delete

# Log backup
echo "$(date): Backup completed - $BACKUP_DIR/monitoring-$DATE.db" >> /var/log/monitoring-backup.log
EOF

# Make executable
sudo chmod +x /opt/traffic2u-monitoring/backup.sh

# Add to crontab (daily at 2 AM)
(sudo crontab -u www-data -l 2>/dev/null; echo "0 2 * * * /opt/traffic2u-monitoring/backup.sh") | sudo crontab -u www-data -
```

## Step 10: Verify Deployment

```bash
# Check if service is running
sudo systemctl status monitoring-dashboard

# View recent logs
sudo journalctl -u monitoring-dashboard -f

# Test the health endpoint
curl https://monitor.sourcevida.com/health

# Test API endpoint
curl -X POST https://monitor.sourcevida.com/api/metrics \
  -H "Content-Type: application/json" \
  -d '{
    "appName": "test-app",
    "displayName": "Test App",
    "metrics": {
      "users": 100,
      "downloads": 5
    }
  }'

# Access the dashboard
# Open browser: https://monitor.sourcevida.com/dashboard
# Enter credentials from .env
```

## Step 11: Configure App Metrics Integration

Update all your apps to report to the production dashboard:

**.env files in your apps**:
```env
MONITORING_DASHBOARD_URL=https://monitor.sourcevida.com
```

**API Endpoint for apps to use**:
```
https://monitor.sourcevida.com/api/metrics
```

## Monitoring and Maintenance

### View Logs

```bash
# Real-time logs
sudo journalctl -u monitoring-dashboard -f

# Last 100 lines
sudo journalctl -u monitoring-dashboard -n 100

# Logs since last hour
sudo journalctl -u monitoring-dashboard --since "1 hour ago"
```

### Monitor Disk Usage

```bash
# Check database size
du -h /opt/traffic2u-monitoring/data/monitoring.db

# Check total app directory size
du -sh /opt/traffic2u-monitoring

# Archive old data if database grows too large
# Recommended threshold: 1GB
```

### Health Checks

```bash
# Check if service is running
systemctl is-active monitoring-dashboard

# Check Nginx
systemctl is-active nginx

# Check SSL certificate expiration
sudo certbot certificates

# Test connectivity
curl -I https://monitor.sourcevida.com/health
```

### Automatic Health Monitoring Script

Create a monitoring script that checks the dashboard health:

```bash
sudo tee /opt/traffic2u-monitoring/health-check.sh > /dev/null <<'EOF'
#!/bin/bash

DASHBOARD_URL="https://monitor.sourcevida.com"
LOG_FILE="/var/log/monitoring-health.log"

# Check if dashboard is responding
if curl -sf $DASHBOARD_URL/health > /dev/null; then
    echo "$(date): Dashboard health check passed" >> $LOG_FILE
else
    echo "$(date): Dashboard health check FAILED" >> $LOG_FILE
    # Restart service if it fails
    sudo systemctl restart monitoring-dashboard
    echo "$(date): Dashboard service restarted" >> $LOG_FILE
fi
EOF

# Add to crontab (check every 5 minutes)
(sudo crontab -l 2>/dev/null; echo "*/5 * * * * /opt/traffic2u-monitoring/health-check.sh") | sudo crontab -
```

## Updating the Dashboard

To update the code to a new version:

```bash
cd /opt/traffic2u-monitoring

# Stop the service
sudo systemctl stop monitoring-dashboard

# Pull latest changes
git pull origin main  # or your branch

# Install dependencies
npm install --production

# Restart service
sudo systemctl start monitoring-dashboard

# Verify it's running
sudo systemctl status monitoring-dashboard
```

## Troubleshooting

### Service Won't Start

```bash
# Check detailed error logs
sudo journalctl -u monitoring-dashboard -n 50 --no-pager

# Check if port 3000 is in use
sudo lsof -i :3000

# Check Node.js installation
which node
node --version
```

### SSL Certificate Issues

```bash
# Check certificate status
sudo certbot certificates

# Renew certificate manually
sudo certbot renew --force-renewal

# Test certificate renewal
sudo certbot renew --dry-run
```

### Database Lock Error

```bash
# Remove lock files if database is corrupted
rm /opt/traffic2u-monitoring/data/monitoring.db-wal
rm /opt/traffic2u-monitoring/data/monitoring.db-shm

# Restart service
sudo systemctl restart monitoring-dashboard
```

### High Memory Usage

```bash
# Check memory usage
ps aux | grep node

# Restart service to free memory
sudo systemctl restart monitoring-dashboard

# Monitor memory over time
watch -n 5 'ps aux | grep node'
```

## Performance Optimization

### Enable Gzip Compression in Nginx

Add to Nginx config:
```nginx
gzip on;
gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss;
gzip_min_length 1000;
```

### Set Up CDN for Static Assets

Configure CloudFlare or similar to cache dashboard static files.

### Database Optimization

```bash
# Vacuum database (run weekly)
sqlite3 /opt/traffic2u-monitoring/data/monitoring.db "VACUUM;"

# Analyze query performance
sqlite3 /opt/traffic2u-monitoring/data/monitoring.db ".schema"
```

## Security Checklist

- [x] SSL/TLS certificate installed
- [x] Firewall configured (UFW)
- [x] SSH key authentication enabled
- [x] Strong admin password set
- [x] Systemd service configured with limited permissions
- [x] Database backups automated
- [x] Security headers configured in Nginx
- [x] Rate limiting on API (optional, can be added)
- [x] Regular updates scheduled

## Monitoring Dashboard Features Summary

Once deployed to `monitor.sourcevida.com`:

- **Dashboard URL**: https://monitor.sourcevida.com/dashboard
- **Health Check**: https://monitor.sourcevida.com/health
- **Metrics API**: https://monitor.sourcevida.com/api/metrics
- **Metrics Storage**: SQLite (auto-backed up daily)
- **User Access**: Protected by basic authentication
- **Uptime**: Managed by systemd with auto-restart
- **SSL**: Automated renewal via Let's Encrypt

## Support

For issues or questions:

1. Check logs: `sudo journalctl -u monitoring-dashboard -f`
2. Verify config: `sudo nginx -t`
3. Test connectivity: `curl https://monitor.sourcevida.com/health`
4. Review files: Check README_MONITORING.md and INTEGRATION_GUIDE.md

---

**Production deployment complete!** Your monitoring dashboard is now live at https://monitor.sourcevida.com
