#!/bin/bash

################################################################################
# QUICKSELL DEPLOYMENT TO QUICKSELL.MONSTER
# Complete setup with all fixes
# Usage: sudo bash QUICKSELL_MONSTER_DEPLOY.sh
################################################################################

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

DOMAIN="quicksell.monster"
APP_DIR="/var/www/quicksell.monster"
APP_NAME="quicksell"
APP_PORT=3000

echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}QUICKSELL DEPLOYMENT TO ${DOMAIN}${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
echo ""

# ============================================================================
# STEP 1: Stop and clean up broken processes
# ============================================================================

echo -e "${YELLOW}[1/7] Stopping broken processes...${NC}"

pm2 stop "$APP_NAME" > /dev/null 2>&1 || true
pm2 delete "$APP_NAME" > /dev/null 2>&1 || true

# Kill any lingering npm/node processes
pkill -f "npm start" > /dev/null 2>&1 || true
pkill -f "next start" > /dev/null 2>&1 || true

sleep 2

echo -e "${GREEN}✓ Processes stopped${NC}"
echo ""

# ============================================================================
# STEP 2: Clean and prepare directory
# ============================================================================

echo -e "${YELLOW}[2/7] Cleaning and preparing directory...${NC}"

cd "$APP_DIR"

# Remove problematic files
rm -rf node_modules .next .env build dist

# Clean npm cache
npm cache clean --force > /dev/null 2>&1

# Remove lock file to force fresh install
rm -f package-lock.json yarn.lock

echo -e "${GREEN}✓ Directory cleaned${NC}"
echo ""

# ============================================================================
# STEP 3: Install dependencies
# ============================================================================

echo -e "${YELLOW}[3/7] Installing dependencies...${NC}"

echo "  Installing npm packages..."
npm install --legacy-peer-deps > /tmp/quicksell_install.log 2>&1

if [ $? -ne 0 ]; then
  echo -e "${RED}✗ npm install failed${NC}"
  echo "  Error log:"
  tail -20 /tmp/quicksell_install.log | sed 's/^/    /'
  exit 1
fi

# Verify critical dependencies
if [ ! -d "node_modules/next" ]; then
  echo -e "${RED}✗ Next.js not installed${NC}"
  exit 1
fi

echo -e "${GREEN}✓ Dependencies installed${NC}"
echo ""

# ============================================================================
# STEP 4: Build application
# ============================================================================

echo -e "${YELLOW}[4/7] Building application...${NC}"

echo "  Running npm run build..."
npm run build > /tmp/quicksell_build.log 2>&1

if [ $? -ne 0 ]; then
  echo -e "${RED}✗ Build failed${NC}"
  echo "  Error log:"
  tail -30 /tmp/quicksell_build.log | sed 's/^/    /'
  exit 1
fi

# Verify build was successful
if [ ! -f "$APP_DIR/.next/BUILD_ID" ]; then
  echo -e "${RED}✗ Build incomplete - BUILD_ID missing${NC}"
  exit 1
fi

echo -e "${GREEN}✓ Application built successfully${NC}"
echo ""

# ============================================================================
# STEP 5: Configure Nginx for quicksell.monster (root domain)
# ============================================================================

echo -e "${YELLOW}[5/7] Configuring Nginx for ${DOMAIN}...${NC}"

# Create Nginx configuration
sudo tee /etc/nginx/sites-available/quicksell.monster.conf > /dev/null << 'NGINX_EOF'
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name quicksell.monster;

    # SSL Certificate
    ssl_certificate /etc/letsencrypt/live/quicksell.monster/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/quicksell.monster/privkey.pem;

    # SSL Configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5:!DSS;
    ssl_prefer_server_ciphers on;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # Security Headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;

    # Gzip Compression
    gzip on;
    gzip_vary on;
    gzip_types text/plain text/css text/xml text/javascript
               application/x-javascript application/xml+rss
               application/javascript application/json;

    # Logging
    access_log /var/log/nginx/quicksell.monster.access.log;
    error_log /var/log/nginx/quicksell.monster.error.log;

    # Reverse Proxy to Node.js app
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";

        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Health check endpoint
    location /health {
        access_log off;
        return 200 "ok\n";
        add_header Content-Type text/plain;
    }
}

# HTTP to HTTPS redirect
server {
    listen 80;
    listen [::]:80;
    server_name quicksell.monster;

    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }

    location / {
        return 301 https://$server_name$request_uri;
    }
}
NGINX_EOF

# Enable the site
sudo ln -sf /etc/nginx/sites-available/quicksell.monster.conf /etc/nginx/sites-enabled/

# Remove old incorrect config
sudo rm -f /etc/nginx/sites-enabled/quicksell.quicksell.monster.conf

# Test Nginx configuration
if ! sudo nginx -t > /dev/null 2>&1; then
  echo -e "${RED}✗ Nginx configuration has errors${NC}"
  sudo nginx -t
  exit 1
fi

# Reload Nginx
sudo systemctl reload nginx > /dev/null 2>&1 || {
  echo -e "${RED}✗ Failed to reload Nginx${NC}"
  exit 1
}

echo -e "${GREEN}✓ Nginx configured for ${DOMAIN}${NC}"
echo ""

# ============================================================================
# STEP 6: Start with PM2
# ============================================================================

echo -e "${YELLOW}[6/7] Starting application with PM2...${NC}"

cd "$APP_DIR"

# Start with PM2 - do NOT auto-restart on crash
pm2 start "npm start" \
  --name "$APP_NAME" \
  --cwd "$APP_DIR" \
  --append-log \
  --no-autorestart > /dev/null 2>&1

if [ $? -ne 0 ]; then
  echo -e "${RED}✗ Failed to start with PM2${NC}"
  exit 1
fi

# Give it a few seconds to start
sleep 3

# Check if it's still running
if ! pm2 list | grep -q "$APP_NAME.*online"; then
  echo -e "${RED}✗ App crashed after starting${NC}"
  echo "  Check logs:"
  pm2 logs "$APP_NAME" --lines 20
  exit 1
fi

echo -e "${GREEN}✓ Application started with PM2${NC}"
echo ""

# ============================================================================
# STEP 7: Verify deployment
# ============================================================================

echo -e "${YELLOW}[7/7] Verifying deployment...${NC}"

# Check PM2
pm2 list

echo ""
echo "Logs:"
pm2 logs "$APP_NAME" --lines 15

echo ""
echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}✓ QUICKSELL DEPLOYMENT COMPLETE${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
echo ""

echo "Access your app at:"
echo "  https://quicksell.monster"
echo ""

echo "Useful commands:"
echo "  View logs:      pm2 logs quicksell"
echo "  Monitor:        pm2 monit"
echo "  Restart:        pm2 restart quicksell"
echo "  Stop:           pm2 stop quicksell"
echo ""

echo "Nginx logs:"
echo "  Access: tail -f /var/log/nginx/quicksell.monster.access.log"
echo "  Errors: tail -f /var/log/nginx/quicksell.monster.error.log"
echo ""

echo "Test HTTPS:"
echo "  curl -I https://quicksell.monster"
echo ""
