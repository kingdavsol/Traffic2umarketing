# Quicksell Deployment Guide

## Overview

This guide covers the complete deployment of the Quicksell application to the `quicksell.monster` domain. The application is a Next.js 14 SaaS platform with AI-powered features, Stripe payments, and NextAuth authentication.

## Key Fixes Included

All TypeScript errors have been resolved:

### 1. **Stripe Webhook Type Error** (lib/stripe/webhook/route.ts)
- **Issue**: `getTierFromPriceId()` returns a string, but Prisma expects `SubscriptionTier` enum
- **Fix**: Added type assertion: `subscriptionTier: tier as any`
- **Impact**: Stripe webhook processing for subscription updates

### 2. **NextAuth Nullable Name Field** (lib/auth.ts)
- **Issue**: User name from database can be null, but NextAuth User type requires string
- **Fix**: Changed to `name: user.name || ''` to provide empty string default
- **Impact**: User authentication and session management

### 3. **OpenAI Lazy Loading** (lib/openai.ts)
- **Issue**: OpenAI client instantiation failed at module load time without API key
- **Fix**: Implemented lazy-loading with `getOpenAI()` function that instantiates on first use
- **Impact**: Build succeeds without API keys; client instantiates at runtime

### 4. **Resend Email Lazy Loading** (lib/email.ts)
- **Issue**: Resend client instantiation failed at module load time without API key
- **Fix**: Implemented lazy-loading with `getResend()` function that instantiates on first use
- **Impact**: Build succeeds without email API keys; client instantiates at runtime

### 5. **React Hooks Prerendering Error** (app/layout.tsx and API routes)
- **Issue**: Pages with client hooks (useState, useEffect) were being statically prerendered
- **Fix**: Added `export const dynamic = 'force-dynamic'` to disable static prerendering
- **Impact**: All pages and API routes render dynamically at runtime

## Architecture

```
GitHub Repository
    ↓ (Branch: claude/fix-typescript-github-sync-01PcLoV7ZCLcgH9wDizRyGiS)
Source Code (/root/Traffic2umarketing)
    ↓
Deployment Script (DEPLOY_QUICKSELL.sh)
    ↓
VPS Deployment (/var/www/quicksell.monster)
    ↓
PM2 Process Manager (Port 3000)
    ↓
Nginx Reverse Proxy (HTTPS)
    ↓
quicksell.monster (Production Domain)
```

## Prerequisites

