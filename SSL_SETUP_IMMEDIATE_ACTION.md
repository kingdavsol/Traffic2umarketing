# SSL Setup - Immediate Action Required

**Status**: Ready to execute now via SSH
**Time Required**: ~10 minutes
**Complexity**: Simple (copy-paste commands)

---

## ⚡ Quick Summary

You have **two approaches** to setup SSL for 9gg.app and quicksell.monster:

1. **🟢 Direct SSH (Available NOW)** ← Use this immediately
2. **🔵 GitHub Actions (Available after merge)** ← Use later

---

## 🚀 Start Here: Direct SSH Method

This is the fastest way to get SSL certificates installed **right now**.

### Step 1: Get the Script Files

From the repository, download these two files:
- `VPS_SSL_STANDALONE_SETUP.sh`
- `VERIFY_DOMAINS_STANDALONE.sh`

(Or clone the repo and navigate to the root directory)

### Step 2: Run These Commands

Open your terminal and run:

```bash
# Replace YOUR_VPS_IP with your Hostinger VPS IP
# Replace deploy-user if your VPS user is different

# Copy scripts to VPS
scp VPS_SSL_STANDALONE_SETUP.sh deploy-user@YOUR_VPS_IP:/home/deploy-user/
scp VERIFY_DOMAINS_STANDALONE.sh deploy-user@YOUR_VPS_IP:/home/deploy-user/

# SSH into VPS
ssh deploy-user@YOUR_VPS_IP

# On VPS - Run SSL setup
sudo bash ~/VPS_SSL_STANDALONE_SETUP.sh

# On VPS - Verify setup
sudo bash ~/VERIFY_DOMAINS_STANDALONE.sh

# Exit VPS
exit
```

### Step 3: Done!

That's it. In ~10 minutes you'll have:
- ✅ SSL certificates for 9gg.app (covers all subdomains)
- ✅ SSL certificates for quicksell.monster
- ✅ Nginx configured to use SSL
- ✅ HTTP automatically redirecting to HTTPS
- ✅ Auto-renewal enabled (certificates renew automatically)

---

## What the Script Does

