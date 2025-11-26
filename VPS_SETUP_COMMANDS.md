# Getting VPS Ready with Latest Deployment Scripts

## SSH to VPS and Clone/Update Repository

```bash
# SSH to your VPS
ssh root@YOUR_VPS_IP

# If this is the first time, clone the repository
git clone https://github.com/kingdavsol/Traffic2umarketing.git /root/Traffic2umarketing
cd /root/Traffic2umarketing

# If repository already exists, pull latest changes
cd /root/Traffic2umarketing
git fetch origin
git pull origin claude/fix-typescript-github-sync-01PcLoV7ZCLcgH9wDizRyGiS

# Verify you have the latest scripts
ls -lh /root/Traffic2umarketing/DEPLOY_ALL_APPS_MULTI_DOMAIN.sh
ls -lh /root/Traffic2umarketing/VPS_COMPLETE_SETUP.sh
ls -lh /root/Traffic2umarketing/MULTI_DOMAIN_DEPLOYMENT_GUIDE.md
```

## Complete Step-by-Step Setup (From Scratch)

```bash
# ============================================================================
# STEP 1: SSH to VPS
# ============================================================================
ssh root@YOUR_VPS_IP

# ============================================================================
# STEP 2: Clone the repository with latest scripts
# ============================================================================
cd /root
git clone https://github.com/kingdavsol/Traffic2umarketing.git
cd Traffic2umarketing

# Verify the branch
git status

# If not on the correct branch, check it out
git checkout claude/fix-typescript-github-sync-01PcLoV7ZCLcgH9wDizRyGiS

# ============================================================================
# STEP 3: Make scripts executable
# ============================================================================
chmod +x VPS_COMPLETE_SETUP.sh
chmod +x DEPLOY_ALL_APPS_MULTI_DOMAIN.sh
chmod +x VPS_COMPREHENSIVE_SSL_SETUP.sh
chmod +x QUICK_DEPLOY.sh

# Verify scripts are ready
ls -lh | grep ".sh$"

# ============================================================================
# STEP 4: Read the documentation
# ============================================================================
cat README_MULTI_DOMAIN_DEPLOYMENT.md
cat DEPLOYMENT_INSTRUCTIONS.md

# ============================================================================
# STEP 5: Run VPS setup (one-time, 10-15 minutes)
# ============================================================================
sudo bash VPS_COMPLETE_SETUP.sh 9gg.app admin@9gg.app

# ============================================================================
# STEP 6: Deploy all 20 apps (45-60 minutes)
# ============================================================================
sudo bash DEPLOY_ALL_APPS_MULTI_DOMAIN.sh

# ============================================================================
# STEP 7: Verify deployment
# ============================================================================
pm2 list
pm2 monit

# Test HTTPS access
curl -I https://ai-caption-generator-app.9gg.app
curl -I https://quicksell.quicksell.monster
```

## If Repository Already Exists on VPS

```bash
# SSH to VPS
ssh root@YOUR_VPS_IP

# Navigate to repository
cd /root/Traffic2umarketing

# Update to latest scripts
git fetch origin
git pull origin claude/fix-typescript-github-sync-01PcLoV7ZCLcgH9wDizRyGiS

# Make new scripts executable
chmod +x DEPLOY_ALL_APPS_MULTI_DOMAIN.sh

# Verify latest commits are present
git log --oneline -5

# Verify scripts exist
ls -lh DEPLOY_ALL_APPS_MULTI_DOMAIN.sh
ls -lh MULTI_DOMAIN_DEPLOYMENT_GUIDE.md
ls -lh DEPLOYMENT_INSTRUCTIONS.md
```

## Quick Pre-Deployment Verification

```bash
# SSH to VPS
ssh root@YOUR_VPS_IP

# Check that all scripts are present
cd /root/Traffic2umarketing

echo "=== Checking Deployment Scripts ==="
test -f DEPLOY_ALL_APPS_MULTI_DOMAIN.sh && echo "✓ DEPLOY_ALL_APPS_MULTI_DOMAIN.sh" || echo "✗ Missing"
test -f VPS_COMPLETE_SETUP.sh && echo "✓ VPS_COMPLETE_SETUP.sh" || echo "✗ Missing"
test -f VPS_COMPREHENSIVE_SSL_SETUP.sh && echo "✓ VPS_COMPREHENSIVE_SSL_SETUP.sh" || echo "✗ Missing"
test -f QUICK_DEPLOY.sh && echo "✓ QUICK_DEPLOY.sh" || echo "✗ Missing"

echo ""
echo "=== Checking Documentation ==="
test -f README_MULTI_DOMAIN_DEPLOYMENT.md && echo "✓ README_MULTI_DOMAIN_DEPLOYMENT.md" || echo "✗ Missing"
test -f DEPLOYMENT_INSTRUCTIONS.md && echo "✓ DEPLOYMENT_INSTRUCTIONS.md" || echo "✗ Missing"
test -f MULTI_DOMAIN_DEPLOYMENT_GUIDE.md && echo "✓ MULTI_DOMAIN_DEPLOYMENT_GUIDE.md" || echo "✗ Missing"

echo ""
echo "=== Current Git Status ==="
git log --oneline -3
git status
```

## Troubleshooting Git Issues

```bash
# If you get permission denied
ssh -i ~/.ssh/your_key root@YOUR_VPS_IP

# If you need to check the remote URL
cd /root/Traffic2umarketing
git remote -v

# If you need to update the remote URL
git remote set-url origin https://github.com/kingdavsol/Traffic2umarketing.git

# If you get merge conflicts
git reset --hard HEAD
git pull origin claude/fix-typescript-github-sync-01PcLoV7ZCLcgH9wDizRyGiS
```

