# Deployment Scripts Overview - 70+ Apps on VPS

This document provides a complete overview of all deployment scripts and their usage for managing 70+ applications on a single VPS.

---

## Quick Start (TL;DR)

```bash
# 1. SSH into VPS
ssh root@YOUR_VPS_IP

# 2. One-time VPS setup (first deployment only)
sudo bash VPS_COMPLETE_SETUP.sh 9gg.app admin@9gg.app

# 3. Deploy all 70+ apps from GitHub branches
sudo bash MONOREPO_DEPLOYMENT_SETUP.sh

# 4. Verify deployment
pm2 list
curl https://app-name.9gg.app

# 5. Monitor apps
pm2 monit
```

---

## Script Descriptions

### 1. VPS_COMPLETE_SETUP.sh
**Purpose**: One-time initial VPS setup (Run once per new VPS)

**What it does:**
- Updates OS packages
- Installs Node.js 18, npm, PM2
- Installs Nginx web server
- Installs Certbot for SSL certificates
- Creates SSL wildcard certificate for *.9gg.app
- Sets up directory structure
- Creates helper command-line tools
- Configures auto-startup for all services

**When to use:**
- First time setting up a new VPS
- After complete OS reinstallation

**Usage:**
```bash
sudo bash VPS_COMPLETE_SETUP.sh [DOMAIN] [EMAIL]
# Example:
sudo bash VPS_COMPLETE_SETUP.sh 9gg.app admin@9gg.app
```

**Time required:** ~10-15 minutes

**Output:**
```
VPS Setup Complete
  - Node.js: v18.x.x
  - npm: 9.x.x
  - PM2: 5.x.x
  - Nginx: 1.x.x
  - Web Root: /var/www/9gg.app
```

---

### 2. MONOREPO_DEPLOYMENT_SETUP.sh
**Purpose**: Deploy all applications from GitHub branches

**What it does:**
1. Clones repository and fetches all branches
2. For each `claude/*` branch:
   - Detects single app or monorepo structure
   - Clones branch code
   - Installs npm dependencies
   - Builds application
   - Starts with PM2
   - Creates Nginx configuration
   - Applies SSL certificate
3. Reloads Nginx
4. Saves PM2 state for auto-restart on boot

**When to use:**
- Initial deployment of all 70+ apps
- Adding new branches/apps
- Syncing all apps to latest versions

**Usage:**
```bash
sudo bash MONOREPO_DEPLOYMENT_SETUP.sh
```

**Time required:** ~30-60 minutes (depends on 70+ apps, dependencies, build times)

**Output:**
```
Found 70 branches to deploy
→ Processing branch: caption-genius-01PcLoV...
  ├─ Single app detected: caption-genius
    Installing dependencies...
    Building application...
    ✓ caption-genius.9gg.app (port 3000)

→ Processing branch: soltil-app-01S2rj2Z...
  ...

✓ Deployed 70 applications
```

**Failed Apps Handling:**
- Script continues even if one app fails
- Shows list of failed deployments at end
- Check logs: `pm2 logs [app-name]`

---

### 3. QUICK_DEPLOY.sh
**Purpose**: Fast update without reinstalling dependencies

**What it does:**
1. Pulls latest code from GitHub
2. Runs build for each app
3. Restarts PM2 processes
4. **Skips npm install** (much faster)

**When to use:**
- Quick updates without dependency changes
- Daily/weekly updates
- After code changes on GitHub
- Cannot be used for new dependencies

**Usage:**
```bash
sudo bash QUICK_DEPLOY.sh
```

**Time required:** ~5-15 minutes

**Comparison:**
```
MONOREPO_DEPLOYMENT_SETUP.sh: ~45 minutes (includes npm install)
QUICK_DEPLOY.sh:              ~8 minutes  (skips npm install)
```

---

### 4. VPS_COMPREHENSIVE_SSL_SETUP.sh
**Purpose**: SSL certificate management and configuration

**What it does:**
- Verifies/obtains wildcard SSL certificate
- Configures Certbot for auto-renewal
- Creates Nginx SSL configuration snippets
- Sets up automatic renewal cron job
- Displays certificate information

**When to use:**
- Initial SSL setup (already done by VPS_COMPLETE_SETUP.sh)
- Renewing expired certificates
- Adding new domains
- Fixing SSL configuration issues

**Usage:**
```bash
# Verify existing certificate
sudo bash VPS_COMPREHENSIVE_SSL_SETUP.sh 9gg.app admin@9gg.app

# Renew certificate manually
sudo certbot renew --force-renewal
```

**Time required:** ~2-5 minutes

---

### 5. DIAGNOSE_APP_ERRORS.sh
**Purpose**: Troubleshoot application issues

**What it does:**
- Checks PM2 process status
- Shows app logs (last 50 lines)
- Checks for port conflicts
- Verifies Nginx configuration
- Tests domain connectivity
- Reports system resource usage

