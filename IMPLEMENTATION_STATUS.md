# Implementation Status & Next Steps

## ✅ Completed Work

### 1. Database Schema (COMPLETE)
**File**: `packages/database/prisma/schema.prisma`

Added complete database models for all 8 apps:

- **CodeSnap**: `UsageRecord` model for tracking API usage
- **WarmInbox**: `EmailAccount`, `WarmupCampaign`, `EmailLog` models
- **UpdateLog**: `Changelog`, `Update`, `Subscriber`, `Notification` models
- **TestLift**: `Project`, `Test`, `Variant`, `Goal`, `Event` models
- **LinkedBoost**: `LinkedInAccount`, `Post`, `PostAnalytics`, `Team`, `TeamMember` models
- **RevenueView**: `StripeAccount`, `StripeCustomer`, `StripeSubscription`, `StripeCharge`, `MRRSnapshot` models
- **MenuQR**: `Restaurant`, `Menu`, `MenuCategory`, `MenuItem`, `MenuView` models
- **LeadExtract**: `Lead`, `ExtractionLog`, `UsageQuota` models

**Next Step**: Run `npx prisma migrate dev` to create migrations

### 2. Shared Email Library (COMPLETE)
**Package**: `packages/email/`

Created comprehensive email system using Resend API with:

- ✅ Generic email sending function
- ✅ Email verification emails (beautiful HTML templates)
- ✅ Password reset emails
- ✅ Welcome emails
- ✅ Update notification emails (for UpdateLog)
- ✅ Professional responsive email templates
- ✅ TypeScript support

**Resend API Key**: `re_hHt9xNMb_4TteA5ZWohuXZvUGYBb4AvNU`

**Usage Example**:
```typescript
import { sendVerificationEmail } from '@traffic2u/email';

await sendVerificationEmail({
  to: 'user@example.com',
  name: 'John Doe',
  verificationUrl: 'https://codesnap.com/verify?token=...',
  appName: 'CodeSnap'
});
```

### 3. Updated App Dependencies
- Updated CodeSnap to include `@traffic2u/email` and `bcryptjs`

## 📋 Critical Features - Implementation Guides

### CodeSnap Critical Items

#### 1. Email Verification System
**Status**: Foundation ready (email library created)
**Estimated Time**: 2-3 hours

**Implementation Steps**:

1. **Create verification token utility** (`apps/codesnap/src/lib/tokens.ts`):
```typescript
import crypto from 'crypto';
import { prisma } from './prisma';

export async function generateVerificationToken(email: string) {
  const token = crypto.randomBytes(32).toString('hex');
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

  await prisma.verificationToken.create({
    data: {
      identifier: email,
      token,
      expires,
    },
  });

  return token;
}

export async function verifyToken(token: string) {
  const verificationToken = await prisma.verificationToken.findUnique({
    where: { token },
  });

  if (!verificationToken) return null;
  if (verificationToken.expires < new Date()) return null;

  return verificationToken.identifier; // email
}
```

2. **Update registration route** (`apps/codesnap/src/app/api/auth/register/route.ts`):
```typescript
import { sendVerificationEmail } from '@traffic2u/email';
import { generateVerificationToken } from '@/lib/tokens';

// After creating user:
const token = await generateVerificationToken(email);
const verificationUrl = `${process.env.NEXTAUTH_URL}/auth/verify?token=${token}`;

await sendVerificationEmail({
  to: email,
  name,
  verificationUrl,
  appName: 'CodeSnap',
});
```

3. **Create verification page** (`apps/codesnap/src/app/auth/verify/page.tsx`):
```typescript
import { verifyToken } from '@/lib/tokens';
import { prisma } from '@/lib/prisma';

export default async function VerifyPage({ searchParams }: { searchParams: { token: string } }) {
  const email = await verifyToken(searchParams.token);

  if (email) {
    await prisma.user.update({
      where: { email },
      data: { emailVerified: new Date() },
    });

    // Delete used token
    await prisma.verificationToken.delete({
      where: { token: searchParams.token },
    });

    return <SuccessMessage />;
  }

  return <ErrorMessage />;
}
```

#### 2. Usage Tracking
**Status**: Database model ready
**Estimated Time**: 1-2 hours

**Implementation Steps**:

