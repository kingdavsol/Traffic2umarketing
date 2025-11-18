#!/bin/bash

# ==========================================
# CAR MAINTENANCE HUB - DATABASE SETUP SCRIPT
# ==========================================
# This script sets up the database schema and initial data

set -e  # Exit on error

echo "🚗 Car Maintenance Hub - Database Setup"
echo "========================================"

# Check if .env file exists
if [ ! -f .env ]; then
    echo "❌ Error: .env file not found"
    echo "Please copy .env.example to .env and fill in your values"
    exit 1
fi

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    echo "❌ Error: DATABASE_URL not set in .env file"
    exit 1
fi

echo "📦 Installing dependencies..."
npm install

echo ""
echo "🔄 Generating Prisma client..."
cd packages/database
npm run prisma:generate

echo ""
echo "🗄️ Running database migration..."
npm run db:push

echo ""
echo "🌱 Seeding database with initial data..."
npm run db:seed

echo ""
echo "✅ Database setup complete!"
echo ""
echo "Next steps:"
echo "1. Set up your environment variables (.env)"
echo "2. Configure Stripe webhooks"
echo "3. Start the development server: npm run dev:api"
