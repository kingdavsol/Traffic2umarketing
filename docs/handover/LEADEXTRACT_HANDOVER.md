# LeadExtract.com - Handover Documentation

## App Overview
LeadExtract is a LinkedIn profile scraper that helps sales teams and recruiters extract contact information from LinkedIn profiles into a structured format. The tool includes a Chrome extension for one-click extraction and a web dashboard for managing and exporting leads.

**Value Proposition**: "Extract LinkedIn leads in one click. 70% cheaper than ZoomInfo."
**Target Market**: Sales teams, recruiters, B2B marketers, lead generation agencies
**Competitive Advantage**: 70% cheaper than ZoomInfo and Apollo

## Domain & Access Information
- **Domain**: leadextract.com
- **Development Port**: 3008
- **Dev Command**: `npm run dev:leadextract` (from monorepo root)
- **App Directory**: `/apps/leadextract`
- **Chrome Extension**: `/apps/leadextract-extension` (TO BE CREATED)

## Tech Stack
- **Framework**: Next.js 14 (App Router) for web dashboard
- **Chrome Extension**: Vanilla JavaScript/TypeScript with Manifest V3
- **Language**: TypeScript
- **Styling**: TailwindCSS
- **UI Components**: Shared package (`@traffic2u/ui`)
- **Database**: Prisma + PostgreSQL (shared schema)
- **Authentication**: NextAuth.js (shared config)
- **Data Enrichment**: Not yet configured (consider Clearbit, Hunter.io)
- **Notifications**: react-hot-toast
- **Icons**: Lucide React

