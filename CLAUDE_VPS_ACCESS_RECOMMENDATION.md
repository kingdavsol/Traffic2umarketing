# Claude Code - VPS Access Strategy & Recommendation

**Date**: November 21, 2025
**Prepared for**: Traffic2uMarketing Deployment
**Status**: Technical Recommendation Document

---

## EXECUTIVE SUMMARY

After analyzing the Traffic2uMarketing deployment requirements (70+ apps, complex infrastructure), this document provides a **clear recommendation** for how Claude Code should access the Hostinger VPS for ongoing development, deployment, and management.

### **RECOMMENDED: SSH via MCP (Model Context Protocol)**

**Why**: Direct SSH access provides the fastest, most flexible, and most cost-effective approach for Claude-assisted deployments.

---

## PART 1: COMPARISON OF APPROACHES

### Approach #1: SSH via MCP ⭐ RECOMMENDED

#### What It Is
Claude Code communicates with Hostinger VPS through an SSH MCP server, allowing direct command execution, file transfers, and real-time monitoring.

#### Architecture
```
Claude Code (Local)
        ↓
    MCP SSH Server
        ↓
    SSH Connection (encrypted)
        ↓
    Hostinger VPS (Execute commands)
```

#### Implementation

**Step 1: Install SSH MCP Server**
```bash
# On your local machine (where Claude Code runs)
npm install @modelcontextprotocol/server-ssh

# Or use pip if Python version
pip install mcp-ssh-server
```

**Step 2: Configure Claude Code MCP**

Create or edit `~/.claude/mcp.json`:
```json
{
  "mcpServers": {
    "vps-ssh": {
      "command": "npx",
      "args": ["@modelcontextprotocol/server-ssh"],
      "env": {
        "SSH_HOST": "your-vps-ip.hostinger.com",
        "SSH_PORT": "22",
        "SSH_USER": "claude-deploy",
        "SSH_PRIVATE_KEY_PATH": "/home/user/.ssh/id_claude_vps",
        "SSH_PRIVATE_KEY_PASSPHRASE": ""
      }
    }
  }
}
```

**Step 3: Generate SSH Key for Claude**
```bash
# Generate ED25519 key (more secure than RSA)
ssh-keygen -t ed25519 -f ~/.ssh/id_claude_vps -N "" -C "claude-code-vps"

# Or with passphrase (more secure but interactive)
ssh-keygen -t ed25519 -f ~/.ssh/id_claude_vps -C "claude-code-vps"
```

**Step 4: Configure VPS for SSH Access**
```bash
# On Hostinger VPS as root:

# 1. Create deployment user
useradd -m -s /bin/bash claude-deploy
usermod -aG sudo claude-deploy
usermod -aG docker claude-deploy

# 2. Setup SSH directory
mkdir -p /home/claude-deploy/.ssh
chmod 700 /home/claude-deploy/.ssh

# 3. Add public key
echo "$(cat /home/user/.ssh/id_claude_vps.pub)" >> /home/claude-deploy/.ssh/authorized_keys
chmod 600 /home/claude-deploy/.ssh/authorized_keys
chown -R claude-deploy:claude-deploy /home/claude-deploy/.ssh

# 4. Configure sudo for passwordless commands (optional but recommended)
echo "claude-deploy ALL=(ALL) NOPASSWD:ALL" | visudo -f /etc/sudoers.d/claude-deploy

# 5. Disable password login for this user (more secure)
sed -i '/^claude-deploy/s/bash/\/usr\/sbin\/nologin/' /etc/passwd
# Then re-enable bash:
usermod -s /bin/bash claude-deploy
```

**Step 5: Test Connection**
```bash
# Test from local machine
ssh -i ~/.ssh/id_claude_vps claude-deploy@your-vps-ip "whoami"
# Should output: claude-deploy

# Test from Claude Code
# In Claude, type: "Run 'whoami' on the VPS"
# Claude will use the MCP server to execute the command
```