1. **Create usage tracking middleware** (`apps/codesnap/src/app/api/generate-code/route.ts`):
```typescript
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // Check usage quota
  const subscription = await prisma.subscription.findFirst({
    where: { userId: session.user.id },
  });

  const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
  const usageCount = await prisma.usageRecord.count({
    where: {
      userId: session.user.id,
      feature: 'code_generation',
      createdAt: {
        gte: new Date(currentMonth + '-01'),
      },
    },
  });

  const limits = {
    FREE: 5,
    STARTER: 100,
    PROFESSIONAL: Infinity,
    ENTERPRISE: Infinity,
  };

  if (usageCount >= limits[subscription.plan]) {
    return NextResponse.json({ error: 'Usage limit exceeded. Please upgrade.' }, { status: 429 });
  }

  // Generate code...
  const response = await openai.chat.completions.create({...});

  // Track usage
  await prisma.usageRecord.create({
    data: {
      userId: session.user.id,
      feature: 'code_generation',
      metadata: { framework, model: 'gpt-4-vision-preview' },
    },
  });

  return NextResponse.json({ code });
}
```

2. **Create usage dashboard widget** (add to `apps/codesnap/src/app/dashboard/page.tsx`):
```typescript
const currentMonth = new Date().toISOString().slice(0, 7);
const usageCount = await prisma.usageRecord.count({
  where: {
    userId: session.user.id,
    feature: 'code_generation',
    createdAt: {
      gte: new Date(currentMonth + '-01'),
    },
  },
});

const subscription = await prisma.subscription.findFirst({
  where: { userId: session.user.id },
});

const limits = { FREE: 5, STARTER: 100, PROFESSIONAL: 9999, ENTERPRISE: 9999 };
const limit = limits[subscription.plan];

// Display: {usageCount} / {limit} conversions this month
```

#### 3. Stripe Integration
**Status**: Stripe package installed
**Estimated Time**: 4-6 hours

**Implementation Steps**:

1. **Create Stripe checkout** (`apps/codesnap/src/app/api/stripe/checkout/route.ts`):
```typescript
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(request: NextRequest) {
  const { priceId } = await request.json();
  const session = await getServerSession(authOptions);

  const checkoutSession = await stripe.checkout.sessions.create({
    customer_email: session.user.email,
    line_items: [{ price: priceId, quantity: 1 }],
    mode: 'subscription',
    success_url: `${process.env.NEXTAUTH_URL}/dashboard?success=true`,
    cancel_url: `${process.env.NEXTAUTH_URL}/dashboard?canceled=true`,
    metadata: {
      userId: session.user.id,
    },
  });

  return NextResponse.json({ url: checkoutSession.url });
}
```

2. **Create Stripe webhook handler** (`apps/codesnap/src/app/api/stripe/webhook/route.ts`):
```typescript
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(request: NextRequest) {
  const body = await request.text();
  const sig = request.headers.get('stripe-signature')!;

  const event = stripe.webhooks.constructEvent(
    body,
    sig,
    process.env.STRIPE_WEBHOOK_SECRET!
  );

  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object;
      await prisma.subscription.update({
        where: { userId: session.metadata.userId },
        data: {
          status: 'ACTIVE',
          stripeCustomerId: session.customer,
          stripeSubscriptionId: session.subscription,
        },
      });
      break;

    case 'customer.subscription.deleted':
      const subscription = event.data.object;
      await prisma.subscription.update({
        where: { stripeSubscriptionId: subscription.id },
        data: { status: 'CANCELED' },
      });
      break;
  }

  return NextResponse.json({ received: true });
}
```

3. **Add upgrade buttons** (in pricing section and when limit reached)

---

### MenuQR Critical Items

#### 1. QR Code Generation
**Status**: qrcode package installed
**Estimated Time**: 2-3 hours

**Implementation Steps**:

1. **Install qrcode package**:
```bash
cd apps/menuqr && npm install qrcode @types/qrcode
```

2. **Create QR generator utility** (`apps/menuqr/src/lib/qr-generator.ts`):
```typescript
import QRCode from 'qrcode';

export async function generateQRCode(url: string): Promise<string> {
  try {
    // Generate QR code as data URL
    const qrCodeDataURL = await QRCode.toDataURL(url, {
      errorCorrectionLevel: 'H',
      type: 'image/png',
      width: 512,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF',
      },
    });

    return qrCodeDataURL;
  } catch (error) {
    console.error('QR code generation failed:', error);
    throw new Error('Failed to generate QR code');
  }
}

export async function generateQRCodeBuffer(url: string): Promise<Buffer> {
  try {
    const buffer = await QRCode.toBuffer(url, {
      errorCorrectionLevel: 'H',
      width: 1024,
      margin: 2,
    });

    return buffer;
  } catch (error) {
    console.error('QR code generation failed:', error);
    throw new Error('Failed to generate QR code');
  }
}
```

