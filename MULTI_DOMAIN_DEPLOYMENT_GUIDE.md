# Multi-Domain Deployment Guide

## Overview

This guide covers deploying all applications to multiple domains with automatic subdomain routing:

- **Primary Domain:** `9gg.app` - For most applications (app-name.9gg.app)
- **Special Domain:** `quicksell.monster` - For Quicksell application (quicksell.quicksell.monster)
- **Excluded Apps:** soltil*, topcoinbot*, coinpicker* (not deployed)

---

## Domain Architecture

```
┌─────────────────────────────────────────┐
│       GitHub Branches (22+ apps)        │
└────────────────┬────────────────────────┘
                 │
    ┌────────────┼────────────┐
    │            │            │
    ▼            ▼            ▼
9gg.app      quicksell.monster  EXCLUDED
│            │                  │
├─ ai-caption-generator     quicksell   ✗ soltil*
├─ analyze-android-app              ✗ topcoinbot*
├─ analyze-insurance                ✗ coinpicker*
├─ app-monitoring-dashboard
├─ bizbuys-procurement
├─ business-apps-setup
├─ datacash-monetization
├─ earnhub-student
├─ gigcredit-lending
├─ impactreceipts-charity
├─ item-selling-photo-app
├─ medisave-healthcare
├─ neighborcash-local
├─ seasonalears-gigs
├─ skillswap-bartering
├─ skilltrade-gig
└─ social-media-marketing-tool
```

---

## Prerequisites

### 1. VPS Setup

Ensure your VPS has the deployment environment ready:

```bash
# SSH to VPS
ssh root@YOUR_VPS_IP

# Run one-time setup (if not done already)
sudo bash VPS_COMPLETE_SETUP.sh 9gg.app admin@9gg.app

# If deploying to multiple domains, also set up quicksell.monster
# (Update SSL config to include this domain)
```

### 2. DNS Configuration

Update your DNS records to point all domains to the VPS:

**For 9gg.app:**
```dns
9gg.app         A    YOUR_VPS_IP
*.9gg.app       A    YOUR_VPS_IP
```

**For quicksell.monster:**
```dns
quicksell.monster    A    YOUR_VPS_IP
*.quicksell.monster  A    YOUR_VPS_IP
```

Wait for DNS propagation (usually 5-30 minutes).

### 3. SSL Certificates

Before deployment, ensure SSL certificates exist for both domains:

```bash
# Check existing certificates
sudo certbot certificates

# If needed, add quicksell.monster to the setup
sudo certbot certonly --nginx \
  -d quicksell.monster \
  -d *.quicksell.monster
```

---

## Deployment Process

### Step 1: Prepare Deployment Script on VPS

```bash
# SSH to VPS
ssh root@YOUR_VPS_IP

# Download the deployment script
cd /root
wget https://raw.githubusercontent.com/kingdavsol/Traffic2umarketing/claude/fix-typescript-github-sync/DEPLOY_ALL_APPS_MULTI_DOMAIN.sh

# Or copy from local machine
scp DEPLOY_ALL_APPS_MULTI_DOMAIN.sh root@YOUR_VPS_IP:/root/

# Make executable
chmod +x /root/DEPLOY_ALL_APPS_MULTI_DOMAIN.sh
```

### Step 2: Execute Deployment

```bash
# SSH to VPS
ssh root@YOUR_VPS_IP

# Run the deployment script
sudo bash /root/DEPLOY_ALL_APPS_MULTI_DOMAIN.sh
```

**Expected Output:**
```
═══════════════════════════════════════════════════════
ENHANCED MULTI-DOMAIN DEPLOYMENT
═══════════════════════════════════════════════════════

Domain Configuration:
  Default Domain: 9gg.app (for most apps)
  Special Domain: quicksell.monster (for quicksell)
  Excluded Apps: soltil*, topcoinbot*, coinpicker*

[1/6] Verifying prerequisites...
✓ All prerequisites verified

[2/6] Fetching repository and branches...
✓ Found 22 branches to deploy

[3/6] Deploying applications...
→ Deploying: ai_caption_generator_app → ai-caption-generator-app.9gg.app
  Installing dependencies...
  Building application...
  ✓ ai-caption-generator-app.9gg.app (port 3000)

→ Deploying: quicksell → quicksell.quicksell.monster
  Installing dependencies...
  Building application...
  ✓ quicksell.quicksell.monster (port 3001)

...

✓ Deployed 19 applications
⊘ Excluded/Skipped 3 applications
```

### Step 3: Verify Deployment

```bash
# Check PM2 processes
pm2 list

# View logs for specific app
pm2 logs ai-caption-generator-app

# Real-time monitoring
pm2 monit

# Test HTTPS connectivity
curl -I https://ai-caption-generator-app.9gg.app
curl -I https://quicksell.quicksell.monster
```

