#!/bin/bash

################################################################################
# MONOREPO-AWARE VPS DEPLOYMENT SETUP
# Deploys all apps from monorepo branches to VPS with automatic subdomain routing
# Handles: Single apps, monorepos with multiple apps in subdirectories
# Usage: sudo bash MONOREPO_DEPLOYMENT_SETUP.sh
################################################################################

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

WEB_ROOT="/var/www/9gg.app"
REPO_URL="https://github.com/kingdavsol/Traffic2umarketing.git"
NGINX_SITES="/etc/nginx/sites-available"
NGINX_ENABLED="/etc/nginx/sites-enabled"
TEMP_REPO="/tmp/traffic2u_deploy_$$"
TEMP_BRANCH="/tmp/traffic2u_branch_$$"

echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}MONOREPO-AWARE DEPLOYMENT SETUP - ALL APPS${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
echo ""

# ============================================================================
# STEP 1: Install Dependencies
# ============================================================================

echo -e "${YELLOW}[1/6] Installing system dependencies...${NC}"

apt-get update -qq 2>/dev/null || true
apt-get install -y git curl wget nodejs npm nginx certbot python3-certbot-nginx > /dev/null 2>&1 || true
npm install -g pm2 > /dev/null 2>&1 || true

echo -e "${GREEN}✓ Dependencies installed${NC}"
echo ""

# ============================================================================
# STEP 2: Create Web Root Directory
# ============================================================================

echo -e "${YELLOW}[2/6] Setting up web root directory...${NC}"

mkdir -p "$WEB_ROOT"
chmod 755 "$WEB_ROOT"

echo -e "${GREEN}✓ Web root created: $WEB_ROOT${NC}"
echo ""

# ============================================================================
# STEP 3: Clone Repository and Get Branches
# ============================================================================

echo -e "${YELLOW}[3/6] Cloning repository and fetching branches...${NC}"

rm -rf "$TEMP_REPO"
git clone --quiet "$REPO_URL" "$TEMP_REPO" 2>/dev/null
cd "$TEMP_REPO"
git fetch --quiet --all 2>/dev/null

# Get all claude/* branches (excluding deployment branch) - keep origin/ prefix for git clone
BRANCHES=$(git branch -r | grep "origin/claude/" | grep -v "plan-vps-deployment" | sort)
BRANCH_COUNT=$(echo "$BRANCHES" | wc -l)

echo -e "${GREEN}✓ Found $BRANCH_COUNT branches to deploy${NC}"
echo ""

# ============================================================================
# STEP 4: Deploy Each App from Each Branch
# ============================================================================

echo -e "${YELLOW}[4/6] Deploying applications...${NC}"
echo ""

DEPLOY_COUNT=0
FAILED_APPS=""

while IFS= read -r BRANCH; do
  if [ -z "$BRANCH" ]; then
    continue
  fi

  # Extract branch name for display
  BRANCH_SHORT=$(echo "$BRANCH" | sed 's/.*\///')
  echo -e "${BLUE}→ Processing branch: $BRANCH_SHORT${NC}"

  # Clone this specific branch to temp directory
  rm -rf "$TEMP_BRANCH" 2>/dev/null || true
  mkdir -p "$TEMP_BRANCH"

  # Strip origin/ prefix for git clone (git clone --branch doesn't accept origin/ prefix)
  CLONE_BRANCH=$(echo "$BRANCH" | sed 's|origin/||')

  git clone --quiet --branch "$CLONE_BRANCH" "$REPO_URL" "$TEMP_BRANCH" 2>&1 >/dev/null || {
    echo -e "${RED}✗ Failed to clone $CLONE_BRANCH${NC}"
    continue
  }

  # Find all apps in this branch (both root-level single app and monorepo subdirectories)
  # Check for package.json at root (single app)
  if [ -f "$TEMP_BRANCH/package.json" ]; then
    # Single app at root level - extract app name from branch (remove origin/ and -01xxx suffix)
    APP_NAME=$(echo "$BRANCH" | sed 's|origin/claude/\(.*\)-01.*|\1|')

    if [ -n "$APP_NAME" ] && [ "$APP_NAME" != "$BRANCH" ]; then
      echo -e "${BLUE}  ├─ Single app detected: $APP_NAME${NC}"

      # Deploy this app
      APP_DIR="$WEB_ROOT/$APP_NAME"
      mkdir -p "$APP_DIR"

      cd "$TEMP_BRANCH"

      echo "    Installing dependencies..."
      npm install --production --silent > /dev/null 2>&1 || {
        echo -e "${RED}    ✗ npm install failed${NC}"
        FAILED_APPS="$FAILED_APPS\n  - $APP_NAME (npm install)"
        continue
      }

      if grep -q '"build"' package.json; then
        echo "    Building application..."
        npm run build --silent > /dev/null 2>&1 || {
          echo -e "${RED}    ✗ build failed${NC}"
          FAILED_APPS="$FAILED_APPS\n  - $APP_NAME (build)"
          continue
        }
      fi

      # Copy built app to web root
      cp -r . "$APP_DIR/" 2>/dev/null || {
        echo -e "${RED}    ✗ Failed to copy app files${NC}"
        FAILED_APPS="$FAILED_APPS\n  - $APP_NAME (copy)"
        continue
      }

      # Create .env if needed
      if [ ! -f "$APP_DIR/.env" ] && [ -f "$APP_DIR/.env.example" ]; then
        cp "$APP_DIR/.env.example" "$APP_DIR/.env"
      fi

      # Detect port
      PORT=3000
      if grep -q '"express"' "$APP_DIR/package.json" 2>/dev/null; then
        PORT=5000
      fi

      # Stop existing PM2 process
      pm2 stop "$APP_NAME" > /dev/null 2>&1 || true
      pm2 delete "$APP_NAME" > /dev/null 2>&1 || true

      # Start with PM2
      cd "$APP_DIR"
      if grep -q '"start"' package.json; then
        pm2 start "npm start" --name "$APP_NAME" --append-log > /dev/null 2>&1 || {
          echo -e "${RED}    ✗ Failed to start app${NC}"
          FAILED_APPS="$FAILED_APPS\n  - $APP_NAME (start)"
          continue
        }
      else
        pm2 start "npm run dev" --name "$APP_NAME" --append-log > /dev/null 2>&1 || \
        pm2 start "node index.js" --name "$APP_NAME" --append-log > /dev/null 2>&1 || \
        pm2 start "node server.js" --name "$APP_NAME" --append-log > /dev/null 2>&1 || {
          echo -e "${RED}    ✗ Failed to start app${NC}"
          FAILED_APPS="$FAILED_APPS\n  - $APP_NAME (start)"
          continue
        }
      fi

      # Create Nginx config for subdomain
      create_nginx_config "$APP_NAME" "$PORT"

      echo -e "${GREEN}    ✓ $APP_NAME.9gg.app (port $PORT)${NC}"
      ((DEPLOY_COUNT++))
    fi
  fi

  # Check for monorepo structure (subdirectories with package.json)
  SUBDIRS=$(find "$TEMP_BRANCH" -maxdepth 2 -name "package.json" -type f | grep -v "^$TEMP_BRANCH/package.json" | grep -v node_modules | sed 's|/package.json||' | sort -u)

  if [ -n "$SUBDIRS" ]; then
    echo -e "${BLUE}  ├─ Monorepo detected: multiple apps${NC}"

    while IFS= read -r APP_DIR_PATH; do
      if [ -z "$APP_DIR_PATH" ]; then
        continue
      fi

      # Extract app name from directory path
      APP_NAME=$(basename "$APP_DIR_PATH")

      if [ -z "$APP_NAME" ] || [ "$APP_NAME" = "." ] || [ "$APP_NAME" = "$TEMP_BRANCH" ]; then
        continue
      fi

      echo "    Deploying: $APP_NAME"

      DEPLOY_DIR="$WEB_ROOT/$APP_NAME"
      mkdir -p "$DEPLOY_DIR"

      # Copy app files
      cp -r "$APP_DIR_PATH"/* "$DEPLOY_DIR/" 2>/dev/null || {
        echo -e "${RED}      ✗ Failed to copy app files${NC}"
        FAILED_APPS="$FAILED_APPS\n  - $APP_NAME (copy)"
        continue
      }

      # Install dependencies
      echo "      Installing dependencies..."
      cd "$DEPLOY_DIR"
      npm install --production --silent > /dev/null 2>&1 || {
        echo -e "${RED}      ✗ npm install failed${NC}"
        FAILED_APPS="$FAILED_APPS\n  - $APP_NAME (npm)"
        continue
      }

      # Build if needed
      if grep -q '"build"' package.json; then
        echo "      Building application..."
        npm run build --silent > /dev/null 2>&1 || {
          echo -e "${RED}      ✗ build failed${NC}"
          FAILED_APPS="$FAILED_APPS\n  - $APP_NAME (build)"
          continue
        }
      fi

      # Create .env if needed
      if [ ! -f ".env" ] && [ -f ".env.example" ]; then
        cp .env.example .env
      fi

      # Detect port
      PORT=3000
      if grep -q '"express"' package.json 2>/dev/null; then
        PORT=5000
      fi

      # Stop existing PM2 process
      pm2 stop "$APP_NAME" > /dev/null 2>&1 || true
      pm2 delete "$APP_NAME" > /dev/null 2>&1 || true

      # Start with PM2
      if grep -q '"start"' package.json; then
        pm2 start "npm start" --name "$APP_NAME" --append-log > /dev/null 2>&1 || {
          echo -e "${RED}      ✗ Failed to start app${NC}"
          FAILED_APPS="$FAILED_APPS\n  - $APP_NAME (start)"
          continue
        }
      else
        pm2 start "npm run dev" --name "$APP_NAME" --append-log > /dev/null 2>&1 || \
        pm2 start "node index.js" --name "$APP_NAME" --append-log > /dev/null 2>&1 || \
        pm2 start "node server.js" --name "$APP_NAME" --append-log > /dev/null 2>&1 || {
          echo -e "${RED}      ✗ Failed to start app${NC}"
          FAILED_APPS="$FAILED_APPS\n  - $APP_NAME (start)"
          continue
        }
      fi

      # Create Nginx config for subdomain
      create_nginx_config "$APP_NAME" "$PORT"

      echo -e "${GREEN}      ✓ $APP_NAME.9gg.app (port $PORT)${NC}"
      ((DEPLOY_COUNT++))

    done <<< "$SUBDIRS"
  fi

done <<< "$BRANCHES"

# Save PM2 state
pm2 save > /dev/null 2>&1 || true
pm2 startup > /dev/null 2>&1 || true

echo ""
echo -e "${GREEN}✓ Deployed $DEPLOY_COUNT applications${NC}"
echo ""

# ============================================================================
# STEP 5: Test and Enable Nginx
# ============================================================================

echo -e "${YELLOW}[5/6] Configuring Nginx...${NC}"

# Test Nginx config
if ! sudo nginx -t > /dev/null 2>&1; then
  echo -e "${RED}✗ Nginx configuration has errors${NC}"
  sudo nginx -t
else
  echo -e "${GREEN}✓ Nginx configuration is valid${NC}"
fi

# Reload Nginx
sudo systemctl reload nginx > /dev/null 2>&1 || {
  echo -e "${RED}✗ Failed to reload Nginx${NC}"
}

echo -e "${GREEN}✓ Nginx reloaded${NC}"
echo ""

# ============================================================================
# STEP 6: Verify Deployments
# ============================================================================

echo -e "${YELLOW}[6/6] Verifying deployments...${NC}"
echo ""

pm2 list

echo ""
echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}✓ DEPLOYMENT COMPLETE${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
echo ""

echo "Summary:"
echo "  Web Root: $WEB_ROOT"
echo "  Master Domain: 9gg.app"
echo "  Apps Deployed: $DEPLOY_COUNT"
echo "  Subdomains: [app-name].9gg.app"
echo "  SSL: Wildcard certificate covers all subdomains"
echo ""

echo "Next Steps:"
echo "  1. Test domain: curl https://[app-name].9gg.app"
echo "  2. View logs: pm2 logs [app-name]"
echo "  3. Restart app: pm2 restart [app-name]"
echo "  4. Check SSL: sudo certbot certificates"
echo ""

if [ -n "$FAILED_APPS" ]; then
  echo -e "${RED}Failed deployments:${NC}"
  echo -e "$FAILED_APPS"
  echo ""
fi

# Cleanup
rm -rf "$TEMP_REPO" "$TEMP_BRANCH"

################################################################################
# HELPER FUNCTION: Create Nginx Config for Subdomain
################################################################################

function create_nginx_config() {
  local APP_NAME="$1"
  local PORT="$2"
  local CONFIG_FILE="$NGINX_SITES/${APP_NAME}.9gg.app.conf"

  # Create Nginx config (uses existing wildcard SSL cert)
  cat > "$CONFIG_FILE" << 'NGINX_EOF'
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name APP_NAME.9gg.app;

    # Use wildcard SSL certificate
    ssl_certificate /etc/letsencrypt/live/9gg.app/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/9gg.app/privkey.pem;

    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_types text/plain text/css text/xml text/javascript
               application/x-javascript application/xml+rss
               application/javascript application/json;

    location / {
        proxy_pass http://127.0.0.1:PORT;
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
}

# HTTP to HTTPS redirect
server {
    listen 80;
    listen [::]:80;
    server_name APP_NAME.9gg.app;

    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }

    location / {
        return 301 https://$server_name$request_uri;
    }
}
NGINX_EOF

  # Replace placeholders
  sed -i "s/APP_NAME/$APP_NAME/g" "$CONFIG_FILE"
  sed -i "s/PORT/$PORT/g" "$CONFIG_FILE"

  # Enable site (create symlink)
  ln -sf "$CONFIG_FILE" "$NGINX_ENABLED/${APP_NAME}.9gg.app.conf" 2>/dev/null || true
}

echo "Deployment directory: $WEB_ROOT"
echo "To update an app, pull latest from branch and restart: pm2 restart [app-name]"
echo ""