#### Capabilities with SSH MCP
- ✅ Execute commands remotely
- ✅ View/edit files on VPS
- ✅ Monitor logs in real-time
- ✅ Check application status
- ✅ Deploy applications
- ✅ Manage databases
- ✅ Restart services
- ✅ Transfer files

#### Pros
| Aspect | Benefit |
|--------|---------|
| **Speed** | Commands execute instantly, no queue |
| **Cost** | Free (no CI/CD minutes used) |
| **Debugging** | Real-time feedback and logs |
| **Flexibility** | Can do anything directly on VPS |
| **Interactive** | Can test and iterate quickly |
| **Security** | SSH keys can be rotated, access controlled |
| **Full Control** | Direct access to all systems |

#### Cons
| Aspect | Challenge |
|--------|-----------|
| **Setup** | Requires initial SSH configuration |
| **Key Management** | Need to protect SSH private key |
| **Local Requirement** | Local MCP server must be running |
| **Network** | Depends on network connectivity |

#### Best Use Cases
- ✅ Rapid development and debugging
- ✅ Real-time monitoring and troubleshooting
- ✅ Interactive deployments with immediate feedback
- ✅ One-off commands and scripts
- ✅ Developing and testing deployment automation

#### Security Considerations
```bash
# Recommended security practices:

# 1. Use Ed25519 keys (stronger than RSA)
ssh-keygen -t ed25519 -f ~/.ssh/id_claude_vps -N "passphrase"

# 2. Use passphrase-protected keys
ssh-keygen -t ed25519 -f ~/.ssh/id_claude_vps -C "claude-code-vps"

# 3. Restrict SSH access via firewall
sudo ufw allow from 127.0.0.1 to any port 22 comment "Local SSH"

# 4. Disable root SSH login
sed -i 's/^PermitRootLogin yes/PermitRootLogin no/' /etc/ssh/sshd_config

# 5. Disable password authentication
sed -i 's/^PasswordAuthentication yes/PasswordAuthentication no/' /etc/ssh/sshd_config

# 6. Enable SSH audit logging
sed -i 's/^#LogLevel INFO/LogLevel DEBUG/' /etc/ssh/sshd_config

# 7. Rotate keys quarterly
# Add to calendar: "Rotate SSH keys for Claude VPS access"
```

---

### Approach #2: GitHub Actions (Fallback)

#### What It Is
Push code to GitHub → Automatic CI/CD pipeline runs → Deploys to VPS

#### Architecture
```
Claude Code (commits)
        ↓
    GitHub Repository
        ↓
    GitHub Actions Workflow
        ↓
    Deploy to Hostinger VPS
```

#### Implementation

**Step 1: Generate VPS SSH Key**
```bash
ssh-keygen -t ed25519 -f ~/.ssh/github_deploy_key -N "" -C "github-actions-deploy"
```

**Step 2: Add Key to GitHub Secrets**
```bash
# In GitHub repository:
# Settings → Secrets and Variables → Actions → New Repository Secret

# Create these secrets:
# VPS_DEPLOY_KEY = (contents of ~/.ssh/github_deploy_key)
# VPS_HOST = your-vps-ip.hostinger.com
# VPS_USER = deploy-user
# VPS_PORT = 22
```

**Step 3: Add Public Key to VPS**
```bash
# On VPS:
echo "$(cat ~/.ssh/github_deploy_key.pub)" >> /home/deploy-user/.ssh/authorized_keys
```

**Step 4: Create GitHub Actions Workflow**

