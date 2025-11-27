# QuickSell Deployment Runbook
## Production Deployment Procedures

**Version**: 1.0
**Last Updated**: November 2025
**Status**: Ready for Production

---

## Table of Contents

1. [Pre-Deployment Checklist](#pre-deployment-checklist)
2. [Backend Deployment](#backend-deployment)
3. [Frontend Deployment](#frontend-deployment)
4. [Mobile Deployment](#mobile-deployment)
5. [Database Migrations](#database-migrations)
6. [Verification & Smoke Tests](#verification--smoke-tests)
7. [Monitoring Setup](#monitoring-setup)
8. [Rollback Procedures](#rollback-procedures)
9. [Post-Deployment](#post-deployment)
10. [Troubleshooting](#troubleshooting)

---

## Pre-Deployment Checklist

**24 Hours Before Deployment**:
- [ ] All code merged and committed to main branch
- [ ] Tag release: `git tag -a v1.0.0 -m "Production release"`
- [ ] Push tag: `git push origin v1.0.0`
- [ ] All tests passing (CI/CD green)
- [ ] Code review approved
- [ ] Security audit passed
- [ ] Performance testing passed
- [ ] Database backup created and tested
- [ ] Rollback plan documented and tested
- [ ] Team notified of deployment window
- [ ] Support team briefed
- [ ] Communication template prepared
- [ ] Monitoring dashboards created
- [ ] Error tracking configured
- [ ] Runbook reviewed by team

**2 Hours Before Deployment**:
- [ ] Final staging environment test
- [ ] Verify all secrets/environment variables configured
- [ ] Verify database replication working
- [ ] Verify Redis cluster healthy
- [ ] Verify CDN configuration
- [ ] Check server resources (CPU, memory, disk)
- [ ] Verify backup systems operational
- [ ] Test health check endpoints
- [ ] Team in communication channel

---

## Backend Deployment

### Option 1: Docker Deployment (VPS)

#### Step 1: Build Docker Image

```bash
# On local machine or CI/CD server
cd backend

# Build image
docker build -t quicksell-backend:v1.0.0 -f Dockerfile .

# Tag for registry
docker tag quicksell-backend:v1.0.0 registry.example.com/quicksell-backend:v1.0.0
docker tag quicksell-backend:v1.0.0 registry.example.com/quicksell-backend:latest

# Login to registry
docker login registry.example.com

# Push to registry
docker push registry.example.com/quicksell-backend:v1.0.0
docker push registry.example.com/quicksell-backend:latest
```

**Verification**:
```bash
# Verify image built successfully
docker images | grep quicksell-backend

# Verify image pushed
docker pull registry.example.com/quicksell-backend:v1.0.0
docker image inspect registry.example.com/quicksell-backend:v1.0.0
```

**Status**: [ ] Pass [ ] Fail

#### Step 2: SSH to Production Server

```bash
# SSH to API server
ssh -i ~/.ssh/quicksell-prod.pem ubuntu@api.quicksell.monster

# Verify current deployment
docker ps | grep quicksell-backend
docker logs quicksell-backend --tail 20
```

**Status**: [ ] Pass [ ] Fail

#### Step 3: Pull Latest Image

```bash
# Login to registry
docker login registry.example.com

# Pull latest image
docker pull registry.example.com/quicksell-backend:v1.0.0

# Verify image pulled
docker images | grep quicksell-backend
```

**Status**: [ ] Pass [ ] Fail

#### Step 4: Update Container

```bash
# Stop current container (graceful shutdown)
docker stop quicksell-backend

# Verify stopped
docker ps | grep quicksell-backend  # Should return nothing

# Wait for container to fully stop
sleep 10

# Remove old container
docker rm quicksell-backend

# Run new container
docker run -d \
  --name quicksell-backend \
  -p 5000:5000 \
  --env-file /etc/quicksell/.env \
  --restart unless-stopped \
  -v /data/quicksell/logs:/app/logs \
  registry.example.com/quicksell-backend:v1.0.0

# Verify container running
docker ps | grep quicksell-backend
docker logs quicksell-backend --tail 50
```

**Status**: [ ] Pass [ ] Fail

#### Step 5: Health Check

```bash
# Wait for container to be ready
sleep 5

# Health check
curl http://localhost:5000/health

# Expected response:
# {"status":"healthy","timestamp":"...","environment":"production"}

# Verify API responding
curl -s http://localhost:5000/health | jq .
```

**Status**: [ ] Pass [ ] Fail

### Option 2: Kubernetes Deployment

#### Step 1: Build & Push Image (same as above)

#### Step 2: Update Deployment

```bash
# Set kubectl context
kubectl config use-context quicksell-prod

# Update deployment with new image
kubectl set image deployment/quicksell-backend \
  quicksell-backend=registry.example.com/quicksell-backend:v1.0.0 \
  -n quicksell

# Monitor rollout
kubectl rollout status deployment/quicksell-backend -n quicksell

# Watch pods
kubectl get pods -n quicksell -w
```

**Status**: [ ] Pass [ ] Fail

#### Step 3: Verify Deployment

```bash
# Check current deployment
kubectl get deployment quicksell-backend -n quicksell

# Check pod status
kubectl get pods -n quicksell | grep quicksell-backend

# Check recent events
kubectl describe deployment quicksell-backend -n quicksell

# Check logs from new pod
kubectl logs -l app=quicksell-backend -n quicksell --tail=50

# Health check via proxy
kubectl port-forward svc/quicksell-backend 5000:5000 -n quicksell &
curl http://localhost:5000/health
kill %1
```

**Status**: [ ] Pass [ ] Fail

---

## Frontend Deployment

### Option 1: Static S3 + CloudFront

#### Step 1: Build Frontend

```bash
cd frontend

# Install dependencies
npm ci

# Build production bundle
npm run build

# Verify build succeeded
ls -la build/
du -sh build/
```

**Status**: [ ] Pass [ ] Fail

#### Step 2: Upload to S3

```bash
# Set AWS credentials
export AWS_PROFILE=quicksell-prod

# Sync to S3 with cache busting
aws s3 sync build/ s3://quicksell-web/ \
  --delete \
  --cache-control "public, max-age=3600" \
  --exclude "*.html" \
  --metadata "Cache-Control=no-cache" \
  --region us-east-1

# Upload HTML files with no-cache
aws s3 cp build/index.html s3://quicksell-web/index.html \
  --cache-control "no-cache, no-store, must-revalidate" \
  --content-type text/html \
  --region us-east-1

# Verify upload
aws s3 ls s3://quicksell-web/ --recursive | wc -l
```

**Status**: [ ] Pass [ ] Fail

#### Step 3: Invalidate CloudFront Cache

```bash
# Get distribution ID
DISTRIBUTION_ID=$(aws cloudfront list-distributions \
  --query 'DistributionList.Items[?DomainName==`quicksell-web.s3.amazonaws.com`].Id' \
  --output text)

echo "CloudFront Distribution ID: $DISTRIBUTION_ID"

# Create invalidation
aws cloudfront create-invalidation \
  --distribution-id $DISTRIBUTION_ID \
  --paths "/*" \
  --region us-east-1

# Wait for invalidation (optional)
# aws cloudfront wait distribution-deployed \
#  --id $DISTRIBUTION_ID \
#  --region us-east-1
```

**Status**: [ ] Pass [ ] Fail

### Option 2: Docker + Nginx

#### Step 1: Build Docker Image

```bash
# Build image
docker build -t quicksell-frontend:v1.0.0 -f frontend/Dockerfile ./frontend

# Tag and push (same as backend)
docker tag quicksell-frontend:v1.0.0 registry.example.com/quicksell-frontend:v1.0.0
docker push registry.example.com/quicksell-frontend:v1.0.0
```

#### Step 2: Deploy Container

```bash
# SSH to web server
ssh -i ~/.ssh/quicksell-prod.pem ubuntu@quicksell.monster

# Pull and run
docker pull registry.example.com/quicksell-frontend:v1.0.0

docker stop quicksell-frontend
docker rm quicksell-frontend

docker run -d \
  --name quicksell-frontend \
  -p 80:80 \
  -p 443:443 \
  -v /etc/letsencrypt:/etc/letsencrypt:ro \
  -v /var/log/nginx:/var/log/nginx \
  --restart unless-stopped \
  registry.example.com/quicksell-frontend:v1.0.0

# Verify
docker ps | grep quicksell-frontend
curl https://quicksell.monster/ -I
```

**Status**: [ ] Pass [ ] Fail

---

## Database Migrations

### Step 1: Backup Database

```bash
# SSH to database server or via remote connection
ssh -i ~/.ssh/quicksell-prod.pem ubuntu@db.quicksell.monster

# Create backup
BACKUP_FILE="quicksell_backup_$(date +%Y%m%d_%H%M%S).sql"
pg_dump -h localhost -U postgres -d quicksell -Fc > /backups/$BACKUP_FILE

# Verify backup
ls -lh /backups/$BACKUP_FILE
pg_restore --list /backups/$BACKUP_FILE | head -20

# Upload to S3
aws s3 cp /backups/$BACKUP_FILE s3://quicksell-backups/$BACKUP_FILE

echo "Backup created: $BACKUP_FILE"
```

**Status**: [ ] Pass [ ] Fail

### Step 2: Run Migrations

```bash
# Option 1: Via Docker container
docker run --rm \
  --env-file /etc/quicksell/.env \
  -v /app/migrations:/migrations \
  registry.example.com/quicksell-backend:v1.0.0 \
  npm run migrate

# Option 2: Via kubectl
kubectl run migration-job \
  --image=registry.example.com/quicksell-backend:v1.0.0 \
  --env-file=/etc/quicksell/.env \
  --command npm -- run migrate \
  -n quicksell

# Verify migrations ran
docker logs quicksell-backend | grep -i "migration\|migrated"
```

**Status**: [ ] Pass [ ] Fail

### Step 3: Verify Database

```bash
# Connect to database
psql -h db.quicksell.monster -U postgres -d quicksell

# Check tables
\dt

# Check schema version
SELECT * FROM schema_migrations ORDER BY id DESC LIMIT 5;

# Verify constraints
\d marketplace_accounts

# Exit
\q
```

**Status**: [ ] Pass [ ] Fail

### Step 4: Seed Data (if needed)

```bash
# Only run if launching with demo data
docker run --rm \
  --env-file /etc/quicksell/.env \
  registry.example.com/quicksell-backend:v1.0.0 \
  npm run seed

# Verify seed data
psql -h db.quicksell.monster -U postgres -d quicksell -c "SELECT COUNT(*) FROM users;"
```

**Status**: [ ] Pass [ ] Fail

---

## Verification & Smoke Tests

### Backend Verification

```bash
# Health check
curl https://api.quicksell.monster/health
# Expected: {"status":"healthy",...}

# Check version
curl https://api.quicksell.monster/api/v1/version
# Expected: {"version":"1.0.0",...}

# Auth endpoint
curl -X POST https://api.quicksell.monster/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test"}'
# Expected: Error or token (depending on user existence)

# Verify no error logs
curl https://api.quicksell.monster/api/v1/health/status
# Expected: All services green
```

**Status**: [ ] Pass [ ] Fail

### Frontend Verification

```bash
# Test homepage loads
curl -I https://quicksell.monster/
# Expected: 200 OK

# Test with curl
curl https://quicksell.monster/ | grep -i "quicksell" | head -5

# Test API connectivity from frontend
# Navigate to https://quicksell.monster in browser
# Open DevTools Console
# Should see no CORS errors
# Check Network tab - API calls should show 200
```

**Status**: [ ] Pass [ ] Fail

### Smoke Test Checklist

Execute these tests to verify production readiness:

- [ ] **Login**: Can login with test account
- [ ] **Dashboard**: Dashboard loads and displays stats
- [ ] **Create Listing**: Can create a test listing
- [ ] **View Listings**: Can see listing in /listings
- [ ] **Gamification**: Points visible and updating
- [ ] **Marketplace Signup**: Can connect marketplace
- [ ] **Mobile**: App loads (iOS/Android)
- [ ] **Email**: Verification email received
- [ ] **API**: All critical API endpoints responding
- [ ] **Database**: Data persisting correctly
- [ ] **Cache**: Redis responding
- [ ] **Storage**: S3 uploads working
- [ ] **Payments**: Stripe in test mode
- [ ] **Analytics**: Tracking working
- [ ] **Monitoring**: Alerts configured

All should show: ✅ Pass

---

## Monitoring Setup

### Application Monitoring

```bash
# Verify Sentry is configured
curl https://sentry.example.com/api/0/organizations/quicksell/

# Check error tracking active
# Visit app - should report errors to Sentry

# Set up alerts
# Email: dev-alerts@quicksell.com
# Slack: #production-alerts
# PagerDuty: if critical
```

**Status**: [ ] Pass [ ] Fail

### Infrastructure Monitoring

```bash
# Check CloudWatch alarms
aws cloudwatch describe-alarms \
  --alarm-names quicksell-api-errors \
  --region us-east-1

# Verify DataDog agents running
# On servers: sudo service datadog-agent status
# Check dashboard: https://app.datadoghq.com

# CPU usage: Target < 70%
# Memory: Target < 80%
# Disk: Target < 90%
# Network: Monitor for anomalies
```

**Status**: [ ] Pass [ ] Fail

### Log Aggregation

```bash
# Verify logs flowing
# CloudWatch: https://console.aws.amazon.com/cloudwatch
# ELK Stack: https://logs.quicksell.monster
# Check recent logs:
#   - API errors
#   - Database connections
#   - Payment processing
#   - Marketplace API calls
```

**Status**: [ ] Pass [ ] Fail

### Performance Monitoring

```bash
# Check API response times
# Target: p95 < 500ms
# Check from DataDog/New Relic

# Check database query times
# Target: avg < 100ms

# Check frontend metrics (if using analytics)
# Page load time: Target < 3s
# Core Web Vitals: Pass
```

**Status**: [ ] Pass [ ] Fail

---

## Rollback Procedures

### Full Rollback (If Critical Issue)

#### Step 1: Notify Team

```
URGENT: Critical issue detected in production
Initiating FULL ROLLBACK
Channel: #production-alerts
Slack: @all

Issue: [DESCRIBE]
Severity: CRITICAL
Rollback Time: ~15 minutes
```

**Status**: [ ] Complete

#### Step 2: Rollback Backend

```bash
# Option 1: Docker (replace with previous version)
docker stop quicksell-backend
docker rm quicksell-backend

# Pull previous version
docker pull registry.example.com/quicksell-backend:v0.9.0

# Run previous version
docker run -d \
  --name quicksell-backend \
  -p 5000:5000 \
  --env-file /etc/quicksell/.env \
  --restart unless-stopped \
  registry.example.com/quicksell-backend:v0.9.0

# Verify
curl http://localhost:5000/health
```

**Status**: [ ] Complete

#### Step 3: Rollback Frontend

```bash
# Option 1: S3/CloudFront (restore from S3 versioning)
aws s3 cp s3://quicksell-web-backups/v0.9.0/index.html \
  s3://quicksell-web/index.html

# Invalidate CloudFront cache
aws cloudfront create-invalidation --distribution-id XXXXX --paths "/*"

# Verify
curl https://quicksell.monster/ -I
```

**Status**: [ ] Complete

#### Step 4: Database Rollback

```bash
# Only if migrations caused issue
# Restore from backup
pg_restore -h localhost -U postgres -d quicksell \
  /backups/quicksell_backup_<TIMESTAMP>.sql

# Or run rollback migration
docker run --rm \
  --env-file /etc/quicksell/.env \
  registry.example.com/quicksell-backend:v0.9.0 \
  npm run migrate:rollback
```

**Status**: [ ] Complete (only if needed)

#### Step 5: Verify System

```bash
# Health checks
curl https://api.quicksell.monster/health
curl https://quicksell.monster/ -I

# Check logs for errors
docker logs quicksell-backend | tail -50

# Manual smoke tests
# [ ] Can login
# [ ] Can create listing
# [ ] Can connect marketplace
# [ ] Data displaying correctly
```

**Status**: [ ] Complete

#### Step 6: Post-Rollback

```bash
# Notify team
Slack: #production-alerts
"ROLLBACK COMPLETE: System restored to v0.9.0"

# Create incident report
Document:
- What went wrong
- How we detected it
- Time to rollback
- Impact duration
- Lessons learned

# Schedule post-mortem
Meeting time: [24 hours after rollback]
Attendees: Engineering, Product, DevOps

# Fix root cause
Create issue in GitHub for investigation
```

**Status**: [ ] Complete

### Partial Rollback (Feature Specific)

```bash
# If only one feature is broken:

# Option 1: Feature flag (if implemented)
- Disable problematic feature flag
- Users won't see new code
- Fix issue in background
- Re-enable flag

# Option 2: API endpoint rollback
# Serve older code path for specific endpoints
# Redirect requests to v0.9.0 API while keeping v1.0.0 for other features

# Option 3: Database rollback only
# Run migration rollback
# Keep application code
# Users unaffected
```

---

## Post-Deployment

### Immediate (0-30 min)

- [ ] Verify all smoke tests passing
- [ ] Check error rates (target: < 0.1%)
- [ ] Monitor CPU/memory/disk usage
- [ ] Check database connections healthy
- [ ] Verify user signups working
- [ ] Check payment processing
- [ ] Review logs for errors
- [ ] Monitor API response times

**Status**: [ ] Pass [ ] Fail

### Short-term (30 min - 4 hours)

- [ ] Monitor new user signups
- [ ] Check premium conversion rate
- [ ] Track error logs for patterns
- [ ] Monitor database query times
- [ ] Check for performance degradation
- [ ] Review support tickets
- [ ] Monitor marketplace API integrations
- [ ] Verify email notifications

**Status**: [ ] Pass [ ] Fail

### Medium-term (4-24 hours)

- [ ] Review daily metrics:
  - Signups: Target 100+/hour
  - Premium conversions: Target 3-5%
  - Error rate: Target < 0.1%
  - API latency: Target p95 < 500ms
- [ ] User feedback review
- [ ] Any critical bugs reported
- [ ] Performance optimization
- [ ] Documentation updates

**Status**: [ ] Pass [ ] Fail

### Deployment Sign-off

```
Deployment Summary:

Version: v1.0.0
Date: [DATE]
Time: [START TIME] - [END TIME]
Duration: [MINUTES]
Status: ✅ SUCCESS / ❌ ROLLED BACK

Backend: ✅ Deployed
Frontend: ✅ Deployed
Database: ✅ Migrated
Monitoring: ✅ Configured

Issues Found: [NUMBER]
Critical Issues: [NUMBER]
Downtime: [MINUTES]

Approved By:
- DevOps Lead: ________________
- Engineering Lead: ________________
- Product Manager: ________________

Date: ________________
```

---

## Troubleshooting

### Backend Pod Won't Start

```bash
# Check pod events
kubectl describe pod quicksell-backend-xxxxx -n quicksell

# Check logs
kubectl logs quicksell-backend-xxxxx -n quicksell

# Common issues:
# 1. Image pull failed
#    → Check registry credentials
#    → Check image exists in registry

# 2. Insufficient resources
#    → Check node resources: kubectl top nodes
#    → Increase pod requests

# 3. Health check failing
#    → Check /health endpoint
#    → Verify database connectivity

# 4. Environment variables missing
#    → Check ConfigMap: kubectl get configmap -n quicksell
#    → Check Secrets: kubectl get secrets -n quicksell
```

### Database Connectivity Error

```bash
# Test database connection
psql -h db.quicksell.monster -U postgres -d quicksell -c "SELECT 1;"

# If fails, check:
1. Network connectivity: ping db.quicksell.monster
2. Firewall rules: Check security groups
3. Database running: sudo systemctl status postgresql
4. Credentials: Verify in .env file
5. SSL certificates: Check if SSL required
```

### Frontend Not Loading

```bash
# Check S3 bucket
aws s3 ls s3://quicksell-web/

# Check CloudFront distribution
aws cloudfront get-distribution-config --id XXXXX

# Check DNS
nslookup quicksell.monster
nslookup api.quicksell.monster

# Check HTTPS certificate
openssl s_client -connect quicksell.monster:443

# Clear cache if needed
aws cloudfront create-invalidation --distribution-id XXXXX --paths "/*"
```

### API Timeouts

```bash
# Check database query times
# Database slow log: /var/log/postgres/postgresql.log

# Check connection pool
# Verify: SELECT count(*) FROM pg_stat_activity;

# Check if hitting limits
# Database max_connections setting
# Connection pool size

# Solutions:
1. Add database indexes
2. Optimize slow queries
3. Increase connection pool
4. Scale database vertically
```

### High Memory Usage

```bash
# Check which process
docker stats quicksell-backend

# Check logs for memory leaks
docker logs quicksell-backend | grep -i "memory\|OOM"

# Solutions:
1. Restart service (temporary)
2. Analyze code for memory leaks
3. Increase memory allocation
4. Profile with memory profiler
```

---

## Emergency Contacts

**On-Call Schedule**:
- Monday-Friday: Engineering Lead
- Weekends: Rotating engineer
- Critical: Full team

**Contact Methods**:
1. Slack: #production-alerts (immediate)
2. Phone: [Phone number]
3. PagerDuty: [if critical]

**Escalation**:
1. 30 min of no response → escalate
2. Critical issue → CEO notified
3. Widespread outage → PR communication

---

## Version Control

| Version | Date | Changes | Deployed By |
|---------|------|---------|-------------|
| 1.0.0 | 2025-11-18 | Initial production release | [NAME] |
| | | | |

---

**Document Owner**: DevOps Lead
**Last Updated**: November 2025
**Next Review**: After first production deployment

