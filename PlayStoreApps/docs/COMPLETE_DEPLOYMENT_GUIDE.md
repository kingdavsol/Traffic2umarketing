# Complete Deployment Guide - All 20 Apps

This guide walks through deploying all 20 apps from development to production on Google Play Store.

## Quick Start (30-minute setup)

### Prerequisites
- Node.js 18+
- MongoDB Atlas account (free tier)
- Stripe account (test + live keys)
- Resend account (email service)
- Google OAuth credentials
- Google AdMob account
- Vercel account (recommended)

### 1. Clone & Setup
```bash
git clone https://github.com/[your-org]/PlayStoreApps.git
cd PlayStoreApps
git checkout play-store-apps

# Copy template for new app
cp -r apps/template apps/2-postpartum-fitness
cd apps/2-postpartum-fitness
npm install
cp .env.example .env.local
```

### 2. Configure Environment
Edit `.env.local`:
```
NEXTAUTH_SECRET=$(openssl rand -base64 32)
NEXTAUTH_URL=http://localhost:3000
DATABASE_URL=mongodb+srv://user:pass@cluster/postpartum-fitness
STRIPE_SECRET_KEY=sk_test_xxxxx
STRIPE_PUBLIC_KEY=pk_test_xxxxx
NEXT_PUBLIC_STRIPE_PRODUCT_PREMIUM=price_xxxxx
RESEND_API_KEY=re_xxxxx
GOOGLE_CLIENT_ID=xxxxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=xxxxx
NEXT_PUBLIC_APP_ID=postpartum-fitness
NEXT_PUBLIC_APP_NAME=PostPartum Fitness
```

### 3. Develop Locally
```bash
npm run dev
# Visit http://localhost:3000
```

### 4. Deploy
```bash
# Deploy to Vercel
npm i -g vercel
vercel --prod
```

---

## Detailed Deployment Process

### Phase 1: Local Development (Days 1-2)

#### Step 1: Setup Database
```bash
# Go to https://cloud.mongodb.com
# Create cluster
# Get connection string: mongodb+srv://user:pass@cluster/dbname
# Add to .env.local

# Test connection:
mongo $DATABASE_URL --eval "db.adminCommand('ping')"
```

#### Step 2: Setup Authentication
```bash
# 1. Generate NEXTAUTH_SECRET
openssl rand -base64 32

# 2. Create Google OAuth app
# Go to: https://console.cloud.google.com/apis
# Create OAuth 2.0 Client ID
# Authorized redirect URIs: http://localhost:3000/api/auth/callback/google
# Get Client ID & Secret

# 3. Setup Resend (email)
# Go to: https://resend.com
# Create account, get API key

# Add all to .env.local
```

#### Step 3: Customize App
```bash
# Edit src/pages/index.tsx (landing page)
# Edit src/pages/dashboard.tsx (main app)
# Create components in src/components/[AppName]/
# Add API routes in src/pages/api/
# Add logo to public/logo.svg
```

#### Step 4: Test Locally
```bash
npm run dev

# Test signup flow
# Test login flow
# Test payment (use Stripe test card: 4242 4242 4242 4242)
# Test ads (should show test ads)
# Check responsive design (mobile, tablet, desktop)
```

---

### Phase 2: Production Setup (Days 2-3)

#### Step 1: Setup Production Database
```bash
# In MongoDB Atlas:
# Create production cluster
# Create new database user
# Whitelist all IPs (0.0.0.0/0)
# Get production connection string
# Update .env.production
```

#### Step 2: Setup Stripe (Live)
```bash
# Go to: https://dashboard.stripe.com
# Switch to Live mode
# Get live secret key (sk_live_xxxxx)
# Create "Free" and "Premium" products
# Create price IDs (price_xxxxx)
# Setup webhooks:
# - Endpoint: https://your-app.vercel.app/api/webhooks/stripe
# - Events: customer.subscription.*, charge.*
# Get webhook signing secret
```

#### Step 3: Setup Google AdMob
```bash
# Go to: https://admob.google.com
# Create app
# Create ad units:
# - Banner
# - Interstitial
# - Rewarded
# Copy ad unit IDs to environment

# Test ads with test ad unit IDs first:
# Banner: ca-app-pub-3940256099942544/6300978111
# Interstitial: ca-app-pub-3940256099942544/1033173712
# Rewarded: ca-app-pub-3940256099942544/5224354917
```

