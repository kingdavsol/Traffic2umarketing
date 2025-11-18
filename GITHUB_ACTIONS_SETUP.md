# GitHub Actions VPS Deployment Setup

Automated deployment to VPS on every push to `main` or `claude/*` branches.

## Prerequisites

1. GitHub repository (public or private)
2. VPS with SSH access
3. Generated SSH key pair for GitHub Actions

---

## Step 1: Generate SSH Key for GitHub Actions

On your local machine or VPS:

```bash
# Generate a new SSH key pair (without passphrase)
ssh-keygen -t ed25519 -f github_actions_key -N ""

# This creates:
# - github_actions_key (private key - goes to GitHub Secrets)
# - github_actions_key.pub (public key - goes to VPS)
```

### Add public key to VPS

SSH into your VPS and add the public key:

```bash
# SSH into VPS
ssh root@your-vps-ip

# Add public key to authorized_keys for traffic2u user
mkdir -p /home/traffic2u/.ssh
echo "$(cat github_actions_key.pub)" >> /home/traffic2u/.ssh/authorized_keys
chmod 600 /home/traffic2u/.ssh/authorized_keys
chown traffic2u:traffic2u /home/traffic2u/.ssh/authorized_keys

# Verify by testing SSH without password
exit

# From your local machine, test the key
ssh -i github_actions_key traffic2u@your-vps-ip "echo 'SSH works!'"
```

---

## Step 2: Configure GitHub Secrets

Go to your GitHub repository:
1. Click **Settings** → **Secrets and variables** → **Actions**
2. Click **New repository secret**

### Add these secrets (one by one):

#### 1. `VPS_HOST`
- **Value**: Your VPS IP address or hostname
- **Example**: `192.168.1.100` or `vps.example.com`

#### 2. `VPS_USER`
- **Value**: SSH user for GitHub Actions
- **Example**: `traffic2u`

#### 3. `VPS_SSH_KEY`
- **Value**: Private SSH key content
- **How to get**:
  ```bash
  cat github_actions_key
  # Copy the entire output (including BEGIN and END lines)
  ```

#### 4. `DATABASE_URL`
- **Value**: PostgreSQL connection string
- **Format**: `postgresql://user:password@localhost:5432/traffic2u`
- **Example**:
  ```
  postgresql://traffic2u_user:YourStrongPassword123@localhost:5432/traffic2u
  ```

#### 5. `RESEND_API_KEY`
- **Value**: Your Resend API key
- **Format**: `re_xxxxxxxxxxxxxxxxxxxx`
- **Get from**: https://resend.com/api-keys

#### 6. `JWT_SECRET`
- **Value**: Random 32+ character string
- **Generate**:
  ```bash
  openssl rand -base64 32
  ```

#### 7. `ENCRYPTION_KEY`
- **Value**: Random 32+ character string
- **Generate**:
  ```bash
  openssl rand -base64 32
  ```

#### 8. `SLACK_WEBHOOK_URL` (Optional)
- **Value**: Slack webhook for notifications
- **Get from**: https://api.slack.com/apps

---

## Step 3: Verify Secrets Setup

In GitHub repository settings, you should see all 7-8 secrets listed.

---

## How It Works

### Trigger

The workflow automatically runs when you:
1. Push to `main` branch
2. Push to any `claude/*` branch
3. Manually trigger via GitHub Actions UI

### Workflow Steps

```
1. Checkout code from GitHub
2. Set up SSH connection to VPS
3. Extract branch name
4. SSH into VPS and:
   - Create .env file with secrets
   - Pull latest code from branch
   - Install dependencies
   - Build Docker images
   - Stop old containers
   - Start new containers
   - Wait for services to be healthy
   - Run database migrations
5. Verify deployment
6. Send Slack notification (if configured)
```

### Expected Execution Time
- **Total**: 15-25 minutes
- Setup SSH: <1 minute
- Pull code: <1 minute
- Install deps: 2-3 minutes
- Build images: 10-15 minutes
- Deploy: 2-3 minutes
- Migrations: <1 minute

---

## Manual Trigger

To manually trigger deployment:

1. Go to your GitHub repository
2. Click **Actions** tab
3. Click **Deploy to VPS** workflow
4. Click **Run workflow** button
5. Select branch to deploy (optional)
6. Click **Run workflow**

---

## Monitoring Deployments

### In GitHub Actions

1. Go to repository **Actions** tab
2. Click on the workflow run
3. Expand **Deploy to VPS** job
4. View real-time logs

### On VPS

While deployment is running:

```bash
# SSH into VPS
ssh traffic2u@your-vps-ip

# Watch Docker build
docker-compose build --no-cache

# View running containers
docker-compose ps

# View logs
docker-compose logs -f
```

---

## Troubleshooting

### SSH Connection Failed

**Error**: `Permission denied (publickey)`

