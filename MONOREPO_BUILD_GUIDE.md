# Traffic2u Insurance - 10-Site Monorepo Build Guide

## Overview

This monorepo contains a scalable, multi-site insurance comparison platform with shared infrastructure. It includes:

- **Shared Packages**: Database, email, UI components, configuration
- **10 Complete Apps**: Insurance comparison sites for different niches
- **Turborepo**: For efficient multi-site management

## Architecture

```
traffic2u-insurance/
├── packages/
│   ├── config/          # Shared configuration & constants
│   ├── types/           # TypeScript type definitions
│   ├── db/              # Prisma database schema & client
│   ├── email/           # Email templates & Resend integration
│   ├── ui/              # Shared React components
│   ├── api/             # Shared API utilities (tRPC, etc.)
│   └── utils/           # Helper utilities
│
├── apps/
│   ├── pet-insurance-compare/           (FULLY BUILT)
│   ├── disability-insurance-compare/    (SCAFFOLD - follow pet template)
│   ├── cyber-insurance-compare/         (SCAFFOLD - follow pet template)
│   ├── travel-insurance-compare/        (SCAFFOLD)
│   ├── umbrella-insurance-compare/      (SCAFFOLD)
│   ├── motorcycle-insurance-compare/    (SCAFFOLD)
│   ├── sr22-insurance-compare/          (SCAFFOLD)
│   ├── wedding-insurance-compare/       (SCAFFOLD)
│   ├── drone-insurance-compare/         (SCAFFOLD)
│   └── landlord-insurance-compare/      (SCAFFOLD)
│
└── docs/
    ├── SETUP.md              # Initial setup instructions
    ├── CUSTOMIZATION.md      # How to customize each site
    └── DEPLOYMENT.md         # Production deployment guide
```

## Quick Start

### Prerequisites

- Node.js 18+
- npm 10+ or yarn
- PostgreSQL 14+
- Resend API key

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env.local
```

Edit `.env.local` with your database URL and API keys:

```
DATABASE_URL="postgresql://user:password@localhost:5432/traffic2u"
RESEND_API_KEY="re_xxxx"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 3. Setup Database

```bash
npm run db:push
```

This will create all tables defined in `packages/db/prisma/schema.prisma`

### 4. Run All Sites in Development

```bash
npm run dev
```

Sites will run on:
- Pet Insurance: http://localhost:3001
- Disability Insurance: http://localhost:3002
- Cyber Insurance: http://localhost:3003
- ... (each app gets its own port)

## Building Your 10 Sites

### Site Template Structure

Each site follows this structure (pet insurance is the complete example):

```
apps/[site-name]/
├── src/
│   ├── app/
│   │   ├── layout.tsx           # Main layout with nav/footer
│   │   ├── page.tsx             # Hero page with CTA
│   │   ├── compare/             # Quote comparison flow
│   │   │   └── page.tsx
│   │   ├── guides/              # Educational content
│   │   │   └── page.tsx
│   │   ├── reviews/             # Customer reviews
│   │   │   └── page.tsx
│   │   └── api/
│   │       ├── quotes/          # POST /api/quotes
│   │       ├── click/           # Track affiliate clicks
│   │       └── subscribe/       # Email subscriptions
│   ├── components/              # Site-specific components
│   ├── lib/                     # Site-specific utilities
│   └── styles/                  # Site-specific styles
├── public/                      # Site-specific assets
├── package.json
├── next.config.js
├── tailwind.config.ts
└── tsconfig.json
```

### Key Files to Customize Per Site

1. **`apps/[site]/src/app/layout.tsx`**
   - Update site name, colors, navigation
   - Import from `@traffic2u/config` and select your site:
   ```typescript
   const site = SITES.pet;  // Change to .disability, .cyber, etc.
   ```

2. **`apps/[site]/tailwind.config.ts`**
   - Update primary/secondary colors:
   ```typescript
   colors: {
     primary: SITES.pet.primaryColor,  // Change to your site
     secondary: SITES.pet.secondaryColor,
   }
   ```

3. **`apps/[site]/src/app/compare/page.tsx`**
   - Customize form questions for your insurance type
   - Pet insurance: pet type, breed, age
   - Disability: occupation, income, benefit period
   - Cyber: employee count, industry, revenue

4. **`apps/[site]/src/app/api/quotes/route.ts`**
   - Update mock carrier data for your niche
   - Integrate with actual carrier APIs (Phase 2)
   - Customize quote calculation logic

