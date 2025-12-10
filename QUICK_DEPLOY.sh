#!/bin/bash

################################################################################
# QUICK DEPLOYMENT - Update and restart apps without reinstalling
# Usage: sudo bash QUICK_DEPLOY.sh [branch-name-optional]
################################################################################

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

WEB_ROOT="/var/www/9gg.app"
REPO_URL="https://github.com/kingdavsol/Traffic2umarketing.git"
TEMP_REPO="/tmp/traffic2u_update_$$"

echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}QUICK APP UPDATE & RESTART${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
echo ""

# If specific branch provided, update just that branch
if [ -n "$1" ]; then
  SPECIFIC_BRANCH="$1"
  echo -e "${YELLOW}Updating specific branch: $SPECIFIC_BRANCH${NC}"
else
  SPECIFIC_BRANCH=""
  echo -e "${YELLOW}Updating all deployed apps...${NC}"
fi

echo ""

# Function to update an app in web root
update_app() {
  local APP_NAME="$1"
  local APP_DIR="$WEB_ROOT/$APP_NAME"

  if [ ! -d "$APP_DIR" ]; then
    echo -e "${YELLOW}  ⊘ Skipping $APP_NAME (not deployed yet)${NC}"
    return
  fi

  echo -e "${BLUE}→ Updating: $APP_NAME${NC}"

  cd "$APP_DIR"

  # Check for git repo inside app directory
  if [ -d ".git" ]; then
    echo "  Pulling latest changes..."
    git pull > /dev/null 2>&1 || {
      echo -e "${RED}  ✗ Failed to pull latest${NC}"
      return 1
    }
  fi

  # Rebuild if needed
  if [ -f "package.json" ] && grep -q '"build"' package.json; then
    echo "  Rebuilding..."
    npm run build > /tmp/build.log 2>&1 || {
      echo -e "${RED}  ✗ Build failed${NC}"
      tail -2 /tmp/build.log | sed 's/^/    /'
      return 1
    }
  fi

  # Restart app
  echo "  Restarting..."
  pm2 restart "$APP_NAME" > /dev/null 2>&1 || {
    echo -e "${RED}  ✗ Failed to restart${NC}"
    return 1
  }

  echo -e "${GREEN}  ✓ Updated and restarted${NC}"
}

# Apps to skip (already running independently)
SKIP_APPS="soltil|soltil-backend|topcoinbot-main"

# If specific branch, just update that one
if [ -n "$SPECIFIC_BRANCH" ]; then
  # Extract app name from branch
  APP_NAME=$(echo "$SPECIFIC_BRANCH" | sed 's|origin/claude/\(.*\)-01.*|\1|')
  update_app "$APP_NAME"
else
  # Update all deployed apps (skip independent ones)
  if [ -d "$WEB_ROOT" ]; then
    for APP_DIR in "$WEB_ROOT"/*; do
      if [ -d "$APP_DIR" ]; then
        APP_NAME=$(basename "$APP_DIR")
        # Skip independent apps
        if echo "$APP_NAME" | grep -qE "^($SKIP_APPS)$"; then
          continue
        fi
        update_app "$APP_NAME"
      fi
    done
  fi
fi

echo ""
echo -e "${GREEN}✓ Update complete${NC}"
echo ""
echo "Current running apps:"
pm2 list