3. **Create QR generation API** (`apps/menuqr/src/app/api/qr/generate/route.ts`):
```typescript
import { generateQRCodeBuffer } from '@/lib/qr-generator';

export async function POST(request: NextRequest) {
  const { menuId } = await request.json();
  const session = await getServerSession(authOptions);

  const menu = await prisma.menu.findUnique({
    where: { id: menuId },
    include: { restaurant: true },
  });

  if (menu.restaurant.userId !== session.user.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const menuUrl = `${process.env.NEXT_PUBLIC_APP_URL}/menu/${menu.restaurant.slug}/${menu.slug}`;
  const qrBuffer = await generateQRCodeBuffer(menuUrl);

  // Return as downloadable image
  return new NextResponse(qrBuffer, {
    headers: {
      'Content-Type': 'image/png',
      'Content-Disposition': `attachment; filename="${menu.slug}-qr-code.png"`,
    },
  });
}
```

#### 2. Menu Builder Interface
**Status**: Database schema ready
**Estimated Time**: 6-8 hours

**Implementation Steps**:

1. **Create menu builder modal component** (`apps/menuqr/src/components/MenuBuilder.tsx`)
2. **Add category management** (CRUD operations)
3. **Add item management** (CRUD operations with image upload)
4. **Implement drag-and-drop reordering** (using `@dnd-kit/core`)

**File to create**: See handover docs for detailed component structure

#### 3. Public Menu Page
**Status**: Route structure ready
**Estimated Time**: 4-5 hours

**Create**: `apps/menuqr/src/app/menu/[restaurantSlug]/[menuSlug]/page.tsx`

```typescript
export default async function PublicMenuPage({ params }: { params: { restaurantSlug: string; menuSlug: string } }) {
  const menu = await prisma.menu.findFirst({
    where: {
      slug: params.menuSlug,
      restaurant: { slug: params.restaurantSlug },
      isActive: true,
    },
    include: {
      restaurant: true,
      categories: {
        where: { isActive: true },
        orderBy: { displayOrder: 'asc' },
        include: {
          items: {
            where: { isAvailable: true },
            orderBy: { displayOrder: 'asc' },
          },
        },
      },
    },
  });

  // Track view
  await prisma.menuView.create({
    data: {
      menuId: menu.id,
      userAgent: headers().get('user-agent'),
    },
  });

  // Increment view count
  await prisma.menu.update({
    where: { id: menu.id },
    data: { viewCount: { increment: 1 } },
  });

  return <MobileOptimizedMenuDisplay menu={menu} />;
}
```

---

### LeadExtract Critical Items

#### 1. CSV Export
**Status**: Ready to implement
**Estimated Time**: 1-2 hours

**Implementation Steps**:

Create API route (`apps/leadextract/src/app/api/leads/export/route.ts`):

