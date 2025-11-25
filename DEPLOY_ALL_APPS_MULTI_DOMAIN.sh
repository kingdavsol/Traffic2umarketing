#!/bin/bash

################################################################################
# ENHANCED DEPLOYMENT SCRIPT FOR MULTIPLE DOMAINS
# Deploys apps to appropriate domains:
# - Most apps: app-name.9gg.app
# - Quicksell: quicksell.monster
# - Excludes: soltil.com, topcoinbot.coinpicker.us, coinpicker.us
# Usage: sudo bash DEPLOY_ALL_APPS_MULTI_DOMAIN.sh
################################################################################

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration
WEB_ROOT="/var/www"
REPO_URL="https://github.com/kingdavsol/Traffic2umarketing.git"
NGINX_SITES="/etc/nginx/sites-available"
NGINX_ENABLED="/etc/nginx/sites-enabled"
TEMP_REPO="/tmp/traffic2u_deploy_$$"
TEMP_BRANCH="/tmp/traffic2u_branch_$$"
ORIGINAL_DIR=$(pwd)

# Domain mappings
DEFAULT_DOMAIN="9gg.app"
QUICKSELL_DOMAIN="quicksell.monster"

# Apps to exclude (by name pattern)
EXCLUDE_PATTERNS=(
  "soltil"
  "topcoinbot"
  "coinpicker"
)

echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}ENHANCED MULTI-DOMAIN DEPLOYMENT${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
echo ""
echo "Domain Configuration:"
echo "  Default Domain: $DEFAULT_DOMAIN (for most apps)"
echo "  Special Domain: $QUICKSELL_DOMAIN (for quicksell)"
echo "  Excluded Apps: soltil*, topcoinbot*, coinpicker*"
echo ""

# ============================================================================
# STEP 1: Verify Prerequisites
# ============================================================================

echo -e "${YELLOW}[1/6] Verifying prerequisites...${NC}"

if [ "$EUID" -ne 0 ]; then
  echo -e "${RED}✗ This script must be run as root (sudo)${NC}"
  exit 1
fi

# Verify Nginx, PM2, etc.
for cmd in nginx pm2 git npm node; do
  if ! command -v $cmd &> /dev/null; then
    echo -e "${RED}✗ Required command not found: $cmd${NC}"
    exit 1
  fi
done

echo -e "${GREEN}✓ All prerequisites verified${NC}"
echo ""

# ============================================================================
# STEP 2: Clone Repository and Get Branches
# ============================================================================

echo -e "${YELLOW}[2/6] Fetching repository and branches...${NC}"

rm -rf "$TEMP_REPO" 2>/dev/null || true
git clone --quiet "$REPO_URL" "$TEMP_REPO" 2>/dev/null || {
  echo -e "${RED}✗ Failed to clone repository${NC}"
  exit 1
}

cd "$TEMP_REPO"
git fetch --quiet --all 2>/dev/null || true

# Get all claude/* branches (excluding deployment/planning branches)
BRANCHES=$(git branch -r | grep "origin/claude/" | \
  grep -v "plan-vps-deployment" | \
  grep -v "fix-typescript-github-sync" | \
  grep -v "setup-app-subdomains" | \
  sed 's/^[[:space:]]*//;s/[[:space:]]*$//' | sort)

BRANCH_COUNT=$(echo "$BRANCHES" | wc -l)

cd "$ORIGINAL_DIR"

echo -e "${GREEN}✓ Found $BRANCH_COUNT branches to deploy${NC}"
echo ""

# ============================================================================
# STEP 3: Function to Check if App Should Be Excluded
# ============================================================================

should_exclude_app() {
  local app_name="$1"

  for pattern in "${EXCLUDE_PATTERNS[@]}"; do
    if [[ "$app_name" == *"$pattern"* ]]; then
      return 0  # Should exclude
    fi
  done

  return 1  # Should not exclude
}

# ============================================================================
# STEP 4: Function to Determine Target Domain
# ============================================================================

get_target_domain() {
  local app_name="$1"

  if [[ "$app_name" == "quicksell" ]]; then
    echo "$QUICKSELL_DOMAIN"
  else
    echo "$DEFAULT_DOMAIN"
  fi
}

# ============================================================================
# STEP 5: Function to Create Nginx Config
# ============================================================================

create_nginx_config() {
  local APP_NAME="$1"
  local PORT="$2"
  local DOMAIN="$3"
  local CONFIG_FILE="$NGINX_SITES/${APP_NAME}.${DOMAIN}.conf"

  cat > "$CONFIG_FILE" << NGINX_EOF
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name ${APP_NAME}.${DOMAIN};

    # Use wildcard SSL certificate
    ssl_certificate /etc/letsencrypt/live/${DOMAIN}/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/${DOMAIN}/privkey.pem;

    # SSL configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5:!DSS;
    ssl_prefer_server_ciphers on;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

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
        proxy_pass http://127.0.0.1:${PORT};
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Health check
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
    server_name ${APP_NAME}.${DOMAIN};

    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }

    location / {
        return 301 https://\$server_name\$request_uri;
    }
}
NGINX_EOF

  # Enable site
  ln -sf "$CONFIG_FILE" "$NGINX_ENABLED/${APP_NAME}.${DOMAIN}.conf" 2>/dev/null || true
}