Create `.github/workflows/deploy.yml`:
```yaml
name: Deploy to Hostinger VPS

on:
  push:
    branches:
      - claude/plan-vps-deployment-*
      - main

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3
        with:
          fetch-depth: 0

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm install

      - name: Build application
        run: npm run build

      - name: Deploy to VPS
        env:
          DEPLOY_KEY: ${{ secrets.VPS_DEPLOY_KEY }}
          DEPLOY_HOST: ${{ secrets.VPS_HOST }}
          DEPLOY_USER: ${{ secrets.VPS_USER }}
          DEPLOY_PORT: ${{ secrets.VPS_PORT }}
          APP_NAME: ${{ github.ref_name }}
        run: |
          mkdir -p ~/.ssh
          echo "$DEPLOY_KEY" > ~/.ssh/deploy_key
          chmod 600 ~/.ssh/deploy_key

          ssh -i ~/.ssh/deploy_key -p $DEPLOY_PORT $DEPLOY_USER@$DEPLOY_HOST << 'DEPLOY_SCRIPT'
          cd /var/www/traffic2u.com/${{ env.APP_NAME }}
          git pull origin ${{ github.ref }}
          npm install
          npm run build
          pm2 restart ${{ env.APP_NAME }} || pm2 start "npm start" --name "${{ env.APP_NAME }}"
          DEPLOY_SCRIPT

      - name: Verify Deployment
        run: |
          sleep 5
          curl -f http://$(echo $DEPLOY_HOST | cut -d. -f1).traffic2u.com/health || exit 1

      - name: Notify Slack (optional)
        if: always()
        uses: slackapi/slack-github-action@v1
        with:
          webhook-url: ${{ secrets.SLACK_WEBHOOK }}
          payload: |
            {
              "text": "Deployment ${{ job.status }} for ${{ github.ref_name }}"
            }
```

#### Pros
| Aspect | Benefit |
|--------|---------|
| **Automated** | Runs automatically on push |
| **Standardized** | Uses industry-standard CI/CD |
| **Audit Trail** | All builds logged in GitHub |
| **Scheduled** | Can schedule deployments |
| **Testing** | Can run tests before deploy |
| **Notifications** | Slack/email alerts |
| **Scalable** | Handles multiple branches |

#### Cons
| Aspect | Challenge |
|--------|-----------|
| **Speed** | Slower (GitHub Actions queue) |
| **Cost** | GitHub Actions minutes (but generous free tier) |
| **Debugging** | Less interactive feedback |
| **Complexity** | More setup and maintenance |
| **Latency** | GitHub Actions runners need to start |

#### Best Use Cases
- ✅ Automated, scheduled deployments
- ✅ Running tests before deployment
- ✅ Multi-environment deployments (dev/staging/prod)
- ✅ Compliance and audit trails
- ✅ Team-based workflows

---

### Approach #3: GitLab CI/CD

#### What It Is
Similar to GitHub Actions but using GitLab's native CI/CD system.

#### Why Not?
This repository uses GitHub/custom Git hosting, not GitLab. Use GitHub Actions instead if going the CI/CD route.

---

### Approach #4: Vercel/Netlify (Only for Static/Next.js)

#### What It Is
Deploy Next.js/React apps directly to Vercel/Netlify.

#### Limitations
- ❌ Only works for Next.js and static sites
- ❌ Can't deploy Node.js backends
- ❌ Can't deploy React Native apps
- ❌ Limited to their infrastructure

#### Use Case
Only for the 35+ Next.js web apps, not for mobile apps or backends.

---

### Approach #5: Docker Hub (Container Registry)

#### What It Is
Push Docker images to Docker Hub → Deploy via Docker Compose on VPS

#### Implementation
```yaml
# docker-compose.yml on VPS
version: '3.8'
services:
  caption-genius:
    image: your-org/caption-genius:latest
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://...
```

#### Pros
- ✅ Containerized deployments
- ✅ Consistent environments
- ✅ Easy rollback

#### Cons
- ❌ Slower than direct SSH
- ❌ Requires Docker image building
- ❌ Less interactive

---

## PART 2: DETAILED RECOMMENDATION

### **Use SSH via MCP as Primary, GitHub Actions as Secondary**

```
Primary Flow (90% of work):
    Claude + SSH MCP ← Direct VPS access
    Fastest development and debugging

Secondary Flow (10% of work):
    GitHub Actions ← Automated scheduled deployments
    Compliance and audit trails
```

### Setup Timeline

