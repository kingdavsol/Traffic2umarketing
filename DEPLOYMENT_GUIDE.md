# Deployment Guide: GitHub to VPS

## Quick Start (3 Steps)

### Step 1: On Your VPS - Generate Deploy Key

```bash
# SSH into your VPS
ssh user@your-vps-ip

# Generate SSH key for automated deployments
mkdir -p ~/.ssh
ssh-keygen -t ed25519 -f ~/.ssh/deploy_key -N ""

# Display and copy the public key
cat ~/.ssh/deploy_key.pub
```

### Step 2: Add Deploy Key to GitHub

For **each app repository** (each branch):

1. Go to GitHub: `Settings > Deploy keys > Add deploy key`
2. Paste your public key from above
3. Check "Allow write access"
4. Add the key

### Step 3: Add GitHub Secrets

For **your repository**, go to `Settings > Secrets and variables > Actions`:

Create these secrets:
- **VPS_HOST**: Your VPS IP address (e.g., `192.168.1.100`)
- **VPS_USER**: Your VPS username (e.g., `ubuntu`)
- **VPS_SSH_KEY**: Paste entire contents of `~/.ssh/deploy_key` (private key from step 1)

---

## GitHub Actions Workflow File

Create `.github/workflows/deploy.yml` in each app repository:

```yaml
name: Deploy to VPS

on:
  push:
    branches:
      - claude/*

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v3

      - name: Deploy to VPS
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.VPS_HOST }}
          username: ${{ secrets.VPS_USER }}
          key: ${{ secrets.VPS_SSH_KEY }}
          port: 22

          script: |
            # Extract app name from branch name
            BRANCH_NAME="${{ github.ref_name }}"
            APP_NAME="${BRANCH_NAME#claude/}"
            APP_NAME="${APP_NAME%-*}"

            # Navigate to app directory
            cd ~/apps/$APP_NAME || { echo "App directory not found"; exit 1; }

            # Pull latest code
            git fetch origin
            git checkout $BRANCH_NAME
            git pull origin $BRANCH_NAME

            # Install & build
            npm install
            npm run build

            # Restart with PM2
            pm2 restart $APP_NAME || pm2 start npm --name $APP_NAME -- start

            echo "✓ Deployed $APP_NAME successfully"
```

---

## VPS Setup Instructions

### 1. Install Node.js

```bash
# SSH into VPS
ssh user@your-vps-ip

# Install Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
node --version  # Should be v18+
```

### 2. Create App Directories

```bash
# Create directory structure
mkdir -p ~/apps
cd ~/apps

# Clone each repository (or create empty directories)
mkdir -p medisave skilltrade neighborcash earnhub
mkdir -p impactreceipts bizbuys skillswap datacash
mkdir -p seasonalears gigcredit

# For each app, initialize git (GitHub Actions will clone)
# Or manually clone:
# cd medisave
# git clone -b claude/medisave-healthcare-01Y5zseebXjcC5Y62bi55kXG https://github.com/yourusername/Traffic2umarketing.git .
```

### 3. Install PM2

```bash
# Install PM2 globally
sudo npm install -g pm2

# Create ecosystem config file
cat > ~/apps/ecosystem.config.js << 'EOF'
module.exports = {
  apps: [
    { name: 'medisave', script: 'npm', args: 'start', cwd: '/home/user/apps/medisave', instances: 2, exec_mode: 'cluster', env: { NODE_ENV: 'production', PORT: 3001 } },
    { name: 'skilltrade', script: 'npm', args: 'start', cwd: '/home/user/apps/skilltrade', instances: 2, exec_mode: 'cluster', env: { NODE_ENV: 'production', PORT: 3002 } },
    { name: 'neighborcash', script: 'npm', args: 'start', cwd: '/home/user/apps/neighborcash', instances: 1, exec_mode: 'cluster', env: { NODE_ENV: 'production', PORT: 3003 } },
    { name: 'earnhub', script: 'npm', args: 'start', cwd: '/home/user/apps/earnhub', instances: 1, exec_mode: 'cluster', env: { NODE_ENV: 'production', PORT: 3004 } },
    { name: 'impactreceipts', script: 'npm', args: 'start', cwd: '/home/user/apps/impactreceipts', instances: 1, exec_mode: 'cluster', env: { NODE_ENV: 'production', PORT: 3005 } },
    { name: 'bizbuys', script: 'npm', args: 'start', cwd: '/home/user/apps/bizbuys', instances: 1, exec_mode: 'cluster', env: { NODE_ENV: 'production', PORT: 3006 } },
    { name: 'skillswap', script: 'npm', args: 'start', cwd: '/home/user/apps/skillswap', instances: 1, exec_mode: 'cluster', env: { NODE_ENV: 'production', PORT: 3007 } },
    { name: 'datacash', script: 'npm', args: 'start', cwd: '/home/user/apps/datacash', instances: 1, exec_mode: 'cluster', env: { NODE_ENV: 'production', PORT: 3008 } },
    { name: 'seasonalears', script: 'npm', args: 'start', cwd: '/home/user/apps/seasonalears', instances: 1, exec_mode: 'cluster', env: { NODE_ENV: 'production', PORT: 3009 } },
    { name: 'gigcredit', script: 'npm', args: 'start', cwd: '/home/user/apps/gigcredit', instances: 1, exec_mode: 'cluster', env: { NODE_ENV: 'production', PORT: 3010 } },
  ]
};
EOF

# Start all apps
pm2 start ecosystem.config.js

# Save config and setup auto-start on reboot
pm2 save
pm2 startup
```