## One-Command Complete Setup

```bash
# Copy and paste this entire block to set up your VPS from scratch

ssh root@YOUR_VPS_IP << 'EOFSETUP'

# Clone repository
cd /root
git clone https://github.com/kingdavsol/Traffic2umarketing.git
cd Traffic2umarketing

# Checkout correct branch
git checkout claude/fix-typescript-github-sync-01PcLoV7ZCLcgH9wDizRyGiS

# Make scripts executable
chmod +x VPS_COMPLETE_SETUP.sh
chmod +x DEPLOY_ALL_APPS_MULTI_DOMAIN.sh
chmod +x VPS_COMPREHENSIVE_SSL_SETUP.sh
chmod +x QUICK_DEPLOY.sh

# Verify scripts
echo "=== Scripts Ready ==="
ls -lh *.sh | grep -E "(VPS_COMPLETE|DEPLOY_ALL|VPS_COMPREHENSIVE|QUICK_DEPLOY)"

echo ""
echo "=== Documentation Ready ==="
ls -lh *.md | grep -i "deployment\|readme"

echo ""
echo "=== Current Git Status ==="
git log --oneline -3

echo ""
echo "✅ Repository and scripts are ready!"
echo ""
echo "Next steps:"
echo "1. Read: cat README_MULTI_DOMAIN_DEPLOYMENT.md"
echo "2. Read: cat DEPLOYMENT_INSTRUCTIONS.md"
echo "3. Update DNS records (9gg.app and quicksell.monster)"
echo "4. Run: sudo bash VPS_COMPLETE_SETUP.sh 9gg.app admin@9gg.app"
echo "5. Run: sudo bash DEPLOY_ALL_APPS_MULTI_DOMAIN.sh"

EOFSETUP
```

## After Cloning: Next Actions

```bash
# SSH to VPS
ssh root@YOUR_VPS_IP

# Go to repository
cd /root/Traffic2umarketing

# 1. Read the quick start guide
less DEPLOYMENT_INSTRUCTIONS.md

# 2. Read the complete guide
less MULTI_DOMAIN_DEPLOYMENT_GUIDE.md

# 3. Update DNS records (do this in your DNS provider)
#    9gg.app              A    YOUR_VPS_IP
#    *.9gg.app            A    YOUR_VPS_IP
#    quicksell.monster    A    YOUR_VPS_IP
#    *.quicksell.monster  A    YOUR_VPS_IP

# 4. Run VPS setup (one time, 10-15 minutes)
sudo bash VPS_COMPLETE_SETUP.sh 9gg.app admin@9gg.app

# 5. Deploy all 20 apps (45-60 minutes)
sudo bash DEPLOY_ALL_APPS_MULTI_DOMAIN.sh

# 6. Monitor deployment
pm2 list
pm2 monit

# 7. Test your apps
curl -I https://ai-caption-generator-app.9gg.app
curl -I https://quicksell.quicksell.monster
```

## Verify Everything is Set Up

```bash
# SSH to VPS
ssh root@YOUR_VPS_IP

# Navigate to scripts
cd /root/Traffic2umarketing

# Check all required components
echo "=== System Requirements ==="
node -v
npm -v
pm2 -v
nginx -v
sudo certbot --version

echo ""
echo "=== Repository Status ==="
git log --oneline -1
git status

echo ""
echo "=== Deployment Scripts ==="
test -f DEPLOY_ALL_APPS_MULTI_DOMAIN.sh && echo "✓ Main deployment script ready"
test -x DEPLOY_ALL_APPS_MULTI_DOMAIN.sh && echo "✓ Script is executable"

echo ""
echo "=== Documentation ==="
test -f README_MULTI_DOMAIN_DEPLOYMENT.md && echo "✓ README available"
test -f DEPLOYMENT_INSTRUCTIONS.md && echo "✓ Instructions available"
test -f MULTI_DOMAIN_DEPLOYMENT_GUIDE.md && echo "✓ Complete guide available"

echo ""
echo "✅ VPS is ready for deployment!"
```

---

## Summary: Complete Command Sequence

```bash
# 1. SSH to VPS
ssh root@YOUR_VPS_IP

# 2. Clone repository (or update if exists)
cd /root
git clone https://github.com/kingdavsol/Traffic2umarketing.git
cd Traffic2umarketing
git checkout claude/fix-typescript-github-sync-01PcLoV7ZCLcgH9wDizRyGiS
git pull origin claude/fix-typescript-github-sync-01PcLoV7ZCLcgH9wDizRyGiS

# 3. Make scripts executable
chmod +x *.sh

# 4. Verify scripts present
ls -lh DEPLOY_ALL_APPS_MULTI_DOMAIN.sh

# 5. Read documentation
cat DEPLOYMENT_INSTRUCTIONS.md

# 6. Update DNS records (external, before continuing)

# 7. Run VPS setup
sudo bash VPS_COMPLETE_SETUP.sh 9gg.app admin@9gg.app

# 8. Deploy all apps
sudo bash DEPLOY_ALL_APPS_MULTI_DOMAIN.sh

# 9. Verify deployment
pm2 list
pm2 monit
```

---

**Total time for complete setup: ~100 minutes**
- DNS propagation: 5-30 minutes
- VPS setup: 10-15 minutes
- App deployment: 45-60 minutes

All scripts are now available on your VPS via GitHub!
