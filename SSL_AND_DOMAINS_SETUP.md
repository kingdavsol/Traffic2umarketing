# SSL & Domain Configuration for 9gg.app and quicksell.monster

**Date**: November 21, 2025
**Status**: Ready for VPS implementation
**Domains**: 9gg.app (+ 68 subdomains) + quicksell.monster

---

## QUICK OVERVIEW

### What You'll Do:
1. Copy Nginx configs to VPS
2. Run SSL setup script
3. Verify everything works

### Time Required: ~10 minutes (mostly automated)

---

## DOMAIN STRUCTURE

### Main Domain: 9gg.app
```
9gg.app                         (Main domain - landing page)
caption-genius.9gg.app          (App 1)
gig-credit.9gg.app              (App 2)
snap-save.9gg.app               (App 3)
... (65 more apps as subdomains)
```

**Single wildcard SSL certificate covers**: `9gg.app` + `*.9gg.app`

### Dedicated Domain: quicksell.monster
```
quicksell.monster               (Main QuickSell app)
www.quicksell.monster           (Optional: with www)
```

**Separate SSL certificate for**: `quicksell.monster` + `www.quicksell.monster`

---

## FILES CREATED

### 1. Nginx Configurations

**`nginx/9gg.app.conf`**
- Routes all `*.9gg.app` subdomains to apps
- HTTP → HTTPS redirect
- SSL configuration
- Security headers
- Gzip compression

**`nginx/quicksell.monster.conf`**
- Routes main domain + subdomain
- Separate API endpoint routing (port 5000)
- SSL configuration
- Security headers

### 2. Setup Scripts

**`VPS_SSL_SETUP.sh`** (Main automation script)
- Installs Certbot (if needed)
- Gets SSL certificates for both domains
- Configures Nginx
- Sets up auto-renewal
- Verifies everything works

**`VERIFY_DOMAINS_SSL.sh`** (Verification script)
- Tests Nginx status
- Checks DNS resolution
- Verifies SSL certificates
- Tests HTTPS redirect
- Checks running apps
- 10-point verification checklist

---

## STEP-BY-STEP EXECUTION

### Step 1: Copy Files to VPS

On VPS, download the setup files:

```bash
# Navigate to repo
cd /path/to/Traffic2umarketing

# Copy Nginx configs
sudo mkdir -p /etc/nginx/sites-available
sudo cp nginx/9gg.app.conf /etc/nginx/sites-available/
sudo cp nginx/quicksell.monster.conf /etc/nginx/sites-available/
```

Or if files are in repo:
```bash
# Files will be auto-copied by script
```

### Step 2: Run SSL Setup Script

```bash
# SSH to VPS
ssh deploy-user@YOUR_VPS_IP

# Download and run the script
curl -O https://raw.githubusercontent.com/your-repo/VPS_SSL_SETUP.sh
bash VPS_SSL_SETUP.sh
```

**Or run from repo directory:**
```bash
cd /home/deploy-user/Traffic2umarketing
bash VPS_SSL_SETUP.sh
```

**What it does:**
1. Installs Certbot ✓
2. Copies Nginx configs ✓
3. Enables Nginx sites ✓
4. Gets SSL cert for 9gg.app (wildcard) ✓
5. Gets SSL cert for quicksell.monster ✓
6. Reloads Nginx with SSL ✓
7. Sets up auto-renewal ✓

**Expected output:**
```
[✓] Certbot installed
[✓] Nginx configs enabled
[✓] SSL certificate obtained for 9gg.app
[✓] SSL certificate obtained for quicksell.monster
[✓] Nginx reloaded
[✓] Auto-renewal configured
[✓] Verification passed
```

### Step 3: Verify Setup

```bash
# Run verification script
bash VERIFY_DOMAINS_SSL.sh
```

**This tests:**
- Nginx running ✓
- Nginx config valid ✓
- DNS resolution ✓
- HTTP → HTTPS redirect ✓
- SSL certificates valid ✓
- HTTPS responding ✓
- Apps running ✓
- Auto-renewal enabled ✓

---

## DNS REQUIREMENTS

Your DNS records should already point to VPS IP:

```
Domain/Subdomain                Type    Value           TTL
────────────────────────────────────────────────────────────────
9gg.app                         A       YOUR_VPS_IP     3600
*.9gg.app                       CNAME   9gg.app         3600
quicksell.monster               A       YOUR_VPS_IP     3600
www.quicksell.monster           CNAME   quicksell.monster 3600
```

If not configured, do it now in Hostinger DNS panel.

---

## HOW NGINX ROUTING WORKS

### For 9gg.app subdomains:

```
User visits: caption-genius.9gg.app
       ↓
Nginx receives request on :443 (HTTPS)
       ↓
Matches: *.9gg.app server block
       ↓
Extracts subdomain: caption-genius
       ↓
Proxies to: http://127.0.0.1:3000
       ↓
PM2 process "caption-genius" responds
       ↓
Response returned to user
```

**Key point**: All subdomains use same Nginx server block and route to port 3000. Each app runs on different PM2 processes listening on port 3000.

### For quicksell.monster:

```
User visits: quicksell.monster
       ↓
Nginx receives request on :443 (HTTPS)
       ↓
Matches: quicksell.monster server block
       ↓
Proxies to: http://127.0.0.1:3000 (main app)
       ↓
PM2 process "quicksell" responds
       ↓
Response returned to user

For API calls:
User visits: quicksell.monster/api/*
       ↓
Nginx routes to: http://127.0.0.1:5000
       ↓
Backend API responds
```

---

## SSL CERTIFICATES

### For 9gg.app:

