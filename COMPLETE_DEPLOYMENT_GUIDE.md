# Complete VPS Deployment Guide

**For: All apps from GitHub branches → 9gg.app subdomains + quicksell.monster**

---

## 🚀 Quick Start (3 Steps)

### Step 1: SSH to VPS

```bash
ssh deploy-user@YOUR_VPS_IP
```

### Step 2: Run SSL Setup

```bash
# Clone repo
git clone https://github.com/kingdavsol/Traffic2umarketing.git
cd Traffic2umarketing

# Setup SSL certificates for all domains
sudo bash VPS_SSL_STANDALONE_SETUP.sh

# Verify SSL
sudo bash VERIFY_DOMAINS_STANDALONE.sh
```

Expected time: **~10 minutes**

Result:
- ✅ 9gg.app domain with wildcard (*.9gg.app) - single SSL cert covers all subdomains
- ✅ quicksell.monster domain - separate SSL cert
- ✅ Nginx configured with auto-routing to port 3000

### Step 3: Deploy All Apps

```bash
# Still in the repo directory
sudo bash DEPLOYMENT_SETUP_SCRIPTS.sh
```

Expected time: **5-15 minutes** (depends on number of apps and build times)

Result:
- ✅ All apps from `claude/*` branches deployed to `/var/www/9gg.app/[app-name]/`
- ✅ Each app running on PM2
- ✅ Accessible at: `https://[app-name].9gg.app`
- ✅ quicksell at: `https://quicksell.monster`

**Done!** All your domains are live with HTTPS.

---

## 📋 What Gets Set Up

### Domain Structure

```
9gg.app (Master domain)
├── *.9gg.app (Wildcard - routes all subdomains to port 3000)
│   ├── caption-genius.9gg.app
│   ├── ai-caption.9gg.app
│   ├── my-app.9gg.app
│   └── [60+ more apps]
│
quicksell.monster (Dedicated domain)
├── Frontend on port 3000
└── API on port 5000 (/api/*)
```

### SSL Certificates

- **9gg.app**: Single wildcard certificate covers main domain + all subdomains
- **quicksell.monster**: Separate certificate
- **Auto-renewal**: Certificates auto-renew 30 days before expiry
- **Provider**: Let's Encrypt (free)

### Application Deployment

Each app gets:
- Own directory: `/var/www/9gg.app/[app-name]/`
- PM2 process management
- Automatic restart on VPS reboot
- Subdomain routing via Nginx
- HTTPS access via wildcard certificate

---

## 🔄 Update an App Later

### Via Git (from your local machine with GitHub Desktop)

1. **Make changes** in GitHub Desktop
2. **Commit and push** to the app's branch (e.g., `claude/caption-generator-app-01xxx`)
3. **On VPS**, update the app:

```bash
cd /var/www/9gg.app/caption-generator
git pull origin claude/caption-generator-app-01xxx
npm install --production
npm run build  # if needed
pm2 restart caption-generator
```

### Or Rerun Full Deployment

To redeploy all apps with latest code:

```bash
cd ~/Traffic2umarketing
git pull origin main
sudo bash DEPLOYMENT_SETUP_SCRIPTS.sh
```

This will update all apps to latest code.

---

## 📊 Deployment Scripts Explained

### 1. VPS_SSL_STANDALONE_SETUP.sh