## Branding
- **Primary Color**: Purple (#7C3AED)
- **Logo**: User/profile extraction theme (200x200px)
- **Favicon**: Matching purple theme (32x32px)
- **Files**: `apps/leadextract/public/{logo.svg, favicon.svg}`

## File Structure
```
apps/leadextract/
├── public/
│   ├── logo.svg
│   └── favicon.svg
├── src/
│   ├── app/
│   │   ├── layout.tsx                    # Root layout
│   │   ├── page.tsx                      # Landing page
│   │   ├── dashboard/
│   │   │   └── page.tsx                  # Lead management
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
│   │       ├── leads/
│   │       │   ├── create/route.ts       # Save lead from extension
│   │       │   ├── bulk/route.ts         # Bulk extract (TO BE IMPLEMENTED)
│   │       │   ├── export/route.ts       # Export to CSV (TO BE IMPLEMENTED)
│   │       │   └── enrich/route.ts       # Enrich with email finder (TO BE IMPLEMENTED)
│   │       └── extension/
│   │           └── auth/route.ts         # Extension authentication
│   └── lib/
│       ├── prisma.ts
│       └── lead-enrichment.ts            # Email finding logic
├── package.json
├── next.config.js
├── tailwind.config.js
├── tsconfig.json
└── postcss.config.js

apps/leadextract-extension/  (TO BE CREATED)
├── manifest.json                         # Chrome extension manifest
├── popup/
│   ├── popup.html                        # Extension popup UI
│   ├── popup.js                          # Popup logic
│   └── popup.css                         # Popup styles
├── content/
│   ├── content.js                        # LinkedIn page scraper
│   └── content.css                       # Injected styles
├── background/
│   └── background.js                     # Background service worker
├── icons/
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
└── utils/
    ├── api.js                            # API communication
    └── scraper.js                        # LinkedIn DOM scraper
```

## Key Features Implemented

### ✅ Landing Page
- Hero section with purple gradient theme
- Social proof stats: "70% Cheaper", "500K+ Profiles extracted", "95% Email accuracy"
- Feature showcase (One-Click Extract, CSV Export, Bulk Extract, Compliant, Dashboard, Enrichment)
- Use cases (Sales teams, Recruiters, Marketers)
- 4-tier pricing section
- Customer testimonials
- Extension download CTA

### ✅ Authentication System
- User signup with validation
- User signin
- Password hashing
- Session management
- Protected routes
- Automatic free subscription

### ✅ Dashboard Features (Basic)
- Lead list view with mock data
- Lead cards showing:
  - Name
  - Title
  - Company
  - Email
  - Extraction date
- "Export to CSV" button (not functional yet)
- Search and filter UI (not functional yet)

### ✅ Admin Dashboard
- User metrics (Total Users, Total Leads, Avg. Extractions/User, Active Users)
- Recent activity monitoring
- User management
- Usage analytics

### ✅ Legal Pages
- Terms of Service
- Privacy Policy (IMPORTANT: includes compliance language for web scraping)

### ✅ Pricing Structure
| Plan | Price/mo | Features |
|------|----------|----------|
| Free | $0 | 50 exports/month, Basic info (name, title, company), Manual extraction, Email support |
| Starter | $19 | 500 exports/month, Email finder, Bulk extraction, CSV export, Priority support |
| Professional | $39 | 2,000 exports/month, Advanced enrichment, CRM integration, API access, Phone numbers, Dedicated support |
| Enterprise | $99 | Unlimited exports, Team collaboration, Custom integrations, White-label, SLA, Dedicated account manager |

**Competitor Comparison**: 70% cheaper than ZoomInfo ($250+/mo) and Apollo ($49-149/mo)

## Environment Variables Required

Create `.env.local` in `apps/leadextract/`:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/traffic2u?schema=public"

# NextAuth
NEXTAUTH_SECRET="your-generated-secret-here"
NEXTAUTH_URL="http://localhost:3008"

# Extension API Key (for authenticating extension requests)
EXTENSION_API_SECRET="random-long-secret-string"

# Email Finder APIs (choose one or multiple)
HUNTER_API_KEY="..."          # Hunter.io for email finding
CLEARBIT_API_KEY="..."        # Clearbit for enrichment
APOLLO_API_KEY="..."          # Apollo.io API
PROSPEO_API_KEY="..."         # Prospeo for email verification

# LinkedIn (NOT RECOMMENDED - against LinkedIn ToS)
# LINKEDIN_SESSION_COOKIE="..."  # DO NOT USE - violates LinkedIn ToS

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# Chrome Web Store
CHROME_EXTENSION_ID="..."     # After publishing to Chrome Web Store
```

## Database Setup

### Additional Schema Needed
Add these models to the shared Prisma schema:

```prisma
// Add to packages/database/prisma/schema.prisma

model Lead {
  id              String    @id @default(cuid())
  userId          String
  linkedInUrl     String?
  firstName       String?
  lastName        String?
  fullName        String
  headline        String?
  company         String?
  companyUrl      String?
  title           String?
  location        String?
  email           String?
  emailStatus     EmailStatus @default(PENDING)
  phone           String?
  profilePicture  String?
  about           String?   @db.Text
  experience      Json?     // Array of work experience
  education       Json?     // Array of education
  skills          String[]  // Array of skills
  connections     Int?
  isEnriched      Boolean   @default(false)
  tags            String[]
  notes           String?   @db.Text
  extractedAt     DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  user            User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  @@index([userId])
  @@index([email])
  @@index([company])
}

model ExtractionLog {
  id              String    @id @default(cuid())
  userId          String
  leadId          String?
  linkedInUrl     String
  status          ExtractionStatus @default(SUCCESS)
  errorMessage    String?
  ipAddress       String?
  userAgent       String?
  extractedAt     DateTime  @default(now())
  user            User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  @@index([userId])
  @@index([extractedAt])
}

model UsageQuota {
  id              String    @id @default(cuid())
  userId          String    @unique
  plan            Plan
  monthlyLimit    Int
  currentUsage    Int       @default(0)
  resetDate       DateTime
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  user            User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  @@index([userId])
}

enum EmailStatus {
  PENDING
  FOUND
  NOT_FOUND
  INVALID
  VERIFIED
}

enum ExtractionStatus {
  SUCCESS
  FAILED
  RATE_LIMITED
  BLOCKED
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
# Add Lead, ExtractionLog, UsageQuota models

# 4. Generate Prisma client
npx prisma generate

# 5. Create migration
npx prisma migrate dev --name add_leadextract_models

# 6. Create environment file
cd ../../apps/leadextract
cp .env.example .env.local
# Edit .env.local

# 7. Start development server
npm run dev:leadextract

# App available at http://localhost:3008

# 8. For Chrome extension development (when created)
# - Load unpacked extension in chrome://extensions
# - Point to apps/leadextract-extension directory
# - Enable Developer Mode
```

## Chrome Extension Setup (To Be Implemented)

### manifest.json Example
```json
{
  "manifest_version": 3,
  "name": "LeadExtract - LinkedIn Profile Scraper",
  "version": "1.0.0",
  "description": "Extract LinkedIn profiles in one click",
  "permissions": [
    "activeTab",
    "storage"
  ],
  "host_permissions": [
    "https://www.linkedin.com/*",
    "https://leadextract.com/*"
  ],
  "action": {
    "default_popup": "popup/popup.html",
    "default_icon": {
      "16": "icons/icon16.png",
      "48": "icons/icon48.png",
      "128": "icons/icon128.png"
    }
  },
  "content_scripts": [
    {
      "matches": ["https://www.linkedin.com/*"],
      "js": ["content/content.js"],
      "css": ["content/content.css"]
    }
  ],
  "background": {
    "service_worker": "background/background.js"
  }
}
```

## API Endpoints (To Be Implemented)

### POST /api/leads/create
Save extracted lead from Chrome extension
```typescript
// Headers: { "Authorization": "Bearer user-api-key" }

// Request
{
  "fullName": "John Doe",
  "title": "CEO",
  "company": "Acme Corp",
  "linkedInUrl": "https://www.linkedin.com/in/johndoe",
  "headline": "CEO at Acme Corp",
  "location": "San Francisco, CA",
  "profilePicture": "https://...",
  "experience": [...],
  "education": [...],
  "skills": ["Leadership", "Sales", ...]
}

// Response
{
  "success": true,
  "leadId": "clu...",
  "remainingQuota": 450
}
```

### POST /api/leads/enrich
Enrich lead with email finder
```typescript
// Request
{
  "leadId": "clu..."
}

// Response
{
  "success": true,
  "email": "john@acmecorp.com",
  "emailStatus": "VERIFIED",
  "phone": "+1-555-123-4567"
}
```

### GET /api/leads/export
Export leads to CSV
```typescript
// Query params: format=csv, startDate, endDate, tags

// Response: CSV file download
```

### POST /api/extension/auth
Authenticate Chrome extension
```typescript
// Request
{
  "email": "user@example.com",
  "password": "..."
}

// Response
{
  "success": true,
  "apiKey": "le_...",
  "plan": "STARTER",
  "quota": {
    "limit": 500,
    "used": 50,
    "remaining": 450
  }
}
```

## Known Limitations & Issues

### 🔴 Critical - Not Implemented
1. **Chrome Extension**: Entire extension not built
   - Need to create extension project
   - Need LinkedIn DOM scraper
   - Need popup UI for extraction
   - Need authentication flow
   - Need API communication
   - Need quota tracking
   - Directory to create: `apps/leadextract-extension/`

2. **LinkedIn Scraping Logic**: Core functionality missing
   - Need to parse LinkedIn profile HTML
   - Need to extract structured data
   - Need to handle different LinkedIn layouts
   - Need to handle rate limiting
   - IMPORTANT: Must comply with LinkedIn ToS
   - File to create: `apps/leadextract-extension/utils/scraper.js`

3. **Email Finding**: Not implemented
   - Need email finder API integration (Hunter.io, Clearbit)
   - Need email verification
   - Need fallback if primary API fails
   - File to create: `apps/leadextract/src/lib/lead-enrichment.ts`

4. **CSV Export**: Button shown but not functional
   - Need to generate CSV from leads
   - Need to handle large exports (streaming)
   - Need to include custom fields
   - File to create: `apps/leadextract/src/app/api/leads/export/route.ts`

### 🟡 Medium Priority
5. **Usage Quota Enforcement**: Not tracking usage
   - Need to check quota before extraction
   - Need to increment usage counter
   - Need to reset monthly
   - Need to notify user when approaching limit

6. **Bulk Extraction**: Feature mentioned but not built
   - Extract multiple profiles from search results
   - Extract from Sales Navigator
   - Queue extraction jobs

7. **CRM Integration**: Pro feature not built
   - Salesforce integration
   - HubSpot integration
   - Pipedrive integration

### 🟢 Nice to Have
8. **Phone Number Finding**: Pro feature
9. **Advanced Enrichment**: Company data, funding info
10. **Team Collaboration**: Enterprise feature
11. **API Access**: Pro feature
12. **Chrome Extension Options Page**: Settings, theme

### ⚠️ Legal & Compliance Concerns
- **LinkedIn Terms of Service**: Scraping LinkedIn may violate their ToS
- **GDPR Compliance**: Need proper data handling for EU users
- **CCPA Compliance**: Need proper data handling for CA users
- **Data Retention**: Need clear policy for storing personal data
- **Right to be Forgotten**: Need delete functionality
- **Opt-Out**: Need mechanism for people to request removal

## Suggested Next Steps for Improvements

### Phase 1: Chrome Extension Development (High Priority)
1. **Build Chrome Extension**
   - Create extension project structure
   - Build popup UI (login, extraction status, quota)
   - Implement content script for LinkedIn
   - Build LinkedIn DOM scraper
   - Handle different profile layouts
   - Add error handling
   - Add loading states

2. **LinkedIn Scraping Logic**
   - Parse profile header (name, title, company)
   - Parse About section
   - Parse Experience section (with dates)
   - Parse Education section
   - Parse Skills list
   - Handle missing fields gracefully
   - Add retry logic for failed extractions

3. **Extension-Dashboard Communication**
   - Implement authentication (API key)
   - Send extracted data to dashboard API
   - Handle API errors
   - Store API key securely (chrome.storage)
   - Sync quota with dashboard

### Phase 2: Data Enrichment & Export (Medium Priority)
4. **Email Finder Integration**
   - Integrate Hunter.io API (most popular)
   - Implement email verification
   - Add Clearbit as fallback
   - Store email confidence score
   - Handle API rate limits
   - Cache found emails

5. **CSV Export**
   - Build CSV generation endpoint
   - Include all lead fields
   - Allow custom field selection
   - Handle large exports (streaming)
   - Add filters (date range, tags, company)
   - Support Excel format (.xlsx)

6. **Usage Quota System**
   - Track extractions per user
   - Enforce plan limits
   - Show quota in dashboard
   - Show quota in extension
   - Reset monthly
   - Send notifications at 80%, 100%

### Phase 3: Advanced Features (Nice to Have)
7. **Bulk Extraction**
   - Extract from LinkedIn search results
   - Extract from Sales Navigator
   - Queue-based processing
   - Progress tracking
   - Export all at once

8. **CRM Integrations**
   - Salesforce: Create contacts/leads
   - HubSpot: Sync contacts
   - Pipedrive: Add deals
   - Zapier: Generic integration

9. **Advanced Enrichment**
   - Company data (industry, size, funding)
   - Social media profiles (Twitter, GitHub)
   - Technology stack (BuiltWith, Wappalyzer)
   - News mentions

10. **Team Features**
    - Shared lead database
    - Lead assignment
    - Activity tracking
    - Duplicate detection
    - Lead scoring

## Testing Strategy

### Unit Tests
- Test LinkedIn scraper with mock HTML
- Test email finder logic
- Test CSV generation
- Test quota calculations

### Integration Tests
- Test extension-dashboard communication
- Test lead creation workflow
- Test email enrichment flow
- Test export functionality

### Manual Testing Checklist
- [ ] Extension installs correctly
- [ ] User can log in via extension
- [ ] Extension extracts profile data correctly
- [ ] Extracted data appears in dashboard
- [ ] Email finding works
- [ ] Export to CSV works
- [ ] Quota is tracked correctly
- [ ] Extension handles errors gracefully
- [ ] Extension works on different LinkedIn layouts
- [ ] Extension respects rate limits

## Deployment Considerations

### Chrome Web Store Publishing
1. Create developer account ($5 one-time fee)
2. Prepare store listing:
   - Title, description, screenshots
   - Privacy policy link
   - Support email
3. Upload extension ZIP
4. Submit for review (can take 1-5 days)
5. Handle any rejection feedback
6. Publish to store

### Extension Distribution
- Chrome Web Store (primary)
- Direct download from website (requires enterprise distribution)
- Auto-update via Chrome Web Store

### Extension Security
- Content Security Policy (CSP)
- No inline scripts
- Secure API communication (HTTPS)
- Store sensitive data encrypted

### Environment Variables for Production
All development variables plus:
```env
NEXTAUTH_URL="https://leadextract.com"
CHROME_EXTENSION_ID="abc...xyz"  # From Chrome Web Store
HUNTER_API_KEY="production-key"
```

### Rate Limiting
- LinkedIn may block if too many requests
- Implement delays between extractions
- Rotate IP addresses (if using server-side scraping)
- Respect robots.txt

## Performance Optimization

### Extension Performance
- Minimize extension bundle size
- Use content script only on LinkedIn
- Lazy load popup UI
- Cache API responses locally
- Batch API requests

### Dashboard Performance
- Paginate lead list (50 per page)
- Index database on userId, email, company
- Cache frequently accessed data
- Use virtual scrolling for large lists

## Security Considerations

### Current Security Measures
✅ Password hashing
✅ JWT sessions

### Security Improvements Needed
- [ ] API key for extension (not password)
- [ ] Rate limiting on lead creation API
- [ ] Validate extracted data (prevent injection)
- [ ] Encrypt stored emails (GDPR requirement)
- [ ] Audit logs for data access
- [ ] Two-factor authentication
- [ ] Implement data retention policy (auto-delete after X months)
- [ ] GDPR consent for EU users
- [ ] CCPA opt-out for CA users

### LinkedIn Scraping Risks
- **Account Ban**: LinkedIn may ban accounts that scrape
- **IP Ban**: LinkedIn may block IPs
- **Legal Risk**: LinkedIn has sued scraping companies
- **Mitigation**:
  - Only scrape publicly visible data
  - Use official LinkedIn API where possible
  - Respect rate limits
  - Add delays between requests
  - Disclose scraping in Terms of Service

## Support & Maintenance

### Common Issues & Solutions
1. **"Extension not extracting"**: Check LinkedIn layout changes, update scraper
2. **"Email not found"**: Check API credits, check email finder API status
3. **"Quota exceeded"**: User needs to upgrade plan
4. **"LinkedIn blocking"**: Reduce extraction rate, add delays
5. **"Extension not loading"**: Check manifest.json, check permissions

### LinkedIn Layout Changes
- LinkedIn frequently updates their HTML structure
- Extension scraper will break when layout changes
- Need to monitor and update scraper regularly
- Consider using LinkedIn API instead (requires LinkedIn approval)

### Monitoring Alerts
- Extension errors (track via API)
- Email finder API failures
- Quota exceeded events
- CSV export failures
- LinkedIn rate limit errors

### Contact Information
- Support: support@leadextract.com (not configured)
- Privacy: privacy@leadextract.com (not configured)
- Legal: legal@leadextract.com (not configured)

## Legal Disclaimer

**IMPORTANT**: Web scraping LinkedIn may violate their Terms of Service. LinkedIn has a history of taking legal action against scraping services. Consider these alternatives:

1. **LinkedIn API**: Apply for LinkedIn API access (requires approval)
2. **LinkedIn Webhooks**: Use official webhooks for data
3. **User Input**: Ask users to manually input data
4. **Partnerships**: Partner with licensed data providers

If proceeding with scraping:
- Only scrape publicly available data
- Include disclaimer in Terms of Service
- Add opt-out mechanism
- Comply with GDPR, CCPA
- Consult with lawyer

## Handover Checklist

Before next session:
- [ ] All dependencies installed
- [ ] Database schema updated with Lead models
- [ ] Environment variables configured
- [ ] App starts without errors
- [ ] Can create account and sign in
- [ ] Dashboard displays correctly
- [ ] Decided on email finder API (Hunter.io recommended)
- [ ] Reviewed Chrome extension documentation
- [ ] Reviewed LinkedIn scraping legal risks
- [ ] Consulted legal team about compliance

## Conclusion

LeadExtract.com addresses a real need for sales teams and recruiters, but it comes with significant legal and technical challenges. The Chrome extension architecture is more complex than typical web apps, and LinkedIn scraping is legally risky.

**Estimated completion**: 25% of production-ready features
**Next priority**: Chrome extension and LinkedIn scraper
**Time to production**: 6-10 weeks with focused development
**Technical complexity**: High (Chrome extension + scraping + legal risks)
**Legal risk**: High (LinkedIn ToS violations)

**Recommendation**: Consider pivoting to use LinkedIn's official API or partnering with licensed data providers to avoid legal issues. Alternatively, focus on enriching user-provided data rather than scraping.

If proceeding with scraping, prioritize:
1. Strong legal disclaimer
2. GDPR/CCPA compliance
3. Respectful rate limiting
4. Opt-out mechanism
5. Data security

---

*Last Updated: 2024-03-20*
*Version: 1.0*
*Author: AI Development Team*
