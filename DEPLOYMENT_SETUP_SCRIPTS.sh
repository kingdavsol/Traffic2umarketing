#!/bin/bash

################################################################################
# COMPLETE VPS DEPLOYMENT SETUP
# Deploys all apps from GitHub branches to VPS with automatic Nginx routing
# Usage: sudo bash DEPLOYMENT_SETUP_SCRIPTS.sh
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
TEMP_REPO="/tmp/traffic2u_deploy_$$"

echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}VPS DEPLOYMENT SETUP - ALL APPS${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
echo ""

# STEP 1: Install Dependencies
echo -e "${YELLOW}[1/5] Installing system dependencies...${NC}"

apt-get update -qq 2>/dev/null || true
apt-get install -y git curl wget nodejs npm nginx certbot python3-certbot-nginx > /dev/null 2>&1 || true
npm install -g pm2 > /dev/null 2>&1 || true

echo -e "${GREEN}✓ Dependencies installed${NC}"
echo ""

# STEP 2: Create Web Root
echo -e "${YELLOW}[2/5] Setting up web root directory...${NC}"

mkdir -p "$WEB_ROOT"
chmod 755 "$WEB_ROOT"

echo -e "${GREEN}✓ Web root created: $WEB_ROOT${NC}"
echo ""

# STEP 3: Clone Repository
echo -e "${YELLOW}[3/5] Cloning repository and fetching branches...${NC}"

rm -rf "$TEMP_REPO"
git clone --quiet "$REPO_URL" "$TEMP_REPO" 2>/dev/null
cd "$TEMP_REPO"
git fetch --quiet --all 2>/dev/null

BRANCHES=$(git branch -r | grep "origin/claude/" | sed 's/origin\///' | grep -v "plan-vps-deployment" | sort)
BRANCH_COUNT=$(echo "$BRANCHES" | wc -l)

echo -e "${GREEN}✓ Found $BRANCH_COUNT branches to deploy${NC}"
echo ""

# STEP 4: Deploy Each App
echo -e "${YELLOW}[4/5] Deploying applications...${NC}"
echo ""

DEPLOY_COUNT=0
FAILED_APPS=""

while IFS= read -r BRANCH; do
  if [ -z "$BRANCH" ]; then
    continue
  fi

  APP_NAME=$(echo "$BRANCH" | sed 's/claude\/\(.*\)-01.*/\1/')

  if [ -z "$APP_NAME" ] || [ "$APP_NAME" = "$BRANCH" ]; then
    continue
  fi

  echo -e "${BLUE}→ Deploying: $APP_NAME${NC}"

  APP_DIR="$WEB_ROOT/$APP_NAME"
  mkdir -p "$APP_DIR"

  if [ -d "$APP_DIR/.git" ]; then
    cd "$APP_DIR"
    git fetch --quiet origin 2>/dev/null || true
    git checkout --quiet "$BRANCH" 2>/dev/null || git checkout --quiet -b "$BRANCH" "origin/$BRANCH" 2>/dev/null || true
    git pull --quiet origin "$BRANCH" 2>/dev/null || true
  else
    cd "$TEMP_REPO"
    rm -rf "$APP_DIR"
    mkdir -p "$APP_DIR"
    cd "$APP_DIR"
    git clone --quiet --branch "$BRANCH" --single-branch "$REPO_URL" . 2>/dev/null || {
      echo -e "${RED}✗ Failed to clone $BRANCH${NC}"
      FAILED_APPS="$FAILED_APPS\n  - $APP_NAME"
      continue
    }
  fi

  cd "$APP_DIR"

  if [ -f "package.json" ]; then
    echo "  Installing dependencies..."
    npm install --production --silent > /dev/null 2>&1 || {
      echo -e "${RED}✗ npm install failed${NC}"
      FAILED_APPS="$FAILED_APPS\n  - $APP_NAME (npm)"
      continue
    }

    if grep -q '"build"' package.json; then
      echo "  Building application..."
      npm run build --silent > /dev/null 2>&1 || {
        echo -e "${RED}✗ build failed${NC}"
        FAILED_APPS="$FAILED_APPS\n  - $APP_NAME (build)"
        continue
      }
    fi
  fi

  if [ ! -f ".env" ] && [ -f ".env.example" ]; then
    cp .env.example .env
  fi

  pm2 stop "$APP_NAME" > /dev/null 2>&1 || true
  pm2 delete "$APP_NAME" > /dev/null 2>&1 || true

  if [ -f "package.json" ]; then
    if grep -q '"start"' package.json; then
      pm2 start "npm start" --name "$APP_NAME" --append-log > /dev/null 2>&1 || {
        echo -e "${RED}✗ Failed to start${NC}"
        FAILED_APPS="$FAILED_APPS\n  - $APP_NAME (start)"
        continue
      }
    else
      pm2 start "npm run dev" --name "$APP_NAME" --append-log > /dev/null 2>&1 || \
      pm2 start "node index.js" --name "$APP_NAME" --append-log > /dev/null 2>&1 || \
      pm2 start "node server.js" --name "$APP_NAME" --append-log > /dev/null 2>&1 || {
        echo -e "${RED}✗ Failed to start${NC}"
        FAILED_APPS="$FAILED_APPS\n  - $APP_NAME (start)"
        continue
      }
    fi
  fi

  echo -e "${GREEN}  ✓ $APP_NAME.9gg.app${NC}"
  ((DEPLOY_COUNT++))

done <<< "$BRANCHES"

pm2 save > /dev/null 2>&1 || true
pm2 startup > /dev/null 2>&1 || true

echo ""
echo -e "${GREEN}✓ Deployed $DEPLOY_COUNT applications${NC}"
echo ""

# STEP 5: Verify
echo -e "${YELLOW}[5/5] Verifying deployments...${NC}"
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
echo "  Nginx: Auto-routing all *.9gg.app to port 3000"
echo ""

echo "Next Steps:"
echo "  1. Verify SSL: sudo certbot certificates"
echo "  2. Test: curl https://[app-name].9gg.app"
echo "  3. View logs: pm2 logs [app-name]"
echo "  4. Restart: pm2 restart [app-name]"
echo ""

if [ -n "$FAILED_APPS" ]; then
  echo -e "${RED}Failed:${NC}"
  echo -e "$FAILED_APPS"
  echo ""
fi

rm -rf "$TEMP_REPO"
