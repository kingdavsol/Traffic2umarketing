# Traffic2U Marketing - Business Apps Suite

A monorepo containing 8 high-value SaaS applications built with modern web technologies.

## 🚀 Applications

### 1. CodeSnap.com - Screenshot to Code Converter
Transform UI screenshots into production-ready code using AI vision models.
- **Domain**: codesnap.com
- **Tech Stack**: Next.js, OpenAI GPT-4V, TailwindCSS
- **Pricing**: $19-49/month
- **Port**: 3001

### 2. WarmInbox.com - Email Warm-up & Deliverability
Improve email deliverability through automated domain reputation building.
- **Domain**: warminbox.com
- **Tech Stack**: Next.js, Node.js, SMTP
- **Pricing**: $29-79/month
- **Port**: 3002

### 3. UpdateLog.com - Changelog & Product Updates
Engage users with beautiful product update announcements.
- **Domain**: updatelog.com
- **Tech Stack**: Next.js, Markdown, Embeddable Widget
- **Pricing**: $19-49/month
- **Port**: 3003

### 4. TestLift.com - No-Code A/B Testing
Simple A/B testing for landing pages without expensive enterprise tools.
- **Domain**: testlift.com
- **Tech Stack**: Next.js, Analytics, Visual Editor
- **Pricing**: $29-99/month
- **Port**: 3004

### 5. LinkedBoost.com - LinkedIn Scheduler with AI
Schedule and optimize LinkedIn posts with AI-powered content enhancement.
- **Domain**: linkedboost.com
- **Tech Stack**: Next.js, LinkedIn API, OpenAI
- **Pricing**: $15-39/month
- **Port**: 3005

### 6. RevenueView.com - Stripe Analytics Dashboard
Beautiful revenue analytics and insights for Stripe users.
- **Domain**: revenueview.com
- **Tech Stack**: Next.js, Stripe API, Chart.js
- **Pricing**: $19-99/month
- **Port**: 3006

### 7. MenuQR.com - QR Code Menu Builder
Digital menu builder for restaurants with QR code generation.
- **Domain**: menuqr.com
- **Tech Stack**: Next.js, QR Code Generator, Image Upload
- **Pricing**: $9-29/month
- **Port**: 3007

### 8. LeadExtract.com - LinkedIn Profile Scraper
Chrome extension for extracting LinkedIn profile data for sales teams.
- **Domain**: leadextract.com
- **Tech Stack**: Chrome Extension, Next.js Dashboard
- **Pricing**: $19-49/month
- **Port**: 3008

## 📦 Monorepo Structure

```
├── apps/
│   ├── codesnap/         # Screenshot to Code Converter
│   ├── warminbox/        # Email Warm-up Tool
│   ├── updatelog/        # Changelog Platform
│   ├── testlift/         # A/B Testing Tool
│   ├── linkedboost/      # LinkedIn Scheduler
│   ├── revenueview/      # Stripe Analytics
│   ├── menuqr/           # QR Menu Builder
│   └── leadextract/      # LinkedIn Scraper
├── packages/
│   ├── ui/               # Shared UI components
│   ├── auth/             # Shared authentication
│   ├── database/         # Shared database models
│   └── config/           # Shared configurations
└── turbo.json            # Turborepo configuration
```

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: TailwindCSS
- **Database**: PostgreSQL with Prisma
- **Auth**: NextAuth.js with email verification
- **Payments**: Stripe
- **Email**: Resend
- **Deployment**: Vercel
- **Monorepo**: Turborepo

## 🚦 Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL
- pnpm (recommended)

### Installation

```bash
# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env.local

# Run database migrations
pnpm db:migrate

# Start all apps in development
pnpm dev

# Or start individual apps
pnpm dev:codesnap
pnpm dev:warminbox
# ... etc
```

## 📊 Features (All Apps)

- ✅ Custom logos and favicons
- ✅ Email verification
- ✅ Terms & Conditions
- ✅ Privacy Policy
- ✅ 4-tier pricing (Freemium, Starter, Professional, Enterprise)
- ✅ Admin dashboard for user monitoring
- ✅ Stripe payment integration
- ✅ Responsive design
- ✅ SEO optimized
- ✅ Analytics integration

## 💰 Pricing Strategy

All apps priced 25% below competitors while offering equal or better functionality:
- **Freemium**: Free tier with limitations
- **Starter**: ~$19-29/month
- **Professional**: ~$39-59/month
- **Enterprise**: ~$79-99/month

## 📝 License

Proprietary - All Rights Reserved

## 👥 Author

Traffic2U Marketing