# ============================================================================
# STEP 6: Deploy Each App
# ============================================================================

echo -e "${YELLOW}[3/6] Deploying applications...${NC}"
echo ""

DEPLOY_COUNT=0
EXCLUDED_COUNT=0
FAILED_APPS=""

while IFS= read -r BRANCH; do
  if [ -z "$BRANCH" ]; then
    continue
  fi

  BRANCH=$(echo "$BRANCH" | sed 's/^[[:space:]]*//;s/[[:space:]]*$//')

  # Extract app name from branch
  APP_NAME=$(echo "$BRANCH" | sed 's|origin/claude/\(.*\)-01.*|\1|' | sed 's/-/_/g')

  # Check if app should be excluded
  if should_exclude_app "$APP_NAME"; then
    echo -e "${YELLOW}⊘ Skipped (excluded): $APP_NAME${NC}"
    ((EXCLUDED_COUNT++))
    continue
  fi

  # Get target domain
  TARGET_DOMAIN=$(get_target_domain "$APP_NAME")

  # Create app directory
  APP_DIR="$WEB_ROOT/$APP_NAME"
  mkdir -p "$APP_DIR"

  cd "$ORIGINAL_DIR"

  echo -e "${BLUE}→ Deploying: $APP_NAME → ${APP_NAME}.${TARGET_DOMAIN}${NC}"

  # Clone the specific branch
  rm -rf "$TEMP_BRANCH" 2>/dev/null || true

  CLONE_BRANCH=$(echo "$BRANCH" | sed 's|origin/||;s/^[[:space:]]*//;s/[[:space:]]*$//')

  git clone --quiet "$REPO_URL" "$TEMP_BRANCH" 2>&1 >/dev/null || {
    echo -e "${RED}  ✗ Failed to clone repository${NC}"
    FAILED_APPS="$FAILED_APPS\n  - $APP_NAME (clone)"
    continue
  }

  # Fetch and checkout specific branch
  cd "$TEMP_BRANCH"
  git fetch --quiet origin "$CLONE_BRANCH:$CLONE_BRANCH" 2>&1 >/dev/null || {
    cd "$ORIGINAL_DIR"
    echo -e "${RED}  ✗ Failed to fetch branch${NC}"
    FAILED_APPS="$FAILED_APPS\n  - $APP_NAME (fetch)"
    continue
  }

  git checkout --quiet "$CLONE_BRANCH" 2>&1 >/dev/null || {
    cd "$ORIGINAL_DIR"
    echo -e "${RED}  ✗ Failed to checkout branch${NC}"
    FAILED_APPS="$FAILED_APPS\n  - $APP_NAME (checkout)"
    continue
  }

  cd "$ORIGINAL_DIR"

  # Check if package.json exists
  if [ ! -f "$TEMP_BRANCH/package.json" ]; then
    echo -e "${YELLOW}  ⊘ No package.json found (skipping)${NC}"
    ((EXCLUDED_COUNT++))
    continue
  fi

  # Copy app files
  cp -r "$TEMP_BRANCH"/* "$APP_DIR/" 2>/dev/null || {
    echo -e "${RED}  ✗ Failed to copy files${NC}"
    FAILED_APPS="$FAILED_APPS\n  - $APP_NAME (copy)"
    continue
  }

  cd "$APP_DIR"

  # Install dependencies
  if [ ! -d "node_modules" ]; then
    echo "  Installing dependencies..."
    if [ -f "package-lock.json" ]; then
      npm ci --legacy-peer-deps > /tmp/npm_install.log 2>&1 || {
        cd "$ORIGINAL_DIR"
        echo -e "${RED}  ✗ npm install failed${NC}"
        FAILED_APPS="$FAILED_APPS\n  - $APP_NAME (npm)"
        continue
      }
    else
      npm install --legacy-peer-deps > /tmp/npm_install.log 2>&1 || {
        cd "$ORIGINAL_DIR"
        echo -e "${RED}  ✗ npm install failed${NC}"
        FAILED_APPS="$FAILED_APPS\n  - $APP_NAME (npm)"
        continue
      }
    fi
  else
    echo "  ⊘ Dependencies already installed"
  fi

  # Build if needed
  if grep -q '"build"' package.json; then
    echo "  Building application..."
    npm run build > /tmp/npm_build.log 2>&1 || {
      cd "$ORIGINAL_DIR"
      echo -e "${RED}  ✗ Build failed${NC}"
      FAILED_APPS="$FAILED_APPS\n  - $APP_NAME (build)"
      continue
    }
  fi

  # Create .env if needed
  if [ ! -f "$APP_DIR/.env" ] && [ -f "$APP_DIR/.env.example" ]; then
    cp "$APP_DIR/.env.example" "$APP_DIR/.env"
    echo "  Created .env from template"
  fi

  # Detect port
  PORT=3000
  if grep -q '"express"' "$APP_DIR/package.json" 2>/dev/null; then
    PORT=5000
  fi

  # Find next available port in sequence
  while lsof -Pi :$PORT -sTCP:LISTEN -t >/dev/null 2>&1; do
    PORT=$((PORT + 1))
  done

  # Stop existing PM2 process
  pm2 stop "$APP_NAME" > /dev/null 2>&1 || true
  pm2 delete "$APP_NAME" > /dev/null 2>&1 || true

  # Start with PM2
  cd "$APP_DIR"
  if grep -q '"start"' package.json; then
    pm2 start "npm start" --name "$APP_NAME" --append-log > /dev/null 2>&1 || {
      cd "$ORIGINAL_DIR"
      echo -e "${RED}  ✗ Failed to start app${NC}"
      FAILED_APPS="$FAILED_APPS\n  - $APP_NAME (start)"
      continue
    }
  else
    pm2 start "npm run dev" --name "$APP_NAME" --append-log > /dev/null 2>&1 || \
    pm2 start "node index.js" --name "$APP_NAME" --append-log > /dev/null 2>&1 || \
    pm2 start "node server.js" --name "$APP_NAME" --append-log > /dev/null 2>&1 || {
      cd "$ORIGINAL_DIR"
      echo -e "${RED}  ✗ Failed to start app${NC}"
      FAILED_APPS="$FAILED_APPS\n  - $APP_NAME (start)"
      continue
    }
  fi

  cd "$ORIGINAL_DIR"

  # Create Nginx config
  create_nginx_config "$APP_NAME" "$PORT" "$TARGET_DOMAIN"

  echo -e "${GREEN}  ✓ ${APP_NAME}.${TARGET_DOMAIN} (port $PORT)${NC}"
  ((DEPLOY_COUNT++))

done <<< "$BRANCHES"

# Save PM2 state
pm2 save > /dev/null 2>&1 || true
pm2 startup > /dev/null 2>&1 || true

echo ""
echo -e "${GREEN}✓ Deployed $DEPLOY_COUNT applications${NC}"
echo -e "${YELLOW}⊘ Excluded/Skipped $EXCLUDED_COUNT applications${NC}"
echo ""

# ============================================================================
# STEP 7: Test and Enable Nginx
# ============================================================================

echo -e "${YELLOW}[4/6] Configuring Nginx...${NC}"

if ! sudo nginx -t > /dev/null 2>&1; then
  echo -e "${RED}✗ Nginx configuration has errors${NC}"
  sudo nginx -t
else
  echo -e "${GREEN}✓ Nginx configuration is valid${NC}"
fi

sudo systemctl reload nginx > /dev/null 2>&1 || {
  echo -e "${RED}✗ Failed to reload Nginx${NC}"
}

echo -e "${GREEN}✓ Nginx reloaded${NC}"
echo ""

# ============================================================================
# STEP 8: Verify Deployments
# ============================================================================

echo -e "${YELLOW}[5/6] Verifying deployments...${NC}"
echo ""

pm2 list

echo ""

# ============================================================================
# Summary and Next Steps
# ============================================================================

echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}✓ DEPLOYMENT COMPLETE${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
echo ""

echo "Deployment Summary:"
echo "  Applications Deployed: $DEPLOY_COUNT"
echo "  Applications Excluded: $EXCLUDED_COUNT"
echo ""

echo "Domain Configuration:"
echo "  Primary Domain: $DEFAULT_DOMAIN (most apps)"
echo "  Special Domain: $QUICKSELL_DOMAIN (quicksell)"
echo "  Subdomains: [app-name].9gg.app"
echo ""

echo "Next Steps:"
echo "  1. Verify DNS records:"
echo "     - $DEFAULT_DOMAIN A [YOUR_VPS_IP]"
echo "     - *.$DEFAULT_DOMAIN A [YOUR_VPS_IP]"
echo "     - $QUICKSELL_DOMAIN A [YOUR_VPS_IP]"
echo ""
echo "  2. Test applications:"
echo "     curl https://ai-caption-generator-app.$DEFAULT_DOMAIN"
echo "     curl https://quicksell.$QUICKSELL_DOMAIN"
echo ""
echo "  3. View logs:"
echo "     pm2 logs [app-name]"
echo ""
echo "  4. Monitor:"
echo "     pm2 monit"
echo ""
echo "  5. Check SSL certificates:"
echo "     sudo certbot certificates"
echo ""

if [ -n "$FAILED_APPS" ]; then
  echo -e "${RED}Failed deployments:${NC}"
  echo -e "$FAILED_APPS"
  echo ""
fi

# Cleanup
rm -rf "$TEMP_REPO" "$TEMP_BRANCH"

echo "Deployment directory: $WEB_ROOT"
echo ""