**What it does:**
- Installs Certbot (Let's Encrypt client)
- Creates Nginx config for 9gg.app (with wildcard)
- Creates Nginx config for quicksell.monster
- Obtains SSL certificates
- Configures Nginx to use HTTPS
- Sets up automatic renewal

**Run once:** Yes (or whenever adding new domains)

**Time:** ~8 minutes

```bash
sudo bash VPS_SSL_STANDALONE_SETUP.sh
```

### 2. DEPLOYMENT_SETUP_SCRIPTS.sh

**What it does:**
- Creates web root directory (`/var/www/9gg.app/`)
- Installs dependencies (Node.js, npm, PM2, Nginx, Certbot)
- Clones repo and gets all branches
- For each `claude/*` branch:
  - Extracts app name from branch
  - Clones branch code to app directory
  - Runs `npm install --production`
  - Runs `npm run build` (if exists)
  - Starts app with PM2
- Saves PM2 state (survives VPS reboot)

**Run:** After SSL setup, or anytime to redeploy

**Time:** 5-15 minutes (depends on app count and build times)

```bash
sudo bash DEPLOYMENT_SETUP_SCRIPTS.sh
```

### 3. VERIFY_DOMAINS_STANDALONE.sh

**What it does:**
- Runs 10 verification checks
- Tests DNS resolution
- Tests HTTPS connectivity
- Verifies certificates are valid
- Checks Nginx status
- Checks PM2 apps running
- Confirms auto-renewal enabled

**Run:** After SSL setup to verify everything works

**Time:** ~2 minutes

```bash
sudo bash VERIFY_DOMAINS_STANDALONE.sh
```

---

## 🎯 Step-by-Step Execution

### On Your Local Machine (with GitHub Desktop)

1. **Open GitHub Desktop**
2. **Make sure you're on the main branch**
3. **Pull latest code:**
   ```
   Ctrl+Shift+P (Windows) or Cmd+Shift+P (Mac)
   → "Pull"
   ```

This ensures your local copy has all the latest scripts.

### On VPS (via SSH)

#### Session 1: SSL Setup (~10 min)

```bash
# Connect to VPS
ssh deploy-user@YOUR_VPS_IP

# Clone repo
git clone https://github.com/kingdavsol/Traffic2umarketing.git
cd Traffic2umarketing

# Setup SSL for all domains
sudo bash VPS_SSL_STANDALONE_SETUP.sh

# Verify SSL setup
sudo bash VERIFY_DOMAINS_STANDALONE.sh

# You should see ✓ checks passing for:
# - Nginx running
# - DNS resolution
# - SSL certificates valid
# - HTTPS connectivity
# - Auto-renewal enabled
```

#### Session 2: Deploy All Apps (~10 min)

```bash
# Still on VPS, in the repo directory
sudo bash DEPLOYMENT_SETUP_SCRIPTS.sh

# You should see apps being deployed:
# → Deploying: caption-generator
#   ✓ caption-generator.9gg.app
# → Deploying: my-app
#   ✓ my-app.9gg.app
# [... 60+ more apps ...]
```

#### Verify Deployments

```bash
# List all running apps
pm2 list

# View logs for an app
pm2 logs caption-generator

# Check specific app status
pm2 describe caption-generator

# Exit when done
exit
```

---

## 🔍 Testing

### Test Domains

From anywhere (local machine or VPS):

```bash
# Test main domain
curl https://9gg.app

# Test a subdomain
curl https://caption-generator.9gg.app

# Test quicksell
curl https://quicksell.monster

# Check certificate
openssl s_client -connect 9gg.app:443 -servername 9gg.app 2>/dev/null | grep "Issuer"
# Should show: Let's Encrypt Authority
```

### Monitor Apps

```bash
# On VPS
ssh deploy-user@YOUR_VPS_IP

# See all apps
pm2 list

# See logs in real-time
pm2 logs

# See logs for specific app
pm2 logs caption-generator

# Restart an app
pm2 restart caption-generator

# Stop an app
pm2 stop caption-generator

# Start an app
pm2 start caption-generator
```

---

## 📁 Directory Structure After Deployment

```
/var/www/9gg.app/
├── caption-generator/
│   ├── .git/
│   ├── node_modules/
│   ├── package.json
│   ├── .env
│   └── [app code]
├── my-app/
│   ├── .git/
│   ├── node_modules/
│   ├── package.json
│   └── [app code]
├── quicksell/
│   ├── .git/
│   ├── node_modules/
│   ├── package.json
│   └── [app code]
└── [60+ more apps]/
```

---

## 🔐 SSL Certificate Details

### Certificates Installed

```
/etc/letsencrypt/live/9gg.app/
├── fullchain.pem (Used by Nginx)
├── privkey.pem (Used by Nginx)
└── chain.pem

/etc/letsencrypt/live/quicksell.monster/
├── fullchain.pem (Used by Nginx)
├── privkey.pem (Used by Nginx)
└── chain.pem
```

### Certificate Renewal

```bash
# Check certificate status
sudo certbot certificates

# Manual renewal (if needed)
sudo certbot renew

# Check auto-renewal timer
sudo systemctl status certbot.timer

# View renewal logs
sudo tail -f /var/log/letsencrypt/letsencrypt.log
```

---

## ⚠️ Troubleshooting

### Issue: Apps not responding

```bash
# Check if apps are running
pm2 list

# Check app logs
pm2 logs [app-name]

# Restart app
pm2 restart [app-name]

# Check Nginx
sudo nginx -t
sudo systemctl status nginx
```

### Issue: HTTPS not working

```bash
# Check certificate
sudo certbot certificates

# Verify DNS
dig 9gg.app
dig caption-generator.9gg.app

# Check Nginx config
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

### Issue: App not starting

```bash
# Check if port is in use
sudo lsof -i :3000
sudo lsof -i :5000

# Check if dependencies installed
cd /var/www/9gg.app/[app-name]
npm ls

# Reinstall if needed
npm install --production
npm run build
pm2 restart [app-name]
```

---

## 📝 Common Commands Reference

### PM2 Management

```bash
pm2 list                    # List all apps
pm2 logs [app]             # View logs
pm2 restart [app]          # Restart app
pm2 stop [app]             # Stop app
pm2 start [app]            # Start app
pm2 delete [app]           # Remove app from PM2
pm2 save                   # Save app list
pm2 resurrect              # Restore saved app list
```

### Git Management (on VPS)

```bash
cd /var/www/9gg.app/[app-name]
git status                 # Check status
git pull origin [branch]   # Pull latest code
git log --oneline          # View commits
```

### Nginx Management

```bash
sudo nginx -t              # Test config
sudo systemctl start nginx    # Start
sudo systemctl restart nginx  # Restart
sudo systemctl reload nginx   # Reload (no downtime)
sudo systemctl stop nginx     # Stop
```

---

## ✅ Deployment Checklist

- [ ] SSH access to VPS confirmed
- [ ] GitHub Desktop synced with latest code
- [ ] DNS records point to VPS IP (9gg.app, *.9gg.app, quicksell.monster, www.quicksell.monster)
- [ ] Ports 80 & 443 open on VPS firewall
- [ ] Ran `VPS_SSL_STANDALONE_SETUP.sh` successfully
- [ ] Ran `VERIFY_DOMAINS_STANDALONE.sh` (all checks passed)
- [ ] Ran `DEPLOYMENT_SETUP_SCRIPTS.sh` successfully
- [ ] All apps show in `pm2 list`
- [ ] HTTPS works for main domain: `curl https://9gg.app`
- [ ] HTTPS works for subdomain: `curl https://[app-name].9gg.app`
- [ ] HTTPS works for quicksell: `curl https://quicksell.monster`

---

## 🎯 Summary

**Initial Setup:** ~20-30 minutes total
- SSL setup: ~10 min
- All app deployment: ~10-15 min
- Verification: ~5 min

**After Setup:** Fully automated
- Apps auto-start on VPS reboot (PM2)
- Certificates auto-renew (Let's Encrypt)
- Update any app by pulling latest branch code and restarting PM2

**All Done!** You have a production-ready VPS with:
- ✅ 70+ apps deployed to subdomains
- ✅ HTTPS for all domains
- ✅ Automatic SSL renewal
- ✅ PM2 process management
- ✅ Easy app updates
