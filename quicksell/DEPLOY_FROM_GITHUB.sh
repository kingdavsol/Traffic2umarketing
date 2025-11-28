#!/bin/bash

################################################################################
# QUICKSELL - GitHub to Production Deployment Script
#
# This script deploys QuickSell from GitHub to a VPS server
#
# Usage: sudo bash DEPLOY_FROM_GITHUB.sh [branch-name]
# Default branch: claude/fix-vps-deployment-013taUqhcCQwKrcLj98DZWZ1
################################################################################

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration
REPO_URL="https://github.com/kingdavsol/Traffic2umarketing.git"
BRANCH="${1:-claude/fix-vps-deployment-013taUqhcCQwKrcLj98DZWZ1}"
DEPLOY_DIR="/var/www/quicksell.monster"
TEMP_DIR="/tmp/quicksell-deploy-$$"
APP_NAME="quicksell"

echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}    QuickSell - GitHub Deployment Script${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
echo ""
echo -e "${YELLOW}Repository:${NC} $REPO_URL"
echo -e "${YELLOW}Branch:${NC} $BRANCH"
echo -e "${YELLOW}Deploy Directory:${NC} $DEPLOY_DIR"
echo ""

# Check if running as root
if [ "$EUID" -ne 0 ]; then
  echo -e "${RED}✗ Please run as root (sudo)${NC}"
  exit 1
fi

echo -e "${BLUE}[1/9] Checking prerequisites...${NC}"

# Check for required tools
REQUIRED_TOOLS=("git" "docker")
for tool in "${REQUIRED_TOOLS[@]}"; do
  if ! command -v $tool &> /dev/null; then
    echo -e "${RED}✗ $tool is not installed${NC}"
    echo "Please install $tool first"
    exit 1
  fi
  echo -e "${GREEN}  ✓ $tool found${NC}"
done

# Check Docker Compose V2
if ! docker compose version &> /dev/null; then
  echo -e "${RED}✗ Docker Compose V2 is not available${NC}"
  echo "Please install Docker 20.10+ which includes Compose V2"
  exit 1
fi
echo -e "${GREEN}  ✓ Docker Compose V2 found${NC}"

echo ""
echo -e "${BLUE}[2/9] Creating deployment directory...${NC}"

# Create deployment directory if it doesn't exist
mkdir -p "$DEPLOY_DIR"

echo -e "${GREEN}  ✓ Directory ready: $DEPLOY_DIR${NC}"

echo ""
echo -e "${BLUE}[3/9] Cloning/updating repository...${NC}"

# Clone to temp directory
if [ -d "$TEMP_DIR" ]; then
  rm -rf "$TEMP_DIR"
fi

echo "  Cloning repository to temporary location..."
git clone --branch "$BRANCH" --depth 1 "$REPO_URL" "$TEMP_DIR"

echo "  Copying QuickSell files to deployment directory..."
# Copy the quicksell subdirectory contents to the deploy directory
rsync -av --delete "$TEMP_DIR/quicksell/" "$DEPLOY_DIR/"

# Clean up temp directory
rm -rf "$TEMP_DIR"

cd "$DEPLOY_DIR"

echo -e "${GREEN}  ✓ Repository ready${NC}"

echo ""
echo -e "${BLUE}[4/9] Setting up environment variables...${NC}"

if [ ! -f ".env" ]; then
  if [ -f ".env.example" ]; then
    echo "  Creating .env from .env.example..."
    cp .env.example .env
    echo -e "${YELLOW}  ⚠ IMPORTANT: Edit .env file with your actual credentials!${NC}"
    echo -e "${YELLOW}  Required variables: DB_PASSWORD, REDIS_PASSWORD, JWT_SECRET, OPENAI_API_KEY, STRIPE_SECRET_KEY${NC}"

    read -p "  Press Enter to edit .env now, or Ctrl+C to cancel and edit manually..."
    ${EDITOR:-nano} .env
  else
    echo -e "${RED}  ✗ .env.example not found${NC}"
    exit 1
  fi
else
  echo -e "${GREEN}  ✓ .env file already exists${NC}"
fi

echo ""
echo -e "${BLUE}[5/9] Stopping existing containers...${NC}"

docker compose -f docker-compose.prod.yml down 2>/dev/null || echo "  No existing containers to stop"

echo ""
echo -e "${BLUE}[6/9] Building Docker images...${NC}"

docker compose -f docker-compose.prod.yml build --no-cache

echo -e "${GREEN}  ✓ Docker images built${NC}"

echo ""
echo -e "${BLUE}[7/9] Starting services...${NC}"

docker compose -f docker-compose.prod.yml up -d

echo -e "${GREEN}  ✓ Services started${NC}"

echo ""
echo -e "${BLUE}[8/9] Running database migrations...${NC}"

# Wait for database to be ready
echo "  Waiting for database to be ready..."
sleep 10

# Run migrations
docker compose -f docker-compose.prod.yml exec -T backend npm run migrate || {
  echo -e "${YELLOW}  ⚠ Migration failed or no migrations to run${NC}"
}

echo ""
echo -e "${BLUE}[9/9] Verifying deployment...${NC}"

# Check if containers are running
RUNNING_CONTAINERS=$(docker compose -f docker-compose.prod.yml ps --services --filter "status=running" | wc -l)
TOTAL_CONTAINERS=$(docker compose -f docker-compose.prod.yml ps --services | wc -l)

echo "  Running containers: $RUNNING_CONTAINERS/$TOTAL_CONTAINERS"

if [ "$RUNNING_CONTAINERS" -eq "$TOTAL_CONTAINERS" ]; then
  echo -e "${GREEN}  ✓ All containers are running${NC}"
else
  echo -e "${YELLOW}  ⚠ Some containers are not running${NC}"
  docker compose -f docker-compose.prod.yml ps
fi

# Test backend health
echo "  Testing backend health..."
sleep 5
HEALTH_CHECK=$(curl -s http://localhost:5000/health || echo "failed")

if echo "$HEALTH_CHECK" | grep -q "healthy"; then
  echo -e "${GREEN}  ✓ Backend is healthy${NC}"
else
  echo -e "${RED}  ✗ Backend health check failed${NC}"
  echo "  Response: $HEALTH_CHECK"
fi

echo ""
echo -e "${GREEN}═══════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}✓ DEPLOYMENT COMPLETE!${NC}"
echo -e "${GREEN}═══════════════════════════════════════════════════════${NC}"
echo ""
echo "Application URLs:"
echo -e "  Frontend: ${BLUE}http://localhost${NC} or ${BLUE}http://$(hostname -I | awk '{print $1}')${NC}"
echo -e "  Backend API: ${BLUE}http://localhost:5000${NC}"
echo -e "  Health Check: ${BLUE}http://localhost:5000/health${NC}"
echo ""
echo "Useful commands:"
echo -e "  View logs: ${YELLOW}docker compose -f docker-compose.prod.yml logs -f${NC}"
echo -e "  Stop services: ${YELLOW}docker compose -f docker-compose.prod.yml down${NC}"
echo -e "  Restart services: ${YELLOW}docker compose -f docker-compose.prod.yml restart${NC}"
echo -e "  View running containers: ${YELLOW}docker compose -f docker-compose.prod.yml ps${NC}"
echo ""
echo -e "${YELLOW}⚠ Remember to:${NC}"
echo "  1. Configure your domain DNS to point to this server"
echo "  2. Set up SSL/TLS certificates (use Let's Encrypt)"
echo "  3. Configure Nginx reverse proxy for production"
echo "  4. Set up database backups"
echo "  5. Configure monitoring and alerting"
echo ""
