# GitHub Actions Deployment Setup Guide

**For**: Hostinger VPS SSH deployment via GitHub Actions
**Works With**: Claude Code online (web browser)
**Setup Time**: 15-20 minutes

---

## WHAT THIS DOES

When you push code to any `claude/*` branch on GitHub, this workflow automatically:

1. ✅ Checks out your code
2. ✅ Extracts the app name from the branch
3. ✅ Connects to your Hostinger VPS via SSH
4. ✅ Clones/updates the code on VPS
5. ✅ Installs dependencies (`npm install`)
6. ✅ Builds the application (`npm run build`)
7. ✅ Starts the app with PM2
8. ✅ Verifies deployment was successful

**Result**: Your app is automatically deployed every time you push!

---

## PREREQUISITES

Before setting up, you need:

1. ✅ Hostinger VPS with SSH access
2. ✅ A deployment user on VPS (e.g., `deploy-user`)
3. ✅ SSH key pair for authentication
4. ✅ GitHub repository (you're here!)
5. ✅ GitHub Secrets configured (we'll do this)

---

## STEP 1: CREATE DEPLOYMENT USER ON VPS

SSH into your VPS as root:

```bash
ssh root@YOUR_VPS_IP
```

Create a deployment user:

```bash
# Create user
useradd -m -s /bin/bash deploy-user

# Add to docker group (for Docker commands)
usermod -aG docker deploy-user

# Add to sudo group
usermod -aG sudo deploy-user

# Create .ssh directory
mkdir -p /home/deploy-user/.ssh
chmod 700 /home/deploy-user/.ssh
chown -R deploy-user:deploy-user /home/deploy-user/.ssh

# Configure passwordless sudo (optional but recommended)
echo "deploy-user ALL=(ALL) NOPASSWD:ALL" | tee /etc/sudoers.d/deploy-user
```

Verify:

```bash
su - deploy-user
exit
```

---

## STEP 2: GENERATE SSH KEY FOR GITHUB ACTIONS

On your **local machine**:

```bash
# Generate SSH key
ssh-keygen -t ed25519 -f ~/.ssh/id_github_vps -N "" -C "github-actions-vps"

# Display public key
cat ~/.ssh/id_github_vps.pub
```

**Copy the output** - you'll need it in the next step.

---

## STEP 3: ADD PUBLIC KEY TO VPS

Back in your VPS terminal (as root):

```bash
# Switch to deploy-user
su - deploy-user

# Add public key
cat >> ~/.ssh/authorized_keys <<'EOF'
PASTE_YOUR_PUBLIC_KEY_HERE
EOF

# Set permissions
chmod 600 ~/.ssh/authorized_keys

# Verify
cat ~/.ssh/authorized_keys

# Exit back to root
exit
exit
```

**Example:**
```bash
cat >> ~/.ssh/authorized_keys <<'EOF'
ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIJx7vK4m2n9p0q1r2s3t4u5v6w7x8y9z0 github-actions-vps
EOF
```

---

## STEP 4: TEST SSH CONNECTION

On your **local machine**, test SSH:

```bash
ssh -i ~/.ssh/id_github_vps deploy-user@YOUR_VPS_IP "whoami"
```

**Expected output**: `deploy-user`

If it fails, check:
- VPS IP is correct
- Public key was added to authorized_keys
- File permissions are correct (`chmod 700 ~/.ssh`, `chmod 600 authorized_keys`)

---

## STEP 5: ADD GITHUB SECRETS

Now you need to add secrets to GitHub so the workflow can authenticate.

### On GitHub:

1. Go to your repository
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**

### Add these 3 secrets:

#### Secret 1: VPS_HOST
- **Name**: `VPS_HOST`
- **Value**: Your VPS IP address (e.g., `185.145.130.45`)
- Click **Add secret**

#### Secret 2: VPS_SSH_KEY
- **Name**: `VPS_SSH_KEY`
- **Value**: Contents of `~/.ssh/id_github_vps` (the **private key**, not public!)
  ```bash
  cat ~/.ssh/id_github_vps
  # Copy the ENTIRE output (-----BEGIN OPENSSH PRIVATE KEY----- ... -----END OPENSSH PRIVATE KEY-----)
  ```
- Click **Add secret**

#### Secret 3: VPS_DEPLOY_USER (Optional - already set in workflow)
- Already configured in workflow as `deploy-user`
- Only add if you used a different username

### Verify Secrets Added:

In **Settings → Secrets and variables → Actions**, you should see:
- ✓ VPS_HOST
- ✓ VPS_SSH_KEY

(Secrets show as `●●●●●●●●●●●●` for security)

---

## STEP 6: VERIFY WORKFLOW FILE EXISTS

The workflow file is here:
```
.github/workflows/deploy.yml
```

It's already committed. You can view it in GitHub or locally:

```bash
cat .github/workflows/deploy.yml
```

---

## STEP 7: TEST THE DEPLOYMENT

### Option A: Test with Existing Branch

Push to any `claude/*` branch:

```bash
git push origin claude/plan-vps-deployment-01V5CrSGmkxds4BG7ULg6tga
```

### Option B: Create Test Commit

```bash
# Make a small change
echo "# Deploy test" >> README.md

# Commit
git add README.md
git commit -m "test: trigger deployment workflow"

# Push to a claude/* branch
git push origin claude/test-deployment
```

### Watch the Deployment:

1. Go to GitHub repository
2. Click **Actions** tab
3. See your workflow running
4. Click on it to watch logs in real-time

**Expected flow:**
- ✓ Checkout code
- ✓ Extract app name
- ✓ Setup SSH
- ✓ Deploy to VPS
- ✓ Start with PM2
- ✓ Verify deployment

---

## STEP 8: VERIFY ON VPS

After workflow completes, check VPS:

```bash
# SSH to VPS
ssh -i ~/.ssh/id_github_vps deploy-user@YOUR_VPS_IP

# Check PM2 apps
pm2 list

# View app logs
pm2 logs [app-name]

# Check directory
ls /var/www/traffic2u.com/
```

You should see your deployed app there!

---

## HOW THE WORKFLOW WORKS

### Trigger
```yaml
on:
  push:
    branches:
      - claude/**  # Any branch starting with claude/
      - main
      - deploy
```

**This means:** Every push to a `claude/*` branch automatically deploys!

### Steps Executed:

1. **Extract app name** from branch
   - `claude/caption-generator-app-01xxx` → `caption-generator`

2. **Setup SSH** with secrets
   - Uses `VPS_SSH_KEY` and `VPS_HOST` from secrets

3. **Clone/update code** on VPS
   - Creates `/var/www/traffic2u.com/[app-name]/`
   - Clones repo and checks out correct branch

4. **Install dependencies**
   - Runs `npm install --production`

5. **Build app** (if build script exists)
   - Runs `npm run build`

6. **Start with PM2**
   - Starts app: `pm2 start "npm start" --name "[app-name]"`

7. **Verify** deployment worked
   - Checks PM2 status
   - Shows logs if there's an error

---

## DEPLOYING YOUR APPS

### To deploy any app:

1. **Make sure code is on the right branch** (e.g., `claude/caption-generator-app`)
2. **Push to GitHub**:
   ```bash
   git push origin claude/caption-generator-app
   ```
3. **Watch Actions tab** for deployment progress
4. **App automatically starts** on VPS with PM2
5. **Access via domain**: `[app-name].traffic2u.com` (after DNS is configured)

### Deployment happens automatically!

No manual SSH commands needed. Just push code to GitHub and it deploys.

---

## COMMON ISSUES & FIXES

### Issue: SSH connection fails
**Fix:**
```bash
# Verify secret values
# 1. VPS_HOST is correct IP
# 2. VPS_SSH_KEY is your PRIVATE key (not public)
# 3. Public key is in VPS ~/.ssh/authorized_keys
```

### Issue: App not starting
**Fix:**
- Check app has `package.json`
- Check Node.js is installed on VPS
- Check PM2 is installed: `pm2 -v` on VPS

### Issue: Deployment times out
**Fix:**
- Timeout is set to 30 minutes
- Check if network is slow
- Check if build is taking too long

### Issue: "Host key verification failed"
**Fix:** Already handled in workflow with `StrictHostKeyChecking=accept-new`

### Issue: Permission denied
**Fix:**
```bash
# Verify SSH key permissions on local machine
chmod 600 ~/.ssh/id_github_vps

# Verify on VPS
chmod 700 /home/deploy-user/.ssh
chmod 600 /home/deploy-user/.ssh/authorized_keys
```

---

## MONITORING DEPLOYMENTS

### In GitHub:

1. Go to **Actions** tab
2. See all workflow runs
3. Click on any run to see logs
4. See which steps passed/failed

### On VPS:

```bash
# List deployed apps
pm2 list

# View logs for specific app
pm2 logs [app-name]

# View real-time logs
pm2 logs [app-name] --lines 50 --follow

# Stop app
pm2 stop [app-name]

# Restart app
pm2 restart [app-name]

# Delete app
pm2 delete [app-name]
```

---

## NEXT STEPS AFTER DEPLOYMENT

Once app is deployed via GitHub Actions:

1. **Configure .env file** on VPS
   ```bash
   ssh -i ~/.ssh/id_github_vps deploy-user@YOUR_VPS_IP
   nano /var/www/traffic2u.com/[app-name]/.env
   # Add API keys, database URLs, etc.
   # Ctrl+O, Enter, Ctrl+X to save
   ```

2. **Restart app** to pick up new config
   ```bash
   pm2 restart [app-name]
   ```

3. **Setup domain** in Hostinger DNS
   - Point `[app-name].traffic2u.com` to VPS IP

4. **Configure Nginx** (if not already done)
   - Reverse proxy from domain to app port

5. **Setup SSL** (Let's Encrypt)
   ```bash
   sudo certbot certonly --nginx -d [app-name].traffic2u.com
   ```

---

## DEPLOYING ALL 70+ APPS

You can deploy all apps by pushing each branch:

```bash
# Deploy CaptionGenius
git push origin claude/ai-caption-generator-app-01Wy8LNC4ojprjMW5s8G2ing

# Deploy another app
git push origin claude/datacash-monetization-01Y5zseebXjcC5Y62bi55kXG

# Deploy another
git push origin claude/earnhub-student-01Y5zseebXjcC5Y62bi55kXG

# And so on...
```

Each push automatically triggers deployment!

---

## SECURITY BEST PRACTICES

1. **Rotate SSH keys quarterly**
   ```bash
   # Generate new key
   ssh-keygen -t ed25519 -f ~/.ssh/id_github_vps_new -N "" -C "github-actions"

   # Add public key to VPS
   # Remove old public key
   # Update GitHub secret with new private key
   ```

2. **Limit SSH access** (optional)
   ```bash
   # On VPS, restrict SSH to specific port
   # Or add firewall rules
   ```

3. **Audit GitHub Actions runs**
   - Regularly check Actions tab for unexpected deployments
   - Verify all commits are from you

4. **Never commit secrets**
   - SSH keys should NOT be in repository
   - Use GitHub Secrets for all sensitive data

---

## WORKFLOW FILE REFERENCE

The workflow file (`deploy.yml`) includes:

- **Trigger**: Pushes to `claude/**` branches
- **Jobs**: Single `deploy` job with 10+ steps
- **Timeout**: 30 minutes
- **Automatic app name extraction**: From branch name
- **Directory**: `/var/www/traffic2u.com/[app-name]`
- **Process manager**: PM2
- **Error handling**: Verification and logging
- **Artifacts**: Deployment logs for debugging

---

## SUMMARY

| Step | Action | Time |
|------|--------|------|
| 1 | Create deployment user on VPS | 5 min |
| 2 | Generate SSH key | 2 min |
| 3 | Add public key to VPS | 3 min |
| 4 | Test SSH connection | 2 min |
| 5 | Add GitHub secrets | 5 min |
| 6 | Verify workflow file exists | 1 min |
| 7 | Test deployment | 2 min |
| 8 | Verify on VPS | 2 min |
| **TOTAL** | **Setup complete** | **~25 min** |

Once set up, deploying is as simple as: **Push to GitHub → Automatic deployment!**

---

## SUPPORT

- **Workflow fails?** Check GitHub Actions logs for error message
- **App won't start?** SSH to VPS and check PM2 logs
- **SSH times out?** Verify VPS IP and network connectivity
- **Secret issues?** Double-check secret names and values

Need help? Check the workflow logs first - they usually tell you what's wrong!

---

**Status**: Ready to deploy all 70+ apps!
**Next**: Push branches to GitHub and watch them deploy automatically!
