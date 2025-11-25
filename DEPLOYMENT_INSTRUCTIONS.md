# Multi-Domain Deployment Instructions

## Quick Start

Deploy all 20+ applications across 2 domains with automatic subdomain routing and SSL certificates.

---

## System Architecture

```
22 GitHub Branches
        ↓
    ├─ 19 apps → 9gg.app (auto subdomains)
    ├─ 1 app  → quicksell.monster (special domain)
    └─ 3 apps → EXCLUDED (soltil, topcoinbot, coinpicker)
        ↓
    Single VPS (32GB RAM, 500GB+ disk)
        ↓
    PM2 Process Management
        ↓
    Nginx Reverse Proxy (SSL/TLS)
        ↓
    20+ Live Subdomains with HTTPS
```

---

## Pre-Deployment Checklist

### 1. DNS Configuration

Update your DNS records **before** deployment:

```bash
# For 9gg.app
9gg.app              A    YOUR_VPS_IP
*.9gg.app            A    YOUR_VPS_IP

# For quicksell.monster
quicksell.monster    A    YOUR_VPS_IP
*.quicksell.monster  A    YOUR_VPS_IP
```

**Wait 5-30 minutes for DNS propagation.**

### 2. VPS Preparation

```bash
# SSH to VPS
ssh root@YOUR_VPS_IP

# Run one-time setup (if not done)
sudo bash VPS_COMPLETE_SETUP.sh 9gg.app admin@9gg.app

# This installs:
# - Node.js 18 + npm
# - PM2 process manager
# - Nginx web server
# - Certbot SSL
# - Wildcard SSL certificate for *.9gg.app
```

**Time:** ~10-15 minutes

### 3. SSL Setup for quicksell.monster

```bash
# Add certificate for quicksell.monster
sudo certbot certonly --nginx \
  -d quicksell.monster \
  -d *.quicksell.monster \
  --email admin@9gg.app

# Verify both certificates exist
sudo certbot certificates
```

---

## Deployment Steps

### Step 1: Copy Deployment Script to VPS

**Option A: Download from Repository**

```bash
ssh root@YOUR_VPS_IP
cd /root
git clone https://github.com/kingdavsol/Traffic2umarketing.git
cd Traffic2umarketing
chmod +x DEPLOY_ALL_APPS_MULTI_DOMAIN.sh
```

**Option B: Copy from Local Machine**

```bash
scp DEPLOY_ALL_APPS_MULTI_DOMAIN.sh root@YOUR_VPS_IP:/root/
ssh root@YOUR_VPS_IP chmod +x /root/DEPLOY_ALL_APPS_MULTI_DOMAIN.sh
```

### Step 2: Execute Deployment Script

```bash
# SSH to VPS
ssh root@YOUR_VPS_IP

# Run deployment
sudo bash /root/DEPLOY_ALL_APPS_MULTI_DOMAIN.sh
```

**What it does:**
1. Fetches all 22 branches from GitHub
2. For each app:
   - Clones the code
   - Installs dependencies (npm)
   - Builds the app
   - Starts with PM2
   - Creates Nginx config with SSL
3. Reloads Nginx
4. Saves PM2 state for auto-restart

**Time:** ~45-60 minutes (depends on app complexity and build times)

**Expected Output:**
```
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

... (more apps)

✓ Deployed 20 applications
⊘ Excluded/Skipped 3 applications

[4/6] Configuring Nginx...
✓ Nginx configuration is valid
✓ Nginx reloaded

[5/6] Verifying deployments...
┌─────────────┬──────────┬──────────┬──────────┬──────────┬──────────────┐
│ App name    │ id  │ version │ mode     │ pid      │ status    │ restart     │
├─────────────┼──────────┼──────────┼──────────┼──────────┼──────────────┤
│ ai-caption  │ 0   │ 1.0.0   │ fork     │ 12345    │ online    │ 0           │
│ quicksell   │ 1   │ 1.0.0   │ fork     │ 12346    │ online    │ 0           │
... (more apps)

✓ DEPLOYMENT COMPLETE
```