#### Step 4: Setup Vercel
```bash
# Go to: https://vercel.com
# Connect GitHub repo
# Configure environment variables:
# - Copy all from .env.production
# - NEXTAUTH_SECRET
# - DATABASE_URL (production)
# - STRIPE_SECRET_KEY (live)
# - All other keys
# Deploy!
```

#### Step 5: Verify Production
```bash
# Visit https://your-app.vercel.app
# Test signup (should receive email from Resend)
# Test login
# Test premium upgrade (use test Stripe card)
# Check ads display
# Check responsive design
```

---

### Phase 3: Google Play Store Submission (Days 3-4)

#### Step 1: Create App Listings
```bash
# For each app:
# 1. Go to Google Play Console
# 2. Create new app
# 3. Fill in app name & category
# 4. Upload icon (512x512 PNG)
# 5. Write description (80 chars short, 4000 chars long)
# 6. Upload screenshots (5x 1440x2560)
# 7. Fill content rating questionnaire
```

#### Step 2: Create Release APK/AAB
```bash
# If using Expo:
eas build --platform android --non-interactive

# If using React Native CLI:
./gradlew bundleRelease

# File will be at: android/app/build/outputs/bundle/release/app-release.aab
```

#### Step 3: Create Release in Play Console
```bash
# 1. Go to: Play Console > Your app > Releases > Create release
# 2. Upload APK/AAB file
# 3. Add release notes
# 4. Review app details
# 5. Submit for review
```

#### Step 4: Monitor Review
```
Review timeline:
- In review: 2-4 hours
- Approved: App goes live (1-2 hours)
- Rejected: Fix issues & resubmit

Monitor at: Google Play Console > Your app > Releases
```

---

## Multi-App Deployment Strategy

### Batch Deployment (Most Efficient)

**Week 1**: Apps 1-4
```bash
# App 1: Mental Health Pro ✅ (already complete)
vercel --prod

# App 2: Postpartum Fitness
cd ../2-postpartum-fitness
npm install && npm run build
vercel --prod

# App 3: Local Services
cd ../3-local-services
npm install && npm run build
vercel --prod

# App 4: ADHD Management
cd ../4-adhd-management
npm install && npm run build
vercel --prod
```

**Week 2**: Apps 5-9
- Following same pattern

**Week 3**: Apps 10-15
- Following same pattern

**Week 4**: Apps 16-20
- Following same pattern

### Deployment Automation Script

Create `scripts/deploy-all.sh`:
```bash
#!/bin/bash

APPS=(
  "1-mental-health-pro"
  "2-postpartum-fitness"
  "3-local-services"
  "4-adhd-management"
  # ... add all 20
)

for app in "${APPS[@]}"; do
  echo "Deploying $app..."
  cd apps/$app
  npm install
  npm run build
  vercel --prod --token=$VERCEL_TOKEN
  cd ../..
  echo "✅ $app deployed!"
done

echo "🎉 All 20 apps deployed!"
```

Run with:
```bash
bash scripts/deploy-all.sh
```

---

## Environment Configuration per App

Each app needs these environment variables:

### Core (Same for all apps)
```
NEXTAUTH_SECRET=random-secret-here
NEXTAUTH_URL=https://your-domain.vercel.app
```

### Database (Unique per app)
```
DATABASE_URL=mongodb+srv://user:pass@cluster/[app-name]
```

### Stripe (Unique per app, but same format)
```
STRIPE_SECRET_KEY=sk_live_xxxxx
STRIPE_PUBLIC_KEY=pk_live_xxxxx
NEXT_PUBLIC_STRIPE_PRODUCT_FREE=price_free_xxxxx
NEXT_PUBLIC_STRIPE_PRODUCT_PREMIUM=price_premium_xxxxx
```

### Email (Same Resend account)
```
RESEND_API_KEY=re_xxxxx
```

### OAuth (Same Google app)
```
GOOGLE_CLIENT_ID=xxxxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=xxxxx
```

### AdMob (Unique ad units per app)
```
NEXT_PUBLIC_ADMOB_APP_ID=ca-app-pub-xxxxxxxxxxxxxxxx
NEXT_PUBLIC_ADMOB_BANNER_ID=ca-app-pub-xxxxx
NEXT_PUBLIC_ADMOB_INTERSTITIAL_ID=ca-app-pub-xxxxx
NEXT_PUBLIC_ADMOB_REWARDED_ID=ca-app-pub-xxxxx
```

---

## Cost Breakdown - Monthly

