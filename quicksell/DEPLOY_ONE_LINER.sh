#!/bin/bash

################################################################################
# QUICKSELL - One-Liner Deployment Script
#
# This script can be piped from GitHub and executed directly
# Usage: curl -fsSL <raw-github-url> | sudo bash
################################################################################

set -e

echo "🚀 QuickSell One-Liner Deployment Starting..."
echo ""

# Configuration
REPO_URL="https://github.com/kingdavsol/Traffic2umarketing.git"
BRANCH="claude/fix-vps-deployment-013taUqhcCQwKrcLj98DZWZ1"
DEPLOY_DIR="/var/www/quicksell.monster"
TEMP_DIR="/tmp/quicksell-deploy-$$"

# Check if running as root
if [ "$EUID" -ne 0 ]; then
  echo "❌ Please run as root (use: sudo bash)"
  exit 1
fi

# Install dependencies if needed
echo "📦 Installing dependencies..."
if ! command -v docker &> /dev/null; then
  curl -fsSL https://get.docker.com | sh
fi
if ! command -v docker-compose &> /dev/null; then
  apt-get update && apt-get install -y docker-compose
fi
if ! command -v rsync &> /dev/null; then
  apt-get update && apt-get install -y rsync
fi

# Clone repository
echo "📥 Cloning repository..."
rm -rf "$TEMP_DIR"
git clone --branch "$BRANCH" --depth 1 "$REPO_URL" "$TEMP_DIR"

# Deploy QuickSell
echo "🔧 Deploying to $DEPLOY_DIR..."
mkdir -p "$DEPLOY_DIR"
rsync -av --delete "$TEMP_DIR/quicksell/" "$DEPLOY_DIR/"

# Clean up
rm -rf "$TEMP_DIR"

# Setup environment
cd "$DEPLOY_DIR"
if [ ! -f ".env" ]; then
  cp .env.example .env
  echo "⚠️  Please edit .env with your credentials: nano .env"
  echo "   Required: DB_PASSWORD, REDIS_PASSWORD, JWT_SECRET, OPENAI_API_KEY"
  echo ""
  read -p "Press Enter to edit .env now, or Ctrl+C to edit later..."
  ${EDITOR:-nano} .env
fi

# Start services
echo "🐳 Starting Docker containers..."
docker-compose -f docker-compose.prod.yml down 2>/dev/null || true
docker-compose -f docker-compose.prod.yml up -d --build

echo ""
echo "✅ DEPLOYMENT COMPLETE!"
echo ""
echo "🌐 Application URLs:"
echo "   Frontend: http://$(hostname -I | awk '{print $1}')"
echo "   Backend:  http://$(hostname -I | awk '{print $1}'):5000"
echo "   Health:   http://$(hostname -I | awk '{print $1}'):5000/health"
echo ""
echo "📊 Check status: cd /var/www/quicksell.monster && docker-compose -f docker-compose.prod.yml ps"
echo "📝 View logs:    cd /var/www/quicksell.monster && docker-compose -f docker-compose.prod.yml logs -f"
echo ""
