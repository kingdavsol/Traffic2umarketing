# SSL Setup Execution Guide

Two methods to setup SSL certificates for 9gg.app and quicksell.monster:

---

## 🚀 METHOD 1: GitHub Actions (Recommended)

**Easiest approach - Fully automated, no manual VPS access needed**

### Prerequisites

Before running, ensure:
1. ✅ Secrets configured in GitHub (VPS_HOST, VPS_SSH_PRIVATE_KEY)
2. ✅ DNS records point to VPS IP:
   ```
   9gg.app                 A       YOUR_VPS_IP
   *.9gg.app               CNAME   9gg.app
   quicksell.monster       A       YOUR_VPS_IP
   www.quicksell.monster   CNAME   quicksell.monster
   ```
3. ✅ VPS port 80 open (for Let's Encrypt validation)
4. ✅ Nginx installed on VPS

### Execution Steps

**Step 1: Trigger the workflow from GitHub**

Option A - Via GitHub Web UI:
```
1. Go to: GitHub → Actions → "Setup SSL Certificates and Configure Nginx"
2. Click: "Run workflow" button
3. Select: "production" environment
4. Click: "Run workflow" button
```

Option B - Via GitHub CLI:
```bash
gh workflow run setup-ssl.yml -f environment=production
```

**Step 2: Monitor execution**

In GitHub:
```
Actions → Setup SSL Certificates → Latest run → View logs
```

Expected output:
```
✅ SSL Setup Complete!

Configured domains:
  • 9gg.app (with *.9gg.app wildcard)
  • quicksell.monster (with www.quicksell.monster)

Next steps:
  1. Test domains: curl https://9gg.app
  2. Deploy apps: git push origin [branch-name]
  3. Monitor apps: pm2 list
```

**Step 3: Verify locally (optional)**

```bash
# Test main domain
curl -I https://9gg.app
# Should return 200 OK

# Test certificate
openssl s_client -connect 9gg.app:443 2>/dev/null | grep "Issuer"
# Should show: Let's Encrypt Authority

# Check expiry
openssl s_client -connect 9gg.app:443 2>/dev/null | grep "Not After"
# Should show expiration ~90 days from now
```

---

## 🔧 METHOD 2: Manual SSH Execution

**Direct approach - Run script manually on VPS**

### Prerequisites

1. ✅ SSH access to VPS
2. ✅ Deploy user exists on VPS
3. ✅ Passwordless sudo configured (or know password)
4. ✅ DNS records configured (same as Method 1)
5. ✅ Port 80 open on VPS

### Execution Steps

**Step 1: Download script to VPS**

From your local machine:
```bash
scp VPS_SSL_STANDALONE_SETUP.sh deploy-user@YOUR_VPS_IP:/home/deploy-user/
scp VERIFY_DOMAINS_STANDALONE.sh deploy-user@YOUR_VPS_IP:/home/deploy-user/
```

**Step 2: SSH to VPS**

```bash
ssh deploy-user@YOUR_VPS_IP
```

**Step 3: Run SSL setup**

```bash
# Make executable
chmod +x ~/VPS_SSL_STANDALONE_SETUP.sh

# Run as root
sudo bash ~/VPS_SSL_STANDALONE_SETUP.sh
```

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

**Step 4: Verify setup**

On VPS:
```bash
# Make executable
chmod +x ~/VERIFY_DOMAINS_STANDALONE.sh

# Run verification
sudo bash ~/VERIFY_DOMAINS_STANDALONE.sh
```

This runs 10 verification tests and shows status of all domains and SSL certificates.

**Step 5: Exit SSH**

```bash
exit
```

---

## 📊 Comparison

| Aspect | GitHub Actions | Manual SSH |
|--------|---|---|
| **Automation** | Fully automated | Manual trigger |
| **Complexity** | Simple (click button) | Medium (SSH + commands) |
| **VPS Access** | Not needed | Required |
| **Logs** | GitHub Actions UI | Terminal output |
| **Time** | 5-10 minutes | 5-10 minutes |
| **Error Recovery** | Retry via UI | Manual re-run |
| **Recommended** | ✅ Yes | Fallback only |

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

**To setup SSL certificates:**

1. **Preferred**: Use GitHub Actions (click button, fully automated)
2. **Fallback**: Manual SSH execution (if GitHub Actions unavailable)

Either way takes ~10 minutes and results in:
- ✅ HTTPS working for all domains
- ✅ HTTP redirecting to HTTPS
- ✅ Certificates auto-renewing before expiry
- ✅ Ready for app deployment

---

**You're ready to execute!**

Next: Choose Method 1 (GitHub Actions) or Method 2 (Manual SSH)
