#!/bin/bash

#######################################
# QuickSell Quick Deploy Script
# Pulls latest changes and rebuilds only what's needed
#######################################

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

BRANCH="${1:-claude/fix-vps-deployment-013taUqhcCQwKrcLj98DZWZ1}"
APP_DIR="/var/www/quicksell.monster/quicksell"

echo -e "${GREEN}Quick Deploy - QuickSell${NC}"
echo ""

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    echo -e "${RED}Please run as root (use sudo)${NC}"
    exit 1
fi

# Navigate to app directory
if [ -d "$APP_DIR" ]; then
    cd "$APP_DIR"
else
    echo -e "${RED}App directory not found: $APP_DIR${NC}"
    echo "Run the full deploy.sh script first"
    exit 1
fi

# Store current commit
BEFORE_COMMIT=$(git rev-parse HEAD)

echo -e "${YELLOW}▶ Pulling latest changes...${NC}"
git fetch origin "$BRANCH"
git checkout "$BRANCH"
git pull origin "$BRANCH"

AFTER_COMMIT=$(git rev-parse HEAD)

if [ "$BEFORE_COMMIT" = "$AFTER_COMMIT" ]; then
    echo -e "${YELLOW}No new changes found${NC}"
    echo ""
    echo "Current commit: $(git log -1 --oneline)"
    echo ""
    read -p "Rebuild anyway? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Deployment cancelled"
        exit 0
    fi
else
    echo -e "${GREEN}✓ New changes pulled${NC}"
    echo "Changes:"
    git log --oneline "$BEFORE_COMMIT..$AFTER_COMMIT"
fi

echo ""
echo -e "${YELLOW}▶ Checking what changed...${NC}"

# Detect what needs rebuilding
REBUILD_BACKEND=false
REBUILD_FRONTEND=false

# Check if backend files changed
if git diff --name-only "$BEFORE_COMMIT" "$AFTER_COMMIT" | grep -q "^quicksell/backend/"; then
    echo "  Backend files changed"
    REBUILD_BACKEND=true
fi

# Check if frontend files changed
if git diff --name-only "$BEFORE_COMMIT" "$AFTER_COMMIT" | grep -q "^quicksell/frontend/"; then
    echo "  Frontend files changed"
    REBUILD_FRONTEND=true
fi

# Check if Docker or env files changed (rebuild everything)
if git diff --name-only "$BEFORE_COMMIT" "$AFTER_COMMIT" | grep -qE "docker-compose|Dockerfile|\.env"; then
    echo "  Docker/config files changed"
    REBUILD_BACKEND=true
    REBUILD_FRONTEND=true
fi

# If no changes detected but user wants to rebuild, rebuild everything
if [ "$REBUILD_BACKEND" = false ] && [ "$REBUILD_FRONTEND" = false ]; then
    echo "  Rebuilding all services..."
    REBUILD_BACKEND=true
    REBUILD_FRONTEND=true
fi

echo ""

# Rebuild and restart services
if [ "$REBUILD_BACKEND" = true ] && [ "$REBUILD_FRONTEND" = true ]; then
    echo -e "${YELLOW}▶ Rebuilding all services...${NC}"
    docker compose -f docker-compose.prod.yml build --no-cache
    docker compose -f docker-compose.prod.yml up -d
elif [ "$REBUILD_BACKEND" = true ]; then
    echo -e "${YELLOW}▶ Rebuilding backend only...${NC}"
    docker compose -f docker-compose.prod.yml build --no-cache backend
    docker compose -f docker-compose.prod.yml up -d backend
elif [ "$REBUILD_FRONTEND" = true ]; then
    echo -e "${YELLOW}▶ Rebuilding frontend only...${NC}"
    docker compose -f docker-compose.prod.yml build --no-cache frontend
    docker compose -f docker-compose.prod.yml up -d frontend
fi

echo ""
echo -e "${YELLOW}▶ Waiting for services...${NC}"
sleep 10

echo ""
echo -e "${YELLOW}▶ Running health checks...${NC}"

# Backend health check
echo -n "Backend health: "
if curl -f -s http://localhost:5000/health > /dev/null 2>&1; then
    echo -e "${GREEN}✓ OK${NC}"
else
    echo -e "${RED}✗ FAILED${NC}"
    echo "Check logs: docker compose -f docker-compose.prod.yml logs backend"
fi

# Frontend health check
echo -n "Frontend: "
if curl -f -s http://localhost:8080 > /dev/null 2>&1; then
    echo -e "${GREEN}✓ OK${NC}"
else
    echo -e "${RED}✗ FAILED${NC}"
    echo "Check logs: docker compose -f docker-compose.prod.yml logs frontend"
fi

# API endpoint test
echo -n "Registration endpoint: "
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST http://localhost:5000/api/v1/auth/register -H "Content-Type: application/json" -d '{}' 2>&1)
HTTP_CODE=$(echo "$RESPONSE" | tail -1)

if [ "$HTTP_CODE" = "400" ] || [ "$HTTP_CODE" = "422" ]; then
    echo -e "${GREEN}✓ OK (HTTP $HTTP_CODE)${NC}"
elif [ "$HTTP_CODE" = "404" ]; then
    echo -e "${RED}✗ 404 NOT FOUND${NC}"
else
    echo -e "${YELLOW}HTTP $HTTP_CODE${NC}"
fi

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Quick Deploy Complete!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo "Deployed commit: $(git log -1 --oneline)"
echo ""
echo "To view logs:"
echo "  docker compose -f docker-compose.prod.yml logs -f"
echo ""
echo "To run full diagnostics:"
echo "  bash monitor.sh"
echo ""
