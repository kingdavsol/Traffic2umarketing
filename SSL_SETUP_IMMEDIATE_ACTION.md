# SSL Setup - Immediate Action

**Status**: Ready to execute now
**Time Required**: ~10 minutes
**Complexity**: Simple (SSH + 3 commands)

---

## ⚡ Two Options

### 🟢 Option 1: Direct SSH to VPS (Simplest - Do This Now)

SSH directly to your VPS and clone the scripts from GitHub:

```bash
# SSH to VPS
ssh deploy-user@YOUR_VPS_IP

# Clone the repo (or just get the scripts)
git clone https://github.com/kingdavsol/Traffic2umarketing.git
cd Traffic2umarketing

# Run SSL setup
sudo bash VPS_SSL_STANDALONE_SETUP.sh

# Verify
sudo bash VERIFY_DOMAINS_STANDALONE.sh

# Exit
exit
```

**That's it. Done in ~10 minutes.**

---

### 🔵 Option 2: GitHub Actions (Coming Soon)

Once the feature branch merges to main:
1. Go to GitHub Actions
2. Click "Setup SSL Certificates and Configure Nginx"
3. Click "Run workflow"
4. Wait ~10 minutes

**Same result, different method. Use GitHub Actions for future setups.**

---

## Prerequisites

Before executing, ensure:

1. **SSH access to VPS**
   ```bash
   ssh deploy-user@YOUR_VPS_IP whoami
   # Should return: deploy-user
   ```

2. **Sudo access on VPS** (passwordless or know password)

3. **DNS records configured** in Hostinger DNS panel:
   ```
   9gg.app              →  A Record  → YOUR_VPS_IP
   *.9gg.app            →  CNAME     → 9gg.app
   quicksell.monster    →  A Record  → YOUR_VPS_IP
   www.quicksell.monster → CNAME     → quicksell.monster
   ```

4. **Ports 80 & 443 open** on VPS firewall
   ```bash
   # On VPS - check if ports are accessible
   sudo lsof -i :80
   sudo lsof -i :443
   ```

5. **Git installed on VPS** (to clone repo)
   ```bash
   # On VPS
   git --version
   ```

---

## Execute Now

### Step 1: Connect to VPS

```bash
ssh deploy-user@YOUR_VPS_IP
```

### Step 2: Get the Scripts from GitHub

```bash
# You have two options:

# Option A: Clone entire repo
git clone https://github.com/kingdavsol/Traffic2umarketing.git
cd Traffic2umarketing

# Option B: Just download the two scripts directly
curl -O https://raw.githubusercontent.com/kingdavsol/Traffic2umarketing/claude/plan-vps-deployment-01V5CrSGmkxds4BG7ULg6tga/VPS_SSL_STANDALONE_SETUP.sh
curl -O https://raw.githubusercontent.com/kingdavsol/Traffic2umarketing/claude/plan-vps-deployment-01V5CrSGmkxds4BG7ULg6tga/VERIFY_DOMAINS_STANDALONE.sh
```

### Step 3: Run SSL Setup

```bash
sudo bash VPS_SSL_STANDALONE_SETUP.sh
```

Monitor the output - should take 5-8 minutes. You'll see:

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

### Step 4: Verify Setup

```bash
sudo bash VERIFY_DOMAINS_STANDALONE.sh
```

Should show all 10 checks passing:
- ✓ Nginx running
- ✓ Nginx config valid
- ✓ DNS resolving
- ✓ HTTP → HTTPS redirect
- ✓ SSL certificates valid
- ✓ HTTPS connectivity
- ✓ Apps running (PM2)
- ✓ App directories exist
- ✓ Subdomains responsive
- ✓ Auto-renewal enabled

### Step 5: Exit VPS

```bash
exit
```

---

## ✅ Done!

Your domains are now:
- ✅ Live with HTTPS
- ✅ HTTP redirects to HTTPS automatically
- ✅ SSL certificates auto-renewing before expiry
- ✅ Ready for app deployment

---

## What Gets Installed

### 9gg.app
- Main domain: `9gg.app`
- Subdomains: `*.9gg.app` (all 68 apps)
- All traffic routes to port 3000
- Single wildcard SSL certificate covers all