**Per App**:
- Vercel hosting: $0-20/month
- MongoDB: $0-50/month (free tier available)
- Stripe fees: 2.9% + $0.30 per transaction
- Resend: $0-20/month (free tier: 100/day)
- Google AdMob: No cost (revenue share)
- Domain: ~$12/year

**Per App Total**: $0-100/month
**20 Apps Total**: $0-2,000/month

**Revenue Potential**:
- 10K users/app: $500-1,100/month/app = $10-22K/month
- 50K users/app: $2,500-5,500/month/app = $50-110K/month

---

## Post-Deployment Monitoring

### Daily Checklist
```
□ Check error logs (Sentry)
□ Monitor ad performance (AdMob)
□ Review user feedback (Google Play reviews)
□ Verify payment processing (Stripe dashboard)
```

### Weekly Checklist
```
□ Analyze engagement metrics
□ Review support emails
□ Check retention rates
□ Plan bug fixes
```

### Monthly Checklist
```
□ Update featured graphics (seasonal)
□ Release updates with bug fixes
□ Optimize slow pages
□ Plan new features
□ Review financial performance
```

## Analytics Setup

Add Google Analytics to each app (in `pages/_app.tsx`):

```typescript
import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function App({ Component, pageProps }) {
  const router = useRouter();

  useEffect(() => {
    const handleRouteChange = (url) => {
      // Send pageview to analytics
      gtag.pageview({
        page_path: url,
        page_title: '',
        page_location: window.location.href,
      });
    };

    router.events.on('routeChangeComplete', handleRouteChange);
    return () => router.events.off('routeChangeComplete', handleRouteChange);
  }, [router.events]);

  return <Component {...pageProps} />;
}
```

## Troubleshooting Deployment

### App won't start
```bash
# Check for missing environment variables
env | grep NEXT

# Verify database connection
npm run build  # Will fail if DB connection broken

# Check Node version
node --version  # Should be 18+
```

### Auth not working
```bash
# Verify NEXTAUTH_SECRET is set
echo $NEXTAUTH_SECRET

# Check Google OAuth credentials are correct
# Test: Try signing in with Google

# Verify email service (Resend) is working
```

### Stripe integration broken
```bash
# Verify API keys are correct (live vs test)
# Check Stripe webhook is configured
# Test payment with test card: 4242 4242 4242 4242

# Monitor: Stripe Dashboard > Logs > API Requests
```

### Ads not showing
```bash
# Verify AdMob ad unit IDs are correct
# Check user is NOT premium (ads hidden for premium)
# Use test ad unit IDs first:
# ca-app-pub-3940256099942544/6300978111

# Monitor: AdMob > Mediation Groups > Status
```

---

## Launch Checklist

Before launching each app:

### Code Quality
- [ ] No console errors
- [ ] No TypeScript errors
- [ ] All links working
- [ ] Responsive on mobile
- [ ] Lighthouse score 90+
- [ ] No security vulnerabilities

### Features
- [ ] Auth flows work (signup, login, logout, reset)
- [ ] Payment flows work (upgrade, cancel)
- [ ] Ads display correctly
- [ ] Gamification tracks points/badges
- [ ] Data persists after reload

### Compliance
- [ ] Privacy Policy live at /privacy
- [ ] Terms of Service live at /terms
- [ ] Support email configured
- [ ] Age rating set
- [ ] Content rating set

### Google Play
- [ ] APK/AAB signed
- [ ] Icon uploaded (512x512)
- [ ] Screenshots uploaded (5)
- [ ] Description written
- [ ] Release notes added
- [ ] Content rating questionnaire completed

---

## Success Metrics (Track These!)

After launch, monitor:

```javascript
// In your analytics:
- Daily Active Users (DAU)
- Monthly Active Users (MAU)
- Signup conversion rate
- Free → Premium conversion
- Premium retention (D1, D7, D30)
- Average Revenue Per User (ARPU)
- Ad RPM (Revenue Per Mille)
- Customer Acquisition Cost (CAC)
- Lifetime Value (LTV)
- 4.0+ star rating percentage
```

---

## Next Steps

1. **Week 1**: Complete & deploy apps 1-4
2. **Weeks 2-4**: Deploy apps 5-20 (batch)
3. **Month 2**: Optimize for retention
4. **Month 3**: Marketing & growth push
5. **Months 4-12**: Scale successful apps

**Total timeline**: 4-6 months to have all 20 apps live and optimized

---

**Questions?** See individual app documentation in `/docs/apps/`