**Day 1: SSH Setup (30 minutes)**
1. Generate SSH key on local machine
2. Create claude-deploy user on VPS
3. Configure MCP server
4. Test connection
5. Start using for deployments

**Day 2: GitHub Actions Setup (30 minutes)** - Optional
1. Add VPS secrets to GitHub
2. Create deployment workflow
3. Test automation
4. Setup notifications

---

## PART 3: COMPLETE SETUP INSTRUCTIONS

### SSH via MCP - Complete Setup Guide

#### Prerequisites
- Local machine with Claude Code installed
- Hostinger VPS with SSH access
- SSH client installed locally

#### Step 1: Generate SSH Key

```bash
# On your local machine
cd ~/.ssh

# Generate Ed25519 key (recommended)
ssh-keygen -t ed25519 -f id_claude_vps -C "claude-code-vps-deployment"

# When prompted for passphrase:
# Option A: Leave blank (less secure but easier)
# Option B: Enter passphrase (more secure)

# Verify key was created
ls -la id_claude_vps*
# Should show: id_claude_vps (private) and id_claude_vps.pub (public)
```

#### Step 2: Configure VPS User and SSH

```bash
# SSH into your Hostinger VPS as root
ssh root@your-vps-ip

# Create deployment user
useradd -m -s /bin/bash claude-deploy

# Grant sudo access
usermod -aG sudo claude-deploy
usermod -aG docker claude-deploy

# Create .ssh directory
mkdir -p /home/claude-deploy/.ssh
chmod 700 /home/claude-deploy/.ssh
chown -R claude-deploy:claude-deploy /home/claude-deploy/.ssh

# Exit root and return to local machine
exit
```

#### Step 3: Copy Public Key to VPS

```bash
# On local machine - copy public key to VPS
ssh-copy-id -i ~/.ssh/id_claude_vps claude-deploy@your-vps-ip

# Or manually if ssh-copy-id fails:
cat ~/.ssh/id_claude_vps.pub | ssh -u claude-deploy@your-vps-ip "mkdir -p ~/.ssh && cat >> ~/.ssh/authorized_keys && chmod 600 ~/.ssh/authorized_keys"
```

#### Step 4: Configure Claude Code MCP

```bash
# On local machine, create/edit MCP config
mkdir -p ~/.claude
nano ~/.claude/mcp.json
```

Add this content:
```json
{
  "mcpServers": {
    "vps-ssh": {
      "command": "npx",
      "args": ["@modelcontextprotocol/server-ssh"],
      "env": {
        "SSH_HOST": "your-vps-ip-here.hostinger.com",
        "SSH_PORT": "22",
        "SSH_USER": "claude-deploy",
        "SSH_PRIVATE_KEY_PATH": "/home/YOUR_USERNAME/.ssh/id_claude_vps",
        "SSH_PRIVATE_KEY_PASSPHRASE": ""
      }
    }
  }
}
```

Replace:
- `your-vps-ip-here.hostinger.com` with your actual VPS IP or hostname
- `YOUR_USERNAME` with your local username

#### Step 5: Test Connection

```bash
# Test direct SSH
ssh -i ~/.ssh/id_claude_vps claude-deploy@your-vps-ip "whoami"
# Should output: claude-deploy

# Test if npm is available
ssh -i ~/.ssh/id_claude_vps claude-deploy@your-vps-ip "node --version"
```

#### Step 6: Verify Claude Can Access VPS

In Claude Code, try this:
```
Run: whoami
on the Hostinger VPS via SSH
```

Claude should respond with `claude-deploy`, confirming the connection works.

---

### GitHub Actions - Complete Setup Guide

#### Step 1: Generate GitHub Deployment Key

```bash
cd ~/.ssh
ssh-keygen -t ed25519 -f github_deploy_key -N "" -C "github-actions-traffic2u"
```

#### Step 2: Add Public Key to VPS

