#!/bin/bash

################################################################################
# QUICKSELL DEPLOYMENT SCRIPT - COMPLETE WITH GITHUB SYNC
# Deploys quicksell application to quicksell.monster domain
# Includes GitHub source code sync, TypeScript verification, and full setup
#
# Usage: sudo bash DEPLOY_QUICKSELL.sh [--skip-github]
# Options:
#   --skip-github    Skip pulling latest code from GitHub
#   --no-build       Skip the build step
################################################################################

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration
GITHUB_REPO="kingdavsol/Traffic2umarketing"
GITHUB_BRANCH="claude/fix-typescript-github-sync-01PcLoV7ZCLcgH9wDizRyGiS"
SOURCE_DIR="/root/Traffic2umarketing"
DOMAIN="quicksell.monster"
APP_DIR="/var/www/quicksell.monster"
APP_NAME="quicksell"
APP_PORT=3000

# Parse command line arguments
SKIP_GITHUB=false
NO_BUILD=false

while [[ $# -gt 0 ]]; do
  case $1 in
    --skip-github)
      SKIP_GITHUB=true
      shift
      ;;
    --no-build)
      NO_BUILD=true
      shift
      ;;
    *)
      echo "Unknown option: $1"
      echo "Usage: sudo bash DEPLOY_QUICKSELL.sh [--skip-github] [--no-build]"
      exit 1
      ;;
  esac
done

echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}QUICKSELL DEPLOYMENT TO ${DOMAIN}${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
echo ""

# ============================================================================
# STEP 1: Update code from GitHub (if not skipped)
# ============================================================================

if [ "$SKIP_GITHUB" = false ]; then
  echo -e "${YELLOW}[1/9] Syncing code from GitHub...${NC}"

  # Check if source directory exists
  if [ ! -d "$SOURCE_DIR" ]; then
    echo "  Creating source directory and cloning repository..."
    mkdir -p "$(dirname "$SOURCE_DIR")"
    git clone --branch "$GITHUB_BRANCH" "https://github.com/$GITHUB_REPO.git" "$SOURCE_DIR"
  else
    echo "  Updating existing repository..."
    cd "$SOURCE_DIR"
    git fetch origin "$GITHUB_BRANCH"
    git reset --hard "origin/$GITHUB_BRANCH"
  fi

  echo -e "${GREEN}✓ Code synced from GitHub${NC}"
else
  echo -e "${YELLOW}[1/9] Skipping GitHub sync (using --skip-github)${NC}"
fi
echo ""

# ============================================================================
# STEP 2: Verify TypeScript compilation
# ============================================================================

echo -e "${YELLOW}[2/9] Verifying TypeScript compilation...${NC}"

cd "$SOURCE_DIR"

# Check TypeScript without building
if ! npx tsc --noEmit > /tmp/quicksell_tsc.log 2>&1; then
  echo -e "${RED}✗ TypeScript compilation errors found${NC}"
  echo "  Errors:"
  cat /tmp/quicksell_tsc.log | sed 's/^/    /'
  exit 1
fi

echo -e "${GREEN}✓ TypeScript verification passed${NC}"
echo ""

# ============================================================================
# STEP 3: Stop and clean up broken processes
# ============================================================================

echo -e "${YELLOW}[3/9] Stopping existing processes...${NC}"

pm2 stop "$APP_NAME" > /dev/null 2>&1 || true
pm2 delete "$APP_NAME" > /dev/null 2>&1 || true

# Kill any lingering npm/node processes
pkill -f "npm start" > /dev/null 2>&1 || true
pkill -f "next start" > /dev/null 2>&1 || true

sleep 2

echo -e "${GREEN}✓ Processes stopped${NC}"
echo ""

# ============================================================================
# STEP 4: Copy source code and clean directory
# ============================================================================

echo -e "${YELLOW}[4/9] Preparing deployment directory...${NC}"

# Create deployment directory if it doesn't exist
mkdir -p "$APP_DIR"

echo "  Copying source code to $APP_DIR..."
# Copy source code, excluding node_modules and .next
rsync -av --delete \
  --exclude node_modules \
  --exclude .next \
  --exclude .env \
  --exclude .git \
  --exclude dist \
  --exclude build \
  "$SOURCE_DIR/" "$APP_DIR/"

cd "$APP_DIR"

# Clean build artifacts
echo "  Cleaning build artifacts..."
rm -rf node_modules .next build dist

# Clean npm cache
npm cache clean --force > /dev/null 2>&1 || true

# Remove lock file to force fresh install
rm -f package-lock.json yarn.lock

echo -e "${GREEN}✓ Deployment directory prepared${NC}"
echo ""

# ============================================================================
# STEP 5: Create .env file (if not exists)
# ============================================================================

echo -e "${YELLOW}[5/9] Setting up environment variables...${NC}"

if [ ! -f "$APP_DIR/.env" ]; then
  echo "  Creating .env file from .env.example..."
  if [ -f "$APP_DIR/.env.example" ]; then
    cp "$APP_DIR/.env.example" "$APP_DIR/.env"

    echo -e "${YELLOW}  ⚠ .env file created. You MUST update it with actual values:${NC}"
    echo ""
    cat "$APP_DIR/.env" | sed 's/^/    /'
    echo ""
    echo -e "${YELLOW}  Required values:${NC}"
    echo "    - DATABASE_URL: PostgreSQL connection string"
    echo "    - NEXTAUTH_SECRET: Generated secret for NextAuth"
    echo "    - NEXTAUTH_URL: https://quicksell.monster"
    echo "    - RESEND_API_KEY: Email service API key"
    echo "    - OPENAI_API_KEY: OpenAI API key"
    echo "    - STRIPE_*: Stripe payment keys"
    echo ""
    echo -e "${YELLOW}  Edit .env and populate actual values:${NC}"
    echo "    nano $APP_DIR/.env"
    echo ""
    read -p "Press ENTER once you've updated .env with actual values (or Ctrl+C to abort): "
  else
    echo -e "${RED}✗ .env.example not found${NC}"
    exit 1
  fi
else
  echo "  .env file already exists - skipping creation"
fi

echo -e "${GREEN}✓ Environment variables configured${NC}"
echo ""

# ============================================================================
# STEP 6: Install dependencies
# ============================================================================

echo -e "${YELLOW}[6/9] Installing dependencies...${NC}"

echo "  Running npm install..."
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
# STEP 7: Build application (unless skipped)
# ============================================================================

if [ "$NO_BUILD" = false ]; then
  echo -e "${YELLOW}[7/9] Building application...${NC}"

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
else
  echo -e "${YELLOW}[7/9] Skipping build (using --no-build)${NC}"
fi
echo ""

# ============================================================================
# STEP 8: Configure Nginx for quicksell.monster (root domain)
# ============================================================================

echo -e "${YELLOW}[8/9] Configuring Nginx for ${DOMAIN}...${NC}"

# Create Nginx configuration
sudo tee /etc/nginx/sites-available/quicksell.monster.conf > /dev/null << 'NGINX_EOF'
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name quicksell.monster www.quicksell.monster;

    # SSL Certificate - Update paths as needed
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
    server_name quicksell.monster www.quicksell.monster;

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
# STEP 9: Start with PM2
# ============================================================================

echo -e "${YELLOW}[9/9] Starting application with PM2...${NC}"

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
# DEPLOYMENT COMPLETE
# ============================================================================

echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}✓ QUICKSELL DEPLOYMENT COMPLETE${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
echo ""

echo "Access your app at:"
echo -e "  ${GREEN}https://quicksell.monster${NC}"
echo ""

echo "Check deployment status:"
pm2 list
echo ""

echo "View application logs:"
pm2 logs "$APP_NAME" --lines 20
echo ""

echo "Useful commands:"
echo "  View logs:      pm2 logs $APP_NAME"
echo "  Monitor:        pm2 monit"
echo "  Restart:        pm2 restart $APP_NAME"
echo "  Stop:           pm2 stop $APP_NAME"
echo "  Reload code:    bash DEPLOY_QUICKSELL.sh --skip-github --no-build"
echo ""

echo "Nginx logs:"
echo "  Access: tail -f /var/log/nginx/quicksell.monster.access.log"
echo "  Errors: tail -f /var/log/nginx/quicksell.monster.error.log"
echo ""

echo "Test HTTPS:"
echo "  curl -I https://quicksell.monster"
echo ""

echo "Verify TypeScript:"
echo "  cd $APP_DIR && npx tsc --noEmit"
echo ""
