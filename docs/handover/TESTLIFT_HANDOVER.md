# TestLift.com - Handover Documentation

## App Overview
TestLift is a no-code A/B testing platform that helps businesses optimize conversion rates through easy-to-setup experiments. The platform offers visual editing, real-time analytics, and goal tracking without requiring developers.

**Value Proposition**: "Boost conversions with no-code A/B testing. 75% cheaper than Optimizely."
**Target Market**: Marketing teams, e-commerce businesses, SaaS companies, agencies
**Competitive Advantage**: 75% cheaper than Optimizely and VWO

## Domain & Access Information
- **Domain**: testlift.com
- **Development Port**: 3004
- **Dev Command**: `npm run dev:testlift` (from monorepo root)
- **App Directory**: `/apps/testlift`

## Tech Stack
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: TailwindCSS
- **UI Components**: Shared package (`@traffic2u/ui`)
- **Database**: Prisma + PostgreSQL (shared schema)
- **Authentication**: NextAuth.js (shared config)
- **Charts**: Recharts (Bar charts for variant comparison)
- **Notifications**: react-hot-toast
- **Icons**: Lucide React

## Branding
- **Primary Color**: Orange (#F97316)
- **Logo**: A/B comparison theme (200x200px)
- **Favicon**: Matching orange theme (32x32px)
- **Files**: `apps/testlift/public/{logo.svg, favicon.svg}`

## File Structure
```
apps/testlift/
├── public/
│   ├── logo.svg
│   └── favicon.svg
├── src/
│   ├── app/
│   │   ├── layout.tsx                    # Root layout
│   │   ├── page.tsx                      # Landing page
│   │   ├── dashboard/
│   │   │   └── page.tsx                  # Test management & analytics
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
│   │       └── tests/
│   │           ├── create/route.ts       # Create test (TO BE IMPLEMENTED)
│   │           ├── track/route.ts        # Track events (TO BE IMPLEMENTED)
│   │           └── results/route.ts      # Get results (TO BE IMPLEMENTED)
│   └── lib/
│       └── prisma.ts
├── package.json
├── next.config.js
├── tailwind.config.js
├── tsconfig.json
└── postcss.config.js
```

## Key Features Implemented

### ✅ Landing Page
- Hero section with orange gradient theme
- Social proof stats: "75% Cheaper", "2.4x Average conversion lift", "5 min Setup time"
- Feature showcase (Visual Editor, Real-Time Analytics, Goal Tracking, Custom Code)
- 4-tier pricing section
- Customer testimonials
- Integration badges

### ✅ Authentication System
- User signup with validation
- User signin
- Password hashing
- Session management
- Protected routes
- Automatic free subscription

### ✅ Dashboard Features (Basic)
- Test list view with mock data
- Status badges (running/completed)
- Conversion rate display
- Visitors count
- Recharts bar chart comparing variant performance
- "New Test" button (no modal yet)
- Edit and view details buttons

### ✅ Admin Dashboard
- User metrics (Total Users, Active Tests, Avg. Conversion Lift, Total Experiments)
- Recent activity monitoring
- User management
- Test moderation

### ✅ Legal Pages
- Terms of Service
- Privacy Policy

### ✅ Pricing Structure
| Plan | Price/mo | Features |
|------|----------|----------|
| Free | $0 | 1 active test, 1,000 monthly visitors, Basic analytics, Email support |
| Starter | $29 | 5 active tests, 10,000 monthly visitors, Advanced analytics, Goal tracking, Priority support |
| Professional | $74 | Unlimited tests, 100,000 monthly visitors, A/B/n testing, Multivariate testing, API access, Dedicated support |
| Enterprise | $199 | Unlimited tests, Unlimited visitors, White-label, Team collaboration, SSO, Server-side testing, SLA |

**Competitor Comparison**: 75% cheaper than Optimizely ($300+/mo) and VWO ($199+/mo)

## Environment Variables Required

Create `.env.local` in `apps/testlift/`:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/traffic2u?schema=public"

# NextAuth
NEXTAUTH_SECRET="your-generated-secret-here"
NEXTAUTH_URL="http://localhost:3004"

# Tracking Script CDN
NEXT_PUBLIC_CDN_URL="https://cdn.testlift.com"
NEXT_PUBLIC_TRACKING_SCRIPT="https://cdn.testlift.com/track.js"

# Redis (for real-time stats)
REDIS_URL="redis://localhost:6379"

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
```

## Database Setup

### Additional Schema Needed
Add these models to the shared Prisma schema:

```prisma
// Add to packages/database/prisma/schema.prisma

model Project {
  id              String    @id @default(cuid())
  userId          String
  name            String
  domain          String
  trackingId      String    @unique @default(cuid())
  isActive        Boolean   @default(true)
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  user            User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  tests           Test[]
  @@index([userId])
  @@index([trackingId])
}

model Test {
  id              String    @id @default(cuid())
  projectId       String
  name            String
  description     String?
  url             String
  status          TestStatus @default(DRAFT)
  testType        TestType   @default(AB_TEST)
  trafficSplit    Int        @default(50)  // Percentage for variant
  startDate       DateTime?
  endDate         DateTime?
  winnerVariant   String?
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  project         Project   @relation(fields: [projectId], references: [id], onDelete: Cascade)
  variants        Variant[]
  goals           Goal[]
  events          Event[]
  @@index([projectId])
  @@index([status])
}

model Variant {
  id              String    @id @default(cuid())
  testId          String
  name            String    // "Control", "Variant A", "Variant B"
  isControl       Boolean   @default(false)
  changes         Json      // DOM changes, CSS, JS
  visitors        Int       @default(0)
  conversions     Int       @default(0)
  conversionRate  Float     @default(0)
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  test            Test      @relation(fields: [testId], references: [id], onDelete: Cascade)
  @@index([testId])
}

model Goal {
  id              String    @id @default(cuid())
  testId          String
  name            String
  type            GoalType  @default(CLICK)
  selector        String?   // CSS selector for click goals
  url             String?   // URL for pageview goals
  value           Float?    // Revenue value
  isPrimary       Boolean   @default(false)
  createdAt       DateTime  @default(now())
  test            Test      @relation(fields: [testId], references: [id], onDelete: Cascade)
  @@index([testId])
}

model Event {
  id              String    @id @default(cuid())
  testId          String
  variantId       String?
  visitorId       String
  eventType       EventType
  goalId          String?
  value           Float?
  metadata        Json?
  timestamp       DateTime  @default(now())
  test            Test      @relation(fields: [testId], references: [id], onDelete: Cascade)
  @@index([testId])
  @@index([visitorId])
  @@index([timestamp])
}

enum TestStatus {
  DRAFT
  RUNNING
  PAUSED
  COMPLETED
}

enum TestType {
  AB_TEST
  MULTIVARIATE
  SPLIT_URL
}

enum GoalType {
  CLICK
  PAGEVIEW
  CUSTOM_EVENT
  REVENUE
}

enum EventType {
  PAGEVIEW
  CONVERSION
  CLICK
  CUSTOM
}
```

## Development Setup

```bash
# 1. Navigate to monorepo root
cd /home/user/Traffic2umarketing

# 2. Install dependencies
npm install

# 3. Update Prisma schema
cd packages/database
# Add Project, Test, Variant, Goal, Event models to schema.prisma

# 4. Generate Prisma client
npx prisma generate

# 5. Create migration
npx prisma migrate dev --name add_testlift_models

# 6. Install Redis (for real-time stats)
# macOS: brew install redis
# Linux: sudo apt-get install redis-server
redis-server  # Start Redis

# 7. Create environment file
cd ../../apps/testlift
cp .env.example .env.local
# Edit .env.local

# 8. Start development server
npm run dev:testlift

# App available at http://localhost:3004
```

## API Endpoints (To Be Implemented)

### POST /api/tests/create
Create new A/B test
```typescript
// Request
{
  "projectId": "clu...",
  "name": "Homepage Hero Test",
  "url": "https://example.com",
  "variants": [
    {
      "name": "Control",
      "isControl": true,
      "changes": {}
    },
    {
      "name": "Variant A",
      "changes": {
        "selector": ".hero-title",
        "html": "<h1>New Title</h1>"
      }
    }
  ],
  "goals": [
    {
      "name": "Sign Up Button Click",
      "type": "CLICK",
      "selector": "#signup-btn",
      "isPrimary": true
    }
  ]
}

// Response
{
  "success": true,
  "testId": "clu...",
  "trackingCode": "<script src='https://cdn.testlift.com/track.js?id=...'></script>"
}
```

### POST /api/tests/track
Track visitor events (called by tracking script)
```typescript
// Request
{
  "testId": "clu...",
  "variantId": "clu...",
  "visitorId": "visitor_123",
  "eventType": "CONVERSION",
  "goalId": "clu..."
}

// Response
{
  "success": true
}
```

### GET /api/tests/results/[testId]
Get test results and statistics
```typescript
// Response
{
  "test": {
    "id": "clu...",
    "name": "Homepage Hero Test",
    "status": "RUNNING",
    "startDate": "2024-03-15"
  },
  "variants": [
    {
      "name": "Control",
      "visitors": 1000,
      "conversions": 45,
      "conversionRate": 4.5
    },
    {
      "name": "Variant A",
      "visitors": 1000,
      "conversions": 62,
      "conversionRate": 6.2,
      "improvement": 37.8,
      "significance": 0.95
    }
  ]
}
```

## Known Limitations & Issues

### 🔴 Critical - Not Implemented
1. **Test Creation Interface**: No form or modal to create tests
   - Need visual test builder
   - Need variant configuration
   - Need goal setup wizard
   - Need URL targeting
   - Need audience targeting
   - File to create: `apps/testlift/src/components/TestBuilder.tsx`

2. **Tracking Script**: No JavaScript tracking library
   - Need to build client-side tracking script
   - Need to handle variant assignment
   - Need to track pageviews and conversions
   - Need cookie/localStorage for visitor identity
   - Need to send events to API
   - Directory to create: `packages/tracking-script/`

3. **Visual Editor**: Mentioned but not built
   - Need WYSIWYG editor for element changes
   - Need CSS selector tool
   - Need preview mode
   - Consider using similar approach to Optimizely
   - File to create: `apps/testlift/src/components/VisualEditor.tsx`

4. **Statistical Significance Calculation**: Not implemented
   - Need to calculate p-values
   - Need confidence intervals
   - Need sample size calculator
   - Need early stopping rules
   - File to create: `apps/testlift/src/lib/statistics.ts`

### 🟡 Medium Priority
5. **Real-Time Dashboard**: Shows mock data only
   - Need websocket connection for live updates
   - Need to aggregate events from database
   - Need caching with Redis
   - Consider using Pusher or Socket.io

6. **Goal Tracking**: UI shown but not functional
   - Need click tracking
   - Need form submission tracking
   - Need custom event tracking
   - Need revenue tracking

7. **Multivariate Testing**: Mentioned in Pro plan but not built
   - More complex than A/B testing
   - Need factorial design support
   - Need combination testing

### 🟢 Nice to Have
8. **Server-Side Testing**: Enterprise feature
9. **Team Collaboration**: Enterprise feature
10. **Personalization**: Beyond A/B testing
11. **Heatmaps**: Visual analytics
12. **Session Replay**: User behavior insights

## Suggested Next Steps for Improvements

### Phase 1: Core Testing Functionality (High Priority)
1. **Build Tracking Script**
   - Create lightweight JavaScript library (<10KB gzipped)
   - Implement visitor identification (cookies)
   - Handle variant assignment (consistent per visitor)
   - Track pageviews and custom events
   - Send events to API endpoint
   - Handle rate limiting and queuing
   - Deploy to CDN

2. **Create Test Builder**
   - Build multi-step test creation wizard
   - Add URL targeting (exact, contains, regex)
   - Add variant editor (HTML, CSS, JS)
   - Add goal configuration
   - Add traffic allocation slider
   - Add test preview mode
   - Generate tracking code

3. **Implement Statistical Engine**
   - Calculate conversion rates
   - Calculate confidence intervals
   - Calculate statistical significance (Chi-square test)
   - Implement Bayesian statistics (optional)
   - Show "winning variant" when significant
   - Add sample size calculator

### Phase 2: Visual Editor & Analytics (Medium Priority)
4. **Build Visual Editor**
   - Create Chrome extension or browser tool
   - Implement element selector (click to select)
   - Add WYSIWYG editing
   - Support text, image, and layout changes
   - Generate change JSON automatically
   - Add preview mode with variants

5. **Real-Time Analytics**
   - Set up Redis for caching
   - Aggregate events in real-time
   - Build websocket server
   - Update dashboard live
   - Show conversion funnel
   - Add segment analysis

6. **Goal Types**
   - Implement click goal tracking
   - Implement pageview goals
   - Implement form submission goals
   - Implement custom event goals
   - Implement revenue tracking
   - Add multiple goals per test

### Phase 3: Advanced Features (Nice to Have)
7. **Multivariate Testing**
   - Support multiple elements changing
   - Calculate all combinations
   - Show interaction effects
   - Need more advanced statistics

8. **Targeting & Segmentation**
   - Device targeting (mobile, desktop)
   - Browser targeting
   - Geographic targeting
   - Custom audience rules
   - URL parameter targeting

9. **Team Features**
   - Add team member invitations
   - Role-based permissions
   - Approval workflows
   - Activity logs
   - Shared test library

10. **Integrations**
    - Google Analytics integration
    - Google Tag Manager
    - Segment.com integration
    - Shopify integration
    - WordPress plugin
    - REST API for programmatic access

## Testing Strategy

### Unit Tests
- Test statistical calculations
- Test variant assignment algorithm
- Test goal tracking logic
- Test event aggregation

### Integration Tests
- Test tracking script end-to-end
- Test event ingestion pipeline
- Test API endpoints
- Test dashboard analytics

### Load Testing
- Test high-traffic scenarios (100K+ visitors/day)
- Test event ingestion rate
- Test database performance
- Test Redis caching

### Manual Testing Checklist
- [ ] User can create project
- [ ] User can create A/B test
- [ ] Tracking script loads on target site
- [ ] Variants are shown correctly
- [ ] Visitors are assigned consistently to variants
- [ ] Conversions are tracked
- [ ] Dashboard shows accurate stats
- [ ] Statistical significance is calculated correctly
- [ ] Can declare winner and end test

## Deployment Considerations

### Required Services
1. **CDN for Tracking Script**: Cloudflare, AWS CloudFront, or Fastly
2. **Redis**: For real-time stats aggregation (Upstash for serverless)
3. **Database**: PostgreSQL with good read performance
4. **Websockets**: For real-time dashboard (consider Pusher)

### Performance Requirements
- Tracking script load time: <100ms
- Event tracking API: <50ms response time
- Dashboard data refresh: <500ms
- Handle 1M+ events per day

### Scaling Considerations
- Use message queue for event ingestion (RabbitMQ, SQS)
- Use time-series database for events (TimescaleDB, InfluxDB)
- Shard database by project or date
- Use CDN for tracking script (critical)
- Implement rate limiting per project

### Environment Variables for Production
```env
NEXT_PUBLIC_APP_URL="https://testlift.com"
CDN_URL="https://cdn.testlift.com"
REDIS_URL="redis://..."
DATABASE_URL="postgresql://..."
TIMESERIES_DB_URL="postgresql://..."  # For events
PUSHER_APP_ID="..."
PUSHER_KEY="..."
PUSHER_SECRET="..."
```

## Performance Optimization

### Tracking Script Optimization
- Minimize bundle size (<10KB gzipped)
- Lazy load non-critical features
- Use async/defer for script loading
- Cache script aggressively (1 year)
- Use HTTP/2 server push

### Database Optimization
- Index on testId, visitorId, timestamp
- Partition events table by date
- Archive old events to cold storage
- Use read replicas for analytics
- Implement database connection pooling

### Real-Time Stats
- Use Redis for aggregated counts
- Update Redis on every event
- Sync to database periodically
- Use Redis Sorted Sets for time-series data

## Security Considerations

### Current Security Measures
✅ Password hashing
✅ JWT sessions

### Security Improvements Needed
- [ ] Rate limiting on tracking API (prevent abuse)
- [ ] CORS configuration for tracking endpoints
- [ ] Validate tracking events (prevent fake data)
- [ ] Hash visitor IDs for privacy
- [ ] Implement GDPR compliance (cookie consent)
- [ ] Audit logs for test changes
- [ ] Prevent script injection in variant changes
- [ ] Secure tracking script from tampering

### Privacy Considerations
- Don't track PII by default
- Support Do Not Track (DNT)
- Provide opt-out mechanism
- GDPR cookie consent
- Data retention policy (delete old events)

## Support & Maintenance

### Common Issues & Solutions
1. **"Tracking script not loading"**: Check CDN, check CORS, check ad blockers
2. **"Variants not showing"**: Check URL targeting, check traffic split
3. **"Conversions not tracking"**: Check goal configuration, check selector
4. **"Statistical significance not reached"**: Need more visitors, suggest sample size
5. **"Flicker effect"**: Tracking script loaded too late, move to <head>

### Monitoring
- Tracking script uptime (99.9% SLA)
- Event ingestion rate
- API response times
- Database query performance
- Redis memory usage
- Error rates on tracking events

### Contact Information
- Support: support@testlift.com (not configured)
- Privacy: privacy@testlift.com (not configured)
- Legal: legal@testlift.com (not configured)

## Handover Checklist

Before next session:
- [ ] All dependencies installed
- [ ] Database schema updated with Project, Test, Variant, Goal, Event models
- [ ] Redis installed and running
- [ ] Environment variables configured
- [ ] App starts without errors
- [ ] Understand statistical significance calculation (Chi-square test)
- [ ] Reviewed Optimizely/VWO architecture for inspiration
- [ ] Decided on tracking script architecture

## Conclusion

TestLift.com has a compelling value proposition and competitive pricing. The foundation is solid with authentication and UI in place. The main challenge is building a robust tracking script and statistical engine.

**Estimated completion**: 30% of production-ready features
**Next priority**: Tracking script and test builder
**Time to production**: 8-12 weeks with focused development
**Technical complexity**: High (requires expertise in statistics and real-time data processing)

The 75% price advantage over Optimizely is significant, but the product must deliver accurate results and handle high traffic reliably. Focus on performance and accuracy above all else.

---

*Last Updated: 2024-03-20*
*Version: 1.0*
*Author: AI Development Team*
