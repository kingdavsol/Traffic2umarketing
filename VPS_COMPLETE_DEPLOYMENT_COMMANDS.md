# Complete VPS Deployment Commands for 70+ Apps in Monorepos

## ⚠️ IMPORTANT: 70+ Apps Across 19 Branches

Since you have **70+ applications in monorepo format** across 19 branches, you should use:
- **MONOREPO_DEPLOYMENT_SETUP.sh** for all apps on 9gg.app
- **Special handling for quicksell.monster** (separate domain)

This script auto-detects:
- Single apps at root level (package.json at root)
- Monorepos with multiple apps in subdirectories

---

## Step-by-Step: Complete Setup from Scratch

### STEP 1: SSH to VPS and Clone Repository

```bash
# SSH to your VPS
ssh root@YOUR_VPS_IP

# Clone the repository with all deployment scripts
cd /root
git clone https://github.com/kingdavsol/Traffic2umarketing.git
cd Traffic2umarketing

# Checkout the branch with all the new scripts
git checkout claude/fix-typescript-github-sync-01PcLoV7ZCLcgH9wDizRyGiS
git pull origin claude/fix-typescript-github-sync-01PcLoV7ZCLcgH9wDizRyGiS

# Make all scripts executable
chmod +x *.sh

# Verify you have the right scripts
echo "=== Verifying Scripts ==="
ls -lh | grep "\.sh$"

# Verify latest commit
git log --oneline -1
```

**Expected output:**
```
MONOREPO_DEPLOYMENT_SETUP.sh (for 70+ apps)
VPS_COMPLETE_SETUP.sh (for initial VPS setup)
VPS_COMPREHENSIVE_SSL_SETUP.sh (for SSL)
DEPLOY_ALL_APPS_MULTI_DOMAIN.sh (for custom multi-domain)
QUICK_DEPLOY.sh (for quick updates)
```

---

### STEP 2: Configure DNS Records

Before proceeding, update your DNS records:

```dns
9gg.app              A    YOUR_VPS_IP
*.9gg.app            A    YOUR_VPS_IP
quicksell.monster    A    YOUR_VPS_IP
*.quicksell.monster  A    YOUR_VPS_IP
```

**⏳ Wait 5-30 minutes for DNS propagation**

---

### STEP 3: Run VPS Setup (One Time Only - 10-15 minutes)

```bash
# Still on VPS, in /root/Traffic2umarketing directory

# Run the complete VPS setup
sudo bash VPS_COMPLETE_SETUP.sh 9gg.app admin@9gg.app

# This installs:
# ✓ Node.js 18 + npm
# ✓ PM2 process manager
# ✓ Nginx web server
# ✓ Certbot SSL
# ✓ Wildcard SSL certificates for *.9gg.app
# ✓ Auto-startup configuration
```

**Expected output:**
```
✓ Dependencies verified
✓ System updated
✓ Node.js v18.x.x installed
✓ PM2 installed and configured
✓ Nginx installed and configured
✓ Certbot installed
✓ SSL/TLS SETUP COMPLETE
```

---

### STEP 4: Deploy All 70+ Apps from Monorepos (45-60 minutes)

```bash
# Still on VPS, in /root/Traffic2umarketing directory

# This is the key script for 70+ apps!
sudo bash MONOREPO_DEPLOYMENT_SETUP.sh

# This script will:
# 1. Fetch all 19 branches from GitHub
# 2. For each branch:
#    - Detect single app or monorepo structure
#    - Install dependencies
#    - Build applications
#    - Start with PM2
#    - Create Nginx configs with SSL
#    - Apply wildcard certificates
# 3. Reload Nginx
# 4. Save PM2 state for auto-restart
```

**What to expect:**
```
Found 19 branches to deploy
→ Processing branch: ai-caption-generator-app-01xxx
  ├─ Single app detected: ai-caption-generator-app
    Installing dependencies...
    Building application...
    ✓ ai-caption-generator-app.9gg.app (port 3000)

→ Processing branch: some-monorepo-01xxx
  ├─ Monorepo detected: multiple apps
    ├─ app-1 deployed to port 3001
    ├─ app-2 deployed to port 3002
    ├─ app-3 deployed to port 3003
    └─ ... (more apps)

→ Processing branch: quicksell-01xxx
  ├─ Single app detected: quicksell
    ✓ quicksell (port XXXX)

... (more branches and apps)

✓ Deployed 70+ applications
✓ Nginx configuration valid
✓ Nginx reloaded
✓ PM2 saved
```

---

### STEP 5: Verify Deployment (5-10 minutes)

```bash
# Check all apps are running
pm2 list

# Should show 70+ apps running

# Monitor in real-time
pm2 monit

# Test HTTPS connectivity
curl -I https://ai-caption-generator-app.9gg.app
curl -I https://quicksell.9gg.app

# Check logs for any errors
pm2 logs | head -50
```

