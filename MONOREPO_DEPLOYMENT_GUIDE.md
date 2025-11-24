# Monorepo Deployment Guide

**Complete solution for deploying 150+ apps from 19 monorepo branches**

---

## 🎯 What This Script Does

The `MONOREPO_DEPLOYMENT_SETUP.sh` script automatically:

1. **Detects branch structure** - Single app or monorepo with multiple apps
2. **Extracts all apps** - Finds every subdirectory with `package.json`
3. **Deploys each app** - Installs dependencies, builds, and starts with PM2
4. **Creates subdomains** - Generates Nginx config for each app
5. **Configures SSL** - Uses wildcard certificate (already installed)
6. **Manages processes** - PM2 handles restarts and monitoring

---

## 📊 What You Have

### By Branch:
- **19 code branches** with actual applications
- **~150+ individual apps** spread across monorepos
- **Monorepo branches** with 1-20 apps in subdirectories
- **Wildcard SSL** already covering `*.9gg.app`

### Example Monorepos:
- `analyze-android-app-stores`: 17 React Native mobile apps
- `business-apps-setup`: 8 SaaS applications
- `find-app-niches`: 20 niche-focused apps
- `ai-caption-generator`: Single Next.js app at root

---

## 🚀 Quick Start (2 Steps)

### Step 1: SSH to VPS

```bash
ssh deploy-user@YOUR_VPS_IP
```

### Step 2: Run Deployment Script

```bash
# Clone repo (or update if already cloned)
git clone https://github.com/kingdavsol/Traffic2umarketing.git
cd Traffic2umarketing

# Run monorepo-aware deployment
sudo bash MONOREPO_DEPLOYMENT_SETUP.sh
```

**That's it!** The script handles everything.

---

## ⏱️ Expected Timeline

| Step | Time | Notes |
|------|------|-------|
| Dependency install | 2-3 min | One-time |
| Repo clone | 1-2 min | Clone entire repo |
| App detection | 1 min | Scan all branches |
| Build & deploy | 30-60 min | Depends on app count & complexity |
| Nginx setup | 2 min | Config generation |
| **TOTAL** | **40-75 min** | Fully deployed |

---

## 📁 Directory Structure After Deployment

```
/var/www/9gg.app/
├── ai-caption-generator/        # Single app from root
├── snap-save/                   # App from monorepo
├── gig-credit/                  # App from monorepo
├── medisave/                    # App from monorepo
├── pet-insurance/               # App from monorepo
├── [150+ more apps]/
│   ├── package.json
│   ├── node_modules/
│   ├── dist/ or .next/
│   └── [app files]
└── quicksell/                   # Separate dedicated domain
```

---

## 🌐 Access Your Apps

Once deployed, access any app via:

```bash
# Direct HTTPS access
https://[app-name].9gg.app

# Examples:
https://ai-caption-generator.9gg.app
https://snap-save.9gg.app
https://pet-insurance.9gg.app
https://gig-credit.9gg.app
```

All use the same wildcard SSL certificate.

---

## 🔍 How The Script Works

### 1. Branch Processing
```
For each branch:
  ├─ Clone branch from GitHub
  ├─ Check for root-level package.json (single app)
  └─ Check subdirectories for package.json (monorepo apps)
```

### 2. App Detection
```
If root package.json exists:
  └─ Deploy as single app using branch name

If subdirectories found with package.json:
  ├─ For each subdirectory:
  │  └─ Deploy as separate app using directory name
```

### 3. Deployment Per App
```
For each app found:
  ├─ Create directory: /var/www/9gg.app/[app-name]/
  ├─ Copy app files
  ├─ npm install --production
  ├─ npm run build (if build script exists)
  ├─ Create .env from .env.example (if needed)
  ├─ Start with PM2: pm2 start [command] --name [app-name]
  └─ Create Nginx config: /etc/nginx/sites-available/[app-name].9gg.app.conf
```

### 4. SSL & Nginx
```
For each app:
  ├─ Create Nginx reverse proxy config
  ├─ Point to running PM2 process
  ├─ Use wildcard SSL certificate (already installed)
  ├─ Enable site: ln -s config file to sites-enabled/
  └─ Reload Nginx
```

---

## 📝 What Gets Created

### Nginx Configs
```
/etc/nginx/sites-available/[app-name].9gg.app.conf
/etc/nginx/sites-enabled/[app-name].9gg.app.conf → (symlink)
```

Each config:
- Routes HTTPS traffic to PM2 process on local port (3000 or 5000)
- Redirects HTTP to HTTPS
- Includes security headers
- Enables gzip compression
- Handles WebSocket upgrades

### PM2 Processes
```bash
pm2 list  # Shows all running apps

# Output example:
│ id │ name              │ status │ memory   │ uptime    │
├────┼──────────────────┼────────┼──────────┼───────────┤
│ 0  │ ai-caption-gen   │ online │ 250mb   │ 1m 30s   │
│ 1  │ snap-save        │ online │ 180mb   │ 1m 20s   │
│ 2  │ gig-credit       │ online │ 200mb   │ 1m 15s   │
│ 3  │ pet-insurance    │ online │ 220mb   │ 1m 10s   │
│ ... more apps ...     │        │          │           │
```

---

## 🛠️ Managing Apps After Deployment

### View App Logs
```bash
# See all logs
pm2 logs

# See specific app logs
pm2 logs ai-caption-generator

# Real-time logs with timestamps
pm2 logs --lines 100
```

### Control Apps
```bash
# List all apps
pm2 list

# Restart an app
pm2 restart ai-caption-generator

# Stop an app
pm2 stop ai-caption-generator

# Start a stopped app
pm2 start ai-caption-generator

# Delete from PM2
pm2 delete ai-caption-generator
```

