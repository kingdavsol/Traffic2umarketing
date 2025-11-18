# PlayStore Apps - Deployment & Testing Guide

**Generated:** 2025-11-18
**Version:** 1.0
**Project:** Google Play Store 20-App Initiative
**Status:** Ready for Beta Testing & Production Deployment

---

## Table of Contents

1. [Quick Start](#quick-start)
2. [Local Development Setup](#local-development-setup)
3. [Environment Configuration](#environment-configuration)
4. [Testing Strategy](#testing-strategy)
5. [Deployment Checklist](#deployment-checklist)
6. [Production Monitoring](#production-monitoring)
7. [Troubleshooting](#troubleshooting)
8. [Support & Resources](#support-and-resources)

---

## Quick Start

### Prerequisites
- Node.js 18+
- npm 9+
- MongoDB Atlas account (or local MongoDB)
- Google Cloud Console access (for OAuth)
- Stripe account (for payments)
- Google AdMob account (for ads)

### 30-Second Setup (Single App)
```bash
# 1. Navigate to app directory
cd PlayStoreApps/apps/1-senior-fitness

# 2. Install dependencies
npm install

# 3. Create .env.local file (see Environment Configuration section)
cp .env.example .env.local
# Edit .env.local with your credentials

# 4. Run development server
npm run dev

# 5. Open http://localhost:3000
```

### Full Project Setup (All Apps)
```bash
# Run this from PlayStoreApps/apps directory
for app in */; do
  cd "$app"
  npm install
  cd ..
done
```

---

## Local Development Setup

### Step 1: Clone Repository & Switch to Development Branch
```bash
# Already completed - you're on claude/find-app-niches-01Y7N59Xi5k3YjrikXAVTGU7
git status

# If not on correct branch:
git fetch origin claude/find-app-niches-01Y7N59Xi5k3YjrikXAVTGU7
git checkout claude/find-app-niches-01Y7N59Xi5k3YjrikXAVTGU7
```

### Step 2: Install Node Modules (Choose One)

**Option A: Install All Apps at Once**
```bash
cd PlayStoreApps/apps
for dir in */; do
  echo "Installing dependencies for $dir"
  (cd "$dir" && npm install)
done
```

**Option B: Install Individual App**
```bash
cd PlayStoreApps/apps/1-senior-fitness
npm install
```

### Step 3: Database Setup

#### MongoDB Atlas (Recommended for Production)
1. Go to https://www.mongodb.com/cloud/atlas
2. Create new project: "PlayStore Apps"
3. Create database cluster: "production"
4. Create database user with strong password
5. Whitelist IP: 0.0.0.0/0 (or restrict to your IP)
6. Copy connection string: `mongodb+srv://user:pass@cluster.mongodb.net/appname?retryWrites=true&w=majority`

#### Local MongoDB (For Development)
```bash
# Install MongoDB Community Edition
# macOS:
brew tap mongodb/brew
brew install mongodb-community

# Start MongoDB service
brew services start mongodb-community

# Connection string: mongodb://localhost:27017/app-name
```

### Step 4: Google OAuth Setup

1. Go to https://console.cloud.google.com
2. Create new project: "PlayStore Apps"
3. Enable Google+ API
4. Create OAuth 2.0 credentials:
   - Application type: Web application
   - Authorized redirect URIs:
     - http://localhost:3000/api/auth/callback/google
     - https://app-domain.com/api/auth/callback/google (production)
5. Copy Client ID and Client Secret

---

## Environment Configuration

### Create .env.local for Each App

**Location:** `PlayStoreApps/apps/[app-name]/.env.local`

**Template:**
```bash
# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-generate-with-openssl

# Database
DATABASE_URL=mongodb+srv://user:password@cluster.mongodb.net/app-name?retryWrites=true&w=majority

# Google OAuth
GOOGLE_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_SECRET=your-google-client-secret

# Stripe (Optional)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...

# Google AdMob
NEXT_PUBLIC_ADMOB_APP_ID=ca-app-pub-xxxxxxxxxxxxxxxx

# Email Service (for verification emails)
RESEND_API_KEY=re_xxxxxxxxxxxxx

# Environment
NODE_ENV=development
```

### Generate NEXTAUTH_SECRET
```bash
openssl rand -base64 32
```

### Environment Variables Per App

Each app uses the same structure but with different:
- Database name (e.g., `app-name` in DATABASE_URL)
- App-specific configuration in dashboard

**Example:**
```bash
# App #1 - Senior Fitness
DATABASE_URL=mongodb+srv://user:pass@cluster.mongodb.net/senior-fitness?...

# App #2 - Gig Worker Finance
DATABASE_URL=mongodb+srv://user:pass@cluster.mongodb.net/gig-worker-finance?...
```

---

## Testing Strategy

### Phase 1: Unit Testing (Local Development)

#### Manual Testing Checklist
```
Authentication & User Management
[ ] Sign up with email works
[ ] Email verification email sent and link works
[ ] Google OAuth login works
[ ] User profile loads correctly
[ ] Password reset functionality works
[ ] Logout functionality works
[ ] Protected routes redirect unauthenticated users

Dashboard & Features
[ ] Dashboard loads without errors
[ ] All dashboard cards display correctly
[ ] Tab navigation works smoothly
[ ] Mobile responsive design verified (375px, 768px, 1024px)
[ ] All interactive elements respond to clicks
[ ] Data persists after page refresh

Database Operations
[ ] User data saves to database
[ ] Profile updates sync correctly
[ ] Feature-specific data saves properly (e.g., habits, schedules)
[ ] Database queries execute within 200ms

Ads & Payments
[ ] Ad banners display for free-tier users
[ ] Premium users don't see ads
[ ] Stripe payment page opens correctly
[ ] Premium features unlock after purchase
[ ] Ad impressions log correctly

Gamification
[ ] Points accumulate correctly
[ ] Badges unlock at correct thresholds
[ ] Leaderboards populate correctly
[ ] Streaks increment and reset properly
```

### Phase 2: Browser Testing

**Test Across Browsers:**
```
Chrome (Latest)
Firefox (Latest)
Safari (Latest)
Edge (Latest)
Mobile Safari (iOS 14+)
Chrome Mobile (Android 10+)
```

**Test Different Screen Sizes:**
```
Mobile: 320px, 375px, 425px
Tablet: 768px, 1024px
Desktop: 1280px, 1920px, 2560px
```

### Phase 3: Performance Testing

```bash
# Run Next.js build analysis
npm run build
npm run analyze

# Check bundle size (should be < 500KB)
npm run bundle-size

# Lighthouse audit
npm run lighthouse
```

**Performance Targets:**
- First Contentful Paint (FCP): < 1.5s
- Largest Contentful Paint (LCP): < 2.5s
- Cumulative Layout Shift (CLS): < 0.1
- Time to Interactive (TTI): < 3.5s

### Phase 4: Security Testing

```
[ ] No hardcoded secrets in code
[ ] HTTPS enforced in production
[ ] API keys rotated
[ ] CORS properly configured
[ ] Rate limiting implemented
[ ] Input validation on all forms
[ ] SQL injection tested and prevented
[ ] XSS protection verified
[ ] CSRF tokens present
```

### Running Automated Tests
```bash
# Jest unit tests (when implemented)
npm test

# E2E tests with Playwright (when implemented)
npm run test:e2e

# TypeScript type checking
npm run type-check

# Linting
npm run lint
```

---

## Deployment Checklist

### Pre-Deployment (48 hours before)

- [ ] All tests passing locally
- [ ] Code review completed (GitHub PR)
- [ ] Performance benchmarks meet targets
- [ ] Security audit passed
- [ ] All environment variables documented
- [ ] Database backups created
- [ ] Rollback plan documented

### Production Environment Setup

#### Option A: Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy from app directory
cd PlayStoreApps/apps/1-senior-fitness
vercel deploy --prod

# Configure environment variables in Vercel dashboard
# Set NEXTAUTH_URL to production domain
# Set all other env vars from .env.local
```

#### Option B: Self-Hosted (AWS, GCP, DigitalOcean)

```bash
# Build optimized production bundle
npm run build

# Start production server
npm run start

# Or use PM2 for process management
pm2 start "npm start" --name "senior-fitness"
pm2 save
pm2 startup
```

#### Option C: Docker Deployment

```bash
# Build Docker image (if Dockerfile exists)
docker build -t senior-fitness:latest .

# Run container
docker run -p 3000:3000 \
  -e DATABASE_URL=... \
  -e NEXTAUTH_SECRET=... \
  senior-fitness:latest

# Deploy to container registry (ECR, DockerHub)
docker push your-registry/senior-fitness:latest
```

### Environment Variables - Production

**Critical:** Use production values only
```bash
# Update .env.production or platform dashboard
NEXTAUTH_URL=https://app.example.com
NEXTAUTH_SECRET=[production-secret-32-chars]
DATABASE_URL=mongodb+srv://prod-user:strong-pass@prod-cluster...
NODE_ENV=production
```

### Database Migration (If Needed)

```bash
# Backup current database
mongodump --uri="mongodb+srv://..." --out=./backup

# Run migrations
npm run migrate

# Verify data integrity
npm run verify-migration
```

### Deployment Command Summary

```bash
# 1. Build
npm run build

# 2. Test build locally
npm run start

# 3. Deploy to staging
vercel deploy --env staging

# 4. Test in staging
# [Run full testing suite against staging URL]

# 5. Deploy to production
vercel deploy --prod

# 6. Verify production deployment
# [Check app is live and responsive]

# 7. Monitor for errors
# [Check error tracking service]
```

---

## Production Monitoring

### Key Metrics to Track

**Application Health:**
```
- Daily Active Users (DAU)
- Monthly Active Users (MAU)
- Error rate (target: < 0.1%)
- Response time (target: < 500ms)
- Database query time (target: < 100ms)
- Uptime (target: > 99.9%)
```

**Business Metrics:**
```
- Sign-up rate
- Premium conversion rate
- Feature usage by type
- Ad impressions and CTR
- Payment success rate
- Churn rate
- User retention (Day 1, Day 7, Day 30)
```

### Error Tracking Setup (Sentry)

```bash
# Install Sentry SDK
npm install @sentry/react @sentry/nextjs

# Initialize in next.config.js (see app config files)
# Sentry DSN: https://[key]@[organization].ingest.sentry.io/[projectid]

# Test error tracking
throw new Error("Test error");
```

### Logging Strategy

**Log Levels:**
```
ERROR: Authentication failures, database errors, crashes
WARN: Deprecated features, slow queries, unusual patterns
INFO: User actions, feature usage, transaction completions
DEBUG: Detailed execution flow, variable values
```

**Log Storage:**
```
CloudWatch (AWS)
Stackdriver (GCP)
Datadog (3rd party)
ELK Stack (self-hosted)
```

### Database Monitoring

```bash
# MongoDB Atlas Charts
# 1. Go to MongoDB Atlas dashboard
# 2. Create charts for:
#    - Query performance
#    - Storage growth
#    - Connection count
#    - Slow queries

# Query performance
db.currentOp()  # Current operations
db.collection.aggregate([{$explain: "executionStats"}])
```

### Uptime Monitoring

```
- Use UptimeRobot.com for 5-minute checks
- Configure PagerDuty for alerts
- Set up Slack notifications for critical errors
- Daily health check emails
```

---

## Troubleshooting

### Build Errors

**Error: "Cannot find module '@next/core-web-vitals'"**
```bash
# Solution: Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

**Error: "Module not found: 'next/image'"**
```bash
# Solution: Update Next.js
npm install next@latest
```

### Runtime Errors

**Error: "MongoDB connection failed"**
```
1. Check DATABASE_URL is correct
2. Verify IP whitelist in MongoDB Atlas
3. Check database user permissions
4. Verify cluster is running
5. Review connection string format
```

**Error: "NextAuth callbacks failed"**
```
1. Verify NEXTAUTH_SECRET is set
2. Check NEXTAUTH_URL matches environment
3. Verify Google credentials are correct
4. Check database connection in NextAuth config
5. Review NextAuth logs: next-auth.log
```

**Error: "Stripe payment failed"**
```
1. Verify Stripe keys are correct
2. Check Stripe account is activated
3. Verify payment intent creation logic
4. Test with Stripe test cards
5. Review Stripe dashboard for errors
```

### Performance Issues

**Slow Dashboard Load (> 2 seconds)**
```
1. Check database query performance
2. Enable Redis caching
3. Verify Next.js image optimization
4. Review bundle size: npm run analyze
5. Check for N+1 queries in API routes
```

**High CPU Usage**
```
1. Check for memory leaks: node --inspect
2. Profile with Node profiler
3. Review event listener cleanup
4. Check background job frequency
5. Monitor process: pm2 monit
```

**Database Performance**
```
# Check slow queries
db.setProfilingLevel(1, { slowms: 100 })

# View profiling data
db.system.profile.find({}) sorted by ts: -1

# Create indexes
db.users.createIndex({ email: 1 })
db.users.createIndex({ createdAt: -1 })
```

---

## Support & Resources

### Documentation
- **Project Overview:** `/HANDOVER_DOCUMENTS.md`
- **App-Specific Guides:** `/apps/[app-name]/HANDOVER_[date].md`
- **Technical Stack:** See individual app README files
- **API Documentation:** Generated by JSDoc in `/api` routes

### Quick Links
- **Next.js Docs:** https://nextjs.org/docs
- **MongoDB Reference:** https://docs.mongodb.com
- **NextAuth.js:** https://next-auth.js.org
- **Stripe API:** https://stripe.com/docs/api
- **Google AdMob:** https://admob.google.com/home
- **Tailwind CSS:** https://tailwindcss.com/docs

### Git Workflow

**Daily Development:**
```bash
# Create feature branch
git checkout -b feature/my-feature

# Make changes and commit
git add .
git commit -m "feat: Add new feature"

# Push to branch
git push origin feature/my-feature

# Create PR for review
# [URL will display after push]

# Merge to main after approval
git checkout main
git merge feature/my-feature
git push origin main
```

**Deployment Branch:**
```
- Development: claude/find-app-niches-01Y7N59Xi5k3YjrikXAVTGU7
- Staging: staging (when created)
- Production: main (when ready)
```

### Issue Reporting

**Format:**
```
Title: [App#] [Component] Issue description
Description:
- Steps to reproduce
- Expected behavior
- Actual behavior
- Screenshots/videos
- Environment: Browser, OS, App version
```

### Contact & Escalation

**For Technical Issues:**
1. Check Troubleshooting section above
2. Review app-specific HANDOVER document
3. Create GitHub issue with details
4. Contact technical lead (contact: [TBD])

**For Production Incidents:**
1. Page on-call engineer
2. Check error tracking (Sentry)
3. Review application logs
4. Implement rollback if necessary

---

## Deployment Status Summary

### Current Setup
- ✅ All 20 apps ready for deployment
- ✅ Code pushed to branch: `claude/find-app-niches-01Y7N59Xi5k3YjrikXAVTGU7`
- ✅ Handover documentation complete
- ✅ Environment variable templates created
- ✅ Database schema documented

### Next Steps
1. **Setup Phase** (Week 1): Configure production databases and OAuth
2. **Testing Phase** (Week 2): Beta testing with internal team
3. **Optimization Phase** (Week 3): Performance tuning and security audit
4. **Launch Phase** (Week 4): Production deployment and monitoring setup

### Timeline
- **Week 1:** Environment setup, database configuration
- **Week 2:** Full testing suite execution
- **Week 3:** Performance optimization, security hardening
- **Week 4:** Production launch, monitoring verification

---

## Sign-Off

**Document:** Deployment & Testing Guide v1.0
**Generated:** 2025-11-18
**All Apps Status:** Ready for Beta Testing
**Next Review Date:** Upon completion of beta testing phase

**For questions or clarifications, refer to individual app HANDOVER documents or contact the technical lead.**

---
