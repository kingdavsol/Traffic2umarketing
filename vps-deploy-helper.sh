#!/bin/bash
# VPS Deployment Helper Script
# Put this on your VPS at: ~/deploy.sh
# Usage: ./deploy.sh medisave claude/medisave-healthcare-01Y5zseebXjcC5Y62bi55kXG

set -e

APP_NAME=$1
BRANCH=$2
VPS_USER=${3:-$(whoami)}
APPS_DIR="${HOME}/apps"

# Validate inputs
if [ -z "$APP_NAME" ] || [ -z "$BRANCH" ]; then
    echo "Usage: $0 <app-name> <branch-name> [vps-user]"
    echo ""
    echo "Examples:"
    echo "  $0 medisave claude/medisave-healthcare-01Y5zseebXjcC5Y62bi55kXG"
    echo "  $0 skilltrade claude/skilltrade-gig-01Y5zseebXjcC5Y62bi55kXG"
    exit 1
fi

APP_DIR="$APPS_DIR/$APP_NAME"

# Verify app directory exists
if [ ! -d "$APP_DIR" ]; then
    echo "❌ Error: App directory not found: $APP_DIR"
    echo "Please create the directory first:"
    echo "  mkdir -p $APP_DIR"
    exit 1
fi

echo "=================================================="
echo "🚀 Deploying: $APP_NAME"
echo "📦 Branch: $BRANCH"
echo "📁 Directory: $APP_DIR"
echo "=================================================="

# Change to app directory
cd "$APP_DIR" || exit 1

# Check if git is initialized
if [ ! -d .git ]; then
    echo "📥 Initializing git repository..."
    git init
    git remote add origin "https://github.com/kingdavsol/Traffic2umarketing.git"
fi

# Fetch and checkout
echo "📥 Fetching latest code..."
git fetch origin "$BRANCH" || {
    echo "❌ Error: Branch not found - $BRANCH"
    exit 1
}

echo "🔀 Checking out $BRANCH..."
git checkout "$BRANCH" 2>/dev/null || git checkout -b "$BRANCH" origin/"$BRANCH"

echo "⬇️  Pulling latest changes..."
git pull origin "$BRANCH"

# Install dependencies
echo "📦 Installing dependencies..."
npm install --production

# Build if needed
if [ -f "next.config.js" ] && [ -f "package.json" ]; then
    echo "🔨 Building Next.js app..."
    npm run build
fi

# Restart with PM2
echo "♻️  Restarting with PM2..."
if pm2 list | grep -q "^[[:space:]]*[0-9]\+.*$APP_NAME"; then
    pm2 restart "$APP_NAME"
    echo "✓ Restarted existing PM2 process"
else
    pm2 start npm --name "$APP_NAME" -- start
    echo "✓ Started new PM2 process"
fi

# Show status
echo ""
echo "=================================================="
pm2 show "$APP_NAME" | tail -20
echo "=================================================="
echo "✅ Deployment complete!"
echo ""
echo "View logs:"
echo "  pm2 logs $APP_NAME"
echo ""
