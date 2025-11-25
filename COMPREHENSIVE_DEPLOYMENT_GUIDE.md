# 70+ Apps Deployment Guide for 9gg.app VPS

## Overview

This guide covers complete deployment of 70+ applications across multiple GitHub branches to a single VPS with automatic subdomain management and SSL certificates.

**Key Features:**
- Automatic app detection and deployment from Git branches
- Automatic subdomain creation (app-name.9gg.app)
- Wildcard SSL certificate coverage for all subdomains
- PM2 process management with auto-restart
- Nginx reverse proxy configuration
- Comprehensive error logging and recovery

---

## Architecture

```
GitHub Branches (70+ apps)
        ↓
   VPS Server (9gg.app)
        ↓
   /var/www/9gg.app/
   ├── app-name-1/
   ├── app-name-2/
   ├── app-name-3/
   └── ... (70+ total)
        ↓
   PM2 Process Manager (auto-restart on crash)
        ↓
   Nginx Reverse Proxy
        ↓
   SSL/TLS with Wildcard Cert
        ↓
   Public (app-name-1.9gg.app, app-name-2.9gg.app, etc.)
```

---

## Pre-Deployment Checklist

### 1. GitHub Repository Setup

Ensure all 70+ apps are in separate Git branches with naming convention:
```
claude/[app-name]-[SESSION_ID]
```

Examples:
```
claude/caption-genius-01PcLoV7ZCLcgH9wDizRyGiS
claude/soltil-app-01S2rj2Zntcsx7PM1BeRdWRy
claude/instagram-bot-01V5CrSGmkxds4BG7ULg6tga
```

Each branch should contain either:
- **Single App**: package.json at root level
- **Monorepo**: package.json files in subdirectories

### 2. VPS Requirements

**Minimum Specifications:**
- **OS**: Ubuntu 20.04 LTS or later
- **CPU**: 8+ cores
- **RAM**: 32GB+ (for 70+ Node.js apps)
- **Disk**: 500GB+ (for npm_modules)
- **Network**: 100Mbps+ connection

**Required Software:**
- Git
- Node.js 18+
- npm 9+
- Nginx
- PM2
- Certbot
- OpenSSL

### 3. Domain Configuration

**DNS Records Required:**
```
9gg.app              A    YOUR_VPS_IP
*.9gg.app            A    YOUR_VPS_IP
```

**Certificate Domain:**
```
Wildcard Certificate: *.9gg.app
Main Domain: 9gg.app
```

---

## Step-by-Step Deployment

### Step 1: Prepare VPS (First Time Only)

```bash
ssh root@YOUR_VPS_IP

# Run the VPS setup script
sudo bash /path/to/VPS_SETUP.sh
```

This will:
- Update system packages
- Install Node.js, npm, PM2, Nginx, Certbot
- Create web root directory
- Configure Nginx
- Set up SSL certificates

### Step 2: Deploy All Apps

```bash
# SSH into VPS
ssh root@YOUR_VPS_IP

# Run the comprehensive deployment script
sudo bash /path/to/MONOREPO_DEPLOYMENT_SETUP.sh
```

**What this does:**
1. Fetches all branches from GitHub repository
2. For each `claude/*` branch:
   - Clones the branch code
   - Detects if single app or monorepo
   - Installs dependencies (npm install/ci)
   - Builds the application (npm run build)
   - Starts with PM2
   - Creates Nginx config for subdomain
   - Applies SSL certificate
3. Reloads Nginx
4. Saves PM2 state for auto-restart

### Step 3: Verify Deployment

```bash
# Check PM2 processes
pm2 list

# Check Nginx config
sudo nginx -t

# Test an app
curl https://app-name-1.9gg.app

# View logs
pm2 logs app-name-1

# Monitor real-time
pm2 monit
```

---

## App Configuration

### Environment Variables

Each app needs a `.env` file. Create from template:

```bash
cd /var/www/9gg.app/app-name
cp .env.example .env
nano .env
```

