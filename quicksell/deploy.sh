#!/bin/bash

#######################################
# QuickSell Deployment Script
# This script deploys QuickSell from GitHub to your server
#######################################

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
REPO_URL="https://github.com/kingdavsol/Traffic2umarketing.git"
BRANCH="${1:-claude/fix-vps-deployment-013taUqhcCQwKrcLj98DZWZ1}"
DEPLOY_DIR="/var/www/quicksell.monster"
APP_DIR="${DEPLOY_DIR}/quicksell"

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}QuickSell Deployment Script${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

# Function to print step
print_step() {
    echo -e "${YELLOW}▶ $1${NC}"
}

# Function to print success
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

# Function to print error
print_error() {
    echo -e "${RED}✗ $1${NC}"
}

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    print_error "Please run as root (use sudo)"
    exit 1
fi

print_step "Step 1: Creating deployment directory..."
mkdir -p "${DEPLOY_DIR}"
cd "${DEPLOY_DIR}"
print_success "Directory created"

print_step "Step 2: Cloning/updating repository..."
if [ -d ".git" ]; then
    print_step "Repository exists, pulling latest changes..."
    git fetch origin "${BRANCH}"
    git checkout "${BRANCH}"
    git pull origin "${BRANCH}"
else
    print_step "Cloning repository..."
    git clone --branch "${BRANCH}" "${REPO_URL}" .
fi
print_success "Repository updated"

# Navigate to quicksell directory
if [ ! -d "quicksell" ]; then
    print_error "quicksell directory not found in repository"
    exit 1
fi

cd quicksell
print_success "In quicksell directory"

print_step "Step 3: Checking .env file..."
if [ ! -f ".env" ]; then
    print_error ".env file not found!"
    echo ""
    echo "Please create a .env file with your configuration."
    echo "You can copy .env.example and fill in your values:"
    echo "  cp .env.example .env"
    echo "  nano .env"
    echo ""
    exit 1
fi

# Check required environment variables
print_step "Validating required environment variables..."
REQUIRED_VARS=("DB_PASSWORD" "REDIS_PASSWORD" "JWT_SECRET")
MISSING_VARS=()

for var in "${REQUIRED_VARS[@]}"; do
    if ! grep -q "^${var}=" .env || grep -q "^${var}=$" .env || grep -q "^${var}=your-" .env; then
        MISSING_VARS+=("$var")
    fi
done

if [ ${#MISSING_VARS[@]} -gt 0 ]; then
    print_error "Missing or invalid environment variables:"
    for var in "${MISSING_VARS[@]}"; do
        echo "  - $var"
    done
    echo ""
    echo "Please edit .env and set proper values for these variables."
    exit 1
fi

print_success "Environment variables validated"

print_step "Step 4: Checking Docker..."
if ! command -v docker &> /dev/null; then
    print_error "Docker is not installed"
    exit 1
fi

if ! docker compose version &> /dev/null; then
    print_error "Docker Compose V2 is not installed"
    exit 1
fi
print_success "Docker is ready"

print_step "Step 5: Stopping existing containers..."
docker compose -f docker-compose.prod.yml down || true
print_success "Containers stopped"

print_step "Step 6: Checking if database reset is needed..."
read -p "Do you want to reset the database? This will delete all data! (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    print_step "Removing old database volume..."
    docker volume rm quicksellmonster_postgres_data || true
    print_success "Database volume removed"
else
    print_step "Keeping existing database..."
fi

print_step "Step 7: Building containers..."
docker compose -f docker-compose.prod.yml build --no-cache
print_success "Containers built"

print_step "Step 8: Starting services..."
docker compose -f docker-compose.prod.yml up -d
print_success "Services started"

print_step "Step 9: Waiting for services to be healthy..."
sleep 10

# Check service status
print_step "Checking service status..."
docker compose -f docker-compose.prod.yml ps

print_step "Checking backend logs..."
docker compose -f docker-compose.prod.yml logs --tail=20 backend

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Deployment Complete!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo "Application URLs:"
echo "  Frontend: http://$(hostname -I | awk '{print $1}'):8080"
echo "  Backend:  http://$(hostname -I | awk '{print $1}'):5000"
echo "  Health:   http://$(hostname -I | awk '{print $1}'):5000/health"
echo ""
echo "To view logs:"
echo "  docker compose -f docker-compose.prod.yml logs -f"
echo ""
echo "To check status:"
echo "  docker compose -f docker-compose.prod.yml ps"
echo ""
