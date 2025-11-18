# GitHub Secrets Setup Guide

## Overview

Your GitHub Actions workflows require 4 secrets to be configured for automatic VPS deployment.

## Required Secrets

Add these 4 secrets to your GitHub repository settings:

**Location**: GitHub Repository → Settings → Secrets and variables → Actions

### 1. VPS_HOST
**What it is**: Your VPS IP address or domain name

**Example values**:
- `192.168.1.100` (IP address)
- `vps.example.com` (Domain)
- `your-server.cloud` (Cloud provider domain)

**How to find it**: Check your VPS provider's dashboard or your VPS login confirmation email

---

### 2. VPS_USERNAME
**What it is**: SSH username to connect to your VPS

**Example values**:
- `traffic2u`
- `ubuntu` (common for Ubuntu VPS)
- `admin` (common for some providers)
- `ec2-user` (common for AWS)

**How to find it**: Check your VPS provider's documentation or login credentials

---

### 3. VPS_PASSWORD
**What it is**: SSH password for your VPS account

**Security Note**: This is stored securely as a GitHub Secret. It's never logged or displayed in workflows.

**Example**:
- Your actual VPS password (e.g., `SecurePass123!@#`)

**How to find it**: Check your VPS provider's dashboard or initial setup email

---

### 4. VPS_PORT
**What it is**: SSH port number on your VPS (yours is 2222)

**Your value**: `2222`

**Common values**:
- `22` (default SSH port)
- `2222` (non-standard, more secure)
- Other custom ports (contact your VPS provider)

**Why it matters**: SSH might run on a non-standard port for security. The workflow needs to know which port to connect on.

---

## Step-by-Step Setup

### Step 1: Go to GitHub Repository Settings
1. Navigate to your GitHub repository
2. Click **Settings** (top right)
3. In left sidebar, find **Secrets and variables**
4. Click **Actions**

### Step 2: Add Each Secret

For each secret below, click **New repository secret** and enter:

#### Secret 1: VPS_HOST
- **Name**: `VPS_HOST`
- **Value**: Your VPS IP or domain (e.g., `192.168.1.100`)
- Click **Add secret**

#### Secret 2: VPS_USERNAME
- **Name**: `VPS_USERNAME`
- **Value**: Your SSH username (e.g., `traffic2u`)
- Click **Add secret**

#### Secret 3: VPS_PASSWORD
- **Name**: `VPS_PASSWORD`
- **Value**: Your SSH password
- Click **Add secret**

#### Secret 4: VPS_PORT
- **Name**: `VPS_PORT`
- **Value**: `2222` (your custom SSH port)
- Click **Add secret**

### Step 3: Verify Secrets Added

After adding all 4 secrets, you should see:
```
VPS_HOST          **** (4 characters shown)
VPS_USERNAME      **** (4 characters shown)
VPS_PASSWORD      **** (4 characters shown)
VPS_PORT          2222 (visible because it's a number)
```

## Verification Checklist

- [ ] VPS_HOST secret added
- [ ] VPS_USERNAME secret added
- [ ] VPS_PASSWORD secret added
- [ ] VPS_PORT secret added with value `2222`
- [ ] All 4 secrets visible in repository settings
- [ ] No typos in secret names (case-sensitive)

## Testing the Connection

Once secrets are configured, you can test by:

1. Making a small code change
2. Pushing to your branch
3. Going to GitHub → Actions tab
4. Watching the workflow run
5. Check the "Deploy to VPS" step logs

**Expected output**:
```
Starting deployment...
[1/5] Pulling latest code...
[2/5] Installing dependencies...
[3/5] Building and deploying apps...
✅ Deployment successful!
```

**If it fails**, check:
- SSH connection: `Can we connect to your VPS?`
- Port: Is SSH really on port 2222?
- Credentials: Are the username and password correct?
- Network: Can the VPS connect to GitHub?

## Troubleshooting

### Error: `SSH: connect to host ... port 2222: Connection refused`

**Causes**:
- SSH is not running on port 2222 on your VPS
- VPS firewall blocking port 2222
- Incorrect VPS_HOST or VPS_PORT

**Solution**:
1. SSH to your VPS directly: `ssh -p 2222 traffic2u@your-vps-ip`
2. Verify it works from your machine first
3. Double-check VPS_PORT is `2222` in GitHub secrets

### Error: `Permission denied (publickey,password)`

**Causes**:
- Wrong password in VPS_PASSWORD
- Wrong username in VPS_USERNAME
- Password-based SSH disabled on VPS

**Solution**:
1. Test login manually: `ssh -p 2222 traffic2u@your-vps-ip`
2. Verify credentials work
3. Ensure password authentication is enabled in `/etc/ssh/sshd_config`

### Error: `Could not resolve hostname`

**Causes**:
- VPS_HOST is incorrect or DNS not resolving
- Domain doesn't exist

**Solution**:
1. Test your VPS_HOST value: `ping your-vps-ip-or-domain`
2. Make sure it resolves to an IP
3. Update VPS_HOST secret with correct value

### Workflow shows "All secrets configured" but still fails

1. Go to Actions → Last workflow run
2. Click "Deploy to VPS" step
3. Look for detailed error message
4. Common issues:
   - Secrets contain extra whitespace
   - Docker not running on VPS
   - .env file missing on VPS

## Security Best Practices

1. **Protect your secrets**: GitHub prevents accidental exposure
   - Secrets are never logged in workflow output
   - You can't view a secret after creating it (intentional)
   - If compromised, update immediately

2. **If credentials change**:
   - Update the corresponding secret in GitHub
   - Old deployments won't be affected
   - New deployments will use updated credentials

3. **Rotate passwords regularly**:
   - Change your VPS password periodically
   - Update VPS_PASSWORD secret in GitHub
   - Consider using SSH keys instead (advanced)

4. **Monitor deployments**:
   - Check GitHub Actions logs after each deployment
   - Monitor VPS logs: `docker-compose logs`
   - Set up alerts if deployment fails

## Next Steps

After configuring these 4 secrets:

1. ✅ Your GitHub Actions workflows are fully configured
2. ✅ You can push code changes and deployments happen automatically
3. ✅ Smart deployment will detect which apps changed and deploy only those

**Try it**: Push a small change to your repo and watch the workflow run in the Actions tab!

## Quick Reference

| Secret | Example | Your Value |
|--------|---------|-----------|
| VPS_HOST | `192.168.1.100` | __________ |
| VPS_USERNAME | `traffic2u` | __________ |
| VPS_PASSWORD | `SecurePass123!@#` | __________ |
| VPS_PORT | `2222` | `2222` |

---

**Need help?** Check GitHub Actions logs or review this guide again!