For multi-instance deployment, each app can have different configuration:
```
DATABASE_URL=postgresql://user:pass@db-host:5432/db-name
STRIPE_SECRET_KEY=sk_live_...
OPENAI_API_KEY=sk-...
NEXT_PUBLIC_APP_URL=https://app-name.9gg.app
```

### Port Assignment

Ports are automatically assigned:
- **Next.js/React apps**: Port 3000 (auto-incremented: 3001, 3002, etc.)
- **Express/Node apps**: Port 5000 (auto-incremented: 5001, 5002, etc.)
- **Static apps**: Port 8080 (auto-incremented)

Check assigned ports:
```bash
pm2 list
```

---

## Managing Deployed Apps

### View All Apps

```bash
pm2 list
```

### Start/Stop/Restart Apps

```bash
# Restart single app
pm2 restart app-name-1

# Restart all apps
pm2 restart all

# Stop single app
pm2 stop app-name-1

# Stop all apps
pm2 stop all

# View logs
pm2 logs app-name-1

# Real-time monitoring
pm2 monit
```

### Quick Update (Without Reinstalling Dependencies)

```bash
# Run QUICK_DEPLOY.sh to update and restart without npm install
sudo bash /path/to/QUICK_DEPLOY.sh
```

### Manually Deploy New Branch

```bash
# Clone specific branch
git clone -b claude/new-app-01xxx https://github.com/kingdavsol/Traffic2umarketing.git /var/www/9gg.app/new-app

cd /var/www/9gg.app/new-app
npm install
npm run build
pm2 start "npm start" --name "new-app"

# Create Nginx config
# (Script will do this automatically, or manually create config)
```

---

## SSL/TLS Certificate Management

### Initial Setup

The wildcard certificate is set up during VPS setup:

```bash
sudo certbot certonly --nginx \
  -d 9gg.app \
  -d *.9gg.app
```

### Renewal

Certbot auto-renewal (runs via cron):

```bash
# Check renewal status
sudo certbot certificates

# Manual renewal
sudo certbot renew --dry-run  # Test
sudo certbot renew             # Actual renewal
```

### Certificate Paths

- **Certificate**: `/etc/letsencrypt/live/9gg.app/fullchain.pem`
- **Private Key**: `/etc/letsencrypt/live/9gg.app/privkey.pem`

All Nginx configs automatically reference these paths.

---

## Monitoring & Logs

### PM2 Logs

```bash
# All app logs
pm2 logs

# Single app logs
pm2 logs app-name-1

# Real-time monitoring dashboard
pm2 monit

# Show last 100 lines
pm2 logs app-name-1 --lines 100

# Save logs to file
pm2 save
```

### Nginx Logs

```bash
# Error logs
tail -f /var/log/nginx/error.log

# Access logs
tail -f /var/log/nginx/access.log

# App-specific logs (if configured)
tail -f /var/log/nginx/app-name-1.error.log
```

### System Logs

```bash
# Check systemd logs
sudo systemctl status nginx
sudo systemctl status pm2-root

# General system issues
journalctl -xe
```

---

## Troubleshooting

### App Won't Start

1. Check logs:
   ```bash
   pm2 logs app-name --lines 50
   ```

2. Check for port conflicts:
   ```bash
   netstat -tlnp | grep :3000
   ```

3. Check environment variables:
   ```bash
   cat /var/www/9gg.app/app-name/.env
   ```

4. Try manual start:
   ```bash
   cd /var/www/9gg.app/app-name
   npm run build
   npm start
   ```

### SSL Certificate Issues

```bash
# Check certificate status
sudo certbot certificates

# Test renewal
sudo certbot renew --dry-run

# Force renewal
sudo certbot renew --force-renewal
```

### Nginx Won't Start

```bash
# Test configuration
sudo nginx -t

# View errors
sudo systemctl restart nginx
sudo tail -f /var/log/nginx/error.log
```

### High Memory Usage

Some 70+ apps simultaneously consuming memory:

```bash
# Check memory by process
pm2 monit

# If one app crashes, restart
pm2 restart app-name

# Restart all apps (one by one)
pm2 restart all

# Increase swap (temporary fix)
sudo fallocate -l 8G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
```

