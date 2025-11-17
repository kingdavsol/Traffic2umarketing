# LinkedBoost.com - Handover Documentation

## App Overview
LinkedBoost is a LinkedIn content scheduler with AI-powered optimization that helps users schedule posts, optimize content for engagement, and track analytics. The platform uses AI to suggest improvements and optimal posting times.

**Value Proposition**: "Grow your LinkedIn presence with AI-powered scheduling"
**Target Market**: LinkedIn creators, B2B marketers, personal brands, agencies
**Competitive Advantage**: 60% cheaper than Buffer and Hootsuite

## Domain & Access Information
- **Domain**: linkedboost.com
- **Development Port**: 3005
- **Dev Command**: `npm run dev:linkedboost` (from monorepo root)
- **App Directory**: `/apps/linkedboost`

## Tech Stack
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: TailwindCSS
- **UI Components**: Shared package (`@traffic2u/ui`)
- **Database**: Prisma + PostgreSQL (shared schema)
- **Authentication**: NextAuth.js (shared config) + LinkedIn OAuth
- **AI Integration**: OpenAI GPT-4 (for content optimization)
- **LinkedIn API**: For post publishing and analytics
- **Notifications**: react-hot-toast
- **Icons**: Lucide React

## Branding
- **Primary Color**: LinkedIn Blue (#0A66C2)
- **Logo**: LinkedIn-style theme (200x200px)
- **Favicon**: Matching blue theme (32x32px)
- **Files**: `apps/linkedboost/public/{logo.svg, favicon.svg}`

## File Structure
```
apps/linkedboost/
├── public/
│   ├── logo.svg
│   └── favicon.svg
├── src/
│   ├── app/
│   │   ├── layout.tsx                    # Root layout
│   │   ├── page.tsx                      # Landing page
│   │   ├── dashboard/
│   │   │   └── page.tsx                  # Post scheduler & calendar
│   │   ├── admin/
│   │   │   └── page.tsx                  # Admin dashboard
│   │   ├── auth/
│   │   │   ├── signup/page.tsx
│   │   │   ├── signin/page.tsx
│   │   │   └── linkedin/callback/page.tsx  # LinkedIn OAuth callback
│   │   ├── privacy/
│   │   │   └── page.tsx
│   │   ├── terms/
│   │   │   └── page.tsx
│   │   └── api/
│   │       ├── auth/
│   │       │   ├── [...nextauth]/route.ts
│   │       │   └── register/route.ts
│   │       ├── linkedin/
│   │       │   ├── connect/route.ts      # Connect LinkedIn account
│   │       │   └── callback/route.ts     # OAuth callback handler
│   │       ├── posts/
│   │       │   ├── create/route.ts       # Create scheduled post
│   │       │   ├── publish/route.ts      # Publish to LinkedIn
│   │       │   └── optimize/route.ts     # AI content optimization
│   │       └── cron/
│   │           └── publish-scheduled/route.ts  # Cron job for publishing
│   └── lib/
│       ├── prisma.ts
│       └── linkedin.ts                   # LinkedIn API client
├── package.json
├── next.config.js
├── tailwind.config.js
├── tsconfig.json
└── postcss.config.js
```

## Key Features Implemented

### ✅ Landing Page
- Hero section with LinkedIn blue theme
- Social proof stats: "60% cheaper", "87% Higher engagement", "2M+ Posts scheduled"
- Feature showcase (AI Optimization, Smart Scheduling, Analytics, Hashtag Suggestions, Team Collaboration)
- 4-tier pricing section
- Customer testimonials
- Integration showcase

### ✅ Authentication System
- User signup with validation
- User signin
- Password hashing
- Session management
- Protected routes
- Automatic free subscription

### ✅ Dashboard Features (Basic)
- Post list view with mock data
- Status badges (scheduled/published)
- Engagement metrics (likes, comments, shares) for published posts
- Post preview
- Edit and delete buttons
- "New Post" button (no modal yet)

### ✅ Admin Dashboard
- User metrics (Total Users, Scheduled Posts, Avg. Engagement, Active Users)
- Recent activity monitoring
- User management
- Content moderation

### ✅ Legal Pages
- Terms of Service
- Privacy Policy

### ✅ Pricing Structure
| Plan | Price/mo | Features |
|------|----------|----------|
| Free | $0 | 5 posts/month, Basic analytics, 1 LinkedIn account, Email support |
| Starter | $15 | 30 posts/month, AI optimization, Advanced analytics, 3 LinkedIn accounts, Priority support |
| Professional | $29 | 100 posts/month, Team collaboration (3 members), Unlimited LinkedIn accounts, Custom templates, API access |
| Enterprise | $79 | Unlimited posts, Unlimited team members, White-label, Dedicated support, Custom integrations, SLA |

**Competitor Comparison**: 60% cheaper than Buffer ($60+/mo) and Hootsuite ($99+/mo)

## Environment Variables Required

Create `.env.local` in `apps/linkedboost/`:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/traffic2u?schema=public"

# NextAuth
NEXTAUTH_SECRET="your-generated-secret-here"
NEXTAUTH_URL="http://localhost:3005"

# LinkedIn OAuth
LINKEDIN_CLIENT_ID="your-linkedin-app-client-id"
LINKEDIN_CLIENT_SECRET="your-linkedin-app-client-secret"
LINKEDIN_REDIRECT_URI="http://localhost:3005/auth/linkedin/callback"

# OpenAI (for AI content optimization)
OPENAI_API_KEY="sk-..."

# Cron Job Secret (for Vercel Cron or similar)
CRON_SECRET="random-secret-string"

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
```

## LinkedIn API Setup

### Create LinkedIn App
1. Go to https://www.linkedin.com/developers/apps
2. Create new app
3. Select company page
4. Add OAuth 2.0 redirect URL: `http://localhost:3005/auth/linkedin/callback`
5. Request permissions:
   - `r_liteprofile` - Read basic profile
   - `r_emailaddress` - Read email
   - `w_member_social` - Post on behalf of member
   - `r_organization_social` - Read company posts
   - `w_organization_social` - Post on company page
6. Copy Client ID and Client Secret to `.env.local`

### LinkedIn API Limitations
- Free tier: Limited to personal posts only
- Marketing API access required for company pages (needs approval)
- Rate limits: 100 requests per user per day
- Posts cannot be edited after publishing

## Database Setup

### Additional Schema Needed
Add these models to the shared Prisma schema:

```prisma
// Add to packages/database/prisma/schema.prisma

model LinkedInAccount {
  id              String    @id @default(cuid())
  userId          String
  linkedInId      String    @unique
  name            String
  email           String?
  profileUrl      String?
  profilePicture  String?
  accessToken     String    // Encrypt in production
  refreshToken    String?   // Encrypt in production
  expiresAt       DateTime?
  isActive        Boolean   @default(true)
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  user            User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  posts           Post[]
  @@index([userId])
}

model Post {
  id                String    @id @default(cuid())
  userId            String
  linkedInAccountId String
  content           String    @db.Text
  images            Json?     // Array of image URLs
  scheduledFor      DateTime?
  publishedAt       DateTime?
  linkedInPostId    String?   @unique
  status            PostStatus @default(DRAFT)
  engagement        Json?     // {likes, comments, shares, views}
  optimizedBy       Boolean   @default(false)
  hashtags          String[]
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt
  user              User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  linkedInAccount   LinkedInAccount @relation(fields: [linkedInAccountId], references: [id], onDelete: Cascade)
  analytics         PostAnalytics[]
  @@index([userId])
  @@index([linkedInAccountId])
  @@index([scheduledFor])
  @@index([status])
}

model PostAnalytics {
  id              String    @id @default(cuid())
  postId          String
  likes           Int       @default(0)
  comments        Int       @default(0)
  shares          Int       @default(0)
  views           Int       @default(0)
  clickThroughs   Int       @default(0)
  engagementRate  Float     @default(0)
  timestamp       DateTime  @default(now())
  post            Post      @relation(fields: [postId], references: [id], onDelete: Cascade)
  @@index([postId])
  @@index([timestamp])
}

model Team {
  id              String    @id @default(cuid())
  name            String
  ownerId         String
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  owner           User      @relation("TeamOwner", fields: [ownerId], references: [id], onDelete: Cascade)
  members         TeamMember[]
}

model TeamMember {
  id              String    @id @default(cuid())
  teamId          String
  userId          String
  role            TeamRole  @default(MEMBER)
  joinedAt        DateTime  @default(now())
  team            Team      @relation(fields: [teamId], references: [id], onDelete: Cascade)
  user            User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  @@unique([teamId, userId])
}

enum PostStatus {
  DRAFT
  SCHEDULED
  PUBLISHING
  PUBLISHED
  FAILED
}

enum TeamRole {
  OWNER
  ADMIN
  MEMBER
  VIEWER
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
# Add LinkedInAccount, Post, PostAnalytics, Team, TeamMember models

# 4. Generate Prisma client
npx prisma generate

# 5. Create migration
npx prisma migrate dev --name add_linkedboost_models

# 6. Set up LinkedIn App (see LinkedIn API Setup section)

# 7. Create environment file
cd ../../apps/linkedboost
cp .env.example .env.local
# Edit .env.local with LinkedIn credentials

# 8. Start development server
npm run dev:linkedboost

# App available at http://localhost:3005
```

## API Endpoints (To Be Implemented)

### POST /api/linkedin/connect
Initiate LinkedIn OAuth flow
```typescript
// Redirects to LinkedIn OAuth URL
```

### GET /api/linkedin/callback
Handle LinkedIn OAuth callback
```typescript
// Query params: code, state
// Exchanges code for access token
// Stores tokens in database
// Response: Redirect to dashboard
```

### POST /api/posts/create
Create new scheduled post
```typescript
// Request
{
  "linkedInAccountId": "clu...",
  "content": "Excited to announce...",
  "scheduledFor": "2024-03-25T10:00:00Z",
  "images": ["https://..."],
  "hashtags": ["#AI", "#LinkedIn"]
}

// Response
{
  "success": true,
  "postId": "clu...",
  "message": "Post scheduled successfully"
}
```

### POST /api/posts/optimize
AI-powered content optimization
```typescript
// Request
{
  "content": "Check out our new product...",
  "tone": "professional",  // professional, casual, enthusiastic
  "goal": "engagement"     // engagement, traffic, awareness
}

// Response
{
  "success": true,
  "optimizedContent": "🚀 Excited to share our groundbreaking product...",
  "suggestedHashtags": ["#Innovation", "#Tech", "#Product"],
  "improvements": [
    "Added emoji for visual appeal",
    "Stronger opening hook",
    "Added call-to-action"
  ]
}
```

### POST /api/posts/publish
Manually publish post immediately
```typescript
// Request
{
  "postId": "clu..."
}

// Response
{
  "success": true,
  "linkedInPostId": "urn:li:share:...",
  "postUrl": "https://www.linkedin.com/feed/update/..."
}
```

### GET /api/cron/publish-scheduled
Cron job to publish scheduled posts (called by Vercel Cron)
```typescript
// Headers: { "Authorization": "Bearer CRON_SECRET" }

// Response
{
  "published": 5,
  "failed": 0
}
```

## Known Limitations & Issues

### 🔴 Critical - Not Implemented
1. **LinkedIn OAuth Integration**: Not connected
   - Need to implement OAuth flow
   - Need to handle token refresh
   - Need to encrypt tokens at rest
   - Files to create:
     - `apps/linkedboost/src/app/api/linkedin/connect/route.ts`
     - `apps/linkedboost/src/app/api/linkedin/callback/route.ts`
     - `apps/linkedboost/src/lib/linkedin.ts`

2. **Post Publishing to LinkedIn**: Core functionality missing
   - Need to integrate with LinkedIn Share API
   - Need to handle image uploads to LinkedIn
   - Need error handling for API failures
   - Need retry logic
   - File to create: `apps/linkedboost/src/lib/linkedin-publisher.ts`

3. **Post Scheduler UI**: No form to create posts
   - Need rich text editor
   - Need image upload
   - Need date/time picker
   - Need hashtag suggestions
   - Need preview
   - File to create: `apps/linkedboost/src/components/PostComposer.tsx`

4. **Cron Job for Scheduled Posts**: Not set up
   - Need Vercel Cron or similar
   - Need to query scheduled posts
   - Need to publish at scheduled time
   - Need to update status
   - File already referenced: `apps/linkedboost/src/app/api/cron/publish-scheduled/route.ts`

### 🟡 Medium Priority
5. **AI Content Optimization**: Mentioned but not implemented
   - Need OpenAI integration
   - Need prompt engineering for LinkedIn content
   - Need to analyze engagement patterns
   - Need tone and style options

6. **Analytics Tracking**: Shows mock engagement
   - Need to fetch real data from LinkedIn API
   - Need to track engagement over time
   - Need analytics dashboard
   - Need engagement rate calculations

7. **Optimal Posting Time Suggestions**: Feature mentioned but not built
   - Need to analyze user's best posting times
   - Need ML model or heuristics
   - Consider time zones

### 🟢 Nice to Have
8. **Team Collaboration**: Pro/Enterprise feature
9. **Content Calendar View**: Better UX for scheduling
10. **Post Templates**: Reusable content templates
11. **Carousel Posts**: Multi-image posts
12. **Video Support**: LinkedIn video posts
13. **Company Page Support**: Post to company pages

## Suggested Next Steps for Improvements

### Phase 1: Core LinkedIn Integration (High Priority)
1. **Implement LinkedIn OAuth**
   - Build OAuth authorization flow
   - Store access tokens securely (encrypt)
   - Implement token refresh logic
   - Handle multiple LinkedIn accounts per user
   - Add "Connect LinkedIn" button in dashboard

2. **Build Post Publisher**
   - Integrate LinkedIn Share API
   - Handle image uploads (LinkedIn's media upload API)
   - Implement error handling and retries
   - Update post status in database
   - Store LinkedIn post ID for tracking

3. **Create Post Composer**
   - Build rich text editor (simple textarea + formatting)
   - Add image upload (to S3, then LinkedIn)
   - Add date/time picker for scheduling
   - Add hashtag input
   - Add character counter (LinkedIn limit: 3000 chars)
   - Add preview mode

### Phase 2: Scheduling & Automation (Medium Priority)
4. **Set Up Cron Job**
   - Configure Vercel Cron (or alternatives)
   - Query posts where scheduledFor <= now
   - Publish to LinkedIn
   - Update post status
   - Send notifications on success/failure
   - Handle failures with retry logic

5. **Build Analytics Dashboard**
   - Fetch engagement data from LinkedIn API
   - Store analytics in PostAnalytics model
   - Display charts (likes, comments, shares over time)
   - Calculate engagement rate
   - Show best performing posts
   - Export analytics to CSV

6. **AI Content Optimization**
   - Integrate OpenAI GPT-4
   - Build prompts for LinkedIn content
   - Offer tone options (professional, casual, enthusiastic)
   - Suggest hashtags based on content
   - Suggest optimal length
   - A/B testing suggestions

### Phase 3: Advanced Features (Nice to Have)
7. **Optimal Posting Time**
   - Track user's past post performance by time
   - Calculate best posting times
   - Suggest times when creating posts
   - Consider audience time zones

8. **Content Calendar**
   - Build calendar view (month, week, day)
   - Drag-and-drop rescheduling
   - Visual post preview in calendar
   - Filter by account or status

9. **Team Collaboration**
   - Implement team creation
   - Add role-based permissions
   - Approval workflow for posts
   - Activity feed for team
   - Assign posts to team members

10. **Advanced Post Types**
    - Carousel posts (multiple images)
    - Video posts (upload to LinkedIn)
    - LinkedIn articles (long-form)
    - Polls
    - Document posts

## Testing Strategy

### Unit Tests
- Test LinkedIn API client methods
- Test token refresh logic
- Test post scheduling logic
- Test AI optimization prompts

### Integration Tests
- Test OAuth flow end-to-end
- Test post publishing to LinkedIn
- Test cron job execution
- Test analytics fetching

### Manual Testing Checklist
- [ ] User can connect LinkedIn account
- [ ] User can disconnect LinkedIn account
- [ ] User can create scheduled post
- [ ] User can edit scheduled post
- [ ] User can delete scheduled post
- [ ] Cron job publishes posts at scheduled time
- [ ] Published posts show engagement metrics
- [ ] AI optimization improves content
- [ ] Multiple LinkedIn accounts work
- [ ] Token refresh works when tokens expire

## Deployment Considerations

### Vercel Cron Configuration
Add to `vercel.json` in app root:
```json
{
  "crons": [
    {
      "path": "/api/cron/publish-scheduled",
      "schedule": "*/5 * * * *"
    }
  ]
}
```
Runs every 5 minutes to publish scheduled posts.

### Environment Variables for Production
All development variables plus:
```env
NEXTAUTH_URL="https://linkedboost.com"
LINKEDIN_REDIRECT_URI="https://linkedboost.com/auth/linkedin/callback"
CRON_SECRET="production-secret"
```

### Security Considerations
- Encrypt LinkedIn access tokens at rest (use crypto library)
- Rotate CRON_SECRET regularly
- Implement rate limiting on API routes
- Validate all inputs server-side
- Use HTTPS only

### LinkedIn API Rate Limits
- Personal posts: 100 requests per user per day
- Company posts: Higher limits with Marketing API access
- Implement rate limit tracking
- Queue posts if approaching limits
- Notify users of failures

### Monitoring
- Track LinkedIn API errors
- Monitor cron job execution
- Alert on publishing failures
- Track token refresh failures
- Monitor API rate limit usage

## Performance Optimization

### Current Performance
- Dashboard loads mock data instantly

### Optimization Opportunities
1. **Cron Job Optimization**
   - Batch queries for scheduled posts
   - Parallel publishing (with rate limits)
   - Use database indexes on scheduledFor

2. **Analytics Caching**
   - Cache engagement data (update hourly)
   - Use Redis for real-time stats
   - Aggregate historical data

3. **Image Handling**
   - Compress images before upload
   - Use CDN for image storage
   - Optimize image formats (WebP)

## Security Considerations

### Current Security Measures
✅ Password hashing
✅ JWT sessions

### Security Improvements Needed
- [ ] Encrypt LinkedIn tokens (use @aws-sdk/client-kms or similar)
- [ ] Rate limiting on post creation
- [ ] CSRF protection on OAuth callback
- [ ] Validate LinkedIn state parameter
- [ ] Implement content moderation (prevent spam)
- [ ] Audit logs for post actions
- [ ] Two-factor authentication
- [ ] Secure cron job endpoint (verify CRON_SECRET)

### Compliance Considerations
- LinkedIn Terms of Service compliance
- Don't auto-follow, auto-like, or auto-comment (violates LinkedIn policy)
- Respect user privacy
- GDPR compliance for user data
- Clear data retention policy

## Support & Maintenance

### Common Issues & Solutions
1. **"LinkedIn connection failed"**: Check OAuth credentials, check redirect URI
2. **"Post failed to publish"**: Check LinkedIn API status, check token validity, check rate limits
3. **"Token expired"**: Implement token refresh logic
4. **"Image upload failed"**: Check file size, check format, check LinkedIn media API
5. **"Cron job not running"**: Check Vercel Cron config, check CRON_SECRET

### LinkedIn API Known Issues
- LinkedIn APIs can be unstable
- Rate limits are strict
- No edit functionality after publishing
- Company page access requires Marketing API approval
- Real-time analytics not available (delayed by hours)

### Monitoring Alerts
- Publishing failure rate > 5%
- Token refresh failures
- Cron job execution failures
- LinkedIn API errors
- Rate limit warnings

### Contact Information
- Support: support@linkedboost.com (not configured)
- Privacy: privacy@linkedboost.com (not configured)
- Legal: legal@linkedboost.com (not configured)

## Handover Checklist

Before next session:
- [ ] All dependencies installed
- [ ] Database schema updated with LinkedIn models
- [ ] LinkedIn app created at https://www.linkedin.com/developers/apps
- [ ] LinkedIn OAuth credentials added to .env.local
- [ ] Environment variables configured
- [ ] App starts without errors
- [ ] Can create account and sign in
- [ ] Dashboard displays correctly
- [ ] Reviewed LinkedIn Share API documentation
- [ ] Understand OAuth flow

## Conclusion

LinkedBoost.com has a strong foundation and competitive pricing. The main work is integrating with LinkedIn's APIs (OAuth and Share API), building the post composer, and setting up the publishing cron job.

**Estimated completion**: 35% of production-ready features
**Next priority**: LinkedIn OAuth and post publishing
**Time to production**: 4-6 weeks with focused development
**Technical complexity**: Medium (LinkedIn API can be tricky)

Success depends on LinkedIn API reliability and staying within rate limits. The AI optimization feature can be a strong differentiator.

---

*Last Updated: 2024-03-20*
*Version: 1.0*
*Author: AI Development Team*