---

## Application Deployment Details

### Deployed Applications (19 apps on 9gg.app)

| App Name | Subdomain | Port |
|----------|-----------|------|
| ai-caption-generator-app | ai-caption-generator-app.9gg.app | 3000 |
| analyze-android-app-stores | analyze-android-app-stores.9gg.app | 3001 |
| analyze-insurance-markets | analyze-insurance-markets.9gg.app | 3002 |
| app-monitoring-dashboard | app-monitoring-dashboard.9gg.app | 3003 |
| bizbuys-procurement | bizbuys-procurement.9gg.app | 3004 |
| business-apps-setup | business-apps-setup.9gg.app | 3005 |
| cross-platform-app-development | cross-platform-app-development.9gg.app | 3006 |
| datacash-monetization | datacash-monetization.9gg.app | 3007 |
| earnhub-student | earnhub-student.9gg.app | 3008 |
| find-app-niches | find-app-niches.9gg.app | 3009 |
| gigcredit-lending | gigcredit-lending.9gg.app | 3010 |
| impactreceipts-charity | impactreceipts-charity.9gg.app | 3011 |
| item-selling-photo-app | item-selling-photo-app.9gg.app | 3012 |
| medisave-healthcare | medisave-healthcare.9gg.app | 3013 |
| neighborcash-local | neighborcash-local.9gg.app | 3014 |
| seasonalears-gigs | seasonalears-gigs.9gg.app | 3015 |
| skillswap-bartering | skillswap-bartering.9gg.app | 3016 |
| skilltrade-gig | skilltrade-gig.9gg.app | 3017 |
| social-media-marketing-tool | social-media-marketing-tool.9gg.app | 3018 |

### Special Deployment (1 app on quicksell.monster)

| App Name | Domain | Port |
|----------|--------|------|
| quicksell | quicksell.quicksell.monster | 3019 |

### Excluded Applications (3 apps - NOT deployed)

- ✗ soltil (all variations)
- ✗ topcoinbot (all variations)
- ✗ coinpicker (all variations)

---

## Accessing Deployed Applications

### 9gg.app Applications:

```bash
# Example: Access AI Caption Generator App
https://ai-caption-generator-app.9gg.app

# Example: Access Monitoring Dashboard
https://app-monitoring-dashboard.9gg.app

# Example: Access Any App
https://[app-name].9gg.app
```

### quicksell.monster Application:

```bash
# Access Quicksell
https://quicksell.quicksell.monster
```

---

## Managing Deployments

### View All Running Apps

```bash
pm2 list
```

### Check App Status

```bash
pm2 status [app-name]
```

### View Application Logs

```bash
# Real-time logs
pm2 logs [app-name]

# Last 100 lines
pm2 logs [app-name] --lines 100

# Monitoring dashboard
pm2 monit
```

### Restart Applications

```bash
# Restart single app
pm2 restart [app-name]

# Restart all apps
pm2 restart all

# Stop single app
pm2 stop [app-name]

# Stop all apps
pm2 stop all
```

### Check Nginx Configuration

```bash
# Test Nginx config
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx

# Restart Nginx
sudo systemctl restart nginx

# View Nginx logs
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log
```

---

## Troubleshooting

### App Won't Start

```bash
# 1. Check logs
pm2 logs [app-name] --lines 50

# 2. Check for port conflicts
netstat -tlnp | grep :3000

# 3. Manually try to start
cd /var/www/[app-name]
npm start

# 4. Check for missing dependencies
npm list
```

### SSL Certificate Issues

```bash
# Check certificate status
sudo certbot certificates

# View certificate details
sudo openssl x509 -in /etc/letsencrypt/live/9gg.app/fullchain.pem -text -noout

# Renew if needed
sudo certbot renew --force-renewal

# Validate certificate for domain
curl -I https://[app-name].9gg.app
```

### Nginx Configuration Issues

```bash
# Test configuration
sudo nginx -t

# View detailed error
sudo nginx -t -c /etc/nginx/nginx.conf

# Check specific site config
sudo nginx -t -c /etc/nginx/sites-available/[app-name].9gg.app.conf
```

### High Memory Usage

```bash
# Monitor memory by process
pm2 monit

# Check total memory
free -h

# Restart problematic app
pm2 restart [app-name]

# Increase swap if needed
sudo fallocate -l 8G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
```

---

## Performance Monitoring

### System Resources

```bash
# Disk usage
df -h

# Memory usage
free -h

# CPU usage
top
```

### Application Monitoring

```bash
# Real-time monitoring
pm2 monit

# List processes with memory
pm2 list

# Detailed app info
pm2 show [app-name]

# Save monitoring data
pm2 save
```

### Nginx Monitoring