### On VPS:
- Ubuntu 20.04+ or similar Linux distribution
- Node.js 18+ and npm 9+
- PM2 for process management
- Nginx for reverse proxy
- SSL certificate (Let's Encrypt)
- PostgreSQL database access
- sudo access for installation

### Environment Variables Required:
```
# Database
DATABASE_URL="postgresql://user:password@host:5432/caption_genius"

# NextAuth
NEXTAUTH_SECRET="<generated-secret>"
NEXTAUTH_URL="https://quicksell.monster"

# Email (Resend)
RESEND_API_KEY="re_xxxxx"
EMAIL_FROM="noreply@captiongenius.com"

# AI (OpenAI)
OPENAI_API_KEY="sk-xxxxx"

# Payments (Stripe)
STRIPE_SECRET_KEY="sk_live_xxxxx"
STRIPE_PUBLISHABLE_KEY="pk_live_xxxxx"
STRIPE_WEBHOOK_SECRET="whsec_xxxxx"
STRIPE_BASIC_PRICE_ID="price_xxxxx"
STRIPE_BUILDER_PRICE_ID="price_xxxxx"
STRIPE_PREMIUM_PRICE_ID="price_xxxxx"

# App URL
NEXT_PUBLIC_APP_URL="https://quicksell.monster"
```

## Deployment Process

### Step 1: Prepare VPS

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js (if not installed)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install PM2 globally
sudo npm install -g pm2

# Install Nginx (if not installed)
sudo apt install -y nginx

# Setup SSL certificate with Let's Encrypt
sudo apt install -y certbot python3-certbot-nginx
sudo certbot certonly --nginx -d quicksell.monster

# Create deployment directory
sudo mkdir -p /var/www/quicksell.monster
sudo chown $(whoami):$(whoami) /var/www/quicksell.monster
```

### Step 2: Run Deployment Script

From your local machine or VPS with access to the GitHub repository:

```bash
# Basic deployment (pulls latest code from GitHub)
sudo bash DEPLOY_QUICKSELL.sh

# Skip GitHub sync (use local files)
sudo bash DEPLOY_QUICKSELL.sh --skip-github

# Skip build step (only for updates to .env or assets)
sudo bash DEPLOY_QUICKSELL.sh --skip-github --no-build
```

The script will:
1. Sync code from GitHub branch
2. Verify TypeScript compilation
3. Stop existing processes
4. Clean and prepare deployment directory
5. Create .env file (you'll be prompted to update it)
6. Install dependencies
7. Build the application
8. Configure Nginx
9. Start with PM2

### Step 3: Update Environment Variables

After running the deployment script, edit `.env`:

```bash
# On VPS
nano /var/www/quicksell.monster/.env
```

Update all placeholder values with actual credentials:
- Database connection string
- NextAuth secret (generate with: `openssl rand -base64 32`)
- API keys (OpenAI, Stripe, Resend)
- Domain URLs

### Step 4: Verify Deployment

```bash
# Check application is running
pm2 status

# View logs
pm2 logs quicksell

# Test HTTPS endpoint
curl -I https://quicksell.monster

# Check Nginx status
sudo systemctl status nginx

# View Nginx logs
tail -f /var/log/nginx/quicksell.monster.access.log
tail -f /var/log/nginx/quicksell.monster.error.log
```

## Common Tasks

### View Application Logs
```bash
pm2 logs quicksell
pm2 logs quicksell --lines 100  # Last 100 lines
```

### Restart Application
```bash
# Restart from current deployment
pm2 restart quicksell

# Full redeploy (reload .env changes)
sudo bash DEPLOY_QUICKSELL.sh --skip-github --no-build
```

### Stop Application
```bash
pm2 stop quicksell
```

### Monitor in Real-time
```bash
pm2 monit
```

### Update Code from GitHub
```bash
cd /var/www/quicksell.monster
git pull origin claude/fix-typescript-github-sync-01PcLoV7ZCLcgH9wDizRyGiS
npm run build
pm2 restart quicksell
```

### Manual Build and Start
```bash
cd /var/www/quicksell.monster

# Verify TypeScript
npx tsc --noEmit

# Build
npm run build

# Start (if not using PM2)
npm start
```

## Troubleshooting

### App Crashes After Starting

Check logs:
```bash
pm2 logs quicksell --lines 50
```

Common causes:
- Missing .env file or incomplete environment variables
- Database connection failed (check DATABASE_URL)
- Port 3000 already in use

### Build Fails

Verify TypeScript:
```bash
cd /var/www/quicksell.monster
npx tsc --noEmit
```

Check build logs:
```bash
cat /tmp/quicksell_build.log
```

### Nginx Returns 502 Bad Gateway

Check if app is running:
```bash
pm2 status
```

Check Nginx logs:
```bash
tail -f /var/log/nginx/quicksell.monster.error.log
```

Verify proxy configuration:
```bash
sudo nginx -t
```

### HTTPS/SSL Issues

Verify certificate:
```bash
sudo certbot certificates
```

Renew certificate if expired:
```bash
sudo certbot renew --nginx
```

## Architecture Details

### Application Structure
- **Frontend**: Next.js React components with TailwindCSS
- **Backend**: Next.js API routes
- **Database**: PostgreSQL with Prisma ORM
- **Auth**: NextAuth.js with JWT strategy
- **Payments**: Stripe integration
- **Email**: Resend for transactional emails
- **AI**: OpenAI for caption generation

### Deployment Stack
- **Process Manager**: PM2 (with no-autorestart for debugging)
- **Web Server**: Nginx (reverse proxy with SSL/TLS)
- **SSL**: Let's Encrypt certificates
- **Port Mapping**:
  - Nginx: 80 (HTTP), 443 (HTTPS)
  - Node.js: 3000 (internal)

### Performance Optimizations
- Gzip compression enabled in Nginx
- HTTP/2 support
- Security headers configured
- Connection pooling with database

## GitHub Workflow

**IMPORTANT**: Always follow this workflow:

1. **Fix code on GitHub**
   - Make all changes in the repository
   - Commit and push to the branch
   - Verify builds pass on GitHub Actions

2. **Deploy to VPS**
   - Run deployment script (pulls latest from GitHub)
   - Script builds and deploys automatically

3. **Never edit production code directly**
   - All changes must be committed to GitHub first
   - GitHub is the source of truth

## Monitoring

### PM2 Monitoring
```bash
# Real-time monitoring
pm2 monit

# List processes
pm2 list

# Show process info
pm2 show quicksell
```

### Nginx Monitoring
```bash
# Check active connections
sudo tail -f /var/log/nginx/quicksell.monster.access.log

# Check errors
sudo tail -f /var/log/nginx/quicksell.monster.error.log
```

### Health Check
```bash
# Simple health check endpoint
curl https://quicksell.monster/health

# Verbose check
curl -v https://quicksell.monster
```

## Database Operations

### Connect to Database
```bash
# Using psql (if PostgreSQL client installed)
psql $DATABASE_URL

# View connection string from .env
grep DATABASE_URL /var/www/quicksell.monster/.env
```

### Run Migrations
```bash
cd /var/www/quicksell.monster
npx prisma migrate deploy
npx prisma generate
```

## Security Considerations

1. **Environment Variables**: Keep .env file secure, never commit to git
2. **SSL/TLS**: Always use HTTPS in production
3. **API Keys**: Rotate Stripe, OpenAI, and Resend keys regularly
4. **Database**: Use strong passwords, restrict network access
5. **Backups**: Regularly backup PostgreSQL database
6. **Updates**: Keep Node.js, npm, and dependencies updated

## Rollback Procedure

If deployment fails:

```bash
# Check logs to identify issue
pm2 logs quicksell

# Restart previous version (if still in PM2)
pm2 restart quicksell

# Or redeploy with previous commit
cd /var/www/quicksell.monster
git log --oneline | head -5
git reset --hard <previous-commit-hash>
npm run build
pm2 restart quicksell
```

## Performance Metrics

Expected performance:
- First load: < 2 seconds
- API response: < 200ms (excluding external APIs)
- Build time: 3-5 minutes
- Deployment time: 10-15 minutes (including npm install and build)

## Additional Resources

- **Next.js Documentation**: https://nextjs.org/docs
- **Prisma Documentation**: https://www.prisma.io/docs
- **NextAuth.js Documentation**: https://next-auth.js.org/
- **PM2 Documentation**: https://pm2.keymetrics.io/docs/usage/pm2-doc-single-page/
- **Nginx Documentation**: https://nginx.org/en/docs/

## Support

For issues or questions:
1. Check logs: `pm2 logs quicksell`
2. Verify .env: `cat /var/www/quicksell.monster/.env`
3. Test TypeScript: `npx tsc --noEmit`
4. Check GitHub branch: Ensure latest commits are pulled