```
Certificate location: /etc/letsencrypt/live/9gg.app/
Covers:
  ✓ 9gg.app
  ✓ www.9gg.app
  ✓ *.9gg.app (all subdomains)

Issued by: Let's Encrypt
Expires: 90 days from issue date
Auto-renewal: Enabled (every 60 days)
```

### For quicksell.monster:

```
Certificate location: /etc/letsencrypt/live/quicksell.monster/
Covers:
  ✓ quicksell.monster
  ✓ www.quicksell.monster

Issued by: Let's Encrypt
Expires: 90 days from issue date
Auto-renewal: Enabled (every 60 days)
```

### Existing Certificates (NO CHANGES):
- `soltil.com` - Already configured
- `coinpicker.us` - Already configured

---

## AUTO-RENEWAL

Certbot is configured to auto-renew certificates automatically:

```bash
# Check auto-renewal status
sudo systemctl status certbot.timer

# Test renewal (dry-run, won't actually renew)
sudo certbot renew --dry-run

# Manual renewal if needed
sudo certbot renew
```

Renewals happen automatically ~60 days before expiration. Nginx is automatically reloaded.

---

## SECURITY FEATURES

The Nginx configuration includes:

✓ **HSTS Header** - Forces HTTPS for 1 year
✓ **Security Headers** - Prevent XSS, clickjacking, etc.
✓ **TLS 1.2+** - No old insecure versions
✓ **Strong Ciphers** - Only HIGH grade encryption
✓ **Gzip Compression** - Faster loading
✓ **WebSocket Support** - For real-time apps

---

## TROUBLESHOOTING

### Issue: DNS not resolving

**Solution:**
```bash
# Check DNS
dig 9gg.app
nslookup 9gg.app

# If not resolving, wait 5-30 minutes for propagation
# Check Hostinger DNS panel to verify records
```

### Issue: SSL certificate error

**Solution:**
```bash
# Check certificate
certbot certificates

# If missing, run script again
bash VPS_SSL_SETUP.sh

# Manual fix
certbot certonly -d 9gg.app -d "*.9gg.app"
```

### Issue: Nginx won't start

**Solution:**
```bash
# Check error
sudo nginx -t

# Fix config if needed
sudo vi /etc/nginx/sites-available/9gg.app.conf

# Restart
sudo systemctl restart nginx
```

### Issue: Apps not responding

**Solution:**
```bash
# Check if apps are running
pm2 list

# Deploy an app
git push origin claude/my-app

# Check logs
pm2 logs [app-name]
```

### Issue: HTTP not redirecting to HTTPS

**Solution:**
```bash
# Verify Nginx config
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx

# Test redirect
curl -I http://9gg.app
# Should return 301 redirect
```

---

## VERIFICATION CHECKLIST

After running setup script, verify:

- [ ] Nginx is running: `systemctl status nginx`
- [ ] Nginx config valid: `nginx -t`
- [ ] Certificates exist: `certbot certificates`
- [ ] Domains resolve: `dig 9gg.app`
- [ ] HTTPS works: `curl https://9gg.app`
- [ ] Redirect works: `curl -I http://9gg.app`
- [ ] Apps running: `pm2 list`
- [ ] Auto-renewal enabled: `systemctl status certbot.timer`

---

## MONITORING

### Check Certificate Expiration

```bash
# See all certificates
certbot certificates

# Check specific domain
openssl x509 -enddate -noout -in /etc/letsencrypt/live/9gg.app/fullchain.pem
```

### Monitor Renewals

```bash
# Check renewal log
sudo tail -f /var/log/letsencrypt/letsencrypt.log

# Test renewal without actually renewing
sudo certbot renew --dry-run
```

### Monitor Nginx

```bash
# Check Nginx status
systemctl status nginx

# View recent logs
sudo tail -f /var/log/nginx/9gg.app-access.log
sudo tail -f /var/log/nginx/quicksell.monster-access.log
```

---

## NEXT STEPS

### 1. Run Setup Script (NOW)
```bash
bash VPS_SSL_SETUP.sh
```

### 2. Verify Setup (IMMEDIATELY AFTER)
```bash
bash VERIFY_DOMAINS_SSL.sh
```

### 3. Deploy Apps (AFTER VERIFICATION)
```bash
# On GitHub: push a branch
git push origin claude/caption-generator-app

# This triggers GitHub Actions
# Which deploys via deploy.yml workflow
```

### 4. Monitor Domains

```bash
# Check all domains accessible
for domain in 9gg.app quicksell.monster; do
    echo "Testing $domain:"
    curl -I https://$domain
done
```

---

## SUPPORT

### Common Commands

```bash
# SSL/Certificate
certbot certificates              # List all certs
certbot renew                     # Renew certs
sudo systemctl status certbot.timer  # Check auto-renewal

# Nginx
nginx -t                          # Test config
sudo systemctl reload nginx       # Reload without stopping
sudo systemctl restart nginx      # Full restart
tail -f /var/log/nginx/error.log  # View errors

# Apps
pm2 list                          # See all apps
pm2 logs [app]                    # View app logs
pm2 restart [app]                 # Restart app

# DNS
dig 9gg.app                       # Check DNS resolution
nslookup 9gg.app                  # Alternative DNS check
```

---

## TIMELINE

| Action | Time | Status |
|--------|------|--------|
| Copy Nginx configs | 1 min | ✓ |
| Run SSL script | 3-5 min | ✓ |
| Get certificates | 2-3 min | ✓ |
| Configure Nginx | 1 min | ✓ |
| Setup auto-renewal | 1 min | ✓ |
| **Total** | **~10 min** | ✅ |

After setup, all domains are live with HTTPS! ✓

---

**Ready to execute!** Run on VPS:
```bash
bash VPS_SSL_SETUP.sh
```