### Step 3: Verify Deployment

```bash
# Check all apps running
pm2 list

# Test HTTPS connectivity
curl -I https://ai-caption-generator-app.9gg.app
curl -I https://quicksell.quicksell.monster

# Monitor in real-time
pm2 monit

# View logs
pm2 logs ai-caption-generator-app
```

---

## Deployed Applications

### 9gg.app (19 applications)

| # | App Name | Domain | Port |
|---|----------|--------|------|
| 1 | ai-caption-generator-app | ai-caption-generator-app.9gg.app | 3000 |
| 2 | analyze-android-app-stores | analyze-android-app-stores.9gg.app | 3001 |
| 3 | analyze-insurance-markets | analyze-insurance-markets.9gg.app | 3002 |
| 4 | app-monitoring-dashboard | app-monitoring-dashboard.9gg.app | 3003 |
| 5 | bizbuys-procurement | bizbuys-procurement.9gg.app | 3004 |
| 6 | business-apps-setup | business-apps-setup.9gg.app | 3005 |
| 7 | cross-platform-app-development | cross-platform-app-development.9gg.app | 3006 |
| 8 | datacash-monetization | datacash-monetization.9gg.app | 3007 |
| 9 | earnhub-student | earnhub-student.9gg.app | 3008 |
| 10 | find-app-niches | find-app-niches.9gg.app | 3009 |
| 11 | gigcredit-lending | gigcredit-lending.9gg.app | 3010 |
| 12 | impactreceipts-charity | impactreceipts-charity.9gg.app | 3011 |
| 13 | item-selling-photo-app | item-selling-photo-app.9gg.app | 3012 |
| 14 | medisave-healthcare | medisave-healthcare.9gg.app | 3013 |
| 15 | neighborcash-local | neighborcash-local.9gg.app | 3014 |
| 16 | seasonalears-gigs | seasonalears-gigs.9gg.app | 3015 |
| 17 | skillswap-bartering | skillswap-bartering.9gg.app | 3016 |
| 18 | skilltrade-gig | skilltrade-gig.9gg.app | 3017 |
| 19 | social-media-marketing-tool | social-media-marketing-tool.9gg.app | 3018 |

### quicksell.monster (1 application)

| # | App Name | Domain | Port |
|---|----------|--------|------|
| 20 | quicksell | quicksell.quicksell.monster | 3019 |

### Excluded (3 applications - NOT deployed)

- ✗ soltil (and all variations)
- ✗ topcoinbot (and all variations)
- ✗ coinpicker (and all variations)

---

## Access Your Applications

### Via Browser

```
https://ai-caption-generator-app.9gg.app
https://app-monitoring-dashboard.9gg.app
https://quicksell.quicksell.monster
... (all other apps)
```

### Via Command Line

```bash
# Test any app
curl -I https://[app-name].9gg.app

# Examples:
curl -I https://ai-caption-generator-app.9gg.app
curl -I https://quicksell.quicksell.monster
```

---

## Post-Deployment Management

### Monitor Applications

```bash
# List all running apps
pm2 list

# Real-time monitoring dashboard
pm2 monit

# View logs for specific app
pm2 logs [app-name]

# View system info
app-status
```

### Manage Applications

```bash
# Restart single app
pm2 restart [app-name]

# Restart all apps
pm2 restart all

# Stop app
pm2 stop [app-name]

# Stop all apps
pm2 stop all

# Delete app
pm2 delete [app-name]
```

### Check Infrastructure

```bash
# Nginx status
sudo systemctl status nginx

# Nginx test
sudo nginx -t

# SSL certificates
sudo certbot certificates

# System resources
df -h                # Disk usage
free -h              # Memory usage
top                  # CPU usage
```

---

## Troubleshooting

### App Won't Start

