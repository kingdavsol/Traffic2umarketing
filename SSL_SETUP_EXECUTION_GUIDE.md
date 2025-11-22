# SSL Setup Execution Guide

Two methods to setup SSL certificates for 9gg.app and quicksell.monster:

---

## 🟢 METHOD 1: Direct SSH Execution (Current - Recommended)

**Simplest immediate approach - Run script directly on VPS via SSH**

This is the fastest way to get SSL certificates installed right now.

### Prerequisites

1. ✅ SSH access to VPS with deploy-user
2. ✅ Sudo access on VPS (passwordless or know password)
3. ✅ DNS records configured:
   ```
   9gg.app                 A       YOUR_VPS_IP
   *.9gg.app               CNAME   9gg.app
   quicksell.monster       A       YOUR_VPS_IP
   www.quicksell.monster   CNAME   quicksell.monster
   ```
4. ✅ Port 80 & 443 open on VPS firewall

### Quick Execution

SSH to VPS and run the setup:

```bash
# SSH to VPS
ssh deploy-user@YOUR_VPS_IP

# Clone the repo (scripts are in GitHub)
git clone https://github.com/kingdavsol/Traffic2umarketing.git
cd Traffic2umarketing

# Run setup
sudo bash VPS_SSL_STANDALONE_SETUP.sh

# Verify
sudo bash VERIFY_DOMAINS_STANDALONE.sh

# Exit
exit
```

**That's it!** The script handles everything:
- ✅ Installs Certbot
- ✅ Creates Nginx configs
- ✅ Gets SSL certificates
- ✅ Configures Nginx
- ✅ Sets up auto-renewal

Expected output:
```
[✓] Certbot installed
[✓] 9gg.app config created
[✓] quicksell.monster config created
[✓] Nginx sites enabled
[✓] Nginx configuration is valid
[✓] Nginx reloaded
[✓] SSL certificate obtained for 9gg.app
[✓] SSL certificate obtained for quicksell.monster
[✓] Nginx reloaded
[✓] Auto-renewal configured
[✓] SSL Setup Complete!
```

### Detailed Step-by-Step

**Step 1: Connect to VPS**

```bash
ssh deploy-user@YOUR_VPS_IP
```

**Step 2: Get scripts from GitHub**

```bash
# Option A: Clone entire repo
git clone https://github.com/kingdavsol/Traffic2umarketing.git
cd Traffic2umarketing

# Option B: Just download the scripts
curl -O https://raw.githubusercontent.com/kingdavsol/Traffic2umarketing/claude/plan-vps-deployment-01V5CrSGmkxds4BG7ULg6tga/VPS_SSL_STANDALONE_SETUP.sh
curl -O https://raw.githubusercontent.com/kingdavsol/Traffic2umarketing/claude/plan-vps-deployment-01V5CrSGmkxds4BG7ULg6tga/VERIFY_DOMAINS_STANDALONE.sh
```

**Step 3: Run SSL setup**

```bash
sudo bash VPS_SSL_STANDALONE_SETUP.sh
```

Monitor the output - takes ~5-8 minutes total.

**Step 4: Verify setup**

```bash
sudo bash VERIFY_DOMAINS_STANDALONE.sh
```

This runs 10 verification tests showing:
- Nginx status ✓
- DNS resolution ✓
- Certificate validity ✓
- HTTPS redirects ✓
- Auto-renewal status ✓

**Step 5: Exit SSH**

```bash
exit
```

Done! Your domains are now live with HTTPS.

---

## 🔵 METHOD 2: GitHub Actions (Future Option)

**For completely automated workflow execution - requires merging to main branch**

The GitHub Actions workflow file (`setup-ssl.yml`) is available, but GitHub Actions only shows workflows from the repository's main branch.

**To use GitHub Actions approach:**

