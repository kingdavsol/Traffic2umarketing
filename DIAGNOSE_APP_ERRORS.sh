#!/bin/bash

################################################################################
# DIAGNOSE APP INSTALLATION ERRORS
# Run npm install manually for a single app to see actual error messages
# Usage: sudo bash DIAGNOSE_APP_ERRORS.sh app-name
################################################################################

APP_NAME="${1:-ai-caption-generator-app}"
WEB_ROOT="/var/www/9gg.app"
APP_DIR="$WEB_ROOT/$APP_NAME"

echo "Diagnosing: $APP_NAME"
echo "Location: $APP_DIR"
echo ""

if [ ! -d "$APP_DIR" ]; then
  echo "App not found at $APP_DIR"
  echo ""
  echo "Available apps:"
  ls -1 "$WEB_ROOT"
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