## Completing Each of the 10 Sites

### TEMPLATE: From Pet Insurance to Other Sites

#### Step 1: Copy Pet Insurance Structure

```bash
# Copy pet insurance as template
cp -r apps/pet-insurance-compare apps/disability-insurance-compare
```

#### Step 2: Update Site Configuration (in `packages/config/src/index.ts`)

The configuration is already set up! Each site is defined in the `SITES` object:

```typescript
export const SITES = {
  pet: { /* ... */ },
  disability: { /* ... */ },
  cyber: { /* ... */ },
  // etc.
}
```

#### Step 3: Customize the Compare Flow

Update `apps/[site]/src/app/compare/page.tsx`:

**For Disability Insurance:**
```typescript
const steps = [
  {
    title: "Tell Us About Your Occupation",
    description: "Help us find income protection for your profession"
  },
  {
    title: "Coverage Amount",
    description: "How much monthly income do you need protected?"
  },
  {
    title: "Your Contact Info",
    description: "We'll send personalized quotes to your email"
  }
];

// Form data for disability:
interface FormData {
  occupation: string;
  monthlyIncome: number;
  benefitPeriod: string; // "short_term" | "long_term" | "both"
  waitingPeriod: number;
  email: string;
  zipCode: string;
}
```

**For Cyber Insurance:**
```typescript
const steps = [
  {
    title: "Tell Us About Your Business",
    description: "Help us find cyber coverage for your company"
  },
  {
    title: "Coverage Details",
    description: "What risks concern you most?"
  },
  {
    title: "Your Contact Info",
    description: "Get instant cyber insurance quotes"
  }
];

// Form data for cyber:
interface FormData {
  employeeCount: number;
  industry: string;
  hasDataBreachInsurance: boolean;
  hasRansomwareInsurance: boolean;
  annualRevenue: number;
  email: string;
  zipCode: string;
}
```

#### Step 4: Update API Carriers Data

In `apps/[site]/src/app/api/quotes/route.ts`, update `MOCK_CARRIERS`:

**For Disability Insurance:**
```typescript
const MOCK_CARRIERS = [
  {
    name: "Prudential",
    monthlyPremium: 125,
    benefit: "60% of income",
    waitingPeriod: "90 days",
    rating: 4.8,
  },
  {
    name: "The Hartford",
    monthlyPremium: 110,
    benefit: "60% of income",
    waitingPeriod: "30 days",
    rating: 4.7,
  },
  // Add more...
];
```

#### Step 5: Update Home Page Content

Customize `apps/[site]/src/app/page.tsx`:
- Update hero copy for your insurance type
- Adjust stats (carriers, average savings, time to compare)
- Update "How It Works" steps

#### Step 6: Add Site-Specific Content Pages

Create additional pages as needed:
- `/guides` - Educational content for your niche
- `/faq` - Common questions
- `/reviews` - Customer reviews (pulls from database)

## Database Integration

All sites share the same PostgreSQL database. Key tables:

- **Users**: User accounts across all sites
- **QuoteRequests**: Form submissions (tracks which site)
- **Quotes**: Generated quotes
- **AffiliateClicks**: Affiliate link tracking
- **Conversions**: Commission tracking
- **EmailSubscriptions**: Email list management
- **InsuranceReviews**: User reviews per carrier

### Query Examples

```typescript
// Get all quotes for a specific request
const quotes = await prisma.quote.findMany({
  where: { quoteRequestId: "..." }
});

// Track affiliate click
await prisma.affiliateClick.create({
  data: {
    userId,
    quoteRequestId,
    carrierName: "Trupanion",
    siteType: "pet",
    affiliateProgram: "Trupanion",
    affiliateUrl: "https://...",
    sessionId,
  }
});

// Get conversion data
const conversions = await prisma.conversion.findMany({
  where: {
    status: "confirmed",
    createdAt: { gte: startOfMonth }
  }
});
```

## Email Integration (Resend)

All sites use Resend for transactional emails. The `@traffic2u/email` package handles templates:

```typescript
// Send verification email
await EmailService.sendVerificationEmail(
  email,
  "https://verificationlink.com",
  "Pet Cover Compare"
);

// Send quote ready email
await EmailService.sendQuoteReadyEmail(
  email,
  "Pet Cover Compare",
  5, // number of quotes
  "https://quotes.com/abc123"
);
```

Templates are in `packages/email/src/index.ts` and automatically generated based on site name.