---

## Scaling Considerations

### RAM Optimization

- Each Node.js app typically uses 100-300MB
- 70 apps × 200MB = 14GB base memory
- Additional 18GB+ for npm_modules and cache

**Recommended**: 32GB RAM

### Disk Space

- Each app's node_modules: 200MB-1GB
- 70 apps × 500MB = 35GB

**Recommended**: 500GB+ SSD

### Load Balancing (Future)

For even higher scale:

```bash
# Deploy to multiple VPS instances
VPS-1 (35 apps) → app-1.9gg.app to app-35.9gg.app
VPS-2 (35 apps) → app-36.9gg.app to app-70.9gg.app

# Load balancer routes traffic
9gg.app (load-balancer) → VPS-1 or VPS-2
```

---

## Security Best Practices

### 1. Firewall

```bash
# Allow only necessary ports
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

### 2. SSH Hardening

```bash
# Disable root login
sudo sed -i 's/^#PermitRootLogin/PermitRootLogin/' /etc/ssh/sshd_config
sudo sed -i 's/PermitRootLogin yes/PermitRootLogin no/' /etc/ssh/sshd_config

# Use SSH keys only
sudo sed -i 's/^PasswordAuthentication yes/PasswordAuthentication no/' /etc/ssh/sshd_config

# Restart SSH
sudo systemctl restart ssh
```

### 3. Regular Updates

```bash
# Update system
sudo apt-get update && sudo apt-get upgrade

# Update Node/npm
sudo npm install -g npm

# Update apps
for app in /var/www/9gg.app/*/; do
  cd "$app"
  git pull
  npm update
  npm run build
  pm2 restart $(basename "$app")
done
```

---

## Emergency Procedures

### Full Backup

```bash
# Backup all apps
tar -czf /backup/apps-$(date +%Y%m%d).tar.gz /var/www/9gg.app/
```

### Full Restore

```bash
# Restore from backup
tar -xzf /backup/apps-20240101.tar.gz -C /
pm2 restart all
```

### Emergency Restart All

```bash
# Restart all PM2 processes
pm2 restart all

# Restart Nginx
sudo systemctl restart nginx

# Check status
pm2 list && sudo nginx -t
```

---

## Deployment Scripts Reference

| Script | Purpose |
|--------|---------|
| `VPS_SETUP.sh` | One-time VPS setup (OS, Node, Nginx, SSL) |
| `MONOREPO_DEPLOYMENT_SETUP.sh` | Deploy all 70+ apps from branches |
| `QUICK_DEPLOY.sh` | Quick update without npm install |
| `VPS_SSL_SETUP.sh` | SSL certificate setup and renewal |
| `VERIFY_DOMAINS_SSL.sh` | Verify all domains and SSL |
| `DIAGNOSE_APP_ERRORS.sh` | Troubleshoot app issues |

---

## Useful Commands Cheat Sheet

```bash
# App Management
pm2 list                          # List all apps
pm2 logs app-name                # View logs
pm2 restart app-name             # Restart
pm2 stop app-name                # Stop
pm2 delete app-name              # Remove

# Nginx
sudo nginx -t                     # Test config
sudo systemctl restart nginx      # Restart
sudo systemctl status nginx       # Status

# Certificates
sudo certbot certificates         # List certs
sudo certbot renew               # Renew certs
curl https://app-1.9gg.app      # Test HTTPS

# System
pm2 monit                        # Real-time monitor
df -h                           # Disk usage
free -h                         # Memory usage
netstat -tlnp                   # Open ports
```

---

## Support & Escalation

If deployment fails:

1. **Check logs**: `pm2 logs` or `sudo tail -f /var/log/nginx/error.log`
2. **Verify environment**: Check DNS, firewall, certificates
3. **Review script output**: Run deployment script with verbose output
4. **Check GitHub actions**: Ensure branches are properly pushed
5. **Contact DevOps team**: With error logs and command output

---

**Last Updated**: 2024
**Compatible With**: Ubuntu 20.04+, Node.js 18+, Nginx 1.18+