```bash
# On VPS as claude-deploy user
cat >> ~/.ssh/authorized_keys <<EOF
$(cat /path/to/github_deploy_key.pub)
EOF
chmod 600 ~/.ssh/authorized_keys
```

#### Step 3: Add Secrets to GitHub

In your GitHub repository:
1. Go to **Settings** → **Secrets and Variables** → **Actions**
2. Click **New repository secret**
3. Add these secrets:

| Secret Name | Value |
|-------------|-------|
| VPS_HOST | your-vps-ip.hostinger.com |
| VPS_USER | claude-deploy |
| VPS_PORT | 22 |
| VPS_DEPLOY_KEY | (contents of ~/.ssh/github_deploy_key) |

#### Step 4: Create Workflow File

Create `.github/workflows/deploy.yml`:
```yaml
name: Deploy to VPS

on:
  push:
    branches:
      - claude/plan-vps-deployment-*

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup SSH
        env:
          DEPLOY_KEY: ${{ secrets.VPS_DEPLOY_KEY }}
        run: |
          mkdir -p ~/.ssh
          echo "$DEPLOY_KEY" > ~/.ssh/deploy_key
          chmod 600 ~/.ssh/deploy_key

      - name: Deploy
        env:
          VPS_HOST: ${{ secrets.VPS_HOST }}
          VPS_USER: ${{ secrets.VPS_USER }}
          VPS_PORT: ${{ secrets.VPS_PORT }}
        run: |
          ssh -i ~/.ssh/deploy_key -p $VPS_PORT $VPS_USER@$VPS_HOST << 'EOF'
          cd /var/www
          # Add deployment commands here
          EOF
```

---

## PART 4: PRACTICAL USAGE EXAMPLES

### With SSH via MCP (Claude Code)

**Example 1: Deploy an app**
```
Claude: Deploy the CaptionGenius app from branch claude/ai-caption-generator-app to /var/www/traffic2u.com/caption-genius on the VPS

Claude will:
1. SSH to VPS
2. Clone the branch
3. Install dependencies
4. Build the app
5. Start the service
6. Verify it's running
```

**Example 2: Check app status**
```
Claude: Check the status of all running apps on the VPS

Claude will:
1. SSH to VPS
2. Run: pm2 list
3. Show you the output
4. Report which apps are running/stopped
```

**Example 3: View logs**
```
Claude: Show me the last 50 lines of the CaptionGenius app logs

Claude will:
1. SSH to VPS
2. Tail the log file
3. Display in real-time
4. Help debug issues
```

**Example 4: Restart an app**
```
Claude: Restart the dashboard app and verify it's running

Claude will:
1. SSH to VPS
2. Run: pm2 restart dashboard
3. Wait for it to start
4. Verify with health check
```

### With GitHub Actions (Automated)

**Example 1: Push to trigger deployment**
```bash
git add .
git commit -m "Update caption-genius feature"
git push origin claude/plan-vps-deployment-01V5CrSGmkxds4BG7ULg6tga

# GitHub Actions automatically:
# 1. Builds the app
# 2. Runs tests
# 3. Deploys to VPS
# 4. Sends Slack notification
```

---

## PART 5: SECURITY BEST PRACTICES

### SSH Key Security
```bash
# 1. Protect your private key
chmod 600 ~/.ssh/id_claude_vps
chmod 700 ~/.ssh

# 2. Use strong passphrases if encrypted
# Suggested format: "Traffic2u-VPS-Claude-{DDMMYYYY}"

# 3. Rotate keys quarterly
# Add reminder to your calendar

# 4. Never commit private keys to Git
# Add to .gitignore:
echo "~/.ssh/id_claude_vps" >> ~/.gitignore

# 5. Use SSH agent to avoid typing passphrases repeatedly
ssh-add ~/.ssh/id_claude_vps
```