---

## Complete Single Command

If you prefer a single copy-paste command for the entire setup:

```bash
# Run this to SSH and set up everything
ssh root@YOUR_VPS_IP << 'EOFCOMPLETE'

cd /root
git clone https://github.com/kingdavsol/Traffic2umarketing.git 2>/dev/null || cd Traffic2umarketing
cd Traffic2umarketing
git checkout claude/fix-typescript-github-sync-01PcLoV7ZCLcgH9wDizRyGiS 2>/dev/null || true
git pull origin claude/fix-typescript-github-sync-01PcLoV7ZCLcgH9wDizRyGiS
chmod +x *.sh

echo "✅ Repository ready with 70+ app deployment scripts"
echo ""
echo "Next: 1. Update DNS records"
echo "      2. sudo bash VPS_COMPLETE_SETUP.sh 9gg.app admin@9gg.app"
echo "      3. sudo bash MONOREPO_DEPLOYMENT_SETUP.sh"
echo ""
echo "Current scripts:"
ls -lh *.sh | grep -E "(MONOREPO|VPS_COMPLETE|DEPLOY_ALL)"
echo ""
echo "Git status:"
git log --oneline -1
git status

EOFCOMPLETE
```

---

## For 70+ Apps: Key Difference

### Old Standard Approach (single domain only)
```bash
sudo bash MONOREPO_DEPLOYMENT_SETUP.sh
# → Deploys all apps to app-name.9gg.app
```

### New Multi-Domain Approach (for special handling)
```bash
sudo bash DEPLOY_ALL_APPS_MULTI_DOMAIN.sh
# → Routes quicksell to quicksell.monster
# → Routes others to 9gg.app
# → Excludes soltil*, topcoinbot*, coinpicker*
```

**Use MONOREPO_DEPLOYMENT_SETUP.sh for your 70+ apps unless you need special routing!**

---

## Post-Deployment: Managing 70+ Apps

```bash
# View all running apps (70+)
pm2 list

# View app count
pm2 list | wc -l

# Real-time monitoring dashboard
pm2 monit

# View logs for specific app
pm2 logs [app-name] --lines 50

# Restart all apps
pm2 restart all

# Check system resources
df -h
free -h
top

# Monitor Nginx
sudo systemctl status nginx
sudo tail -f /var/log/nginx/error.log
```

---

## If You Only Want Specific Domains

If you need the multi-domain approach (quicksell.monster separate), create a custom script:

```bash
# Edit DEPLOY_ALL_APPS_MULTI_DOMAIN.sh to adjust:
# - EXCLUDE_PATTERNS (apps to skip)
# - Domain mappings (which apps go where)

sudo nano DEPLOY_ALL_APPS_MULTI_DOMAIN.sh

# Then run:
sudo bash DEPLOY_ALL_APPS_MULTI_DOMAIN.sh
```

---

## Troubleshooting

### Scripts Not Found
```bash
cd /root/Traffic2umarketing
git pull origin claude/fix-typescript-github-sync-01PcLoV7ZCLcgH9wDizRyGiS
chmod +x *.sh
ls -lh *.sh
```

### Apps Won't Deploy
```bash
# Check what went wrong
pm2 logs [app-name]

# Check port conflicts
netstat -tlnp | grep :3000

# Check dependencies
cd /var/www/[app-name]
npm list
```

### DNS Not Resolving
```bash
# Check DNS propagation
dig 9gg.app
dig quicksell.monster

# Verify VPS IP
hostname -I
```

### SSL Certificate Issues
```bash
# Check certificates
sudo certbot certificates

# Verify Nginx SSL config
sudo nginx -t

# Check certificate paths
ls -la /etc/letsencrypt/live/
```

---

## Summary: For 70+ Apps

| Step | Command | Time |
|------|---------|------|
| 1 | Clone repo & pull latest | 2 min |
| 2 | Update DNS (external) | 1 min + 5-30 min wait |
| 3 | Run VPS setup | 10-15 min |
| 4 | Run monorepo deployment | 45-60 min |
| 5 | Verify & monitor | 5-10 min |
| **Total** | | **~100 minutes** |

---

## The Right Script for 70+ Apps

**Use: MONOREPO_DEPLOYMENT_SETUP.sh**

This script automatically:
✅ Detects 70+ apps across 19 branches
✅ Handles monorepo subdirectories
✅ Handles single app roots
✅ Installs dependencies
✅ Builds applications
✅ Manages PM2 processes
✅ Creates Nginx configs
✅ Applies SSL certificates

---

**Ready to deploy your 70+ apps? Start with cloning the repository and running VPS_COMPLETE_SETUP.sh, then MONOREPO_DEPLOYMENT_SETUP.sh!**
