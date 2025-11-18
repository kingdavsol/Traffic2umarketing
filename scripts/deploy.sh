#!/bin/bash

# Traffic2u Deployment Script
# Pulls latest code and redeploys all containers

set -e

PROJECT_DIR="/home/traffic2u"
BRANCH="${1:-main}"

echo "============================================"
echo "Traffic2u Deployment Script"
echo "============================================"
echo ""
echo "Deploying from branch: $BRANCH"
echo ""

# Change to project directory
cd "$PROJECT_DIR" || exit 1

# Check if .env file exists
if [ ! -f .env ]; then
    echo "❌ Error: .env file not found!"
    echo "Please create .env from .env.example"
    exit 1
fi

# Pull latest code
echo "[1/5] Pulling latest code from $BRANCH..."
git fetch origin
git checkout $BRANCH
git pull origin $BRANCH

# Install dependencies
echo "[2/5] Installing dependencies..."
npm ci

# Run database migrations
echo "[3/5] Running database migrations..."
npm run db:push

# Build Docker images
echo "[4/5] Building Docker images..."
docker-compose build --no-cache

# Deploy containers
echo "[5/5] Deploying containers..."
docker-compose down --remove-orphans || true
docker-compose up -d

# Wait for services to be healthy
echo ""
echo "Waiting for services to start..."
sleep 10

# Check health
echo "Checking service health..."
docker-compose ps

echo ""
echo "============================================"
echo "✅ Deployment Complete!"
echo "============================================"
echo ""
echo "Services running on:"
echo "  Pet Insurance: https://petcovercompare.com"
echo "  Disability Insurance: https://disabilityquotehub.com"
echo "  Cyber Insurance: https://cybersmallbizcompare.com"
echo "  Travel Insurance: https://travelinsurancecompare.io"
echo "  Umbrella Insurance: https://umbrellainsurancequotes.com"
echo "  Motorcycle Insurance: https://motorcycleinsurancehub.com"
echo "  SR-22 Insurance: https://sr22insurancequick.com"
echo "  Wedding Insurance: https://weddinginsurancecompare.com"
echo "  Drone Insurance: https://droneinsurancecompare.io"
echo "  Landlord Insurance: https://landlordinsurancecompare.com"
echo ""
echo "View logs: docker-compose logs -f"
echo "Stop services: docker-compose down"
echo ""