**Solution**:
```bash
# Verify public key is on VPS
ssh traffic2u@your-vps-ip "cat ~/.ssh/authorized_keys | grep -c ssh-ed25519"

# Should return: 1

# If not found, add it again
cat github_actions_key.pub | ssh traffic2u@your-vps-ip "cat >> ~/.ssh/authorized_keys"
```

### Docker Build Fails

**Error**: `docker-compose build failed`

**Solution**:
1. Check logs in GitHub Actions
2. SSH into VPS and manually check:
   ```bash
   cd /home/traffic2u
   docker-compose build --no-cache
   ```
3. Look for specific errors (missing deps, syntax errors, etc.)

### Database Migrations Fail

**Error**: `npm run db:push failed`

**Solution**:
1. Check database connectivity:
   ```bash
   docker exec traffic2u_postgres psql -U traffic2u_user -d traffic2u -c "SELECT 1;"
   ```
2. Verify DATABASE_URL secret is correct
3. Check Prisma schema is valid:
   ```bash
   npx prisma validate
   ```

### Services Not Starting

**Error**: `docker-compose up failed`

**Solution**:
1. Check Docker images built successfully:
   ```bash
   docker images | grep traffic2u
   ```
2. View startup logs:
   ```bash
   docker-compose logs
   ```
3. Check environment variables:
   ```bash
   docker exec pet-insurance env | grep -E "DATABASE|RESEND"
   ```

---

## Security Best Practices

### Secrets Safety

1. **Never** commit `.env` file to GitHub
2. **Never** log secrets in workflow output
3. Use GitHub-managed secrets, not hardcoded values
4. Rotate secrets periodically (every 90 days recommended)

### SSH Key Safety

1. Use dedicated SSH key for GitHub Actions (don't use your personal key)
2. Restrict permissions on VPS:
   ```bash
   chmod 600 ~/.ssh/authorized_keys
   chmod 700 ~/.ssh
   ```
3. Consider IP-restricting the SSH key if possible
4. Regularly audit who has SSH access:
   ```bash
   cat ~/.ssh/authorized_keys
   ```

### Deployment Safety

1. Test on `development` branch first
2. Always review code before merging to `main`
3. Monitor deployment logs for errors
4. Check application logs after deployment:
   ```bash
   docker-compose logs -f --tail=50
   ```

---

## Advanced Configuration

### Deploy Only on Pull Request Approval

Modify `.github/workflows/deploy-to-vps.yml`:

```yaml
on:
  pull_request:
    types: [closed]

jobs:
  deploy:
    if: github.event.pull_request.merged == true
```

### Deploy Only on Tag Push

```yaml
on:
  push:
    tags:
      - 'v*'
```

### Skip Deployment for Certain Commits

In commit message, include `[skip ci]`:

```bash
git commit -m "Minor doc update [skip ci]"
```

### Run Tests Before Deploy

Add step to `.github/workflows/deploy-to-vps.yml`:

```yaml
- name: Run tests
  run: npm run test

- name: Run linting
  run: npm run lint
```

---

## Deployment Branches

### Recommended Strategy

| Branch | Purpose | Auto-Deploy |
|--------|---------|------------|
| `main` | Production | ✅ Yes |
| `claude/*` | Feature branches | ✅ Yes |
| `development` | Development | ❌ No (manual) |
| `staging` | Pre-prod | ❌ No (manual) |

To disable auto-deploy on certain branches:

```yaml
if: github.ref == 'refs/heads/main' || startsWith(github.ref, 'refs/heads/claude/')
```

---

## Slack Notifications

### Set Up Slack Webhook

1. Go to your Slack workspace settings
2. Create incoming webhook: https://api.slack.com/apps
3. Copy webhook URL
4. Add as `SLACK_WEBHOOK_URL` secret in GitHub

### Notification Format

When deployment completes, you'll get a Slack message:

```
Deployment successful ✅
Branch: refs/heads/main
Commit: abc123def456
Author: your-github-username
```

---

## Quick Reference

### View Workflow File
```
.github/workflows/deploy-to-vps.yml
```

### Trigger Deployment
```
Push to main or claude/* branch
OR
Manually in GitHub Actions UI
```

### Monitor Progress
```
GitHub Actions → Workflow Runs → Latest Run
```

### SSH into VPS During Deployment
```bash
ssh traffic2u@your-vps-ip
docker-compose logs -f
```

### View Past Deployments
```
GitHub Actions → Deploy to VPS → All Runs
```

---

## Summary

You now have:
✅ Automated deployments on every push
✅ Secure secret management
✅ One-click manual deployments
✅ Slack notifications
✅ Full deployment history in GitHub

All 10 sites will automatically update whenever you push code!

---

**Setup Date**: November 2025
**Status**: Ready for Production
**Trigger**: Any push to main or claude/* branches
