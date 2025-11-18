# Required Domains & Services for PlayStore Apps Launch

**Document Date:** 2025-11-18
**Status:** Essential Configuration List
**Total Required Services:** 12+ domains

---

## Table of Contents
1. [Critical Services (Required)](#critical-services-required)
2. [Authentication Services](#authentication-services)
3. [Payment Processing](#payment-processing)
4. [Advertising Network](#advertising-network)
5. [Email Services](#email-services)
6. [Hosting & Deployment](#hosting--deployment)
7. [Monitoring & Analytics](#monitoring--analytics)
8. [Development Tools](#development-tools)
9. [Domain Configuration](#domain-configuration)
10. [Accounts Setup Checklist](#accounts-setup-checklist)

---

## Critical Services (Required)

| Service | Domain | Purpose | Status |
|---------|--------|---------|--------|
| MongoDB Atlas | mongodb.com | Database hosting (20 databases, 1 per app) | **REQUIRED** |
| Google Cloud Console | console.cloud.google.com | OAuth configuration & credentials | **REQUIRED** |
| Stripe | stripe.com | Payment processing & subscriptions | **REQUIRED** |
| Google AdMob | admob.google.com | In-app advertising | **REQUIRED** |
| Vercel OR AWS OR GCP | vercel.com / aws.amazon.com / cloud.google.com | App hosting & deployment | **REQUIRED** |

---

## Authentication Services

### Google OAuth Setup
**Domain:** https://console.cloud.google.com

**What You'll Need:**
```
1. Google Cloud Project creation
2. OAuth 2.0 credentials (Web application)
3. Client ID and Client Secret
4. Authorized redirect URIs:
   - http://localhost:3000/api/auth/callback/google (development)
   - https://[app-domain].com/api/auth/callback/google (production)
```

**Apps Affected:** All 20 apps

### Email Verification Service (Resend)
**Domain:** https://resend.com

**What You'll Need:**
```
1. Resend account signup
2. API key for email verification
3. Sender email configuration (no-reply@[domain])
4. Email template setup for verification links
```

**Alternative:** SendGrid (sendgrid.com) or Mailgun (mailgun.com)

**Apps Affected:** All 20 apps (authentication flow)

---

## Payment Processing

### Stripe
**Domain:** https://stripe.com

**What You'll Need:**
```
1. Stripe account creation
2. API Keys:
   - Publishable Key (pk_test_... or pk_live_...)
   - Secret Key (sk_test_... or sk_live_...)
3. Product setup:
   - Premium tier for each app (20 products)
   - Pricing: Recommended $4.99-$9.99/month per app
4. Webhook configuration:
   - Endpoint: https://[app-domain].com/api/webhooks/stripe
   - Events: payment_intent.succeeded, customer.subscription.updated
5. Tax configuration (if applicable)
```

**Webhook URLs (Per App):**
```
App #1:  https://[domain1].com/api/webhooks/stripe
App #2:  https://[domain2].com/api/webhooks/stripe
... (20 total)
```

**Apps Affected:** All 20 apps (premium subscription)

---

## Advertising Network

### Google AdMob
**Domain:** https://admob.google.com

**What You'll Need:**
```
1. Google AdMob account
2. App registration (20 apps):
   - App ID per app (ca-app-pub-xxxxxxxxxxxxxxxx)
3. Ad unit creation per app:
   - Banner ads (320x50, 320x100, 300x250)
   - Interstitial ads (full-screen)
   - Rewarded video ads
   - Native ads (optional)
4. Ad format IDs:
   - ca-app-pub-3940256099942544/6300978111 (test banner)
   - ca-app-pub-3940256099942544/1033173712 (test interstitial)
   - ca-app-pub-3940256099942544/5224354917 (test rewarded)
5. Payment setup (AdSense account linked)
```

**Apps Affected:** All 20 apps (ad integration)

---

## Email Services

### Primary Email Service: Resend
**Domain:** https://resend.com

**Features:**
```
- Email verification and transactional emails
- API-based email sending
- Built-in templates
- Bouncing and complaint handling
- Email analytics
```

### Alternative Options:

**SendGrid**
- Domain: https://sendgrid.com
- Better for high-volume emails
- Drag-and-drop template builder

**Mailgun**
- Domain: https://mailgun.com
- Developer-friendly
- SMTP relay support

**AWS SES (Simple Email Service)**
- Domain: https://console.aws.amazon.com
- Cost-effective at scale
- Requires domain verification

**Apps Affected:** All 20 apps (email verification)

---

## Hosting & Deployment

### Option 1: Vercel (Recommended for Next.js)
**Domain:** https://vercel.com

**Setup:**
```
1. Create Vercel account
2. Connect GitHub repository
3. Configure environment variables per app:
   - DATABASE_URL
   - NEXTAUTH_SECRET
   - GOOGLE_ID / GOOGLE_SECRET
   - STRIPE_SECRET_KEY
   - NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
   - NEXT_PUBLIC_ADMOB_APP_ID
   - RESEND_API_KEY
4. Set up custom domain per app
5. Configure production builds
6. Set up preview deployments for branches
```

**Cost:** Free tier available, Pro tier $20/month per team

### Option 2: AWS
**Domain:** https://aws.amazon.com

**Services Needed:**
```
1. EC2 or App Runner (for hosting)
2. RDS (optional, if not using MongoDB Atlas)
3. CloudFront (CDN for assets)
4. S3 (for static asset storage)
5. Route 53 (DNS management)
6. CloudWatch (monitoring)
7. Certificate Manager (SSL/TLS)
```

**Cost:** Varies, typically $50-200/month per app at scale

### Option 3: Google Cloud Platform (GCP)
**Domain:** https://cloud.google.com

**Services Needed:**
```
1. Cloud Run (container deployment)
2. Cloud SQL (if needed)
3. Cloud Storage (asset storage)
4. Cloud Load Balancing
5. Cloud DNS
6. Cloud Monitoring
```

**Cost:** Free tier available, pay-as-you-go after

### Option 4: DigitalOcean
**Domain:** https://digitalocean.com

**Services Needed:**
```
1. App Platform (managed deployment)
2. Spaces (object storage)
3. Managed Databases (optional)
4. Networking & CDN
```

**Cost:** $5/month starter tier, $12/month standard

---

## Monitoring & Analytics

### Error Tracking: Sentry
**Domain:** https://sentry.io

**Setup:**
```
1. Create Sentry account
2. Create project for each app (or one for all)
3. Configure Sentry DSN per app:
   - https://[key]@[organization].ingest.sentry.io/[projectid]
4. Set up alerts and notifications
5. Configure error grouping rules
```

**Apps Affected:** All 20 apps (recommended for production)

**Cost:** Free tier (5,000 errors/month), paid from $29/month

### Application Analytics: Vercel Analytics / Google Analytics
**Domain:** https://vercel.com (built-in) or https://analytics.google.com

**Setup:**
```
1. Enable Web Analytics in Vercel dashboard
2. Configure Google Analytics 4 (GA4):
   - Measurement ID (G-XXXXXXXXXX)
3. Track user engagement, feature usage, conversion
```

**Apps Affected:** All 20 apps (optional but recommended)

### Database Monitoring: MongoDB Atlas Charts
**Domain:** https://charts.mongodb.com

**Features:**
```
- Query performance visualization
- Storage growth tracking
- Connection monitoring
- Slow query analysis
```

**Apps Affected:** All 20 apps (included with MongoDB Atlas)

---

## Development Tools

### Code Repository: GitHub
**Domain:** https://github.com

**Setup:**
```
1. Repository access for team
2. Branch management:
   - Main branch (production)
   - Staging branch (testing)
   - Development branch: claude/find-app-niches-01Y7N59Xi5k3YjrikXAVTGU7
3. GitHub Actions for CI/CD (optional)
4. Protected branches and review requirements
```

### npm Registry
**Domain:** https://registry.npmjs.org

**Required For:**
```
- Installing dependencies
- Publishing custom packages (optional)
- Security scanning
```

**Note:** Automatically used by npm install

### Node Package Manager
**Domain:** https://npmjs.com

**For:**
```
- Searching packages
- Managing organization packages
- Setting up private packages
```

---

## Domain Configuration

### Custom Domains Per App (Recommended)

Each app should have its own domain for:
- User trust and branding
- Email sender domain verification
- Separate SSL/TLS certificates
- Individual analytics tracking

**Example Structure:**
```
App #1 - Senior Fitness:      https://senior-fitness.example.com
App #2 - Gig Worker Finance:  https://gig-finance.example.com
App #3 - Interview Prep:      https://interview-prep.example.com
... (20 total)
```

### Subdomain Alternative (Single Parent Domain):
```
App #1:   https://app1.example.com
App #2:   https://app2.example.com
... (20 total)

Single parent domain:         https://example.com (dashboard/landing)
```

### Domain Provider Options:
- **GoDaddy:** https://godaddy.com
- **Namecheap:** https://namecheap.com
- **Route 53:** https://console.aws.amazon.com (DNS only)
- **Cloudflare:** https://cloudflare.com (DNS + CDN)
- **Google Domains:** https://domains.google.com

---

## Accounts Setup Checklist

### Phase 1: Authentication & Database (Day 1)
- [ ] Google Cloud Console account created
- [ ] MongoDB Atlas account created
  - [ ] 20 database clusters created (or 1 shared with 20 databases)
  - [ ] Database users configured
  - [ ] Connection strings generated
  - [ ] IP whitelist configured (0.0.0.0/0 or restricted)
- [ ] Google OAuth credentials created
  - [ ] Client ID obtained
  - [ ] Client Secret obtained
  - [ ] Redirect URIs configured

### Phase 2: Payments & Ads (Day 1-2)
- [ ] Stripe account created
  - [ ] API keys obtained
  - [ ] 20 products created (1 per app, optional but recommended)
  - [ ] Webhook URLs configured
  - [ ] Payment testing completed
- [ ] Google AdMob account created
  - [ ] 20 app registrations completed
  - [ ] Ad unit IDs generated
  - [ ] Test ad IDs noted for development

### Phase 3: Email & Communication (Day 2)
- [ ] Resend account created
  - [ ] API key obtained
  - [ ] Sender domain configured
  - [ ] Email templates set up
- [ ] Alternative email service (SendGrid/Mailgun) optional
  - [ ] Account created if needed
  - [ ] API keys obtained

### Phase 4: Hosting & Deployment (Day 2-3)
- [ ] Vercel/AWS/GCP account created
  - [ ] Repository connected
  - [ ] Environment variables configured per app
  - [ ] Build settings configured
  - [ ] Preview/staging environment set up
  - [ ] Production environment configured
- [ ] Custom domains registered
  - [ ] 20 domain names registered or allocated
  - [ ] DNS records created
  - [ ] SSL/TLS certificates requested

### Phase 5: Monitoring & Analytics (Day 3)
- [ ] Sentry account created
  - [ ] Project DSN obtained per app
  - [ ] Alert notifications configured
  - [ ] Team member access granted
- [ ] Google Analytics configured (optional)
  - [ ] GA4 property created
  - [ ] Measurement ID obtained
- [ ] MongoDB Atlas monitoring enabled
  - [ ] Charts created for key metrics
  - [ ] Alerts configured for thresholds

### Phase 6: GitHub & Development (Ongoing)
- [ ] Repository access verified
  - [ ] Team members have clone permissions
  - [ ] Branch protection rules configured
  - [ ] CI/CD pipelines set up (optional)
- [ ] npm registry access (if using private packages)
  - [ ] Authentication tokens configured
  - [ ] Publishing permissions set

---

## Critical Environment Variables Reference

### For Each App (.env.local)
```bash
# Authentication
NEXTAUTH_URL=https://[app-domain].com
NEXTAUTH_SECRET=[32-character-random-string]

# Database
DATABASE_URL=mongodb+srv://user:password@cluster.mongodb.net/[app-name]?retryWrites=true&w=majority

# Google OAuth
GOOGLE_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_SECRET=your-google-client-secret

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_[key]
STRIPE_SECRET_KEY=sk_test_[key]

# Google AdMob
NEXT_PUBLIC_ADMOB_APP_ID=ca-app-pub-xxxxxxxxxxxxxxxx

# Email Service
RESEND_API_KEY=re_[key]

# Sentry (optional)
NEXT_PUBLIC_SENTRY_DSN=https://[key]@[organization].ingest.sentry.io/[projectid]

# Environment
NODE_ENV=production
```

---

## Deployment Checklist - Domains & Services

### Pre-Deployment Verification
- [ ] MongoDB Atlas clusters created and tested
- [ ] Google OAuth credentials working in development
- [ ] Stripe API keys active and tested (with test cards)
- [ ] AdMob app IDs registered
- [ ] Resend email service verified (test email sent)
- [ ] Hosting platform account created and configured
- [ ] Custom domains DNS records created
- [ ] SSL/TLS certificates installed
- [ ] Environment variables set in hosting platform
- [ ] Database backups configured
- [ ] Error tracking (Sentry) initialized
- [ ] Monitoring and alerts configured

### Production Deployment
- [ ] Switch to production API keys (Stripe, Google)
- [ ] Update NEXTAUTH_URL to production domain
- [ ] Verify all environment variables in production
- [ ] Test end-to-end authentication flow
- [ ] Test payment processing with real card (or test mode)
- [ ] Verify email notifications working
- [ ] Check ad display (production ads)
- [ ] Monitor error tracking in real-time
- [ ] Set up on-call alerting

---

## Quick Reference: All Required Domains

```
CRITICAL SERVICES (Must Have):
1. console.cloud.google.com        - Google OAuth setup
2. mongodb.com (Atlas)              - Database hosting
3. stripe.com                       - Payment processing
4. admob.google.com                 - Advertising network
5. vercel.com (or AWS/GCP)         - App hosting

AUTHENTICATION & EMAIL:
6. resend.com                       - Email verification
7. (Alternative: sendgrid.com or mailgun.com)

MONITORING & ANALYTICS:
8. sentry.io                        - Error tracking
9. analytics.google.com             - Analytics (optional)

DEVELOPMENT & REPOSITORY:
10. github.com                      - Code repository
11. npmjs.com                       - Package registry

DOMAIN & DNS:
12. godaddy.com / namecheap.com    - Domain registration
13. cloudflare.com (optional)       - DNS & CDN

TOTAL: 12-13 primary services needed
```

---

## Common Issues & Troubleshooting

### "OAuth redirect URI mismatch"
```
Issue: Your app domain doesn't match Google OAuth config
Fix: Update Google Console with correct NEXTAUTH_URL
```

### "MongoDB connection timeout"
```
Issue: IP not whitelisted in MongoDB Atlas
Fix: Go to Security > Network Access, add 0.0.0.0/0 or your IP
```

### "Stripe webhook not working"
```
Issue: Webhook URL incorrect or not signed with secret
Fix: Verify endpoint URL matches NEXTAUTH_URL/api/webhooks/stripe
```

### "Email verification not sending"
```
Issue: Resend API key invalid or sender email not verified
Fix: Check API key in Resend dashboard, verify sender email
```

### "Ads not displaying"
```
Issue: AdMob app not registered or ad format ID incorrect
Fix: Create app in AdMob console, use test ad IDs in development
```

---

## Summary Table

| Service | Purpose | Cost | Required? |
|---------|---------|------|-----------|
| Google Cloud | OAuth | Free tier | ✅ Yes |
| MongoDB Atlas | Database | Free tier (512MB) | ✅ Yes |
| Stripe | Payments | 2.9% + $0.30 per transaction | ✅ Yes |
| Google AdMob | Ads | Revenue share (70-80%) | ✅ Yes |
| Vercel | Hosting | Free tier | ✅ Yes |
| Resend | Email | Free tier (100/day) | ✅ Yes |
| Sentry | Error Tracking | Free tier (5K errors/mo) | ✅ Recommended |
| Google Analytics | Analytics | Free | Optional |
| Custom Domains | Branding | $10-15/year each | ✅ Recommended |

---

## Next Steps

1. **Week 1:** Set up accounts for services 1-5 (critical)
2. **Week 1:** Configure authentication and database
3. **Week 2:** Set up Stripe and AdMob accounts
4. **Week 2:** Register custom domains and configure DNS
5. **Week 3:** Configure hosting platform with all environments
6. **Week 3:** Set up monitoring and error tracking
7. **Week 4:** Production deployment verification

---

**Document Version:** 1.0
**Last Updated:** 2025-11-18
**For questions:** Refer to individual app HANDOVER documents or DEPLOYMENT_AND_TESTING_GUIDE.md