### Update an App
```bash
# SSH to VPS
ssh deploy-user@YOUR_VPS_IP

# Navigate to app
cd /var/www/9gg.app/ai-caption-generator

# Pull latest code
git pull origin [branch-name]

# Reinstall deps if needed
npm install --production

# Rebuild if needed
npm run build

# Restart with PM2
pm2 restart ai-caption-generator
```

---

## 🔐 SSL Certificates

### Current Status
```bash
sudo certbot certificates

# Output shows:
Certificate Name: 9gg.app
  Domains: 9gg.app, *.9gg.app
  Expiry Date: [future date]
  Auto-renewal: Enabled
```

### Why Wildcard Works
- Single certificate covers `9gg.app` + all subdomains
- `*.9gg.app` matches: `ai-caption-generator.9gg.app`, `snap-save.9gg.app`, etc.
- No need for individual certs per app
- Auto-renewal handles all subdomains

### Monitor Renewal
```bash
# Check renewal status
sudo systemctl status certbot.timer

# View renewal logs
sudo tail -f /var/log/letsencrypt/letsencrypt.log
```

---

## 📊 Monitoring & Troubleshooting

### Check App Status
```bash
# Overall system health
pm2 status

# Describe specific app
pm2 describe ai-caption-generator

# Show memory usage
pm2 monit
```

### Check Nginx
```bash
# Test configuration
sudo nginx -t

# View error logs
sudo tail -f /var/log/nginx/error.log

# Reload after changes
sudo systemctl reload nginx
```

### Fix Common Issues

**App Not Starting:**
```bash
# Check if port is in use
sudo lsof -i :3000
sudo lsof -i :5000

# Check app logs
pm2 logs ai-caption-generator

# Manually test app
cd /var/www/9gg.app/[app-name]
npm start
```

**HTTPS Not Working:**
```bash
# Check certificate
sudo certbot certificates

# Verify DNS
dig ai-caption-generator.9gg.app

# Check Nginx config
sudo nginx -t
```

**App Crashes After Reboot:**
```bash
# Ensure PM2 startup hook installed
pm2 startup

# Save current PM2 state
pm2 save

# Test restart
sudo reboot
```

---

## 🔄 Updating Individual Apps

Since all apps are in separate branches, updating is simple:

### Method 1: Via Git on VPS
```bash
cd /var/www/9gg.app/ai-caption-generator
git pull origin claude/ai-caption-generator-app-01Wy8LNC4ojprjMW5s8G2ing
npm install --production
npm run build
pm2 restart ai-caption-generator
```

### Method 2: Via GitHub Desktop on Local Machine
1. Make changes in GitHub Desktop
2. Commit and push to branch
3. SSH to VPS and pull latest
4. Restart with PM2

### Method 3: Full Redeployment
```bash
# Run deployment script again (will update all apps)
sudo bash MONOREPO_DEPLOYMENT_SETUP.sh
```

---

## 📈 Scaling Considerations

### Current Setup
- **150+ apps** running on single server
- **Shared resources**: CPU, RAM, disk
- **PM2 manages restarts** and crashes
- **Nginx load balances** requests

### Performance Tips
```bash
# Monitor resource usage
pm2 monit

# Check actual memory
free -h

# Check disk space
df -h /var/www/

# Adjust PM2 instances per app
pm2 start "npm start" --instances 2 --name ai-caption-generator
```

### If Performance Degrades
1. **Add more apps selectively** (don't deploy unused ones)
2. **Monitor PM2**: `pm2 monit`
3. **Check Nginx logs**: `/var/log/nginx/`
4. **Consider separate servers** for large apps

---

## 🎯 Complete Execution Checklist

- [ ] SSL already installed (verified earlier)
- [ ] SSH access to VPS confirmed
- [ ] GitHub Desktop has latest code
- [ ] Run: `sudo bash MONOREPO_DEPLOYMENT_SETUP.sh`
- [ ] Wait for completion (40-75 min)
- [ ] Verify: `pm2 list` shows apps running
- [ ] Test: `curl https://[app-name].9gg.app`
- [ ] Check logs: `pm2 logs [app-name]`

---

## 🚀 Command Summary

```bash
# SSH to VPS
ssh deploy-user@YOUR_VPS_IP

# Clone/update repo
git clone https://github.com/kingdavsol/Traffic2umarketing.git
cd Traffic2umarketing

# Run deployment (one command, everything else is automatic)
sudo bash MONOREPO_DEPLOYMENT_SETUP.sh

# After deployment:
pm2 list                          # See all apps
pm2 logs [app-name]              # View app logs
pm2 restart [app-name]           # Restart an app
sudo certbot certificates         # Check SSL
curl https://[app-name].9gg.app  # Test app
```

---

## ⚠️ Important Notes

1. **First run takes time** (40-75 minutes) due to npm installs and builds
2. **Subsequent runs are faster** (mainly code updates)
3. **All apps under one wildcard SSL** (no individual cert generation needed)
4. **PM2 handles crashes** (auto-restart configured)
5. **Logs are valuable** - check them for debugging
6. **Port numbers auto-detected** (3000 for Node/Next.js, 5000 for Express)

---

## 🎓 Learning More

- **PM2 docs**: https://pm2.keymetrics.io/docs/usage/pm2-doc-reference/
- **Nginx docs**: https://nginx.org/en/docs/
- **Let's Encrypt**: https://letsencrypt.org/docs/
- **Node.js best practices**: https://nodejs.org/en/docs/

---

**You're ready to deploy 150+ applications! Run the script and watch them come to life.**