### VPS Access Control
```bash
# 1. Disable root login
sudo sed -i 's/^PermitRootLogin yes/PermitRootLogin no/' /etc/ssh/sshd_config

# 2. Disable password authentication
sudo sed -i 's/^PasswordAuthentication yes/PasswordAuthentication no/' /etc/ssh/sshd_config

# 3. Change default SSH port (optional, adds obscurity)
# sudo sed -i 's/^#Port 22/Port 2222/' /etc/ssh/sshd_config

# 4. Restrict SSH to specific IPs (if your IP is static)
# Add to /etc/ssh/sshd_config:
# AllowUsers claude-deploy@YOUR_HOME_IP_RANGE

# 5. Enable SSH audit logging
sudo sed -i 's/^#LogLevel INFO/LogLevel DEBUG3/' /etc/ssh/sshd_config

# 6. Restart SSH service
sudo systemctl restart ssh
```

### MCP Configuration Security
```bash
# 1. Protect MCP config file
chmod 600 ~/.claude/mcp.json

# 2. Don't store plaintext passphrases
# Use empty passphrases OR use system keyring

# 3. Use SSH agent
eval $(ssh-agent -s)
ssh-add ~/.ssh/id_claude_vps

# 4. Rotate credentials quarterly
# Set calendar reminder: "Rotate VPS SSH keys"
```

---

## PART 6: TROUBLESHOOTING

### SSH Connection Issues

**Problem: "Permission denied (publickey)"**
```bash
# Solution: Check public key is on VPS
ssh -i ~/.ssh/id_claude_vps claude-deploy@your-vps-ip

# Check authorized_keys
cat ~/.ssh/authorized_keys

# If empty, re-copy:
ssh-copy-id -i ~/.ssh/id_claude_vps claude-deploy@your-vps-ip
```

**Problem: "Could not resolve hostname"**
```bash
# Solution: Check VPS IP/hostname
# Verify in Hostinger control panel
# Update MCP config with correct IP
nano ~/.claude/mcp.json
```

**Problem: "MCP server not responding"**
```bash
# Solution: Check MCP is installed
npm list -g @modelcontextprotocol/server-ssh

# Reinstall if needed
npm install -g @modelcontextprotocol/server-ssh

# Check Claude Code has restarted after config change
```

### GitHub Actions Issues

**Problem: "SSH command failed in Actions"**
```bash
# Solution: Ensure deploy key has permission
# Verify public key in ~/.ssh/authorized_keys on VPS

# Test locally first:
ssh -i ~/.ssh/github_deploy_key claude-deploy@your-vps-ip "whoami"
```

---

## FINAL RECOMMENDATION SUMMARY

| Criterion | SSH via MCP | GitHub Actions |
|-----------|-----------|-----------------|
| **Use Case** | Interactive development & debugging | Automated scheduled deploys |
| **Speed** | ⭐⭐⭐⭐⭐ Instant | ⭐⭐⭐ Slower (queue) |
| **Cost** | ⭐⭐⭐⭐⭐ Free | ⭐⭐⭐⭐ Free tier |
| **Setup Time** | ⭐⭐⭐ 30 min | ⭐⭐ 20 min |
| **Security** | ⭐⭐⭐⭐⭐ Excellent | ⭐⭐⭐⭐ Good |
| **Debugging** | ⭐⭐⭐⭐⭐ Real-time | ⭐⭐ Log-based |
| **Flexibility** | ⭐⭐⭐⭐⭐ Full control | ⭐⭐⭐ Limited |
| **Learning Curve** | ⭐⭐⭐ Medium | ⭐⭐ Low |

### **FINAL RECOMMENDATION**

**✅ Implement SSH via MCP as your primary method**

This is the fastest, most cost-effective, and most practical approach for managing 70+ apps across Hostinger VPS with Claude Code.

**🔄 Add GitHub Actions as secondary** (optional)

For automated, scheduled deployments and compliance audit trails. Use for periodic updates and testing pipelines.

**⏱️ Expected Setup Time**: 1 hour (SSH setup + initial testing)

---

**Document prepared**: November 21, 2025
**Status**: Ready for Implementation
**Next Steps**: Follow SSH via MCP setup guide in Part 3