1. **Option A: Create a Pull Request**
   - Create PR from `claude/plan-vps-deployment-01V5CrSGmkxds4BG7ULg6tga` to `main`
   - Merge the PR
   - Workflow will then appear in GitHub Actions tab
   - Trigger manually: Actions → "Setup SSL Certificates and Configure Nginx" → Run workflow

2. **Option B: Manual merge to main**
   - Checkout main branch
   - Merge feature branch
   - Workflow becomes available in Actions tab

**Advantages of GitHub Actions (when available):**
- ✅ One-click execution
- ✅ No manual SSH needed
- ✅ Logs in GitHub UI
- ✅ Can schedule automated renewals
- ✅ Easy audit trail

---

## 📊 Quick Comparison

| Aspect | Direct SSH | GitHub Actions |
|--------|---|---|
| **Available Now** | ✅ Yes | After merge to main |
| **Setup Time** | 5 min | Same |
| **Complexity** | Simple (4 commands) | One button click |
| **VPS Access** | Required | Not needed |
| **Logs** | Terminal | GitHub UI |
| **Recommended NOW** | ✅ Yes | Use after merge |

---

## ✅ What Gets Installed

### Nginx Configurations
```
/etc/nginx/sites-available/9gg.app.conf
/etc/nginx/sites-available/quicksell.monster.conf
/etc/nginx/sites-enabled/9gg.app.conf (symlink)
/etc/nginx/sites-enabled/quicksell.monster.conf (symlink)
```

### SSL Certificates
```
/etc/letsencrypt/live/9gg.app/
  ├── fullchain.pem
  ├── privkey.pem
  └── chain.pem

/etc/letsencrypt/live/quicksell.monster/
  ├── fullchain.pem
  ├── privkey.pem
  └── chain.pem
```

### Auto-Renewal
```
systemd timer: certbot.timer
- Runs daily
- Renews 30 days before expiry
- Automatically reloads Nginx
```

---

## 🔍 Troubleshooting

### Issue: DNS Not Resolving

**Symptom**: Script fails with "Cannot resolve domains"

**Solution**:
```bash
# Wait 5-30 minutes for DNS propagation
dig 9gg.app
nslookup 9gg.app

# If still not resolving, check Hostinger DNS panel
```

### Issue: Let's Encrypt Validation Fails

**Symptom**: "Challenge failed" error

**Causes**:
- Port 80 not open
- DNS not propagated
- Firewall blocking HTTP

**Solution**:
```bash
# Check port 80
sudo lsof -i :80

# Open firewall if needed
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Retry script
sudo bash ~/VPS_SSL_STANDALONE_SETUP.sh
```

### Issue: Nginx Config Error

**Symptom**: "Nginx configuration failed"

**Solution**:
```bash
# Check errors
sudo nginx -t

# Fix any syntax errors in:
# - /etc/nginx/sites-available/9gg.app.conf
# - /etc/nginx/sites-available/quicksell.monster.conf

# Reload Nginx
sudo systemctl reload nginx
```

### Issue: Apps Not Responding After Setup

**Symptom**: HTTPS connect but no app response

**Solution**:
```bash
# Check if apps deployed
pm2 list

# Deploy first app
git push origin claude/my-app-branch

# Monitor deployment
pm2 logs [app-name]
```

---

## 🎯 Next Steps After Setup

### 1. Test Domains (5 min)

```bash
# Test HTTPS redirect
curl -I http://9gg.app
# Should return 301 redirect

# Test HTTPS access
curl https://9gg.app
# Should return 200 or app content

# Test subdomain
curl https://caption-genius.9gg.app
# Should respond (once app deployed)

# Check certificate
echo | openssl s_client -connect 9gg.app:443 2>/dev/null | grep "Issuer"
# Should show: Let's Encrypt Authority
```

### 2. Deploy First App (10 min)

```bash
# Pick an app branch and deploy
git push origin claude/ai-caption-generator-app-01Wy8LNC4ojprjMW5s8G2ing

# GitHub Actions will automatically:
# - Clone the code
# - Install dependencies
# - Build the app
# - Start it with PM2
# - Configure Nginx
```