**When to use:**
- App won't start
- App crashes repeatedly
- SSL certificate errors
- Domain not accessible
- Performance issues

**Usage:**
```bash
sudo bash DIAGNOSE_APP_ERRORS.sh [app-name]
# Example:
sudo bash DIAGNOSE_APP_ERRORS.sh caption-genius
```

**Time required:** ~1-2 minutes

**Output:**
```
Diagnosing: caption-genius
  Process Status: running (PID: 12345)
  Port: 3000
  Nginx Config: valid
  Domain: caption-genius.9gg.app
  SSL: valid (expires: 2025-XX-XX)
  Memory: 245 MB
  CPU: 2.3%

Logs (last 10 lines):
  ...
```

---

### 6. VERIFY_DOMAINS_SSL.sh
**Purpose**: Verify all domains and SSL certificates

**What it does:**
- Tests HTTPS connectivity for each domain
- Verifies SSL certificate validity
- Checks DNS resolution
- Reports certificate expiration dates
- Identifies any unreachable domains

**When to use:**
- After deployment
- Before going live
- SSL troubleshooting
- Regular health checks (scheduled)

**Usage:**
```bash
sudo bash VERIFY_DOMAINS_SSL.sh
```

**Time required:** ~2-3 minutes

**Output:**
```
Verifying 70 apps...

✓ caption-genius.9gg.app - SSL valid (expires: 2025-12-15)
✓ soltil-app.9gg.app - SSL valid (expires: 2025-12-15)
...

Summary:
  Total apps: 70
  Verified: 70
  Failed: 0
  SSL expires in: 45 days
```

---

### 7. VPS_SSL_SETUP.sh (Original)
**Purpose**: Standalone SSL setup

**Status:** Legacy - use VPS_COMPREHENSIVE_SSL_SETUP.sh instead

**What it does:** Same as VPS_COMPREHENSIVE_SSL_SETUP.sh but without some advanced features

---

### 8. VPS_SSH_SETUP.sh
**Purpose**: SSH key configuration and security

**What it does:**
- Sets up SSH key authentication
- Disables password login
- Configures SSH port (optional)
- Hardens SSH configuration

**When to use:**
- Initial VPS setup (optional)
- Improving SSH security
- Setting up key-based authentication

**Usage:**
```bash
sudo bash VPS_SSH_SETUP.sh
```

---

### 9. TEST_MCP_SSH_CONNECTION.sh
**Purpose**: Test SSH connectivity to VPS

**What it does:**
- Tests SSH connection
- Verifies authentication
- Checks key-based login
- Reports connection status

**When to use:**
- Troubleshooting SSH connection issues
- Verifying SSH setup
- Before running deployment scripts remotely

**Usage:**
```bash
bash TEST_MCP_SSH_CONNECTION.sh
```

---

## Execution Flow Diagram

```
                    ┌─────────────────────────────┐
                    │   New VPS Created           │
                    └──────────────┬──────────────┘
                                   │
                    ┌──────────────▼──────────────┐
                    │  VPS_COMPLETE_SETUP.sh      │
                    │  (One-time only)            │
                    │  - Install dependencies     │
                    │  - Configure Nginx          │
                    │  - Setup SSL certificate    │
                    └──────────────┬──────────────┘
                                   │
                    ┌──────────────▼──────────────┐
                    │  MONOREPO_DEPLOYMENT_       │
                    │  SETUP.sh                   │
                    │  - Deploy all 70+ apps      │
                    │  - Setup subdomains         │
                    │  - Start PM2 processes      │
                    └──────────────┬──────────────┘
                                   │
                    ┌──────────────▼──────────────┐
                    │  Deployment Complete       │
                    └──────────────┬──────────────┘
                                   │
                ┌──────────────────┼──────────────────┐
                │                  │                  │
     ┌──────────▼─────────┐  ┌─────▼──────────┐  ┌──▼──────────────┐
     │ QUICK_DEPLOY.sh    │  │ VERIFY_DOMAINS_│  │ DIAGNOSE_APP_   │
     │ (Daily updates)    │  │ SSL.sh          │  │ ERRORS.sh       │
     │                    │  │ (Health check)  │  │ (Troubleshoot)  │
     └────────────────────┘  └─────────────────┘  └─────────────────┘
```

---

## Typical Deployment Scenario

### Scenario: Deploy 70+ apps for the first time

**Timeline:**
1. **Preparation** (15 min)
   - Set up VPS
   - Configure DNS records
   - Clone repository

2. **VPS Setup** (10-15 min)
   ```bash
   sudo bash VPS_COMPLETE_SETUP.sh 9gg.app admin@9gg.app
   ```

3. **Deploy All Apps** (45-60 min)
   ```bash
   sudo bash MONOREPO_DEPLOYMENT_SETUP.sh
   ```

4. **Verification** (5 min)
   ```bash
   sudo bash VERIFY_DOMAINS_SSL.sh
   pm2 list
   ```

**Total time:** ~80-100 minutes

---

## Typical Maintenance Scenario

