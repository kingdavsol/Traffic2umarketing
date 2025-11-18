# Car Maintenance Hub - Deployment & Getting Started Guide

## Table of Contents
1. [Local Development Setup](#local-development-setup)
2. [Database Configuration](#database-configuration)
3. [Frontend Setup](#frontend-setup)
4. [Backend Setup](#backend-setup)
5. [Environment Configuration](#environment-configuration)
6. [Running the Application](#running-the-application)
7. [Testing](#testing)
8. [Deployment](#deployment)
9. [Monitoring & Maintenance](#monitoring--maintenance)

---

## Local Development Setup

### Prerequisites
- Node.js 18+
- npm 8+
- PostgreSQL 12+
- Git

### Initial Setup

```bash
# Clone the repository
git clone <your-repo-url>
cd Traffic2umarketing

# Install root dependencies
npm install

# Install workspace dependencies
npm install --workspaces

# Copy environment template
cp .env.example .env
```

---

## Database Configuration

### Create PostgreSQL Database

```bash
# Create database (if not exists)
createdb car_maintenance_hub

# Or using psql
psql -U postgres
> CREATE DATABASE car_maintenance_hub;
```

### Set DATABASE_URL in .env

```env
DATABASE_URL="postgresql://username:password@localhost:5432/car_maintenance_hub"
```

### Run Migrations

```bash
# Generate Prisma client
cd packages/database
npm run prisma:generate

# Run migrations
npm run db:push

# Seed initial data
npm run db:seed
```

---

## Frontend Setup

### Web App (Next.js)

```bash
cd apps/web

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local

# Required variables:
# NEXT_PUBLIC_API_URL=http://localhost:3001
# NEXT_PUBLIC_STRIPE_KEY=pk_test_...
```

### Mobile App (React Native Expo)

```bash
cd apps/mobile

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env

# Required variables:
# EXPO_PUBLIC_API_URL=http://localhost:3001
```

---

## Backend Setup

### API Server (Express)

```bash
cd apps/api

# Install dependencies
npm install

# Environment variables (see .env.example)
cp .env.example .env
```

### Key Environment Variables

```env
# Server
NODE_ENV=development
PORT=3001
APP_URL=http://localhost:3000

# Database
DATABASE_URL=postgresql://user:password@localhost/car_maintenance_hub

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_PRICE_PRO=price_...
STRIPE_PRICE_BUSINESS=price_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Email
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password

# Affiliate
AMAZON_ASSOCIATE_ID=your-id
EBAY_PARTNER_ID=your-id
ROCKAUTO_AFFILIATE_ID=your-id
PARTSGEEK_AFFILIATE_ID=your-id

# Features
FEATURE_PRICE_ALERTS=true
FEATURE_SUBSCRIPTIONS=true
FEATURE_AFFILIATE_LINKS=true
FEATURE_ADMIN_DASHBOARD=true

# Price Alerts
PRICE_ALERT_CHECK_INTERVAL=60  # minutes
PRICE_ALERT_CRON_SCHEDULE="0 * * * *"  # every hour
```

---

## Running the Application

### Development Mode

```bash
# Start all services concurrently
npm run dev:api      # API on port 3001
npm run dev:web      # Web on port 3000
npm run dev:mobile   # Mobile on Expo

# Or start individual services
cd apps/api && npm run dev
cd apps/web && npm run dev
cd apps/mobile && npm run dev
```

### Production Build

```bash
# Build all
npm run build:api
npm run build:web

# Start production server
cd apps/api && npm run start
cd apps/web && npm run start
```

---

## Testing

### Unit Tests

```bash
# Run all tests
npm test

# Run specific service tests
cd apps/api
npm test -- src/services/__tests__/affiliate.service.test.ts

# Run with coverage
npm test -- --coverage
```

### Integration Tests (Stripe Sandbox)

```bash
# Test subscription creation
curl -X POST http://localhost:3001/api/subscriptions/create \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "planId": "pro",
    "paymentMethodId": "pm_card_visa"
  }'

# Test price alerts
curl -X POST http://localhost:3001/api/price-alerts/create \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "partId": "oil-filter-123",
    "targetPrice": 1500,
    "emailAlert": true,
    "smsAlert": false
  }'
```

### Manual Testing Checklist

- [ ] User registration and login
- [ ] Create vehicle profile
- [ ] View common problems for vehicle
- [ ] Create price alert
- [ ] Receive price alert notification
- [ ] Create user guide
- [ ] Guide approval workflow
- [ ] Subscribe to Pro plan
- [ ] View affiliate earnings
- [ ] Rate guide and earn points
- [ ] Redeem points for discount

---

## Deployment

### Production Checklist

- [ ] Database backed up
- [ ] Environment variables configured
- [ ] SSL/TLS certificates installed
- [ ] Stripe live keys configured
- [ ] Email service configured (Gmail/SendGrid)
- [ ] Admin users created
- [ ] Monitoring set up (Sentry, etc.)
- [ ] CDN configured (CloudFlare, etc.)
- [ ] Database indexes created
- [ ] Cron jobs verified

### Deploy to Cloud

#### Heroku Deployment

```bash
# Create Heroku app
heroku create car-maintenance-hub-api
heroku create car-maintenance-hub-web

# Set environment variables
heroku config:set DATABASE_URL=...
heroku config:set STRIPE_SECRET_KEY=...
# ... set all required variables

# Deploy
git push heroku main
heroku run "npm run db:push"
heroku run "npm run db:seed"
```

#### Docker Deployment

```bash
# Build images
docker build -t car-hub-api -f apps/api/Dockerfile .
docker build -t car-hub-web -f apps/web/Dockerfile .

# Run containers
docker run -p 3001:3001 car-hub-api
docker run -p 3000:3000 car-hub-web
```

#### AWS Deployment

```bash
# Push to ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <account-id>.dkr.ecr.us-east-1.amazonaws.com

docker tag car-hub-api <account-id>.dkr.ecr.us-east-1.amazonaws.com/car-hub-api:latest
docker push <account-id>.dkr.ecr.us-east-1.amazonaws.com/car-hub-api:latest

# Deploy with ECS/Fargate
aws ecs create-service ...
```

### Database Migration (Production)

```bash
# Create migration
cd packages/database
npm run db:migrate

# Review migration file before applying
cat prisma/migrations/[timestamp]_init/migration.sql

# Apply migration
npm run db:push
```

---

## Monitoring & Maintenance

### Health Checks

```bash
# API health
curl http://localhost:3001/health

# Admin dashboard
curl http://localhost:3001/api/admin/health
```

### Database Maintenance

```bash
# Backup database
pg_dump car_maintenance_hub > backup.sql

# Restore from backup
psql car_maintenance_hub < backup.sql

# Check database size
psql -c "SELECT pg_size_pretty(pg_database_size('car_maintenance_hub'));"
```

### Log Monitoring

```bash
# View API logs
tail -f logs/api.log

# Filter for errors
grep "ERROR" logs/api.log

# Monitor cron job
grep "price alert" logs/cron.log
```

### Performance Optimization

```bash
# Create indexes for common queries
CREATE INDEX idx_guides_vehicle ON user_guides(vehicle_make, vehicle_model);
CREATE INDEX idx_price_alerts_active ON price_alerts(is_active);
CREATE INDEX idx_subscriptions_user ON subscriptions(user_id);
CREATE INDEX idx_affiliate_clicks_date ON affiliate_clicks(created_at);
```

---

## Troubleshooting

### Database Connection Issues

```bash
# Test connection
psql $DATABASE_URL -c "SELECT 1;"

# Check Prisma schema
npm run prisma:validate

# Reset database (development only)
npm run db:reset
```

### Email Sending Issues

```bash
# Test Gmail setup
# 1. Enable 2FA
# 2. Create app password
# 3. Set EMAIL_PASSWORD to app password
# 4. Verify EMAIL_USER

# Test email endpoint
curl -X POST http://localhost:3001/api/email/test \
  -H "Content-Type: application/json" \
  -d '{"to": "test@example.com"}'
```

### Stripe Integration Issues

```bash
# Test Stripe connection
curl https://api.stripe.com/v1/customers \
  -u sk_test_...: \
  --limit 1

# Check webhook signing
# 1. Verify webhook secret is correct
# 2. Test webhook delivery in Stripe Dashboard
# 3. Check API logs for errors
```

### Cron Job Not Running

```bash
# Check if feature is enabled
echo $FEATURE_PRICE_ALERTS  # Should be "true"

# Check cron logs
grep "price alert" logs/app.log

# Manual trigger for testing
curl -X POST http://localhost:3001/api/price-alerts/check-all \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

---

## API Documentation

### Authentication
All protected endpoints require JWT token in Authorization header:
```
Authorization: Bearer <jwt-token>
```

### Key Endpoints

#### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user

#### Subscriptions
- `GET /api/subscriptions/plans` - Get available plans
- `POST /api/subscriptions/create` - Create subscription
- `GET /api/subscriptions/current` - Get current subscription
- `POST /api/subscriptions/upgrade` - Upgrade plan

#### Price Alerts
- `POST /api/price-alerts/create` - Create price alert
- `GET /api/price-alerts` - Get user's alerts
- `DELETE /api/price-alerts/:id` - Delete alert
- `POST /api/price-alerts/check-all` - Trigger alert check

#### User Guides
- `POST /api/guides/create` - Create guide
- `GET /api/guides/vehicle/:make/:model` - Get guides for vehicle
- `GET /api/guides/:id` - Get specific guide
- `POST /api/guides/:id/rate` - Rate guide

#### Affiliate
- `GET /api/affiliates/link` - Generate affiliate link
- `GET /api/affiliates/earnings` - Get user earnings
- `POST /api/affiliates/conversion` - Record conversion

#### Admin
- `GET /api/admin/guides/pending` - Get pending guides
- `POST /api/admin/guides/:id/approve` - Approve guide
- `GET /api/admin/analytics/overview` - Platform metrics
- `GET /api/admin/analytics/revenue` - Revenue metrics

---

## Support & Resources

- **Documentation**: See `/docs` directory
- **Issue Tracker**: GitHub Issues
- **API Status**: http://status.carmaintenancehub.com
- **Community**: Discord/Slack channel

---

**Last Updated**: November 18, 2024
**Version**: 1.0.0