### 3. Monitor App (ongoing)

```bash
# On VPS
pm2 list              # See all apps
pm2 logs [app-name]   # View app logs
pm2 status [app-name] # Check status

# Check HTTPS
curl https://caption-genius.9gg.app
# Should now return app content
```

### 4. Monitor SSL (monthly)

```bash
# On VPS
sudo certbot certificates
# Should show expiration dates 90 days out

# Auto-renewal will renew automatically 30 days before expiry
# But you can manually check:
sudo systemctl status certbot.timer
```

---

## 🚨 Emergency Rollback

If something goes wrong and you need to revert:

```bash
# SSH to VPS
ssh deploy-user@YOUR_VPS_IP

# Disable Nginx
sudo systemctl stop nginx

# Backup current Nginx config
sudo mv /etc/nginx/sites-available/9gg.app.conf /tmp/9gg.app.conf.bak
sudo mv /etc/nginx/sites-available/quicksell.monster.conf /tmp/quicksell.monster.conf.bak

# Remove symlinks
sudo rm /etc/nginx/sites-enabled/9gg.app.conf
sudo rm /etc/nginx/sites-enabled/quicksell.monster.conf

# Restart Nginx
sudo systemctl start nginx

# Then re-run SSL setup script
sudo bash ~/VPS_SSL_STANDALONE_SETUP.sh
```

---

## 📋 Quick Reference

### GitHub Actions Workflow

**File**: `.github/workflows/setup-ssl.yml`

**Trigger**: Manual (via GitHub UI or CLI)

**Actions Performed**:
1. Copies SSL setup scripts to VPS
2. Runs VPS_SSL_STANDALONE_SETUP.sh
3. Runs VERIFY_DOMAINS_STANDALONE.sh
4. Checks certificate status
5. Verifies Nginx is running
6. Reports success/failure

### Direct SSH Execution

**Files Needed**:
- VPS_SSL_STANDALONE_SETUP.sh
- VERIFY_DOMAINS_STANDALONE.sh

**Command**:
```bash
sudo bash ~/VPS_SSL_STANDALONE_SETUP.sh
sudo bash ~/VERIFY_DOMAINS_STANDALONE.sh
```

---

## ✨ Summary

**To setup SSL certificates right now:**

### Recommended: Direct SSH Execution (Available Now)

```bash
# SSH to VPS
ssh deploy-user@YOUR_VPS_IP

# Clone repo
git clone https://github.com/kingdavsol/Traffic2umarketing.git
cd Traffic2umarketing

# Run setup and verify
sudo bash VPS_SSL_STANDALONE_SETUP.sh
sudo bash VERIFY_DOMAINS_STANDALONE.sh
exit
```

Takes ~10 minutes and results in:
- ✅ HTTPS working for all domains
- ✅ HTTP redirecting to HTTPS
- ✅ Certificates auto-renewing before expiry
- ✅ Ready for app deployment

### Future: GitHub Actions (After Merge)

Once you merge the feature branch to main, you'll also have:
- One-click execution in GitHub Actions tab
- Fully automated via GitHub UI
- Automated logs and auditing

---

## 🎯 Next Steps

1. **SSH to your VPS:**
   ```bash
   ssh deploy-user@YOUR_VPS_IP
   ```

2. **Clone the repo:**
   ```bash
   git clone https://github.com/kingdavsol/Traffic2umarketing.git
   cd Traffic2umarketing
   ```

3. **Run the setup:**
   ```bash
   sudo bash VPS_SSL_STANDALONE_SETUP.sh
   sudo bash VERIFY_DOMAINS_STANDALONE.sh
   exit
   ```

4. **That's it!** SSL is installed and auto-renewing

Then:
- Test domains: `curl https://9gg.app`
- Deploy apps: `git push origin [branch-name]` (triggers GitHub Actions)
- Monitor: `pm2 list` on VPS