### Scenario: Update code in 2 apps

**Option 1: Quick update (if no dependency changes)**
```bash
# SSH into VPS
ssh root@YOUR_VPS_IP

# Pull latest and rebuild (5 min)
sudo bash QUICK_DEPLOY.sh

# Or restart specific apps (1 min)
pm2 restart app-name-1 app-name-2
```

**Option 2: Full redeployment (if dependencies changed)**
```bash
# SSH into VPS
ssh root@YOUR_VPS_IP

# Full redeployment (45 min)
sudo bash MONOREPO_DEPLOYMENT_SETUP.sh
```

---

## Environment Variables

### For VPS_COMPLETE_SETUP.sh

```bash
DOMAIN=9gg.app                    # Main domain
EMAIL=admin@9gg.app              # Let's Encrypt email
NODE_VERSION=18                   # Node.js major version
WEB_ROOT=/var/www/9gg.app        # Web root directory
```

### For MONOREPO_DEPLOYMENT_SETUP.sh

```bash
WEB_ROOT=/var/www/9gg.app
REPO_URL=https://github.com/kingdavsol/Traffic2umarketing.git
NGINX_SITES=/etc/nginx/sites-available
TEMP_REPO=/tmp/traffic2u_deploy_$$
```

---

## Error Handling

### Common Errors and Solutions

| Error | Cause | Solution |
|-------|-------|----------|
| "nginx: command not found" | Nginx not installed | Run `VPS_COMPLETE_SETUP.sh` |
| "npm: command not found" | npm not installed | Run `VPS_COMPLETE_SETUP.sh` |
| "Failed to clone repository" | SSH key issue | Check GitHub SSH keys |
| "port already in use" | Port conflict | Check `netstat -tlnp` |
| "SSL certificate error" | Certificate expired | Run `certbot renew` |
| "Nginx test failed" | Config syntax error | Run `sudo nginx -t` |

---

## Performance Expectations

### Deployment Time by App Count

| Apps | Dependencies | Build | Total |
|------|-------------|-------|-------|
| 1-10 | 5-10 min | 2-5 min | 10-20 min |
| 10-30 | 10-20 min | 5-10 min | 20-35 min |
| 30-70 | 20-40 min | 10-20 min | 35-70 min |
| 70+ | 40-60 min | 15-30 min | 60-90 min |

### Resource Usage

| Resource | Usage | Notes |
|----------|-------|-------|
| CPU | 40-60% | During build/npm install |
| Memory | 60-80% | 70+ Node.js apps running |
| Disk | 200-400GB | npm_modules + source code |
| Network | 100-500 Mbps | During dependency downloads |

---

## Security Considerations

### Pre-Deployment

1. **VPS Firewall**
   ```bash
   sudo ufw allow 22/tcp  # SSH
   sudo ufw allow 80/tcp  # HTTP
   sudo ufw allow 443/tcp # HTTPS
   sudo ufw enable
   ```

2. **SSH Hardening**
   ```bash
   sudo bash VPS_SSH_SETUP.sh
   ```

3. **SSL Certificate**
   - Automated via Let's Encrypt
   - Auto-renewal configured
   - Wildcard covers all subdomains

### Post-Deployment

1. **Regular Updates**
   ```bash
   sudo apt-get update && sudo apt-get upgrade
   ```

2. **Monitor Logs**
   ```bash
   pm2 logs
   sudo tail -f /var/log/nginx/error.log
   ```

3. **Backup Important Data**
   ```bash
   tar -czf /backup/apps-$(date +%Y%m%d).tar.gz /var/www/9gg.app/
   ```

---

## Rollback Procedures

### If deployment fails:

```bash
# 1. Stop all PM2 processes
pm2 stop all

# 2. Check error logs
pm2 logs

# 3. Fix the issue (e.g., missing dependency)

# 4. Restart
pm2 restart all
```

### If need to revert to previous version:

```bash
# 1. Restore from backup
tar -xzf /backup/apps-20240101.tar.gz -C /

# 2. Restart apps
pm2 restart all

# 3. Verify
pm2 list
```

---

## Monitoring and Alerts

### Recommended Monitoring

```bash
# Real-time monitoring
pm2 monit

# Daily health check (cron)
0 0 * * * sudo bash VERIFY_DOMAINS_SSL.sh

# Check for failing apps (every 5 min)
*/5 * * * * pm2 list | grep "stopped\|errored" && /usr/local/bin/alert.sh
```

---

## Support Contacts

For issues or questions:

1. Check logs: `pm2 logs [app-name]`
2. Run diagnostics: `sudo bash DIAGNOSE_APP_ERRORS.sh [app-name]`
3. Review documentation: Read `COMPREHENSIVE_DEPLOYMENT_GUIDE.md`
4. Contact DevOps team with error output

---

**Last Updated:** 2024
**Maintained By:** DevOps Team
**Compatible With:** Ubuntu 20.04+, Node.js 18+, Nginx 1.18+