### quicksell.monster
- Main domain: `quicksell.monster` + `www.quicksell.monster`
- Frontend: port 3000
- API: `/api/*` routes to port 5000
- Separate SSL certificate

### Security
- ✅ HTTPS enforced (HTTP redirects)
- ✅ TLS 1.2/1.3 only
- ✅ Strong ciphers
- ✅ Security headers (XSS, clickjacking protection)
- ✅ HSTS enabled
- ✅ Gzip compression

### Auto-Renewal
- Certificates auto-renew 30 days before expiry
- systemd timer runs daily check
- Nginx automatically reloaded after renewal
- No manual intervention needed

---

## Troubleshooting

### Issue: "Permission denied (publickey)" when SSHing

**Check**: You're using the correct SSH key and user
```bash
# Verify SSH works
ssh deploy-user@YOUR_VPS_IP whoami
# Should return: deploy-user
```

### Issue: "git: command not found"

**Solution**: Install git on VPS first
```bash
# On VPS
sudo apt update
sudo apt install git -y
```

### Issue: "sudo: password required" during script

**Solution**: Either
- Enter password when prompted, or
- Configure passwordless sudo (contact VPS provider)

### Issue: Let's Encrypt certificate fails

**Common causes**:
- DNS not propagated (wait 5-30 minutes)
- Port 80 not open (firewall issue)
- DNS records not correct

**Check**:
```bash
# On VPS - test DNS
dig 9gg.app
# Should return your VPS IP

# Check port 80
sudo lsof -i :80
# Should show something listening
```

### Issue: Nginx configuration error

**Solution**:
```bash
# On VPS
sudo nginx -t
# Shows exact error
```

---

## After SSL Setup

### 1. Test Domains
```bash
# From anywhere
curl https://9gg.app
# Should return 200 OK

# Check certificate
openssl s_client -connect 9gg.app:443 2>/dev/null | grep "Issuer"
# Should show: Let's Encrypt
```

### 2. Deploy Apps
```bash
# Push any app branch to trigger GitHub Actions
git push origin claude/my-app-branch

# GitHub Actions:
# - Clones code
# - Builds app
# - Starts with PM2
# - Configures Nginx
```

### 3. Monitor Apps
```bash
# On VPS
pm2 list           # See running apps
pm2 logs [app]     # View app logs
pm2 restart [app]  # Restart if needed
```

### 4. Monitor SSL
```bash
# On VPS - check certificate status
sudo certbot certificates

# Check auto-renewal
sudo systemctl status certbot.timer

# Watch renewal logs
sudo tail -f /var/log/letsencrypt/letsencrypt.log
```

---

## Files in Solution

| File | Location | Purpose |
|------|----------|---------|
| `VPS_SSL_STANDALONE_SETUP.sh` | Repository root | Main SSL setup script |
| `VERIFY_DOMAINS_STANDALONE.sh` | Repository root | Verification checklist |
| `SSL_SETUP_QUICK_START.md` | Repository root | One-page reference |
| `SSL_SETUP_EXECUTION_GUIDE.md` | Repository root | Detailed guide |
| `.github/workflows/setup-ssl.yml` | `.github/workflows/` | GitHub Actions workflow |

---

## Next Action

**Right now:**

```bash
ssh deploy-user@YOUR_VPS_IP
git clone https://github.com/kingdavsol/Traffic2umarketing.git
cd Traffic2umarketing
sudo bash VPS_SSL_STANDALONE_SETUP.sh
sudo bash VERIFY_DOMAINS_STANDALONE.sh
exit
```

**Takes ~10 minutes. Then your domains are live with HTTPS.** 🚀

---

## GitHub Actions Alternative (After Merge)

Once you merge this branch to main:

1. Go to GitHub Actions tab
2. Select "Setup SSL Certificates and Configure Nginx"
3. Click "Run workflow"
4. Same result in ~10 minutes

This gives you a one-click option for future setups, but **use SSH method now for immediate execution**.

---

**Status: Ready to execute. All scripts in repository. No local machine needed.**