**VPS_SSL_STANDALONE_SETUP.sh:**
1. Installs Certbot (Let's Encrypt client)
2. Creates Nginx configuration for 9gg.app
3. Creates Nginx configuration for quicksell.monster
4. Gets SSL certificates from Let's Encrypt
5. Configures Nginx to use SSL
6. Sets up automatic renewal via systemd timer

**VERIFY_DOMAINS_STANDALONE.sh:**
- Runs 10 verification tests to confirm everything works
- Checks DNS, certificates, Nginx status, etc.

---

## Prerequisites

Make sure you have:

1. **SSH access** to your Hostinger VPS as `deploy-user`
2. **Sudo access** on the VPS (passwordless or know the password)
3. **DNS records** already configured in Hostinger:
   ```
   9gg.app              →  A Record  → YOUR_VPS_IP
   *.9gg.app            →  CNAME     → 9gg.app
   quicksell.monster    →  A Record  → YOUR_VPS_IP
   www.quicksell.monster → CNAME     → quicksell.monster
   ```
4. **Ports open** on firewall:
   - Port 80 (HTTP - needed for Let's Encrypt validation)
   - Port 443 (HTTPS - for production traffic)

---

## Why Direct SSH Instead of GitHub Actions?

The GitHub Actions workflow (`setup-ssl.yml`) exists, but **GitHub Actions only shows workflows from the repository's main/default branch**.

**Your options:**

### Option 1: Use Direct SSH NOW (Recommended)
- Available immediately
- Takes same time (~10 minutes)
- Straightforward execution
- **Use this to get SSL working today**

### Option 2: Create PR to merge to main (For later)
- Merge the feature branch `claude/plan-vps-deployment-01V5CrSGmkxds4BG7ULg6tga` to `main`
- Then GitHub Actions workflow becomes available
- Then you can use one-click GitHub Actions for future setups
- **Use this after you have SSL working**

**Bottom line**: Use SSH approach now. Once merged to main, GitHub Actions approach becomes available for future use.

---

## Expected Output

When you run `sudo bash ~/VPS_SSL_STANDALONE_SETUP.sh`, you should see:

```
═════════════════════════════════════════════════════
SSL Certificate Setup for 9gg.app and quicksell.monster
STANDALONE VERSION (No external files needed)
═════════════════════════════════════════════════════

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

═════════════════════════════════════════════════════
✓ SSL Setup Complete!
═════════════════════════════════════════════════════

Certificates installed for:
  ✓ 9gg.app (with *.9gg.app wildcard)
  ✓ quicksell.monster (with www.quicksell.monster)

Next steps:
  1. Run verification: bash VERIFY_DOMAINS_SSL.sh
  2. Deploy apps: git push origin [branch-name]
  3. Test domains: curl https://9gg.app
```

---

## What's Configured

### 9gg.app (Master Domain)
- **Main domain**: 9gg.app
- **Subdomains**: *.9gg.app (all 68 apps)
- **Port**: All route to port 3000 (where apps run)
- **Single SSL certificate** covers both main and all subdomains

### quicksell.monster (Dedicated Domain)
- **Main domain**: quicksell.monster + www.quicksell.monster
- **Frontend**: Routes to port 3000
- **API**: /api/* routes to port 5000
- **Separate SSL certificate**

### Security Features
- ✅ HTTPS enforced (HTTP redirects to HTTPS)
- ✅ TLS 1.2 and 1.3 only (no old insecure versions)
- ✅ Strong ciphers only
- ✅ HSTS enabled (browser remembers HTTPS is required)
- ✅ Security headers added (prevents XSS, clickjacking, etc.)
- ✅ Gzip compression enabled

### Auto-Renewal
- Certificates auto-renew 30 days before expiry
- systemd timer checks daily
- No manual intervention needed
- Nginx automatically reloaded after renewal

---

## Troubleshooting

### Issue: "Permission denied" when SSHing

**Check**: You're using the correct SSH key and user
```bash
# Verify you can SSH to VPS
ssh deploy-user@YOUR_VPS_IP whoami
# Should return: deploy-user
```

### Issue: "Command not found: scp"

**Check**: scp is installed on your local machine
```bash
# On your local machine
which scp
# Should return a path
```

### Issue: "sudo: password required"

**Solution**: Either
- Enter password when prompted, or
- Setup passwordless sudo (ask VPS provider)

### Issue: Let's Encrypt certificate fails

**Common causes**:
- DNS not propagated yet (wait 5-30 minutes)
- Port 80 not open (firewall blocking)
- DNS records not set correctly

**Fix**:
```bash
# Check DNS from VPS
dig 9gg.app
# Should return your VPS IP

# Check port 80
sudo lsof -i :80
# Port 80 should be listening
```

### Issue: Nginx configuration error

**Solution**:
```bash
# SSH to VPS and check
ssh deploy-user@YOUR_VPS_IP
sudo nginx -t
# Shows what's wrong
```

---

## After SSL is Set Up

### 1. Test Domains (5 min)
```bash
# From your local machine
curl https://9gg.app
# Should return 200 OK

# Check certificate
openssl s_client -connect 9gg.app:443 2>/dev/null | grep "Issuer"
# Should show: Let's Encrypt Authority
```

### 2. Deploy Apps (10 min)
```bash
# Push any app branch
git push origin claude/my-app-branch

# GitHub Actions automatically:
# - Clones code to VPS
# - Installs dependencies
# - Builds app
# - Starts with PM2
# - Configures Nginx
```

### 3. Test App Domain (5 min)
```bash
# Test any deployed app subdomain
curl https://caption-genius.9gg.app
# Should return app response
```

### 4. Monitor (ongoing)
```bash
# On VPS - check running apps
pm2 list

# Check SSL renewal
sudo certbot certificates

# Watch auto-renewal happen monthly
sudo systemctl status certbot.timer
```

---

## File Locations

| File | Purpose |
|------|---------|
| `VPS_SSL_STANDALONE_SETUP.sh` | Main SSL setup script |
| `VERIFY_DOMAINS_STANDALONE.sh` | Verification checklist |
| `SSL_SETUP_QUICK_START.md` | One-page reference |
| `SSL_SETUP_EXECUTION_GUIDE.md` | Detailed documentation |
| `.github/workflows/setup-ssl.yml` | GitHub Actions workflow |

All files are in the repository root or `.github/workflows/` directory.

---

## Next Action

**👉 Right now, run these commands:**

```bash
# Get the scripts from repo first
# Then:

scp VPS_SSL_STANDALONE_SETUP.sh deploy-user@YOUR_VPS_IP:/home/deploy-user/
scp VERIFY_DOMAINS_STANDALONE.sh deploy-user@YOUR_VPS_IP:/home/deploy-user/
ssh deploy-user@YOUR_VPS_IP
sudo bash ~/VPS_SSL_STANDALONE_SETUP.sh
sudo bash ~/VERIFY_DOMAINS_STANDALONE.sh
exit
```

**That's your complete SSL setup.** Takes ~10 minutes.

---

## Questions?

See detailed guide: `SSL_SETUP_EXECUTION_GUIDE.md`

See quick reference: `SSL_SETUP_QUICK_START.md`

---

**You're ready. Go setup your SSL certificates! 🚀**
