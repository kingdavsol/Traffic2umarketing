# Traffic2umarketing - Multi-App SaaS Portfolio

A comprehensive portfolio of SaaS applications including QuickSell (marketplace automation), CaptionGenius (AI caption generation), and 70+ other applications.

## 📂 Repository Structure

This is a monorepo containing multiple independent SaaS applications:

### Featured Applications

#### 1. QuickSell - Photo to Marketplace Selling App
A gamified mobile and web application that allows users to quickly photograph items and automatically generate optimized listings across multiple online marketplaces.

**Key Features:**
- Instant listings on eBay, Facebook Marketplace, Craigslist
- AI-powered pricing estimates and descriptions
- Gamification system with points, badges, and challenges
- Multi-platform support (Web, iOS, Android)
- Smart shipping cost calculation

**Tech Stack:** React Native, React.js, Node.js/Express, PostgreSQL, Redis

#### 2. CaptionGenius - AI Caption Generator
A full-featured SaaS application that generates engaging social media captions using AI.

**Key Features:**
- AI caption generation for Instagram, Facebook, Twitter, LinkedIn, TikTok
- 7 different tones (Professional, Casual, Funny, etc.)
- Trending memes and hashtag analytics
- Subscription tiers ($9-$29/month)
- Admin dashboard with analytics

**Tech Stack:** Next.js 14, TypeScript, Prisma, PostgreSQL, OpenAI, Stripe

### 70+ Additional Applications
See [APPS_QUICK_REFERENCE.md](./APPS_QUICK_REFERENCE.md) for the complete list of applications in this portfolio.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 12+
- Redis 6+ (for QuickSell)
- OpenAI API key
- Stripe account (for payments)

### Installation

```bash
# Clone the repository
git clone https://github.com/kingdavsol/Traffic2umarketing.git
cd Traffic2umarketing

# Copy environment variables
cp .env.example .env

# Install dependencies (for root-level apps)
npm install

# For individual apps
cd <app-folder>
npm install
```

## 📚 Documentation

- **[Deployment Guide](./DEPLOYMENT.md)** - VPS deployment instructions
- **[Complete Migration Handoff](./COMPLETE_MIGRATION_HANDOFF_2025-12-08.md)** - Full migration guide
- **[Claude Code Instructions](./CLAUDE.md)** - Development workflow and automation

## 🏗️ Architecture

### Deployment Infrastructure
- **Hostinger VPS**: 72.60.114.234 (Primary deployment server)
- **Contabo VPS**: 195.26.248.151 (9gg.app applications)
- **Process Manager**: PM2
- **Reverse Proxy**: nginx with Let's Encrypt SSL
- **CI/CD**: GitHub Actions

### Tech Stack Overview
- **Frontend**: React.js, Next.js, React Native
- **Backend**: Node.js/Express, Next.js API routes
- **Databases**: PostgreSQL, SQLite, MongoDB
- **Auth**: NextAuth.js, JWT
- **Payments**: Stripe
- **AI/ML**: OpenAI API, TensorFlow.js

## 📈 Portfolio Stats

- **Total Applications**: 72+
- **Active Branches**: 25+
- **Tech Stack**: Next.js, React Native, Express, PostgreSQL, SQLite, MongoDB
- **Deployment Status**: Multiple apps deployed on Contabo VPS

## 🤝 Contributing

Contributions are welcome! Please see [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

## 📄 License

MIT License - see [LICENSE](./LICENSE) file

## 📞 Support

For support, open an issue on GitHub or check individual app documentation.

---

**Building the future of SaaS, one app at a time** 🚀
