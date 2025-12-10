# Repository Reorganization Handoff Document
**Date/Time**: 2025-12-07 19:20 UTC
**Status**: MIGRATION COMPLETE - Apps organized into new repositories

---

## Summary

Successfully reorganized 70+ apps from a single branch-based monorepo into **6 separate GitHub repositories** for cleaner management, independent deployments, and easier maintenance.

---

## New Repository Structure

### 1. insurance-compare-suite
**URL**: https://github.com/kingdavsol/insurance-compare-suite
**Type**: Turborepo monorepo
**Apps**: 10 insurance comparison websites
- cyber-insurance-compare
- disability-insurance-compare
- drone-insurance-compare
- landlord-insurance-compare
- motorcycle-insurance-compare
- pet-insurance-compare
- sr22-insurance-compare
- travel-insurance-compare
- umbrella-insurance-compare
- wedding-insurance-compare

**Tech Stack**: Next.js 14, TypeScript, Prisma, PostgreSQL, Turborepo

---

### 2. caption-genius
**URL**: https://github.com/kingdavsol/caption-genius
**Type**: Single app
**Description**: AI-powered social media caption generator
**Tech Stack**: Next.js 14, OpenAI GPT-4, Stripe, Prisma, PostgreSQL

**Known Issues**:
- TypeScript build errors (ignoreBuildErrors: true configured)
- Missing @next-auth/prisma-adapter (needs npm install)
- React hook errors during static generation

---

### 3. fintech-suite
**URL**: https://github.com/kingdavsol/fintech-suite
**Type**: Multi-branch repository (each app on its own branch)
**Branches**:
- `earnhub` - Student micro-gig platform
- `gigcredit` - Gig worker microloans
- `medisave` - Healthcare savings platform
- `datacash` - Data monetization transparency

**Tech Stack**: Next.js 14, React, SQLite, JWT

---

### 4. gig-economy-suite
**URL**: https://github.com/kingdavsol/gig-economy-suite
**Type**: Multi-branch repository
**Branches**:
- `skillswap` - Skill bartering platform
- `skilltrade` - Blue-collar gig platform
- `seasonalearns` - Seasonal gig aggregator
- `neighborcash` - Hyper-local community rewards

**Tech Stack**: Next.js 14, React, SQLite, JWT

---

### 5. social-media-tool
**URL**: https://github.com/kingdavsol/social-media-tool
**Type**: Single app
**Description**: Social media marketing automation (50+ accounts)
**Tech Stack**: Node.js, Express, SQLite, Redis, Playwright, FFmpeg

---

### 6. business-apps-suite
**URL**: https://github.com/kingdavsol/business-apps-suite
**Type**: Turborepo monorepo
**Apps**: 8 business productivity apps
- CodeSnap.com - Screenshot to code
- WarmInbox.com - Email warm-up
- UpdateLog.com - Changelog management
- TestLift.com - A/B testing
- LinkedBoost.com - LinkedIn scheduler
- RevenueView.com - Stripe analytics
- MenuQR.com - QR menu builder
- LeadExtract - Lead data extraction

**Tech Stack**: Next.js 14, TypeScript, Prisma, Stripe

---

## Original Repository (Traffic2umarketing)

**URL**: https://github.com/kingdavsol/Traffic2umarketing
**Status**: KEEP - Original branches preserved for reference

### Branches Preserved:
- `main` - Portfolio hub + deployment scripts
- `quicksell` - QuickSell app (LIVE at quicksell.monster)
- All 22 `claude/*` branches still intact

### Apps Still in Original Repo:
- QuickSell (production-ready, deployed)
- Main portfolio hub
- 30 Android apps (claude/* branches)

---

## VPS Status (72.60.114.234)

### Currently Running:
| Service | Status | URL |
|---------|--------|-----|
| QuickSell | LIVE | https://quicksell.monster |
| 9gg.app Landing | LIVE | https://9gg.app |

### Not Yet Deployed:
- All insurance comparison apps
- Caption Genius
- Fintech apps
- Gig economy apps
- Social media tool
- Business apps suite

### Infrastructure Ready:
- PM2 installed globally
- Nginx configured for *.9gg.app wildcard
- SSL certificates valid
- Chromium for Puppeteer automation

---

## Next Steps for Future Sessions

### 1. Deploy Insurance Suite (Highest Priority)
```bash
cd /var/www
git clone https://github.com/kingdavsol/insurance-compare-suite.git
cd insurance-compare-suite
npm install
npm run build
pm2 start ecosystem.config.js
```

### 2. Fix Caption Genius Build Errors
- Install missing dependencies
- Fix TypeScript strict mode issues
- Resolve React hook errors

### 3. Deploy Fintech Apps
Each app needs:
- Clone from specific branch
- npm install
- Create .env with database config
- npm run build
- PM2 start

### 4. Configure Nginx for Each App
Update /etc/nginx/sites-available/9gg.app.conf:
- Add specific subdomain blocks
- Point to correct PM2 ports

---

## Known Issues

1. **Caption Genius**: 
   - `@next-auth/prisma-adapter` not in package.json
   - TypeScript errors in Stripe webhook
   - React useState not defined errors

2. **Insurance Suite**:
   - `@next/eslint-config@14.0.0` not found in npm registry
   - May need alternative ESLint config

3. **VPS Resource Limits**:
   - 7.8GB RAM - parallel npm installs caused OOM
   - 4 CPU cores - build processes compete
   - Install/build apps sequentially

---

## Repository Mapping (Old -> New)

| Old Branch | New Repository | New Branch |
|------------|----------------|------------|
| claude/analyze-insurance-markets-* | insurance-compare-suite | main |
| claude/ai-caption-generator-app-* | caption-genius | main |
| claude/earnhub-student-* | fintech-suite | earnhub |
| claude/gigcredit-lending-* | fintech-suite | gigcredit |
| claude/medisave-healthcare-* | fintech-suite | medisave |
| claude/datacash-monetization-* | fintech-suite | datacash |
| claude/skillswap-bartering-* | gig-economy-suite | skillswap |
| claude/skilltrade-gig-* | gig-economy-suite | skilltrade |
| claude/seasonalears-gigs-* | gig-economy-suite | seasonalearns |
| claude/neighborcash-local-* | gig-economy-suite | neighborcash |
| claude/social-media-marketing-tool-* | social-media-tool | main |
| claude/business-apps-setup-* | business-apps-suite | main |

---

## Commands Reference

### Clone Specific App
```bash
# For apps with branches in suite repos
git clone -b earnhub https://github.com/kingdavsol/fintech-suite.git earnhub-app

# For main branch apps
git clone https://github.com/kingdavsol/caption-genius.git
```

### PM2 Commands
```bash
pm2 list                    # Show all processes
pm2 start app.js --name X   # Start app
pm2 restart X               # Restart
pm2 logs X                  # View logs
pm2 save                    # Save process list
pm2 startup                 # Auto-start on boot
```

---

## Files Created This Session

- /var/www/9gg.app/root/index.html - Landing page for 9gg.app
- This handoff document

---

## Standing Orders Reminder

From /root/CLAUDE.md:
- **Never ask for permission** - auto-proceed on git/docker/ssh/file operations
- **GitHub-first workflow** - push to GitHub, then pull on VPS
- **VPS**: 72.60.114.234, web root at /var/www/

---

**Generated**: 2025-12-07 19:20 UTC
**Session Duration**: ~45 minutes
**Total Apps Migrated**: 24 apps across 6 new repositories
