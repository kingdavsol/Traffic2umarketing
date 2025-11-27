# CaptionGenius - AI-Powered Social Media Caption Generator

A full-featured SaaS application that generates engaging social media captions using AI. Built with Next.js 14, TypeScript, Prisma, and OpenAI.

## Features

### Core Features
- **AI Caption Generation**: Generate engaging captions for Instagram, Facebook, Twitter, LinkedIn, and TikTok
- **Multi-Platform Support**: Optimized captions for 5 major social media platforms
- **Customizable Tone & Style**: Choose from 7 different tones (Professional, Casual, Funny, etc.)
- **Hashtag Integration**: Automatic hashtag suggestions and research
- **Emoji Support**: Natural emoji integration in captions

### Unique Features
- **Trending Memes**: Access real-time trending memes and viral content ideas
- **Hashtag Analytics**: Discover high-performing hashtags with popularity metrics
- **Bulk Generation**: Generate up to 10 captions at once (Premium plan)
- **Caption Library**: Save and organize your favorite captions
- **Caption History**: Access all previously generated captions

### Subscription Tiers
1. **Free Tier**
   - 10 captions per month
   - 1 social platform
   - Basic features

2. **Basic ($9/month)**
   - 100 captions per month
   - All 5 platforms
   - All tone options
   - Hashtag research

3. **Builder ($19/month)** - Most Popular
   - 500 captions per month
   - Trending memes access
   - Hashtag analytics
   - Bulk generation (5x)
   - Custom templates

4. **Premium ($29/month)**
   - Unlimited captions
   - AI caption improvement
   - Bulk generation (10x)
   - Advanced analytics
   - Priority support
   - API access

### Authentication & Security
- Email authentication with Resend
- Email verification flow
- Secure password hashing with bcrypt
- NextAuth.js session management
- Protected routes with middleware

### Payments
- Stripe integration for subscriptions
- Automatic subscription management
- Billing portal for users
- Webhook handling for subscription events

### Admin Dashboard
- User statistics
- Revenue analytics
- Subscription distribution
- Growth metrics

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js + Resend
- **Payments**: Stripe
- **AI**: OpenAI GPT-4
- **Styling**: Tailwind CSS + Radix UI
- **Deployment**: Vercel-ready

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL database
- OpenAI API key
- Resend API key (for emails)
- Stripe account (for payments)

### Installation

1. **Clone the repository**
```bash
git clone <your-repo-url>
cd Traffic2umarketing
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**

Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/caption_genius"

# NextAuth
NEXTAUTH_SECRET="your-nextauth-secret-here"
NEXTAUTH_URL="http://localhost:3000"

# Resend Email
RESEND_API_KEY="re_your_resend_api_key"
EMAIL_FROM="noreply@captiongenius.com"

# OpenAI
OPENAI_API_KEY="sk-your-openai-api-key"

# Stripe
STRIPE_SECRET_KEY="sk_test_your_stripe_secret_key"
STRIPE_PUBLISHABLE_KEY="pk_test_your_stripe_publishable_key"
STRIPE_WEBHOOK_SECRET="whsec_your_webhook_secret"

# Stripe Price IDs (create products in Stripe Dashboard)
STRIPE_BASIC_PRICE_ID="price_basic_monthly"
STRIPE_BUILDER_PRICE_ID="price_builder_monthly"
STRIPE_PREMIUM_PRICE_ID="price_premium_monthly"

# App URLs
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

4. **Set up the database**

```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev

# (Optional) Seed the database with sample data
npx prisma db seed
```

5. **Run the development server**

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## Stripe Setup

1. Create a Stripe account at [stripe.com](https://stripe.com)
2. Go to Products and create three subscription products:
   - Basic: $9/month
   - Builder: $19/month
   - Premium: $29/month
3. Copy the price IDs and add them to your `.env` file
4. Set up a webhook endpoint pointing to `/api/stripe/webhook`
5. Copy the webhook secret and add it to your `.env` file

## Resend Setup

1. Create a Resend account at [resend.com](https://resend.com)
2. Verify your domain (or use Resend's test domain for development)
3. Create an API key
4. Add the API key to your `.env` file

## OpenAI Setup

1. Create an OpenAI account at [platform.openai.com](https://platform.openai.com)
2. Generate an API key
3. Add the API key to your `.env` file
4. Ensure you have credits in your OpenAI account

## Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Import your repository in Vercel
3. Add all environment variables in Vercel dashboard
4. Deploy

### Database Setup for Production

Use a hosted PostgreSQL database:
- [Supabase](https://supabase.com) (Free tier available)
- [Railway](https://railway.app)
- [Neon](https://neon.tech)

Update the `DATABASE_URL` in your production environment variables.

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

## Project Structure

```
├── app/                      # Next.js app directory
│   ├── api/                 # API routes
│   │   ├── auth/           # Authentication endpoints
│   │   ├── captions/       # Caption generation endpoints
│   │   ├── stripe/         # Stripe integration
│   │   └── trending/       # Trending content endpoints
│   ├── dashboard/          # Dashboard pages
│   ├── admin/              # Admin dashboard
│   ├── login/              # Login page
│   ├── register/           # Registration page
│   └── page.tsx            # Landing page
├── components/             # React components
│   ├── ui/                # UI components (shadcn/ui)
│   └── dashboard/         # Dashboard-specific components
├── lib/                   # Utility functions
│   ├── auth.ts           # NextAuth configuration
│   ├── db.ts             # Prisma client
│   ├── email.ts          # Email utilities
│   ├── openai.ts         # OpenAI integration
│   ├── stripe.ts         # Stripe utilities
│   └── utils.ts          # Helper functions
├── prisma/               # Database schema
│   └── schema.prisma
└── types/                # TypeScript types
```

## API Routes

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/verify-email` - Verify email address
- `POST /api/auth/[...nextauth]` - NextAuth endpoints

### Captions
- `POST /api/captions/generate` - Generate captions
- `GET /api/captions/history` - Get caption history
- `POST /api/captions/save` - Save caption to library
- `DELETE /api/captions/save` - Remove saved caption

### Trending
- `GET /api/trending/memes` - Get trending memes
- `GET /api/trending/hashtags` - Get trending hashtags

### Stripe
- `POST /api/stripe/checkout` - Create checkout session
- `POST /api/stripe/portal` - Create billing portal session
- `POST /api/stripe/webhook` - Handle Stripe webhooks

## Development

### Run Prisma Studio
```bash
npx prisma studio
```

### Run type checking
```bash
npm run lint
```

### Build for production
```bash
npm run build
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License.

## Support

For support, email support@captiongenius.com or open an issue on GitHub.

## Roadmap

- [ ] Social media scheduling integration
- [ ] Caption performance analytics
- [ ] Team collaboration features
- [ ] Mobile app (React Native)
- [ ] API access for Premium users
- [ ] Multi-language support
- [ ] Caption A/B testing
- [ ] Integration with social media management tools

## Market Opportunity

- **Market Size**: $15B+ (Social Media Management)
- **Target Users**: Content creators, influencers, marketers, businesses
- **Pain Point**: Content creators spend 30-60 minutes daily writing captions
- **Solution**: Generate perfect captions in seconds with AI

## Business Model

- **Pricing**: $9-$29/month
- **Target**: 100K+ users at scale
- **Marketing**: SEO, organic social media, influencer partnerships
- **Build Cost**: $2K-5K
- **Time to Market**: 3-4 weeks

---

Built with ❤️ using Next.js, TypeScript, and OpenAI
