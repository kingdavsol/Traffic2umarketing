# Production Deployment Guide

## Prerequisites
- Ubuntu 20.04 LTS server
- 2GB RAM minimum
- 20GB storage minimum
- SSH access
- Domain name
- SSL certificate (Let's Encrypt free)

## Step 1: Server Setup

```bash
# SSH into server
ssh root@your-server-ip

# Update system
apt-get update && apt-get upgrade -y

# Run VPS setup script
bash /path/to/vps-setup.sh

# Configure firewall
ufw allow 22
ufw allow 80
ufw allow 443
ufw enable
```

## Step 2: Database Setup

```bash
# Start MongoDB
systemctl start mongodb
systemctl enable mongodb

# Create databases
mongosh
> use snapsave
> db.createCollection('users')
```

## Step 3: App Deployment

```bash
# Clone repository
cd /app
git clone your-repo-url

# Install dependencies
cd 01-SnapSave/backend
npm install

# Set environment variables
cp .env.example .env
nano .env  # Edit with your values

# Start app with PM2
pm2 start server.js --name "snapsave-backend"
pm2 save
```

## Step 4: Nginx Configuration

```bash
# Copy nginx config
cp infrastructure/nginx/snapsave.conf /etc/nginx/sites-available/

# Enable site
ln -s /etc/nginx/sites-available/snapsave.conf /etc/nginx/sites-enabled/

# Test nginx
nginx -t

# Restart nginx
systemctl restart nginx
```

## Step 5: SSL Certificate

```bash
# Install Let's Encrypt certificate
certbot certonly --nginx -d snapsave.yourdomain.com

# Auto-renew setup (already configured)
systemctl enable certbot.timer
```

## Step 6: Monitoring & Logs

```bash
# View app logs
pm2 logs

# Monitor server
htop

# View nginx logs
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log
```

## Troubleshooting

### App won't start
```bash
pm2 logs snapsave-backend
# Check .env file
# Check MongoDB connection
# Check port availability
```

### Database connection errors
```bash
mongosh
> show dbs
> use snapsave
```

### SSL certificate issues
```bash
certbot renew --dry-run
```

## Scaling

### Load Balancing
```bash
# Use Nginx upstream
upstream app_backend {
  server localhost:5001;
  server localhost:5002;
  server localhost:5003;
}
```

### Database Replication
- Set up MongoDB replica set
- Configure automatic backups
- Test failover

### CDN Integration
- CloudFlare for DNS/CDN
- Cache static assets
- Compress responses
