# Standalone SSL Setup for 9gg.app and quicksell.monster

**Status**: Completely self-contained, no repo files needed
**Files**: 2 standalone scripts ready to run on VPS
**Time**: ~12 minutes total

---

## WHAT YOU HAVE

Two completely standalone bash scripts:

1. **`VPS_SSL_STANDALONE_SETUP.sh`** (10 minutes)
   - Installs Certbot
   - Creates all Nginx configs (embedded in script)
   - Gets SSL certificates for both domains
   - Configures Nginx
   - Sets up auto-renewal

2. **`VERIFY_DOMAINS_STANDALONE.sh`** (2 minutes)
   - 10-point verification checklist
   - Tests all domains and SSL
   - Confirms everything works

---

## HOW TO USE

### Step 1: Download Script to VPS

```bash
# Option A: Copy from repo
scp VPS_SSL_STANDALONE_SETUP.sh deploy-user@YOUR_VPS_IP:/home/deploy-user/

# Option B: Manually paste the script
# SSH to VPS and create the file with editor
ssh deploy-user@YOUR_VPS_IP
nano VPS_SSL_STANDALONE_SETUP.sh
# Paste entire script content, save and exit
```

### Step 2: Run Script as Root

```bash
# SSH to VPS
ssh deploy-user@YOUR_VPS_IP

# Run as root (you'll be prompted for sudo password)
sudo bash VPS_SSL_STANDALONE_SETUP.sh

# Or if you have passwordless sudo:
bash VPS_SSL_STANDALONE_SETUP.sh
```

**That's it!** The script does everything:
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

### Step 3: Verify Setup

```bash
# Still on VPS, run verification script
sudo bash VERIFY_DOMAINS_STANDALONE.sh
```

This tests:
- ✓ Nginx running
- ✓ Nginx config valid
- ✓ DNS resolving
- ✓ SSL certificates valid
- ✓ HTTPS redirect working
- ✓ Auto-renewal enabled

---

## WHAT GETS CREATED ON VPS

### Nginx Configs
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

### Certbot Auto-Renewal
```
systemd timer: certbot.timer (automatically enabled)
Renewal cron: runs daily, renews 30 days before expiry
```

---

## PREREQUISITES

Before running the script, verify:

1. **Nginx installed**
   ```bash
   nginx -v
   ```
   If not installed, the script will error. Install manually:
   ```bash
   sudo apt install nginx
   ```

2. **DNS configured**
   In Hostinger DNS panel, verify:
   - A Record: 9gg.app → YOUR_VPS_IP
   - CNAME: *.9gg.app → 9gg.app
   - A Record: quicksell.monster → YOUR_VPS_IP
   - CNAME: www.quicksell.monster → quicksell.monster

3. **Port 80 open**
   Let's Encrypt needs HTTP (port 80) for validation

---

## DOMAIN STRUCTURE AFTER SETUP

### 9gg.app (Master Domain)

All traffic to `*.9gg.app` routes to:
- Port 3000 (where apps listen via PM2)

```
User → https://caption-genius.9gg.app
       ↓
Nginx (port 443, HTTPS, SSL decryption)
       ↓
Proxy to http://127.0.0.1:3000
       ↓
PM2 process "caption-genius"
       ↓
Response to user
```

### quicksell.monster (Dedicated Domain)

Main domain and API routing:
```
https://quicksell.monster → http://127.0.0.1:3000 (frontend)
https://quicksell.monster/api/* → http://127.0.0.1:5000 (backend)
```

---

## SECURITY FEATURES

✓ **TLS 1.2 + 1.3** - No old versions
✓ **Strong ciphers** - HIGH encryption only
✓ **HSTS** - Force HTTPS for 1 year
✓ **Security headers** - Prevent XSS, clickjacking
✓ **HTTP → HTTPS redirect** - All traffic encrypted
✓ **Auto-renewal** - Certificates stay valid forever

---

## MONITORING & MAINTENANCE

### Check Certificate Status
```bash
sudo certbot certificates
```

### Check Auto-Renewal
```bash
sudo systemctl status certbot.timer
```

### Manual Renewal (if needed)
```bash
sudo certbot renew
```

