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
# Docker Compose V2 is bundled with Docker, verify it works
if ! docker compose version &> /dev/null; then
  echo "❌ Docker Compose V2 not found. Please install Docker 20.10+ which includes Compose V2"
  exit 1
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
  echo "🔧 Auto-configuring .env file..."

  # Generate secure passwords
  DB_PASSWORD=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-32)
  REDIS_PASSWORD=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-32)
  JWT_SECRET=$(openssl rand -base64 48 | tr -d "=+/" | cut -c1-64)

  # Copy and configure .env
  cp .env.example .env
  sed -i "s|DB_PASSWORD=password|DB_PASSWORD=$DB_PASSWORD|g" .env
  sed -i "s|REDIS_PASSWORD=|REDIS_PASSWORD=$REDIS_PASSWORD|g" .env
  sed -i "s|JWT_SECRET=your-super-secret-jwt-key-change-in-production|JWT_SECRET=$JWT_SECRET|g" .env
  sed -i "s|NODE_ENV=development|NODE_ENV=production|g" .env

  # Set production URLs
  HOSTNAME=$(hostname -I | awk '{print $1}')
  sed -i "s|CORS_ORIGINS=http://localhost:3000,http://localhost:8081|CORS_ORIGINS=http://$HOSTNAME,https://$HOSTNAME|g" .env

  echo "✅ .env configured with secure auto-generated passwords"
  echo "   Database Password: $DB_PASSWORD"
  echo "   Redis Password:    $REDIS_PASSWORD"
  echo "   Server IP:         $HOSTNAME"
  echo ""
  echo "⚠️  OpenAI/Stripe API keys not set (optional features disabled)"
  echo "   Edit .env to add: nano .env"
  echo ""
fi

# Start services
echo "🐳 Starting Docker containers..."
docker compose -f docker-compose.prod.yml down 2>/dev/null || true
docker compose -f docker-compose.prod.yml up -d --build

echo ""
echo "✅ DEPLOYMENT COMPLETE!"
echo ""
echo "🌐 Application URLs:"
echo "   Frontend: http://$(hostname -I | awk '{print $1}')"
echo "   Backend:  http://$(hostname -I | awk '{print $1}'):5000"
echo "   Health:   http://$(hostname -I | awk '{print $1}'):5000/health"
echo ""
echo "📊 Check status: cd /var/www/quicksell.monster && docker compose -f docker-compose.prod.yml ps"
echo "📝 View logs:    cd /var/www/quicksell.monster && docker compose -f docker-compose.prod.yml logs -f"
echo ""