```bash
# View active connections
sudo netstat -an | grep ESTABLISHED | wc -l

# Check request rate
tail -f /var/log/nginx/access.log

# View error rate
tail -f /var/log/nginx/error.log
```

---

## Backup and Recovery

### Backup All Apps

```bash
# Create backup
tar -czf /backup/apps-$(date +%Y%m%d_%H%M%S).tar.gz /var/www/

# List backups
ls -lh /backup/
```

### Restore from Backup

```bash
# Stop all apps
pm2 stop all

# Restore files
tar -xzf /backup/apps-20240101_120000.tar.gz -C /

# Restart apps
pm2 restart all
```

---

## SSL Certificate Management

### For 9gg.app Domain

```bash
# Certificate location
/etc/letsencrypt/live/9gg.app/

# Files
- fullchain.pem (certificate)
- privkey.pem (private key)
- chain.pem (chain certificate)
```

### For quicksell.monster Domain

```bash
# Certificate location
/etc/letsencrypt/live/quicksell.monster/

# Files
- fullchain.pem (certificate)
- privkey.pem (private key)
- chain.pem (chain certificate)
```

### Auto-Renewal

Certificates are automatically renewed daily via Certbot:

```bash
# Check renewal status
sudo certbot certificates

# View renewal logs
sudo tail -f /var/log/letsencrypt/letsencrypt.log

# Force renewal (for testing)
sudo certbot renew --force-renewal

# Dry run (test renewal)
sudo certbot renew --dry-run
```

---

## Nginx Configuration

### Auto-Generated Configs

Nginx configuration files are automatically created during deployment:

```bash
# Location
/etc/nginx/sites-available/[app-name].[domain].conf
/etc/nginx/sites-enabled/[app-name].[domain].conf

# Examples
/etc/nginx/sites-available/ai-caption-generator-app.9gg.app.conf
/etc/nginx/sites-available/quicksell.quicksell.monster.conf
```

### Manual Configuration Updates

If you need to modify Nginx config:

```bash
# Edit config
sudo nano /etc/nginx/sites-available/[app-name].[domain].conf

# Test
sudo nginx -t

# Reload
sudo systemctl reload nginx
```

---

## Deployment Script Details

### Script Location

```bash
/root/DEPLOY_ALL_APPS_MULTI_DOMAIN.sh
```

### What the Script Does

1. **Verifies Prerequisites** - Checks Node.js, npm, PM2, Nginx
2. **Fetches Branches** - Clones repository and lists all deployment branches
3. **Deploys Apps** - For each branch:
   - Checks exclusion list
   - Determines target domain
   - Clones branch code
   - Installs dependencies
   - Builds application
   - Starts with PM2
   - Creates Nginx config
4. **Configures Nginx** - Tests and reloads configuration
5. **Verifies Deployment** - Shows process list and status

### Exclusion Logic

Apps are excluded if their name contains:
- `soltil`
- `topcoinbot`
- `coinpicker`

### Domain Assignment

- **quicksell** → `quicksell.quicksell.monster`
- **All other apps** → `app-name.9gg.app`

---

## Post-Deployment Checklist

- [ ] DNS records pointing to VPS IP
- [ ] All apps running in PM2 (`pm2 list`)
- [ ] Nginx configuration valid (`sudo nginx -t`)
- [ ] SSL certificates installed (`sudo certbot certificates`)
- [ ] Test app access (`curl https://[app-name].9gg.app`)
- [ ] Monitoring enabled (`pm2 monit`)
- [ ] Backups configured
- [ ] Error logs reviewed (`pm2 logs`)
- [ ] Environment variables set (if needed)
- [ ] PM2 state saved (`pm2 save`)

---

## Quick Commands Reference

```bash
# Deployment
sudo bash DEPLOY_ALL_APPS_MULTI_DOMAIN.sh

# Monitoring
pm2 list
pm2 monit
pm2 logs [app-name]

# Management
pm2 restart [app-name]
pm2 restart all
pm2 stop all

# Nginx
sudo nginx -t
sudo systemctl reload nginx
sudo systemctl restart nginx

# SSL
sudo certbot certificates
sudo certbot renew
sudo openssl x509 -in /etc/letsencrypt/live/9gg.app/fullchain.pem -text -noout

# System
df -h          # Disk usage
free -h        # Memory usage
top            # CPU usage
netstat -tlnp  # Open ports
```

---

## Support

For issues or questions:

1. Check logs: `pm2 logs [app-name]`
2. Verify Nginx: `sudo nginx -t`
3. Check SSL: `sudo certbot certificates`
4. Review system resources: `pm2 monit`
5. Check error logs: `tail -f /var/log/nginx/error.log`

---

**Last Updated:** November 25, 2024
**Compatible With:** Ubuntu 20.04+, Node.js 18+, Nginx 1.18+