```bash
# 1. Check logs
pm2 logs [app-name] --lines 50

# 2. Manually test
cd /var/www/[app-name]
npm start

# 3. Check port conflict
netstat -tlnp | grep :3000
```

### SSL Certificate Issues

```bash
# Check certificates
sudo certbot certificates

# Force renewal
sudo certbot renew --force-renewal

# Test renewal
sudo certbot renew --dry-run
```

### Nginx Errors

```bash
# Test configuration
sudo nginx -t

# View error logs
sudo tail -f /var/log/nginx/error.log

# Reload (after fixes)
sudo systemctl reload nginx
```

### App Performance Issues

```bash
# Monitor memory usage
pm2 monit

# Check free disk space
df -h

# Increase swap if needed
sudo fallocate -l 8G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
```

---

## Backup & Recovery

### Backup All Apps

```bash
# Create backup
tar -czf /backup/apps-$(date +%Y%m%d).tar.gz /var/www/
```

### Restore from Backup

```bash
# Stop apps
pm2 stop all

# Restore
tar -xzf /backup/apps-20240101.tar.gz -C /

# Restart
pm2 restart all
```

---

## Performance Expectations

| Metric | Value |
|--------|-------|
| Deployment time | 45-60 minutes |
| Memory per app | 100-300 MB |
| Memory total | ~16 GB (20 apps) |
| Disk usage | 200-400 GB |
| Startup time | 30-60 sec (all apps) |
| CPU per app (idle) | 0.5-2% |
| HTTP response time | 50-200 ms |

---

## Resource Requirements

**Your VPS should have:**

- **CPU:** 8+ cores (4 minimum)
- **RAM:** 32 GB (16 GB minimum for 20 apps)
- **Disk:** 500 GB+ SSD (for npm_modules)
- **Network:** 100 Mbps+ (for dependency downloads)
- **OS:** Ubuntu 20.04 LTS or newer

---

## Documentation Files

All documentation is in the repository:

- **DEPLOY_ALL_APPS_MULTI_DOMAIN.sh** - The deployment script
- **MULTI_DOMAIN_DEPLOYMENT_GUIDE.md** - Complete management guide
- **COMPREHENSIVE_DEPLOYMENT_GUIDE.md** - Full architecture guide
- **DEPLOYMENT_SCRIPTS_OVERVIEW.md** - All scripts reference
- **VPS_COMPLETE_SETUP.sh** - VPS initialization script
- **VPS_COMPREHENSIVE_SSL_SETUP.sh** - SSL certificate setup

---

## Quick Reference Commands

```bash
# Deployment
sudo bash DEPLOY_ALL_APPS_MULTI_DOMAIN.sh

# Monitoring
pm2 list
pm2 monit
pm2 logs [app-name]

# Management
pm2 restart [app-name]
pm2 stop [app-name]
pm2 delete [app-name]

# Nginx
sudo nginx -t
sudo systemctl reload nginx

# SSL
sudo certbot certificates
sudo certbot renew

# System
df -h
free -h
top
```

---

## Next Steps

1. ✅ **Configure DNS** - Point domains to VPS
2. ✅ **Run VPS Setup** - `sudo bash VPS_COMPLETE_SETUP.sh`
3. ✅ **Deploy Apps** - `sudo bash DEPLOY_ALL_APPS_MULTI_DOMAIN.sh`
4. ✅ **Verify** - Test HTTPS access to all apps
5. ✅ **Monitor** - Set up monitoring and alerts
6. ✅ **Backup** - Create regular backups

---

## Support

If you encounter issues:

1. Check application logs: `pm2 logs [app-name]`
2. Verify Nginx: `sudo nginx -t`
3. Check SSL: `sudo certbot certificates`
4. Monitor resources: `pm2 monit`
5. Review system logs: `tail -f /var/log/nginx/error.log`

---

**Last Updated:** November 25, 2024
**Ready for:** Production Deployment
