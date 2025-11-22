# SSL Setup - Quick Start

## Choose Your Method

### 🟢 Method 1: GitHub Actions (Recommended)
**Best for**: Automated, hands-off, no VPS access needed

1. **Go to GitHub** → Actions tab
2. **Select**: "Setup SSL Certificates and Configure Nginx"
3. **Click**: "Run workflow" button
4. **Wait**: ~10 minutes
5. **Done!** ✅

**Benefits**:
- ✅ Fully automated
- ✅ No manual SSH needed
- ✅ Logs in GitHub
- ✅ One-click execution
- ✅ Easy retry if needed

---

### 🔵 Method 2: Manual SSH
**Best for**: Direct control, troubleshooting, offline execution

```bash
# 1. Copy scripts to VPS
scp VPS_SSL_STANDALONE_SETUP.sh deploy-user@YOUR_VPS_IP:/home/deploy-user/
scp VERIFY_DOMAINS_STANDALONE.sh deploy-user@YOUR_VPS_IP:/home/deploy-user/

# 2. SSH to VPS
ssh deploy-user@YOUR_VPS_IP

# 3. Run setup (on VPS)
sudo bash ~/VPS_SSL_STANDALONE_SETUP.sh

# 4. Verify (on VPS)
sudo bash ~/VERIFY_DOMAINS_STANDALONE.sh

# 5. Exit
exit
```

**Benefits**:
- ✅ Direct VPS access
- ✅ Real-time feedback
- ✅ Full control
- ✅ Works offline

---

## Prerequisites (Both Methods)

Before executing, verify:

1. **DNS Records** - In Hostinger DNS panel:
   ```
   9gg.app              → A Record → YOUR_VPS_IP
   *.9gg.app            → CNAME → 9gg.app
   quicksell.monster    → A Record → YOUR_VPS_IP
   www.quicksell.monster → CNAME → quicksell.monster
   ```

2. **Port 80 Open** - VPS firewall must allow:
   ```bash
   Port 80 (HTTP) - Let's Encrypt validation
   Port 443 (HTTPS) - Production traffic
   ```

3. **Nginx Installed** - Check on VPS:
   ```bash
   nginx -v
   ```

4. **VPS SSH Access** - Only for Method 2:
   ```bash
   ssh deploy-user@YOUR_VPS_IP
   ```

---

## What Gets Set Up

| Component | Details |
|-----------|---------|
| **Domain 1** | 9gg.app + *.9gg.app (wildcard) |
| **Domain 2** | quicksell.monster + www.quicksell.monster |
| **SSL Type** | Let's Encrypt (free) |
| **Duration** | 90 days (auto-renews) |
| **Nginx Config** | HTTP→HTTPS redirect + reverse proxy |
| **Routing** | All *.9gg.app → port 3000 |
| **API Routing** | quicksell.monster/api/* → port 5000 |

---

## Expected Results

After execution:

```bash
# HTTPS works for all domains
curl https://9gg.app
# → 200 OK

# HTTP redirects to HTTPS
curl -I http://9gg.app
# → 301 redirect

# Certificate is valid
openssl s_client -connect 9gg.app:443 2>/dev/null | grep "Issuer"
# → Let's Encrypt Authority

# Auto-renewal enabled
sudo systemctl status certbot.timer
# → active (running)
```

---

## Execution Timeline

| Step | Time | Notes |
|------|------|-------|
| Setup execution | 5-8 min | Certbot + Nginx config |
| Certificate generation | 1-2 min | Let's Encrypt validation |
| Verification | 1-2 min | Checklist tests |
| **Total** | **~10 min** | ✅ Ready to deploy apps |

---

## Troubleshooting Quick Links

**DNS not resolving?**
- Wait 5-30 minutes for propagation
- Check Hostinger DNS panel

**Let's Encrypt fails?**
- Verify port 80 is open
- Check DNS propagation

**Nginx errors?**
- Run: `sudo nginx -t`
- Check config syntax

**Apps not responding?**
- Deploy first: `git push origin [branch-name]`
- Check status: `pm2 list`

*See `SSL_SETUP_EXECUTION_GUIDE.md` for detailed troubleshooting*

---

## Next Steps

### After SSL is setup:

1. **Test domains** (5 min)
   ```bash
   curl https://9gg.app
   ```

2. **Deploy first app** (10 min)
   ```bash
   git push origin claude/my-app-branch
   ```

3. **Monitor deployment** (ongoing)
   ```bash
   ssh deploy-user@YOUR_VPS_IP
   pm2 list
   pm2 logs [app-name]
   ```

4. **Monitor SSL** (monthly)
   ```bash
   sudo certbot certificates
   sudo systemctl status certbot.timer
   ```

---

## Files in This Solution

- **`.github/workflows/setup-ssl.yml`** - GitHub Actions workflow
- **`VPS_SSL_STANDALONE_SETUP.sh`** - SSL setup script (no dependencies)
- **`VERIFY_DOMAINS_STANDALONE.sh`** - Verification script
- **`SSL_SETUP_EXECUTION_GUIDE.md`** - Detailed execution guide
- **`SSL_SETUP_QUICK_START.md`** - This file

---

## Ready to Execute?

### **Recommended**: Use GitHub Actions

1. Open GitHub
2. Go to Actions → "Setup SSL Certificates and Configure Nginx"
3. Click "Run workflow"
4. Watch logs
5. Done! ✅

**That's it. Everything else is automated.**

---

*For detailed troubleshooting and manual execution, see `SSL_SETUP_EXECUTION_GUIDE.md`*