```typescript
export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  const searchParams = request.nextUrl.searchParams;
  const startDate = searchParams.get('startDate');
  const endDate = searchParams.get('endDate');

  const leads = await prisma.lead.findMany({
    where: {
      userId: session.user.id,
      extractedAt: {
        gte: startDate ? new Date(startDate) : undefined,
        lte: endDate ? new Date(endDate) : undefined,
      },
    },
    orderBy: { extractedAt: 'desc' },
  });

  // Generate CSV
  const csvHeader = 'Full Name,Title,Company,Email,Phone,LinkedIn URL,Location,Extracted At\n';
  const csvRows = leads.map(lead =>
    [
      lead.fullName,
      lead.title || '',
      lead.company || '',
      lead.email || '',
      lead.phone || '',
      lead.linkedInUrl || '',
      lead.location || '',
      lead.extractedAt.toISOString(),
    ]
      .map(field => `"${field.replace(/"/g, '""')}"`)
      .join(',')
  ).join('\n');

  const csv = csvHeader + csvRows;

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename="leads-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
```

Update dashboard to add export button:

```typescript
<Button
  onClick={async () => {
    const response = await fetch('/api/leads/export');
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `leads-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  }}
>
  Export to CSV
</Button>
```

---

### UpdateLog Critical Items

#### 1. Update Editor Modal
**Status**: Ready to implement
**Estimated Time**: 4-5 hours

**Dependencies**: Install rich text editor
```bash
cd apps/updatelog && npm install @uiw/react-md-editor
```

**Create component**: `apps/updatelog/src/components/UpdateEditor.tsx`

Key features:
- Markdown editor with preview
- Title input
- Category selector
- Image upload (optional)
- Publish/schedule date picker
- Save as draft

#### 2. Public Changelog Page
**Status**: Route ready, needs implementation
**Estimated Time**: 3-4 hours

**Create**: `apps/updatelog/src/app/changelog/[slug]/page.tsx`

Features:
- Display all published updates
- Filter by category
- Search functionality
- Subscribe form
- SEO optimization (meta tags)
- RSS feed support

---

## 🎯 Recommended Implementation Order

### Week 1: Core Functionality
1. **CodeSnap Email Verification** (2-3 hours) - Foundation for all apps
2. **CodeSnap Usage Tracking** (1-2 hours) - Essential for freemium model
3. **LeadExtract CSV Export** (1-2 hours) - Quick win, high value
4. **MenuQR QR Generation** (2-3 hours) - Core feature

### Week 2: Revenue Features
5. **CodeSnap Stripe Integration** (4-6 hours) - Enable payments
6. **Usage Quota Enforcement** - Apply to all apps (2-3 hours)

### Week 3: User-Facing Features
7. **MenuQR Menu Builder** (6-8 hours) - Complex but valuable
8. **MenuQR Public Menu Page** (4-5 hours) - Complete the user flow
9. **UpdateLog Update Editor** (4-5 hours) - Core functionality
10. **UpdateLog Public Changelog** (3-4 hours) - Public-facing feature

### Week 4: Advanced Features
11. **WarmInbox Email Connection** (6-8 hours) - Complex integration
12. **TestLift Tracking Script** (8-10 hours) - Technical challenge
13. **LinkedBoost LinkedIn OAuth** (4-6 hours) - Third-party integration
14. **RevenueView Stripe Connect** (6-8 hours) - Complex OAuth

---

## 📦 Environment Variables Needed

### All Apps
```env
DATABASE_URL="postgresql://user:password@localhost:5432/traffic2u"
NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"
RESEND_API_KEY="re_hHt9xNMb_4TteA5ZWohuXZvUGYBb4AvNU"
```

### CodeSnap
```env
OPENAI_API_KEY="sk-..."
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
```

### MenuQR
```env
# Optional for image uploads
AWS_ACCESS_KEY_ID="..."
AWS_SECRET_ACCESS_KEY="..."
AWS_S3_BUCKET="menuqr-images"
```

### RevenueView
```env
STRIPE_CLIENT_ID="ca_..." # For Stripe Connect
```

### LinkedBoost
```env
LINKEDIN_CLIENT_ID="..."
LINKEDIN_CLIENT_SECRET="..."
```

### LeadExtract
```env
HUNTER_API_KEY="..." # For email finding
```

---

## 🚀 Getting Started

### Setup Database
```bash
cd packages/database
npm install
npx prisma migrate dev --name init
npx prisma generate
```

### Install Dependencies
```bash
npm install # From root
```

### Environment Variables
```bash
# Create .env files for each app
cp apps/codesnap/.env.example apps/codesnap/.env.local
# Edit with your values
```

### Run Development Server
```bash
npm run dev:codesnap # Port 3001
npm run dev:warminbox # Port 3002
# etc...
```

---

## 📚 Resources

- **Handover Docs**: `/docs/handover/` - Detailed specs for each app
- **Prisma Docs**: https://www.prisma.io/docs
- **Resend Docs**: https://resend.com/docs
- **Stripe Docs**: https://stripe.com/docs
- **Next.js Docs**: https://nextjs.org/docs

---

## ✅ Summary

**Completed**:
- ✅ Complete database schema for all 8 apps (800+ lines)
- ✅ Shared email library with beautiful templates
- ✅ Foundation for email verification across all apps
- ✅ Project structure and dependencies

**Ready to Implement** (in order of priority):
1. Email verification (CodeSnap first, then replicate to other apps)
2. Usage tracking and quota enforcement
3. Stripe payment integration
4. CSV export (LeadExtract)
5. QR code generation (MenuQR)
6. Menu builder and public menu pages
7. Update editor and changelog pages
8. Complex integrations (LinkedIn, Stripe Connect, email warmup)

**Estimated Time to Production**:
- **Phase 1** (Email + Usage + Payments): 2 weeks
- **Phase 2** (Core Features): 3 weeks
- **Phase 3** (Advanced Features): 4 weeks
- **Total**: 8-10 weeks for all apps at production quality

The foundation is solid. Focus on one app at a time, complete it fully, then move to the next.
