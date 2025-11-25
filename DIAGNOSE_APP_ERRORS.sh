#!/bin/bash

################################################################################
# DIAGNOSE APP INSTALLATION ERRORS
# Run npm install manually for a single app to see actual error messages
# Usage: sudo bash DIAGNOSE_APP_ERRORS.sh app-name
################################################################################

APP_NAME="${1:-ai-caption-generator-app}"
WEB_ROOT="/var/www/9gg.app"
APP_DIR="$WEB_ROOT/$APP_NAME"

# Skip independent apps
SKIP_APPS="soltil|soltil-backend|topcoinbot-main"

echo "Diagnosing: $APP_NAME"
echo "Location: $APP_DIR"
echo ""

if echo "$APP_NAME" | grep -qE "^($SKIP_APPS)$"; then
  echo "✗ $APP_NAME is an independent app - skipping (already running separately)"
  exit 1
fi

if [ ! -d "$APP_DIR" ]; then
  echo "App not found at $APP_DIR"
  echo ""
  echo "Available apps (excluding independent ones):"
  ls -1 "$WEB_ROOT" | grep -vE "^($SKIP_APPS)$"
  exit 1
fi

cd "$APP_DIR"

echo "=== package.json ==="
cat package.json | head -20
echo ""

echo "=== Running npm install with full output ==="
npm install --legacy-peer-deps 2>&1 | tail -50

echo ""
echo "=== Installation result ==="
if [ -d "node_modules" ]; then
  echo "✓ node_modules exists"
  echo "Total packages: $(ls -1 node_modules | wc -l)"
else
  echo "✗ node_modules missing"
fi
