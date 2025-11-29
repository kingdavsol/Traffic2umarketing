#!/bin/bash

#######################################
# QuickSell Monitoring & Diagnostics Script
# Run this on the VPS to get comprehensive status information
#######################################

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

APP_DIR="/var/www/quicksell.monster/quicksell"

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}QuickSell Deployment Monitor${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Check if running from correct directory
if [ ! -f "docker-compose.prod.yml" ]; then
    if [ -d "$APP_DIR" ]; then
        cd "$APP_DIR"
    else
        echo -e "${RED}Error: Cannot find QuickSell directory${NC}"
        exit 1
    fi
fi

print_section() {
    echo ""
    echo -e "${YELLOW}▶ $1${NC}"
    echo "----------------------------------------"
}

# 1. Container Status
print_section "1. CONTAINER STATUS"
docker compose -f docker-compose.prod.yml ps

# 2. Service Health
print_section "2. SERVICE HEALTH CHECKS"
echo -n "Backend health: "
if curl -f -s http://localhost:5000/health > /dev/null 2>&1; then
    echo -e "${GREEN}✓ OK${NC}"
    curl -s http://localhost:5000/health | jq . 2>/dev/null || curl -s http://localhost:5000/health
else
    echo -e "${RED}✗ FAILED${NC}"
fi

echo -n "Frontend reachable: "
if curl -f -s http://localhost:8080 > /dev/null 2>&1; then
    echo -e "${GREEN}✓ OK${NC}"
else
    echo -e "${RED}✗ FAILED${NC}"
fi

echo -n "Database container: "
if docker compose -f docker-compose.prod.yml exec -T postgres pg_isready -U postgres > /dev/null 2>&1; then
    echo -e "${GREEN}✓ OK${NC}"
else
    echo -e "${RED}✗ FAILED${NC}"
fi

echo -n "Redis container: "
if docker compose -f docker-compose.prod.yml exec -T redis redis-cli ping > /dev/null 2>&1; then
    echo -e "${GREEN}✓ OK${NC}"
else
    echo -e "${RED}✗ FAILED${NC}"
fi

# 3. Recent Backend Logs
print_section "3. BACKEND LOGS (Last 30 lines)"
docker compose -f docker-compose.prod.yml logs --tail=30 backend

# 4. Recent Frontend Logs
print_section "4. FRONTEND LOGS (Last 20 lines)"
docker compose -f docker-compose.prod.yml logs --tail=20 frontend

# 5. Database Connection Test
print_section "5. DATABASE CONNECTION TEST"
docker compose -f docker-compose.prod.yml exec -T postgres psql -U postgres -d quicksell -c "SELECT COUNT(*) as user_count FROM users;" 2>&1 || echo -e "${RED}Failed to query database${NC}"

# 6. Environment Check
print_section "6. ENVIRONMENT VARIABLES CHECK"
if [ -f ".env" ]; then
    echo -e "${GREEN}✓ .env file exists${NC}"
    echo "Checking critical variables:"

    for var in DB_HOST DB_PASSWORD REDIS_HOST REDIS_PASSWORD JWT_SECRET; do
        if grep -q "^${var}=" .env && ! grep -q "^${var}=$" .env && ! grep -q "^${var}=your-" .env; then
            echo -e "  ${GREEN}✓${NC} $var is set"
        else
            echo -e "  ${RED}✗${NC} $var is missing or invalid"
        fi
    done
else
    echo -e "${RED}✗ .env file not found!${NC}"
fi

# 7. Network Status
print_section "7. NETWORK STATUS"
echo "Docker networks:"
docker network ls | grep quicksell

echo ""
echo "Container IPs:"
docker compose -f docker-compose.prod.yml ps -q | xargs -I {} docker inspect {} --format='{{.Name}}: {{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}'

# 8. Disk Space
print_section "8. DISK SPACE"
df -h | grep -E '(Filesystem|/$|/var)'

# 9. API Endpoint Tests
print_section "9. API ENDPOINT TESTS"
echo -n "POST /api/v1/auth/register (should return 400 with no data): "
REGISTER_TEST=$(curl -s -w "\n%{http_code}" -X POST http://localhost:5000/api/v1/auth/register \
    -H "Content-Type: application/json" \
    -d '{}' 2>&1)

HTTP_CODE=$(echo "$REGISTER_TEST" | tail -1)
if [ "$HTTP_CODE" = "400" ] || [ "$HTTP_CODE" = "422" ]; then
    echo -e "${GREEN}✓ Endpoint exists (HTTP $HTTP_CODE)${NC}"
else
    echo -e "${RED}✗ Failed (HTTP $HTTP_CODE)${NC}"
    echo "Response: $(echo "$REGISTER_TEST" | head -n -1)"
fi

echo -n "GET /api/v1/health: "
HEALTH_TEST=$(curl -s -w "\n%{http_code}" http://localhost:5000/api/v1/health 2>&1)
HTTP_CODE=$(echo "$HEALTH_TEST" | tail -1)
if [ "$HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}✓ OK (HTTP $HTTP_CODE)${NC}"
else
    echo -e "${RED}✗ Failed (HTTP $HTTP_CODE)${NC}"
fi

# 10. Recent Git Info
print_section "10. GIT REPOSITORY INFO"
echo "Current branch: $(git branch --show-current)"
echo "Latest commit: $(git log -1 --oneline)"
echo "Remote URL: $(git config --get remote.origin.url)"

# 11. Container Resource Usage
print_section "11. CONTAINER RESOURCE USAGE"
docker stats --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}" $(docker compose -f docker-compose.prod.yml ps -q)

# 12. Follow Logs Option
echo ""
echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Monitoring Complete${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""
echo "To follow logs in real-time, run:"
echo "  docker compose -f docker-compose.prod.yml logs -f"
echo ""
echo "To follow only backend logs:"
echo "  docker compose -f docker-compose.prod.yml logs -f backend"
echo ""
echo "To restart services:"
echo "  docker compose -f docker-compose.prod.yml restart"
echo ""