### View Nginx Logs
```bash
tail -f /var/log/nginx/9gg.app-access.log
tail -f /var/log/nginx/quicksell.monster-access.log
```

### Check Apps Running
```bash
pm2 list
pm2 logs [app-name]
```

---

## TROUBLESHOOTING

### Issue: "Cannot get DNS"

**Problem**: Script can't resolve domains
**Cause**: DNS not propagated yet
**Solution**: Wait 5-30 minutes and retry

```bash
# Check DNS
dig 9gg.app
nslookup quicksell.monster
```

### Issue: "Connection refused"

**Problem**: HTTPS not responding
**Cause**: Apps not deployed yet
**Solution**: Deploy an app first

```bash
# Deploy from GitHub
git push origin claude/caption-generator-app

# Check if running
pm2 list
```

### Issue: "Certificate validation error"

**Problem**: Let's Encrypt can't validate
**Cause**: DNS not properly configured
**Solution**: Check DNS records in Hostinger panel

```
A Record: 9gg.app → YOUR_VPS_IP
CNAME: *.9gg.app → 9gg.app
```

### Issue: Nginx won't start

**Problem**: "Address already in use"
**Solution**: Check what's using port 80/443

```bash
sudo lsof -i :80
sudo lsof -i :443

# Kill any conflicting processes if needed
sudo kill -9 [PID]

# Restart Nginx
sudo systemctl restart nginx
```

---

## MANUAL STEPS (If Script Fails)

If the script fails for any reason, you can run the steps manually:

### 1. Install Certbot
```bash
sudo apt update
sudo apt install certbot python3-certbot-nginx
```

### 2. Create Certbot Directory
```bash
sudo mkdir -p /var/www/certbot/.well-known/acme-challenge
sudo chmod -R 755 /var/www/certbot
```

### 3. Get Certificate for 9gg.app
```bash
sudo certbot certonly \
  --webroot \
  -w /var/www/certbot \
  -d 9gg.app \
  -d "*.9gg.app" \
  --agree-tos \
  --email admin@9gg.app
```

### 4. Get Certificate for quicksell.monster
```bash
sudo certbot certonly \
  --webroot \
  -w /var/www/certbot \
  -d quicksell.monster \
  -d www.quicksell.monster \
  --agree-tos \
  --email admin@9gg.app
```

### 5. Verify Certificates
```bash
sudo certbot certificates
```

### 6. Enable Auto-Renewal
```bash
sudo systemctl enable certbot.timer
sudo systemctl start certbot.timer
```

---

## QUICK REFERENCE

```bash
# Run setup
sudo bash VPS_SSL_STANDALONE_SETUP.sh

# Verify setup
sudo bash VERIFY_DOMAINS_STANDALONE.sh

# Check certificates
sudo certbot certificates

# Check Nginx status
sudo systemctl status nginx

# Reload Nginx
sudo systemctl reload nginx

# View logs
tail -f /var/log/nginx/9gg.app-access.log

# Check auto-renewal
sudo systemctl status certbot.timer

# Renew certificates manually
sudo certbot renew
```

---

## WHAT HAPPENS NEXT

After the SSL setup is complete:

1. **All domains are live with HTTPS** ✓
2. **HTTP automatically redirects to HTTPS** ✓
3. **SSL certificates auto-renew before expiry** ✓
4. **Ready for app deployment** ✓

### Deploy apps by pushing branches:
```bash
git push origin claude/caption-generator-app
git push origin claude/datacash-monetization
git push origin claude/earnhub-student
# ... etc
```

Each push triggers GitHub Actions which deploys the app to VPS!

---

## SUCCESS

You'll know it's working when:

```bash
# 1. Test main domain
curl https://9gg.app
# Returns: 200 OK (or app landing page)

# 2. Test subdomain
curl https://caption-genius.9gg.app
# Returns: 200 OK (if app is deployed)

# 3. Check certificate
openssl s_client -connect 9gg.app:443 2>/dev/null | grep "Issuer"
# Shows: Let's Encrypt Authority

# 4. Check expiry
openssl s_client -connect 9gg.app:443 2>/dev/null | grep "Expiration"
# Shows: expiration date 90 days from now
```

---

**Everything is self-contained. No repo files needed on VPS!**

Just run the script and you're done. 🚀
