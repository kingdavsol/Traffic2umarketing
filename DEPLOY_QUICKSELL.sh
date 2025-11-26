#!/bin/bash

################################################################################
# QUICKSELL DEPLOYMENT SCRIPT
# Deploys quicksell application directly to /var/www/quicksell.monster
#
# Usage: sudo bash DEPLOY_QUICKSELL.sh
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
APP_DIR="/var/www/quicksell.monster"
APP_NAME="quicksell"
APP_PORT=3000

# Database configuration
DB_NAME="caption_genius"
DB_USER="quicksell_user"
DB_PASSWORD=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-25)
DB_HOST="localhost"
DB_PORT="5432"

echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}QUICKSELL DEPLOYMENT${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
echo ""

# ============================================================================
# STEP 1: Stop existing processes
# ============================================================================

echo -e "${YELLOW}[1/8] Stopping existing processes...${NC}"

pm2 stop "$APP_NAME" > /dev/null 2>&1 || true
pm2 delete "$APP_NAME" > /dev/null 2>&1 || true
pkill -f "npm start" > /dev/null 2>&1 || true
pkill -f "next start" > /dev/null 2>&1 || true

sleep 2

echo -e "${GREEN}✓ Processes stopped${NC}"
echo ""

# ============================================================================
# STEP 2: Clone code directly to app directory
# ============================================================================

echo -e "${YELLOW}[2/8] Cloning code from GitHub...${NC}"

# Remove old directory and clone fresh
rm -rf "$APP_DIR"
mkdir -p "$APP_DIR"

git clone --branch "$GITHUB_BRANCH" "https://github.com/$GITHUB_REPO.git" "$APP_DIR"

cd "$APP_DIR"

echo -e "${GREEN}✓ Code cloned successfully${NC}"
echo ""

# ============================================================================
# STEP 3: Clean and install dependencies
# ============================================================================

echo -e "${YELLOW}[3/8] Installing dependencies...${NC}"

rm -rf node_modules .next
npm cache clean --force > /dev/null 2>&1 || true

npm install --legacy-peer-deps > /tmp/quicksell_install.log 2>&1

if [ $? -ne 0 ]; then
  echo -e "${RED}✗ npm install failed${NC}"
  tail -20 /tmp/quicksell_install.log | sed 's/^/    /'
  exit 1
fi

if [ ! -d "node_modules/next" ]; then
  echo -e "${RED}✗ Next.js not installed${NC}"
  exit 1
fi

echo -e "${GREEN}✓ Dependencies installed${NC}"
echo ""

# ============================================================================
# STEP 4: Verify TypeScript compilation
# ============================================================================

echo -e "${YELLOW}[4/8] Verifying TypeScript...${NC}"

if ! npx tsc --noEmit > /tmp/quicksell_tsc.log 2>&1; then
  echo -e "${RED}✗ TypeScript errors found${NC}"
  cat /tmp/quicksell_tsc.log | sed 's/^/    /'
  exit 1
fi

echo -e "${GREEN}✓ TypeScript verified${NC}"
echo ""

# ============================================================================
# STEP 5: Setup PostgreSQL database
# ============================================================================

echo -e "${YELLOW}[5/8] Setting up PostgreSQL database...${NC}"

# Check if PostgreSQL is installed
if ! command -v psql &> /dev/null; then
  echo -e "${RED}✗ PostgreSQL is not installed${NC}"
  echo "  Install with: sudo apt install postgresql postgresql-contrib"
  exit 1
fi

# Check if PostgreSQL is running
if ! sudo systemctl is-active --quiet postgresql; then
  echo -e "${YELLOW}  Starting PostgreSQL...${NC}"
  sudo systemctl start postgresql
fi

# Create database and user
sudo -u postgres psql << PSQL_EOF > /dev/null 2>&1 || true
DROP DATABASE IF EXISTS $DB_NAME;
DROP USER IF EXISTS $DB_USER;
CREATE USER $DB_USER WITH PASSWORD '$DB_PASSWORD';
CREATE DATABASE $DB_NAME OWNER $DB_USER;
GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;
PSQL_EOF

# Build DATABASE_URL
DATABASE_URL="postgresql://$DB_USER:$DB_PASSWORD@$DB_HOST:$DB_PORT/$DB_NAME"

echo -e "${GREEN}✓ Database created${NC}"
echo "  Database: $DB_NAME"
echo "  User: $DB_USER"
echo ""

# ============================================================================
# STEP 6: Generate secrets and create .env file
# ============================================================================

echo -e "${YELLOW}[6/8] Generating secrets and creating .env...${NC}"

# Generate NEXTAUTH_SECRET
NEXTAUTH_SECRET=$(openssl rand -base64 32)

cat > "$APP_DIR/.env" << ENV_EOF
# Database (auto-generated)
DATABASE_URL="$DATABASE_URL"

# NextAuth (auto-generated)
NEXTAUTH_SECRET="$NEXTAUTH_SECRET"
NEXTAUTH_URL="https://quicksell.monster"

# Resend Email (UPDATE WITH YOUR KEY)
RESEND_API_KEY="re_your_resend_api_key"
EMAIL_FROM="noreply@captiongenius.com"

# OpenAI (UPDATE WITH YOUR KEY)
OPENAI_API_KEY="sk_your_openai_api_key"

# Stripe (UPDATE WITH YOUR KEYS)
STRIPE_SECRET_KEY="sk_live_your_stripe_secret_key"
STRIPE_PUBLISHABLE_KEY="pk_live_your_stripe_publishable_key"
STRIPE_WEBHOOK_SECRET="whsec_your_webhook_secret"

# Stripe Price IDs (UPDATE WITH YOUR PRICE IDS)
STRIPE_BASIC_PRICE_ID="price_basic_monthly"
STRIPE_BUILDER_PRICE_ID="price_builder_monthly"
STRIPE_PREMIUM_PRICE_ID="price_premium_monthly"

# App URL
NEXT_PUBLIC_APP_URL="https://quicksell.monster"
ENV_EOF

echo -e "${YELLOW}  ⚠ .env created with auto-generated values${NC}"
echo ""
echo -e "${YELLOW}  Update these values in: $APP_DIR/.env${NC}"
echo ""
echo "    nano $APP_DIR/.env"
echo ""
echo -e "${YELLOW}  Required updates:${NC}"
echo "    - RESEND_API_KEY (from Resend)"
echo "    - OPENAI_API_KEY (from OpenAI)"
echo "    - STRIPE_SECRET_KEY"
echo "    - STRIPE_PUBLISHABLE_KEY"
echo "    - STRIPE_WEBHOOK_SECRET"
echo "    - STRIPE_*_PRICE_ID (your Stripe price IDs)"
echo ""

read -p "Press ENTER once you've updated .env with your API keys (or Ctrl+C to abort): "

# Verify critical values are updated
if grep -q "your_" "$APP_DIR/.env"; then
  echo -e "${RED}✗ .env still contains placeholder values - please update it${NC}"
  exit 1
fi

echo -e "${GREEN}✓ .env configured${NC}"
echo ""

# ============================================================================
# STEP 7: Build application
# ============================================================================

echo -e "${YELLOW}[7/8] Building application...${NC}"

npm run build > /tmp/quicksell_build.log 2>&1

if [ $? -ne 0 ]; then
  echo -e "${RED}✗ Build failed${NC}"
  tail -30 /tmp/quicksell_build.log | sed 's/^/    /'
  exit 1
fi

if [ ! -f "$APP_DIR/.next/BUILD_ID" ]; then
  echo -e "${RED}✗ Build incomplete - BUILD_ID missing${NC}"
  exit 1
fi

echo -e "${GREEN}✓ Application built${NC}"
echo ""

# ============================================================================
# STEP 8: Start with PM2
# ============================================================================

echo -e "${YELLOW}[8/8] Starting with PM2...${NC}"

cd "$APP_DIR"

pm2 start "npm start" \
  --name "$APP_NAME" \
  --cwd "$APP_DIR" \
  --append-log \
  --no-autorestart > /dev/null 2>&1

if [ $? -ne 0 ]; then
  echo -e "${RED}✗ Failed to start with PM2${NC}"
  exit 1
fi

sleep 3

if ! pm2 list | grep -q "$APP_NAME.*online"; then
  echo -e "${RED}✗ App crashed after starting${NC}"
  pm2 logs "$APP_NAME" --lines 20
  exit 1
fi

echo -e "${GREEN}✓ Application started${NC}"
echo ""

# ============================================================================
# DEPLOYMENT COMPLETE
# ============================================================================

echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}✓ DEPLOYMENT COMPLETE${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
echo ""

echo "Access your app:"
echo -e "  ${GREEN}https://quicksell.monster${NC}"
echo ""

echo "Status:"
pm2 list
echo ""

echo "Logs:"
pm2 logs "$APP_NAME" --lines 20
echo ""

echo "Database credentials:"
echo "  Host: $DB_HOST"
echo "  Port: $DB_PORT"
echo "  Database: $DB_NAME"
echo "  User: $DB_USER"
echo ""

echo "Useful commands:"
echo "  View logs:      pm2 logs $APP_NAME"
echo "  Monitor:        pm2 monit"
echo "  Restart:        pm2 restart $APP_NAME"
echo "  Stop:           pm2 stop $APP_NAME"
echo ""

echo "Nginx logs:"
echo "  Access: tail -f /var/log/nginx/quicksell.monster.access.log"
echo "  Errors: tail -f /var/log/nginx/quicksell.monster.error.log"
echo ""

echo "Database access:"
echo "  psql -U $DB_USER -h $DB_HOST -d $DB_NAME"
echo ""