### 4. Install Nginx

```bash
# Install Nginx
sudo apt-get update
sudo apt-get install -y nginx

# Create Nginx config for all apps
sudo tee /etc/nginx/sites-available/apps > /dev/null << 'EOF'
upstream medisave { server localhost:3001; }
upstream skilltrade { server localhost:3002; }
upstream neighborcash { server localhost:3003; }
upstream earnhub { server localhost:3004; }
upstream impactreceipts { server localhost:3005; }
upstream bizbuys { server localhost:3006; }
upstream skillswap { server localhost:3007; }
upstream datacash { server localhost:3008; }
upstream seasonalears { server localhost:3009; }
upstream gigcredit { server localhost:3010; }

server {
    listen 80;
    server_name medisave.yourdomain.com;
    location / {
        proxy_pass http://medisave;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

server {
    listen 80;
    server_name skilltrade.yourdomain.com;
    location / {
        proxy_pass http://skilltrade;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

# Add similar blocks for other 8 apps...
EOF

# Enable config
sudo ln -s /etc/nginx/sites-available/apps /etc/nginx/sites-enabled/

# Test and start Nginx
sudo nginx -t
sudo systemctl start nginx
sudo systemctl enable nginx
```

### 5. Setup SSL with Let's Encrypt

```bash
# Install Certbot
sudo apt-get install -y certbot python3-certbot-nginx

# Get certificates for your domains
sudo certbot certonly --nginx -d medisave.yourdomain.com -d skilltrade.yourdomain.com

# Update Nginx to use HTTPS
# Edit /etc/nginx/sites-available/apps to add SSL config

# Auto-renew
sudo systemctl enable certbot.timer
```

---

## Manual Deployment (Alternative)

If you prefer manual deployments without GitHub Actions:

```bash
# SSH into VPS
ssh user@your-vps-ip

# Navigate to app
cd ~/apps/medisave

# Pull latest code
git fetch origin
git checkout claude/medisave-healthcare-01Y5zseebXjcC5Y62bi55kXG
git pull origin claude/medisave-healthcare-01Y5zseebXjcC5Y62bi55kXG

# Install & build
npm install
npm run build

# Restart
pm2 restart medisave
```

---

## Monitoring & Troubleshooting

### Check app status
```bash
pm2 status
pm2 logs medisave
pm2 logs skilltrade --lines 100
```

### Restart apps
```bash
pm2 restart medisave
pm2 restart all
pm2 stop medisave
```

### Check Nginx
```bash
sudo nginx -t
sudo systemctl status nginx
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log
```

### View git status
```bash
cd ~/apps/medisave
git status
git log --oneline -5
```

---

## Complete Workflow

After this setup:

1. **You make a code change** in your local repo
2. **Push to GitHub**: `git push origin branch-name`
3. **GitHub Actions runs** automatically
4. **Your VPS pulls and deploys** the code
5. **PM2 restarts the app**
6. **Your users see the update** within seconds

Everything is automated! No manual SSH commands needed after initial setup.

---

## Summary Checklist

- [ ] Generate deploy key on VPS
- [ ] Add deploy key to GitHub
- [ ] Add secrets to GitHub (VPS_HOST, VPS_USER, VPS_SSH_KEY)
- [ ] Create `.github/workflows/deploy.yml` in each repo
- [ ] Install Node.js on VPS
- [ ] Create app directories on VPS
- [ ] Install and configure PM2
- [ ] Install and configure Nginx
- [ ] Setup SSL with Let's Encrypt
- [ ] Test a deployment

Once complete, you have a production-ready deployment pipeline!