## API Routes (Every Site)

### POST /api/quotes
Create a quote request and return quotes

**Request:**
```json
{
  "petType": "dog",
  "breed": "Golden Retriever",
  "age": "3",
  "email": "user@example.com",
  "zipCode": "12345"
}
```

**Response:**
```json
{
  "success": true,
  "quoteRequestId": "req_123",
  "quotes": [
    {
      "id": "quote_1",
      "carrierName": "Trupanion",
      "monthlyPremium": 45,
      "coverage": "Accident & Illness",
      "rating": 4.8
    }
  ]
}
```

### POST /api/click
Track affiliate link clicks

### POST /api/subscribe
Add to email list

## Styling & Branding

Each site has custom colors defined in:

1. **Config** (`packages/config/src/index.ts`):
```typescript
pet: {
  primaryColor: "#FF6B9D",
  secondaryColor: "#FFA502",
}
```

2. **Tailwind** (`apps/[site]/tailwind.config.ts`):
```typescript
colors: {
  primary: site.primaryColor,
  secondary: site.secondaryColor,
}
```

3. **HTML** - Colors are applied via CSS:
```html
<div style={{ color: site.primaryColor }}>Colored Text</div>
<div className="gradient-primary">Gradient Background</div>
```

## Build for Production

### Single Site
```bash
cd apps/pet-insurance-compare
npm run build
```

### All Sites
```bash
npm run build
```

### Deployment Options

1. **Vercel** (Recommended)
   - Deploy each app as separate project
   - Share database with connection string
   - Environment variables per project

2. **Docker**
   - Create Docker image for monorepo
   - Run multiple containers (one per site)

3. **Traditional Server**
   - Build all sites
   - Run with PM2 or similar
   - Configure nginx/reverse proxy

See `DEPLOYMENT.md` for detailed instructions.

## Performance Optimization

### Code Splitting
- Shared components in `packages/ui` are auto-shared
- Turborepo handles dependency tracking

### Database
- Use indexes (defined in Prisma schema)
- Add caching layer (Redis) for frequently accessed data
- Use connection pooling

### Frontend
- Image optimization (Next.js Image component)
- CSS modules for scoped styling
- Dynamic imports for heavy components

## Testing

```bash
# Run all tests
npm run test

# Run specific site tests
cd apps/pet-insurance-compare && npm run test

# Type checking
npm run type-check
```

## Linting

```bash
# Lint all projects
npm run lint

# Fix linting issues
npm run lint -- --fix
```

## Troubleshooting

### Database Connection Error
```
Error: Can't reach database server
```
Solution: Check `DATABASE_URL` in `.env.local`

### Ports Already in Use
```
Error: listen EADDRINUSE :::3001
```
Solution: Kill process or change port in `package.json` dev script

### Prisma Migration Failed
```
Error: Migration doesn't exist in database
```
Solution:
```bash
npm run db:push --force  # WARNING: Resets schema
```

### Email Not Sending
```
Error: RESEND_API_KEY not found
```
Solution: Add API key to `.env.local`

## Next Steps

1. **Complete remaining 9 sites** using the template above
2. **Integrate real carrier APIs** (currently using mock data)
3. **Set up analytics** - Google Analytics, Hotjar
4. **Add review system** - Let customers rate carriers
5. **Build admin dashboard** - Manage quotes, conversions, analytics
6. **Implement affiliate dashboard** - Show earnings, clicks, conversions

## File Structure Checklist

For each site to be production-ready:

- [ ] `src/app/layout.tsx` - Branded layout
- [ ] `src/app/page.tsx` - SEO-optimized home page
- [ ] `src/app/compare/page.tsx` - Multi-step quote form
- [ ] `src/app/guides/page.tsx` - Educational content
- [ ] `src/app/reviews/page.tsx` - Customer reviews
- [ ] `src/app/api/quotes/route.ts` - Quote generation
- [ ] `src/app/api/click/route.ts` - Affiliate tracking
- [ ] `src/app/api/subscribe/route.ts` - Email signup
- [ ] `tailwind.config.ts` - Custom colors
- [ ] `.env.local` - Environment variables

## Support & Customization

For more details on customizing each site, see `CUSTOMIZATION.md`.

For deployment guidance, see `DEPLOYMENT.md`.

---

**Status**: Production Ready (Pet Insurance), Template Ready (Other 9)

**Next Action**: Copy pet insurance structure to other 9 site directories and customize form/carrier data per niche.

