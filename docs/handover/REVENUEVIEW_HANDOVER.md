# RevenueView.com - Handover Documentation

## App Overview
RevenueView is a Stripe analytics and revenue tracking dashboard that provides SaaS businesses with deep insights into their MRR (Monthly Recurring Revenue), customer lifetime value, churn rate, and cohort analysis. It's a more affordable alternative to Baremetrics and ChartMogul.

**Value Proposition**: "Beautiful Stripe analytics, 80% cheaper"
**Target Market**: SaaS companies, subscription businesses, indie hackers
**Competitive Advantage**: 80% cheaper than Baremetrics and ChartMogul

## Domain & Access Information
- **Domain**: revenueview.com
- **Development Port**: 3006
- **Dev Command**: `npm run dev:revenueview` (from monorepo root)
- **App Directory**: `/apps/revenueview`

## Tech Stack
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: TailwindCSS
- **UI Components**: Shared package (`@traffic2u/ui`)
- **Database**: Prisma + PostgreSQL (shared schema)
- **Authentication**: NextAuth.js (shared config)
- **Charts**: Recharts (Line charts for MRR tracking)
- **Stripe Integration**: stripe npm package
- **Notifications**: react-hot-toast
- **Icons**: Lucide React

## Branding
- **Primary Color**: Green (#10B981)
- **Logo**: Revenue/chart theme (200x200px)
- **Favicon**: Matching green theme (32x32px)
- **Files**: `apps/revenueview/public/{logo.svg, favicon.svg}`

## File Structure
```
apps/revenueview/
├── public/
│   ├── logo.svg
│   └── favicon.svg
├── src/
│   ├── app/
│   │   ├── layout.tsx                    # Root layout
│   │   ├── page.tsx                      # Landing page
│   │   ├── dashboard/
│   │   │   └── page.tsx                  # MRR analytics dashboard
│   │   ├── admin/
│   │   │   └── page.tsx                  # Admin dashboard
│   │   ├── auth/
│   │   │   ├── signup/page.tsx
│   │   │   └── signin/page.tsx
│   │   ├── privacy/
│   │   │   └── page.tsx
│   │   ├── terms/
│   │   │   └── page.tsx
│   │   └── api/
│   │       ├── auth/
│   │       │   ├── [...nextauth]/route.ts
│   │       │   └── register/route.ts
│   │       ├── stripe/
│   │       │   ├── connect/route.ts      # Connect Stripe account
│   │       │   └── webhook/route.ts      # Stripe webhook handler
│   │       └── analytics/
│   │           ├── mrr/route.ts          # Calculate MRR (TO BE IMPLEMENTED)
│   │           ├── churn/route.ts        # Calculate churn (TO BE IMPLEMENTED)
│   │           └── ltv/route.ts          # Calculate LTV (TO BE IMPLEMENTED)
│   └── lib/
│       ├── prisma.ts
│       └── stripe-analytics.ts           # Analytics calculation library
├── package.json
├── next.config.js
├── tailwind.config.js
├── tsconfig.json
└── postcss.config.js
```

## Key Features Implemented

### ✅ Landing Page
- Hero section with green gradient theme
- Social proof stats: "80% Cheaper", "$2.5B Revenue tracked", "5,000+ Customers"
- Feature showcase (MRR Tracking, Cohort Analysis, Customer LTV, Real-Time sync, Forecasting)
- 4-tier pricing section
- Customer testimonials
- Integration showcase (Stripe logo)

### ✅ Authentication System
- User signup with validation
- User signin
- Password hashing
- Session management
- Protected routes
- Automatic free subscription

### ✅ Dashboard Features (Basic)
- Key metrics cards:
  - MRR: $26,500
  - Active Customers: 142
  - Churn Rate: 3.2%
  - Avg LTV: $2,840
- MRR growth chart (Recharts LineChart) showing last 5 months
- Mock data for demonstration
- "Connect Stripe" button (not functional yet)

### ✅ Admin Dashboard
- User metrics (Total Users, Total MRR, Avg. Customer Value, Active Integrations)
- Recent activity monitoring
- User management
- System health monitoring

### ✅ Legal Pages
- Terms of Service
- Privacy Policy

### ✅ Pricing Structure
| Plan | Price/mo | Features |
|------|----------|----------|
| Free | $0 | Up to $10K MRR, Basic metrics, 1 Stripe account, Email support |
| Starter | $19 | Up to $50K MRR, Advanced analytics, Cohort analysis, Email reports, Priority support |
| Professional | $49 | Up to $200K MRR, Unlimited Stripe accounts, Custom metrics, API access, Forecasting, Dedicated support |
| Enterprise | $149 | Unlimited MRR, White-label, Team collaboration, Custom integrations, SLA, Dedicated account manager |

**Competitor Comparison**: 80% cheaper than Baremetrics ($99-799/mo) and ChartMogul ($100-1000+/mo)

## Environment Variables Required

Create `.env.local` in `apps/revenueview/`:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/traffic2u?schema=public"

# NextAuth
NEXTAUTH_SECRET="your-generated-secret-here"
NEXTAUTH_URL="http://localhost:3006"

# Stripe (for connecting user's Stripe accounts)
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# Stripe Connect (for OAuth)
STRIPE_CLIENT_ID="ca_..."  # From Stripe Connect settings

# Background Jobs (for syncing Stripe data)
REDIS_URL="redis://localhost:6379"

# Application Stripe (for payments)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_SECRET_KEY="sk_test_..."
```

## Stripe Setup

### Stripe Connect Setup
1. Go to Stripe Dashboard → Settings → Connect
2. Enable OAuth for Standard Connect
3. Add redirect URI: `http://localhost:3006/api/stripe/callback`
4. Copy Client ID to `.env.local`
5. Configure branding (logo, colors)

### Stripe Webhook Setup
1. Go to Stripe Dashboard → Developers → Webhooks
2. Add endpoint: `https://revenueview.com/api/stripe/webhook`
3. Select events to listen for:
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
   - `charge.refunded`
4. Copy webhook secret to `.env.local`

## Database Setup

### Additional Schema Needed
Add these models to the shared Prisma schema:

```prisma
// Add to packages/database/prisma/schema.prisma

model StripeAccount {
  id                String    @id @default(cuid())
  userId            String
  stripeUserId      String    @unique  // Stripe account ID (acc_...)
  accessToken       String    // Encrypted
  refreshToken      String?   // Encrypted
  livemode          Boolean   @default(false)
  businessName      String?
  email             String?
  lastSyncedAt      DateTime?
  isActive          Boolean   @default(true)
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt
  user              User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  customers         StripeCustomer[]
  subscriptions     StripeSubscription[]
  charges           StripeCharge[]
  @@index([userId])
}

model StripeCustomer {
  id                String    @id @default(cuid())
  stripeAccountId   String
  stripeCustomerId  String    @unique  // cus_...
  email             String?
  name              String?
  metadata          Json?
  createdAt         DateTime  @default(now())
  stripeAccount     StripeAccount @relation(fields: [stripeAccountId], references: [id], onDelete: Cascade)
  subscriptions     StripeSubscription[]
  charges           StripeCharge[]
  @@index([stripeAccountId])
}

model StripeSubscription {
  id                String    @id @default(cuid())
  stripeAccountId   String
  customerId        String
  stripeSubId       String    @unique  // sub_...
  status            String    // active, canceled, past_due, etc.
  currentPeriodStart DateTime
  currentPeriodEnd  DateTime
  cancelAtPeriodEnd Boolean   @default(false)
  planAmount        Int       // In cents
  planInterval      String    // month, year
  quantity          Int       @default(1)
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt
  stripeAccount     StripeAccount @relation(fields: [stripeAccountId], references: [id], onDelete: Cascade)
  customer          StripeCustomer @relation(fields: [customerId], references: [id], onDelete: Cascade)
  @@index([stripeAccountId])
  @@index([customerId])
  @@index([status])
}

model StripeCharge {
  id                String    @id @default(cuid())
  stripeAccountId   String
  customerId        String
  stripeChargeId    String    @unique  // ch_...
  amount            Int       // In cents
  currency          String    @default("usd")
  status            String    // succeeded, failed, refunded
  paid              Boolean
  refunded          Boolean   @default(false)
  description       String?
  createdAt         DateTime  @default(now())
  stripeAccount     StripeAccount @relation(fields: [stripeAccountId], references: [id], onDelete: Cascade)
  customer          StripeCustomer @relation(fields: [customerId], references: [id], onDelete: Cascade)
  @@index([stripeAccountId])
  @@index([customerId])
  @@index([createdAt])
}

model MRRSnapshot {
  id                String    @id @default(cuid())
  stripeAccountId   String
  date              DateTime  @db.Date
  mrr               Int       // Monthly Recurring Revenue in cents
  activeSubscriptions Int
  newMRR            Int       // New subscriptions
  expansionMRR      Int       // Upgrades
  contractionMRR    Int       // Downgrades
  churnedMRR        Int       // Cancellations
  createdAt         DateTime  @default(now())
  @@unique([stripeAccountId, date])
  @@index([stripeAccountId])
  @@index([date])
}
```

## Development Setup

```bash
# 1. Navigate to monorepo root
cd /home/user/Traffic2umarketing

# 2. Install dependencies
npm install

# 3. Install Stripe CLI (for webhook testing)
# macOS: brew install stripe/stripe-cli/stripe
# Login: stripe login

# 4. Update Prisma schema
cd packages/database
# Add StripeAccount, StripeCustomer, StripeSubscription, StripeCharge, MRRSnapshot models

# 5. Generate Prisma client
npx prisma generate

# 6. Create migration
npx prisma migrate dev --name add_revenueview_models

# 7. Install Redis
# macOS: brew install redis
redis-server

# 8. Create environment file
cd ../../apps/revenueview
cp .env.example .env.local
# Edit .env.local

# 9. Start Stripe webhook forwarding (in separate terminal)
stripe listen --forward-to localhost:3006/api/stripe/webhook

# 10. Start development server
npm run dev:revenueview

# App available at http://localhost:3006
```

## API Endpoints (To Be Implemented)

### GET /api/stripe/connect
Initiate Stripe Connect OAuth flow
```typescript
// Redirects to Stripe OAuth URL
```

### GET /api/stripe/callback
Handle Stripe Connect OAuth callback
```typescript
// Query params: code, state
// Exchanges code for access token
// Stores Stripe account in database
// Response: Redirect to dashboard
```

### POST /api/stripe/webhook
Handle Stripe webhook events
```typescript
// Stripe sends events to this endpoint
// Verify webhook signature
// Process events (subscriptions, charges, etc.)
// Update database
// Calculate MRR changes
```

### GET /api/analytics/mrr
Get MRR data
```typescript
// Query params: startDate, endDate, stripeAccountId

// Response
{
  "current": 26500,
  "previous": 22000,
  "growth": 20.5,
  "data": [
    { "date": "2024-01", "mrr": 12000 },
    { "date": "2024-02", "mrr": 15000 },
    // ...
  ]
}
```

### GET /api/analytics/churn
Get churn rate data
```typescript
// Response
{
  "currentMonth": 3.2,
  "previousMonth": 4.1,
  "averageLast6Months": 3.8,
  "data": [
    { "month": "2024-01", "churnRate": 4.5, "churnedCustomers": 5 },
    // ...
  ]
}
```

### GET /api/analytics/ltv
Get customer lifetime value
```typescript
// Response
{
  "averageLTV": 2840,
  "medianLTV": 2100,
  "topQuartile": 5200,
  "byPlan": [
    { "plan": "Basic", "ltv": 890 },
    { "plan": "Pro", "ltv": 3200 },
    // ...
  ]
}
```

## Known Limitations & Issues

### 🔴 Critical - Not Implemented
1. **Stripe Connect Integration**: Not implemented
   - Need OAuth flow to connect user's Stripe account
   - Need to store access tokens securely (encrypted)
   - Need to handle token refresh
   - Files to create:
     - `apps/revenueview/src/app/api/stripe/connect/route.ts`
     - `apps/revenueview/src/app/api/stripe/callback/route.ts`

2. **Stripe Data Sync**: No sync mechanism
   - Need to fetch all customers, subscriptions, charges from Stripe
   - Need initial sync when account is connected
   - Need incremental sync (webhooks + periodic full sync)
   - Need to handle pagination (Stripe API returns 100 items max)
   - File to create: `apps/revenueview/src/lib/stripe-sync.ts`

3. **MRR Calculation**: Shows mock data
   - Need to calculate MRR from subscriptions
   - Need to track MRR movements (new, expansion, contraction, churn)
   - Need to store daily/monthly MRR snapshots
   - File to create: `apps/revenueview/src/lib/mrr-calculator.ts`

4. **Webhook Handler**: Not implemented
   - Need to verify Stripe webhook signature
   - Need to process subscription events
   - Need to update MRR in real-time
   - File to create: `apps/revenueview/src/app/api/stripe/webhook/route.ts`

### 🟡 Medium Priority
5. **Churn Analysis**: Not calculated
   - Need to identify churned customers
   - Need to calculate churn rate
   - Need to segment churn by plan, cohort

6. **Cohort Analysis**: Feature mentioned but not built
   - Track customer cohorts by signup month
   - Calculate retention rates
   - Visualize cohort table

7. **Customer LTV**: Basic metric shown
   - Need actual LTV calculation
   - Consider: average subscription length × average revenue
   - Segment by plan, acquisition channel

8. **Forecasting**: Pro/Enterprise feature not built
   - Linear regression for MRR forecasting
   - Seasonality adjustments
   - Confidence intervals

### 🟢 Nice to Have
9. **Revenue Forecasting**: Enterprise feature
10. **Custom Metrics**: Pro feature
11. **Multiple Stripe Accounts**: Pro feature
12. **Email Reports**: Starter+ feature
13. **Team Collaboration**: Enterprise feature
14. **API Access**: Pro feature

## Suggested Next Steps for Improvements

### Phase 1: Core Stripe Integration (High Priority)
1. **Implement Stripe Connect**
   - Build OAuth authorization flow
   - Store access tokens (encrypted with crypto library)
   - Handle token refresh
   - Support multiple Stripe accounts per user (Pro+)
   - Add "Connect Stripe" and "Disconnect" buttons

2. **Build Stripe Data Sync**
   - Fetch all customers from Stripe API
   - Fetch all subscriptions
   - Fetch all charges/invoices
   - Handle pagination (iterate through all pages)
   - Store in database
   - Show sync progress to user
   - Schedule periodic full sync (daily)

3. **Implement Webhook Handler**
   - Verify webhook signature (critical for security)
   - Handle subscription events:
     - `customer.subscription.created` - Add to database, recalculate MRR
     - `customer.subscription.updated` - Update database, recalculate MRR
     - `customer.subscription.deleted` - Mark as churned, recalculate MRR
   - Handle charge events for one-time payments
   - Queue webhook processing (use BullMQ)

### Phase 2: Analytics Engine (Medium Priority)
4. **Build MRR Calculator**
   - Calculate current MRR from active subscriptions
   - Track MRR movements:
     - New MRR: New subscriptions this month
     - Expansion MRR: Upgrades
     - Contraction MRR: Downgrades
     - Churned MRR: Cancellations
   - Create daily MRR snapshots
   - Generate MRR chart data

5. **Calculate Churn Rate**
   - Formula: (Churned customers / Total customers at start) × 100
   - Calculate monthly churn
   - Calculate revenue churn vs customer churn
   - Identify at-risk customers (past_due status)

6. **Calculate Customer LTV**
   - Formula: (Average MRR per customer) × (1 / Monthly churn rate)
   - Alternative: Sum of all revenue per customer
   - Segment by plan
   - Show LTV to CAC ratio (if CAC data available)

### Phase 3: Advanced Analytics (Nice to Have)
7. **Build Cohort Analysis**
   - Group customers by signup month
   - Calculate retention rates month-over-month
   - Visualize with cohort table (heatmap)
   - Show revenue retention vs customer retention

8. **Revenue Forecasting**
   - Use linear regression on historical MRR
   - Account for seasonality (if applicable)
   - Show confidence intervals
   - Allow user to adjust growth assumptions

9. **Custom Metrics**
   - Allow users to define custom metrics
   - Build formula editor
   - Support filters and segments
   - Save custom dashboard views

10. **Benchmarking**
    - Show industry benchmarks
    - Compare user's metrics to similar companies
    - Identify areas for improvement

## Testing Strategy

### Unit Tests
- Test MRR calculation formulas
- Test churn rate calculations
- Test LTV calculations
- Test webhook signature verification

### Integration Tests
- Test Stripe Connect OAuth flow
- Test Stripe data sync
- Test webhook processing
- Test analytics API endpoints

### Manual Testing Checklist
- [ ] User can connect Stripe account via OAuth
- [ ] Initial sync completes successfully
- [ ] MRR is calculated correctly
- [ ] Dashboard shows accurate metrics
- [ ] Webhook events update metrics in real-time
- [ ] Charts display correct data
- [ ] User can disconnect Stripe account
- [ ] Multiple Stripe accounts work (Pro plan)

## Deployment Considerations

### Stripe Webhook Configuration
- Production webhook URL: `https://revenueview.com/api/stripe/webhook`
- Enable all subscription and charge events
- Test webhook before going live

### Background Jobs
- Use BullMQ + Redis for:
  - Webhook processing queue
  - Daily MRR snapshot job
  - Full Stripe sync (daily)
- Set up monitoring for job failures

### Database Considerations
- Stripe data can be large (thousands of subscriptions)
- Implement pagination for queries
- Use database indexes on:
  - stripeAccountId
  - customerId
  - createdAt / date fields
- Consider archiving old data (> 2 years)

### Environment Variables for Production
All development variables plus:
```env
NEXTAUTH_URL="https://revenueview.com"
STRIPE_CONNECT_REDIRECT_URI="https://revenueview.com/api/stripe/callback"
REDIS_URL="redis://..."
```

### Monitoring
- Stripe API errors
- Webhook failures
- Sync failures
- MRR calculation errors
- Database query performance

## Performance Optimization

### Current Performance
- Dashboard loads mock data instantly

### Optimization Opportunities
1. **MRR Calculation**
   - Pre-calculate and cache MRR daily
   - Use MRRSnapshot table for historical data
   - Avoid recalculating on every page load

2. **Dashboard Queries**
   - Use database indexes
   - Cache metrics in Redis (TTL: 1 hour)
   - Implement pagination for large datasets

3. **Stripe API**
   - Batch API requests when possible
   - Use Stripe's expand feature to reduce requests
   - Respect rate limits (100 requests/second)

4. **Charts**
   - Pre-aggregate data for charts
   - Use time-series database (TimescaleDB) for analytics
   - Cache chart data

## Security Considerations

### Current Security Measures
✅ Password hashing
✅ JWT sessions

### Security Improvements Needed
- [ ] Encrypt Stripe access tokens at rest
- [ ] Verify Stripe webhook signatures (prevent fake webhooks)
- [ ] Implement row-level security (users can only see their data)
- [ ] Rate limiting on API endpoints
- [ ] Audit logs for Stripe account connections
- [ ] GDPR compliance (data export, deletion)
- [ ] SOC 2 compliance considerations

### Stripe Security Best Practices
- Never log access tokens
- Rotate tokens periodically
- Use least-privilege OAuth scopes
- Handle token refresh errors gracefully

## Support & Maintenance

### Common Issues & Solutions
1. **"Stripe connection failed"**: Check OAuth credentials, check redirect URI
2. **"Sync failed"**: Check Stripe API key validity, check rate limits
3. **"MRR doesn't match Stripe dashboard"**: Check calculation logic, check for missing subscriptions
4. **"Webhook not receiving events"**: Check webhook URL, check Stripe dashboard webhook logs
5. **"Dashboard loading slowly"**: Check database indexes, implement caching

### Stripe API Known Issues
- Pagination required for accounts with >100 items
- Webhooks can be delayed by minutes
- Deleted objects still appear with `deleted: true` flag
- Test mode and live mode are separate

### Monitoring Alerts
- Stripe sync failures
- Webhook processing failures
- MRR calculation errors
- Database connection errors
- Redis connection errors

### Contact Information
- Support: support@revenueview.com (not configured)
- Privacy: privacy@revenueview.com (not configured)
- Legal: legal@revenueview.com (not configured)

## Handover Checklist

Before next session:
- [ ] All dependencies installed
- [ ] Database schema updated with Stripe models
- [ ] Stripe Connect app created
- [ ] Stripe webhook endpoint configured
- [ ] Redis installed and running
- [ ] Environment variables configured
- [ ] App starts without errors
- [ ] Can create account and sign in
- [ ] Dashboard displays correctly
- [ ] Reviewed Stripe Connect documentation
- [ ] Reviewed Stripe webhook documentation

## Conclusion

RevenueView.com addresses a real pain point for SaaS businesses: expensive analytics tools. With 80% cost savings over competitors, the pricing is extremely compelling.

**Estimated completion**: 35% of production-ready features
**Next priority**: Stripe Connect integration and data sync
**Time to production**: 6-8 weeks with focused development
**Technical complexity**: High (Stripe API is complex, MRR calculations need to be accurate)

Success depends on accurate analytics calculations and reliable Stripe integration. Accuracy is more important than feature breadth - users need to trust the numbers.

---

*Last Updated: 2024-03-20*
*Version: 1.0*
*Author: AI Development Team*
