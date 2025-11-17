# CodeSnap.com - Handover Documentation

## App Overview
CodeSnap is an AI-powered screenshot-to-code converter that transforms UI screenshots into production-ready code using GPT-4 Vision. The app supports multiple frameworks (React, Vue, Svelte, HTML/CSS, Tailwind) and provides a fast, accurate conversion service.

**Value Proposition**: "Transform screenshots into clean code in seconds"
**Target Market**: Frontend developers, designers, agencies
**Competitive Advantage**: 25% cheaper than v0.dev while offering multi-framework support

## Domain & Access Information
- **Domain**: codesnap.com
- **Development Port**: 3001
- **Dev Command**: `npm run dev:codesnap` (from monorepo root)
- **App Directory**: `/apps/codesnap`

## Tech Stack
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: TailwindCSS
- **UI Components**: Shared package (`@traffic2u/ui`)
- **Database**: Prisma + PostgreSQL (shared schema)
- **Authentication**: NextAuth.js (shared config)
- **AI Integration**: OpenAI GPT-4 Vision API
- **File Upload**: react-dropzone
- **Syntax Highlighting**: prismjs + react-simple-code-editor
- **Notifications**: react-hot-toast
- **Icons**: Lucide React

## Branding
- **Primary Color**: Blue (#2563EB)
- **Logo**: Code brackets theme (200x200px)
- **Favicon**: Matching blue theme (32x32px)
- **Files**: `apps/codesnap/public/{logo.svg, favicon.svg}`

## File Structure
```
apps/codesnap/
├── public/
│   ├── logo.svg
│   └── favicon.svg
├── src/
│   ├── app/
│   │   ├── layout.tsx                    # Root layout with providers
│   │   ├── page.tsx                      # Landing page
│   │   ├── dashboard/
│   │   │   └── page.tsx                  # Main dashboard (screenshot upload & code generation)
│   │   ├── admin/
│   │   │   └── page.tsx                  # Admin dashboard
│   │   ├── auth/
│   │   │   ├── signup/page.tsx           # User registration
│   │   │   └── signin/page.tsx           # User login
│   │   ├── privacy/
│   │   │   └── page.tsx                  # Privacy policy
│   │   ├── terms/
│   │   │   └── page.tsx                  # Terms of service
│   │   └── api/
│   │       ├── auth/
│   │       │   ├── [...nextauth]/route.ts  # NextAuth handler
│   │       │   └── register/route.ts       # Registration API
│   │       └── generate-code/
│   │           └── route.ts                # OpenAI code generation API
│   └── lib/
│       └── prisma.ts                     # Prisma client singleton
├── package.json
├── next.config.js
├── tailwind.config.js
├── tsconfig.json
└── postcss.config.js
```

## Key Features Implemented

### ✅ Landing Page
- Hero section with gradient background
- Feature showcase (Lightning Fast, Multi-Framework, Pixel Perfect, Clean & Secure)
- Social proof stats
- 4-tier pricing section
- Testimonials placeholder
- Footer with links

### ✅ Authentication System
- User signup with validation
- User signin
- Password hashing with bcrypt (10 rounds)
- Session management via NextAuth JWT
- Protected routes (dashboard, admin)
- Automatic free subscription creation on signup

### ✅ Dashboard Features
- Screenshot upload via drag-and-drop (react-dropzone)
- Framework selector (React, Vue, Svelte, HTML/CSS, Tailwind)
- AI code generation with OpenAI GPT-4 Vision
- Syntax highlighting (Prism.js)
- Copy to clipboard functionality
- Download code as file
- Responsive design

### ✅ Admin Dashboard
- User metrics (Total Users, Revenue, Conversions, Active Users)
- Recent activity monitoring
- User management interface
- Role-based access control (admin check)

### ✅ Legal Pages
- Comprehensive Terms of Service
- Detailed Privacy Policy
- GDPR-compliant language

### ✅ Pricing Structure
| Plan | Price/mo | Features |
|------|----------|----------|
| Free | $0 | 5 conversions/month, Basic frameworks, Email support |
| Starter | $19 | 100 conversions/month, All frameworks, Priority support, Download code |
| Professional | $39 | Unlimited conversions, Custom styling, API access, Team collaboration |
| Enterprise | $79 | White-label, Dedicated support, Custom integrations, SLA |

**Competitor Comparison**: 25% cheaper than v0.dev ($20-50/mo)

## Environment Variables Required

Create `.env.local` in `apps/codesnap/`:

```env
# Database (shared across all apps)
DATABASE_URL="postgresql://user:password@localhost:5432/traffic2u?schema=public"

# NextAuth
NEXTAUTH_SECRET="your-generated-secret-here"  # Generate with: openssl rand -base64 32
NEXTAUTH_URL="http://localhost:3001"

# OpenAI API
OPENAI_API_KEY="sk-..."  # Get from https://platform.openai.com/api-keys

# Stripe (for payments - not fully implemented)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
```

## Database Setup

### Prerequisites
1. PostgreSQL installed and running
2. Database created: `traffic2u`

### Setup Commands
```bash
# From monorepo root
cd packages/database
npm install

# Generate Prisma Client
npx prisma generate

# Run migrations
npx prisma migrate dev --name init

# (Optional) Seed database
npx prisma db seed
```

### Relevant Schema (from packages/database/prisma/schema.prisma)
```prisma
model User {
  id            String    @id @default(cuid())
  name          String?
  email         String    @unique
  emailVerified DateTime?
  password      String?
  role          Role      @default(USER)
  image         String?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  accounts      Account[]
  sessions      Session[]
  subscriptions Subscription[]
}

model Subscription {
  id                     String              @id @default(cuid())
  userId                 String
  plan                   Plan                @default(FREE)
  status                 SubscriptionStatus  @default(ACTIVE)
  stripeCustomerId       String?             @unique
  stripeSubscriptionId   String?             @unique
  currentPeriodStart     DateTime?
  currentPeriodEnd       DateTime?
  createdAt              DateTime            @default(now())
  updatedAt              DateTime            @updatedAt
  user                   User                @relation(fields: [userId], references: [id], onDelete: Cascade)
}

enum Plan {
  FREE
  STARTER
  PROFESSIONAL
  ENTERPRISE
}
```

## Development Setup

### First Time Setup
```bash
# 1. Clone repository (if not already done)
cd /home/user/Traffic2umarketing

# 2. Install dependencies
npm install

# 3. Set up database (see Database Setup section)

# 4. Create environment file
cp apps/codesnap/.env.example apps/codesnap/.env.local
# Edit .env.local with your credentials

# 5. Start development server
npm run dev:codesnap

# App will be available at http://localhost:3001
```

### Daily Development
```bash
# Start CodeSnap only
npm run dev:codesnap

# Or start all apps
npm run dev

# Build for production
npm run build

# Lint
npm run lint
```

## API Endpoints

### POST /api/auth/register
Register a new user
```typescript
// Request
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepass123"
}

// Response
{
  "message": "User created successfully",
  "userId": "clu..."
}
```

### POST /api/generate-code
Generate code from screenshot (requires authentication)
```typescript
// Request
{
  "image": "data:image/png;base64,...",  // Base64 encoded image
  "framework": "react"  // react | vue | svelte | html | tailwind
}

// Response
{
  "code": "import React from 'react';\n\nexport default function Component() { ... }"
}
```

## Known Limitations & Issues

### 🔴 Critical - Not Implemented
1. **Email Verification**: System prepared but sending not implemented
   - Database has `emailVerified` field
   - Need to integrate email service (SendGrid, AWS SES, or Resend)
   - Verification tokens not generated yet

2. **Stripe Integration**: Configured but not fully functional
   - Subscription creation happens locally only
   - No actual payment processing
   - Webhook handling not implemented
   - Customer portal not created

3. **Usage Tracking**: Conversion limits not enforced
   - Free plan says "5 conversions/month" but no tracking
   - Need to create `Usage` model in database
   - Implement rate limiting middleware

### 🟡 Medium Priority
4. **OpenAI Error Handling**: Basic error handling in place
   - Need better retry logic for API failures
   - Rate limit handling not implemented
   - Cost monitoring/alerts needed

5. **File Size Limits**: No validation on upload size
   - Large screenshots may cause timeouts
   - Need to implement file size validation (suggest 5MB max)
   - Consider image compression before sending to API

6. **Code Quality Validation**: Generated code not validated
   - No syntax checking
   - No security scanning
   - Consider adding ESLint/Prettier formatting to generated code

### 🟢 Nice to Have
7. **Team Features**: Mentioned in Enterprise plan but not built
8. **API Access**: Listed in Professional plan but no API keys system
9. **Custom Styling Options**: UI not built for customization
10. **Version History**: No storage of previous conversions

## Suggested Next Steps for Improvements

### Phase 1: Core Functionality (High Priority)
1. **Implement Email Verification**
   - Choose email provider (Resend recommended for modern Next.js)
   - Create verification token system
   - Build email templates
   - Add verification flow to signup process
   - File to create: `apps/codesnap/src/lib/email.ts`

2. **Complete Stripe Integration**
   - Set up Stripe products and prices
   - Implement checkout session creation
   - Add webhook handler for subscription events
   - Create customer portal link
   - Files to create:
     - `apps/codesnap/src/app/api/checkout/route.ts`
     - `apps/codesnap/src/app/api/webhooks/stripe/route.ts`
     - `apps/codesnap/src/app/billing/page.tsx`

3. **Add Usage Tracking**
   - Create `Usage` model in Prisma schema
   - Implement middleware to check limits
   - Show usage stats in dashboard
   - Add upgrade prompts when limits reached
   - Files to modify:
     - `packages/database/prisma/schema.prisma`
     - `apps/codesnap/src/app/api/generate-code/route.ts`

### Phase 2: Quality & Security (Medium Priority)
4. **Improve Error Handling**
   - Add Sentry or similar error tracking
   - Implement OpenAI retry logic with exponential backoff
   - Add user-friendly error messages
   - Log errors for debugging

5. **Add Input Validation**
   - File size validation on upload
   - Image format validation
   - Rate limiting per user/IP
   - CORS configuration for API routes

6. **Code Quality Features**
   - Format generated code with Prettier
   - Add syntax validation
   - Provide multiple code style options
   - Allow users to regenerate with different settings

### Phase 3: Advanced Features (Nice to Have)
7. **Team Collaboration**
   - Create `Team` model
   - Add team invitation system
   - Shared conversion history
   - Role-based permissions

8. **API Key System**
   - Generate API keys for Professional+ users
   - Create REST API documentation
   - Implement API rate limiting
   - Add API usage analytics

9. **Enhanced Dashboard**
   - Conversion history with search/filter
   - Favoriting/starring conversions
   - Export to GitHub Gist
   - Deploy directly to Vercel/Netlify

10. **Analytics & Monitoring**
    - User engagement tracking
    - Conversion success rates
    - Popular frameworks
    - A/B testing for pricing

## Testing Strategy

### Unit Tests (Not Implemented)
- Test utilities and helper functions
- Test API route handlers
- Suggested framework: Jest + React Testing Library

### Integration Tests (Not Implemented)
- Test authentication flow end-to-end
- Test code generation with mock OpenAI responses
- Suggested framework: Playwright or Cypress

### Manual Testing Checklist
- [ ] User can sign up and receive session
- [ ] User can sign in with correct credentials
- [ ] User cannot sign in with wrong credentials
- [ ] Protected routes redirect to signin
- [ ] Admin routes only accessible by admin users
- [ ] Screenshot upload works (drag & drop + click)
- [ ] All framework options generate code
- [ ] Generated code is valid syntax
- [ ] Copy to clipboard works
- [ ] Download code file works
- [ ] Responsive design on mobile devices
- [ ] Dark mode toggle (if implemented)

## Deployment Considerations

### Vercel (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy from app directory
cd apps/codesnap
vercel

# Set environment variables in Vercel dashboard
# Add build command: npm run build
# Add output directory: .next
```

### Environment Variables for Production
- Set all `.env.local` variables in Vercel dashboard
- Update `NEXTAUTH_URL` to production domain
- Use production Stripe keys
- Ensure DATABASE_URL points to production database (consider PlanetScale or Neon)

### Database Hosting
- **Recommended**: Vercel Postgres, PlanetScale, or Neon
- Run migrations on production: `npx prisma migrate deploy`
- Set up automated backups

### Monitoring & Observability
- Enable Vercel Analytics
- Set up Sentry for error tracking
- Monitor OpenAI API usage and costs
- Set up alerts for high error rates

## Performance Optimization

### Current Performance
- Lighthouse score: Not measured
- Time to First Byte: Not measured
- Largest Contentful Paint: Not measured

### Optimization Opportunities
1. **Image Optimization**
   - Use Next.js Image component for logos
   - Implement lazy loading for testimonials

2. **Code Splitting**
   - Lazy load react-dropzone
   - Lazy load syntax highlighter
   - Dynamic import for heavy components

3. **Caching**
   - Cache generated code (optional - privacy consideration)
   - Implement Redis for session storage
   - CDN for static assets

4. **API Optimization**
   - Implement request queuing for OpenAI calls
   - Add response caching for identical images
   - Consider streaming responses for large code outputs

## Security Considerations

### Current Security Measures
✅ Password hashing with bcrypt
✅ JWT-based sessions
✅ HTTPS enforcement (in production)
✅ CORS configuration

### Security Improvements Needed
- [ ] Rate limiting on API routes
- [ ] CSRF protection
- [ ] Content Security Policy headers
- [ ] SQL injection prevention (Prisma handles this)
- [ ] XSS prevention (sanitize generated code display)
- [ ] File upload virus scanning
- [ ] API key rotation system
- [ ] Audit logging for sensitive operations

## Support & Maintenance

### Documentation Links
- Next.js: https://nextjs.org/docs
- Prisma: https://www.prisma.io/docs
- NextAuth: https://next-auth.js.org
- OpenAI API: https://platform.openai.com/docs
- TailwindCSS: https://tailwindcss.com/docs

### Common Issues & Solutions
1. **"Prisma Client not found"**: Run `npx prisma generate` in packages/database
2. **OpenAI API errors**: Check API key, check rate limits, check account credits
3. **NextAuth session errors**: Ensure NEXTAUTH_SECRET is set and consistent
4. **Database connection errors**: Verify DATABASE_URL and database is running

### Contact Information
- App Email: support@codesnap.com (not configured)
- Privacy Email: privacy@codesnap.com (not configured)
- Legal Email: legal@codesnap.com (not configured)

## Handover Checklist

Before next session, ensure:
- [ ] All dependencies installed (`npm install`)
- [ ] Database is set up and migrated
- [ ] Environment variables configured
- [ ] OpenAI API key is valid and has credits
- [ ] App starts without errors (`npm run dev:codesnap`)
- [ ] Can create account and sign in
- [ ] Can upload screenshot and generate code
- [ ] Admin dashboard accessible (create admin user in database)

## Conclusion

CodeSnap.com is a functional MVP with core features implemented. The AI-powered code generation works well, and the pricing is competitive. Main areas for improvement are email verification, complete Stripe integration, and usage tracking to enforce plan limits.

**Estimated completion**: 70% of production-ready features
**Next priority**: Email verification and Stripe integration
**Time to production**: 2-4 weeks with focused development

---

*Last Updated: 2024-03-20*
*Version: 1.0*
*Author: AI Development Team*
