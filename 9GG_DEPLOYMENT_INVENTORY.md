# 9GG.APP Complete Deployment Inventory
**Generated:** December 22, 2025
**VPS:** Contabo 195.26.248.151
**Domain Pattern:** [app-name].9gg.app

---

## Executive Summary

**Total Apps Identified:** 61 apps
**Currently Deployed:** 19 apps (31% complete)
**Ready to Deploy:** 42 apps (69% remaining)

---

## CURRENTLY DEPLOYED (19 apps) ✅

### Original 9 Apps (Ports 3001-3009)
1. **caption-genius.9gg.app** - Port 3001 - RUNNING
2. **bizbuys.9gg.app** - Port 3002 - RUNNING
3. **datacash.9gg.app** - Port 3003 - RUNNING
4. **earnhub.9gg.app** - Port 3004 - RUNNING
5. **gigcredit.9gg.app** - Port 3005 - RUNNING
6. **impactreceipts.9gg.app** - Port 3006 - RUNNING
7. **medisave.9gg.app** - Port 3007 - RUNNING
8. **neighborcash.9gg.app** - Port 3008 - RUNNING
9. **skillswap.9gg.app** - Port 3009 - RUNNING

### Insurance Apps (Ports 3010-3019)
10. **health-insurance-compare.9gg.app** - Port 3010 - RUNNING
11. **life-insurance-compare.9gg.app** - Port 3011 - RUNNING
12. **home-insurance-compare.9gg.app** - Port 3012 - RUNNING
13. **car-insurance-compare.9gg.app** - Port 3013 - RUNNING
14. **business-insurance-compare.9gg.app** - Port 3014 - RUNNING
15. **boat-insurance-compare.9gg.app** - Port 3015 - RUNNING
16. **motorcycle-insurance-compare.9gg.app** - Port 3016 - RUNNING
17. **pet-insurance-compare.9gg.app** - Port 3017 - RUNNING
18. **renters-insurance-compare.9gg.app** - Port 3018 - RUNNING
19. **travel-insurance-compare.9gg.app** - Port 3019 - RUNNING

---

## READY TO DEPLOY (42 apps)

### 1. Business Apps Suite - 8 apps 📊
**Repository:** https://github.com/kingdavsol/business-apps-suite
**Type:** Turborepo monorepo
**Location:** /var/www/business-apps-suite
**Tech Stack:** Next.js 14.2, React 18.3, TypeScript, PostgreSQL, Prisma, Stripe
**Status:** ⚠️ Code exists, needs turborepo deployment

**Apps:**
1. **codesnap.9gg.app** - Screenshot to Code ($19-49/mo)
   - Port: 3020
   - OpenAI GPT-4V integration

2. **leadextract.9gg.app** - Lead Data Extraction
   - Port: 3021

3. **linkedboost.9gg.app** - LinkedIn Scheduler with AI ($15-39/mo)
   - Port: 3022
   - LinkedIn API + OpenAI

4. **menuqr.9gg.app** - QR Code Menu Builder
   - Port: 3023

5. **revenueview.9gg.app** - Stripe Analytics Dashboard ($19-99/mo)
   - Port: 3024
   - Stripe API integration

6. **testlift.9gg.app** - No-Code A/B Testing ($29-99/mo)
   - Port: 3025

7. **updatelog.9gg.app** - Changelog & Product Updates ($19-49/mo)
   - Port: 3026

8. **warminbox.9gg.app** - Email Warm-up & Deliverability ($29-79/mo)
   - Port: 3027
   - SMTP integration

### 2. Fintech Suite - 4 apps (1 deployed, 3 remaining) 💰
**Repository:** https://github.com/kingdavsol/fintech-suite
**Type:** Multi-branch repository
**Location:** /var/www/fintech-suite
**Tech Stack:** Next.js, React, SQLite, JWT
**Status:** ⚠️ earnhub deployed, 3 apps need branch deployment

**Branches:**
- earnhub ✅ (DEPLOYED as earnhub.9gg.app - port 3004)
- datacash ⚠️ (CONFLICT: deployed at port 3003, but may need update from branch)
- gigcredit ⚠️ (CONFLICT: deployed at port 3005, but may need update from branch)
- medisave ⚠️ (CONFLICT: deployed at port 3007, but may need update from branch)

**Note:** Need to verify if currently deployed versions match branch code

### 3. Gig Economy Suite - 4 apps (1 deployed, 3 remaining) 🚚
**Repository:** https://github.com/kingdavsol/gig-economy-suite
**Type:** Multi-branch repository
**Location:** /var/www/gig-economy-suite
**Tech Stack:** Next.js, React, SQLite, JWT
**Status:** ⚠️ skillswap and neighborcash deployed, 2 apps need deployment

**Apps:**
1. **skillswap.9gg.app** ✅ - Port 3009 - DEPLOYED
2. **neighborcash.9gg.app** ✅ - Port 3008 - DEPLOYED
3. **skilltrade.9gg.app** ❌ - Port 3028 - NOT DEPLOYED
   - Branch: skilltrade
   - Blue-collar gig platform

4. **seasonalearns.9gg.app** ❌ - Port 3029 - NOT DEPLOYED
   - Branch: seasonalearns
   - Seasonal work aggregator

### 4. Caption Genius - 1 app ✅
**Repository:** https://github.com/kingdavsol/caption-genius
**Location:** /var/www/caption-genius
**Status:** ✅ DEPLOYED at caption-genius.9gg.app (port 3001)

### 5. BizBuys Procurement - 1 app ✅
**Repository:** https://github.com/kingdavsol/bizbuys-procurement
**Location:** /var/www/bizbuys-procurement
**Status:** ✅ DEPLOYED at bizbuys.9gg.app (port 3002)

### 6. Insurance Compare Suite - 10 apps ⚠️
**Repository:** https://github.com/kingdavsol/insurance-compare-suite
**Location:** /var/www/insurance-compare-suite
**Status:** ⚠️ 10 basic landing pages deployed, original monorepo apps NOT deployed

**Note:** Currently deployed insurance apps are simple Next.js landing pages.
The original turborepo has these 10 apps with full functionality:
1. cyber-insurance-compare
2. disability-insurance-compare
3. drone-insurance-compare
4. landlord-insurance-compare
5. motorcycle-insurance-compare ✅ (basic version deployed)
6. pet-insurance-compare ✅ (basic version deployed)
7. sr22-insurance-compare
8. travel-insurance-compare ✅ (basic version deployed)
9. umbrella-insurance-compare
10. wedding-insurance-compare

**Decision needed:** Replace simple landing pages with full turborepo apps or keep as-is?

### 7. Mobile Dev Suite - 33 apps (Android apps - separate deployment) 📱
**Repository:** https://github.com/kingdavsol/mobile-dev-suite
**Location:** /var/www/mobile-dev-suite
**Status:** ❌ NOT DEPLOYED (React Native apps, different deployment strategy needed)

**Branch: android-app-stores (30 apps)**
1. SnapSave - Receipt scanner
2. CashFlowMap - Cash flow visualization
3. GigStack - Gig worker management
4. VaultPay - Secure payments
5. DebtBreak - Debt payoff tracker
6. PeriFlow - Period tracker
7. TeleDocLocal - Telemedicine
8. NutriBalance - Nutrition tracker
9. MentalMate - Mental health
10. ActiveAge - Senior fitness
11. TaskBrain - Task management
12. MemoShift - Memory training
13. CodeSnap - Screenshot to code (mobile version)
14. DraftMate - Writing assistant
15. FocusFlow - Focus timer
16. PuzzleQuest - Puzzle games
17. CityBuilderLite - City builder
18. StoryRunner - Interactive stories
19. SkillMatch - Skill matching
20. ZenGarden - Meditation
21. GuardVault - Password manager
22. NoTrace - Privacy browser
23. CipherText - Encrypted messaging
24. LocalEats - Local restaurants
25. ArtisanHub - Artisan marketplace
26. QualityCheck - Quality assurance
27. SkillBarter - Skill trading
28. ClimateTrack - Carbon footprint
29. CrewNetwork - Team networking
30. AuraRead - Aura reading

**Other branches:**
- cross-platform (1 app) - Framework/tool
- monitoring-dashboard (1 app) - Analytics dashboard
- niche-finder (1 app) - Market research tool

**Note:** These are React Native mobile apps requiring different deployment (app stores or Expo)

### 8. Hostinger Apps - 2 apps (Migration needed) 🔄
**Source:** Hostinger VPS (72.60.114.234)
**Location:** /var/www/*.9gg.app on Hostinger
**Status:** ❌ NOT MIGRATED

**Apps to migrate:**
1. **crm-pro.9gg.app** - Port 3030
   - CRM application

2. **pm-suite.9gg.app** - Port 3031
   - Project Management Suite

---

## DEPLOYMENT PRIORITY

### Phase 1: Business Apps (High Value SaaS) - 8 apps
**Priority:** 🔴 HIGH - Revenue generating apps
**Estimated Time:** 2-3 hours
**Ports:** 3020-3027

Deploy business-apps-suite turborepo:
1. codesnap
2. leadextract
3. linkedboost
4. menuqr
5. revenueview
6. testlift
7. updatelog
8. warminbox

**Commands:**
```bash
cd /var/www/business-apps-suite
npm install
npx turbo build
# Deploy each app with PM2
```

### Phase 2: Gig Economy Apps - 2 apps
**Priority:** 🟡 MEDIUM
**Estimated Time:** 1 hour
**Ports:** 3028-3029

Deploy remaining gig-economy apps:
1. skilltrade
2. seasonalearns

### Phase 3: Hostinger Migration - 2 apps
**Priority:** 🟡 MEDIUM
**Estimated Time:** 1-2 hours
**Ports:** 3030-3031

Migrate from Hostinger:
1. crm-pro
2. pm-suite

### Phase 4: Insurance Monorepo (Optional) - 10 apps
**Priority:** 🟢 LOW - Basic versions already deployed
**Estimated Time:** 3-4 hours
**Decision:** Evaluate if full apps needed vs current landing pages

### Phase 5: Mobile Apps (Future)
**Priority:** 🔵 DEFERRED - Different deployment strategy
**Estimated Time:** Unknown
**Requires:** Expo deployment or app store submission

---

## PORT ALLOCATION REFERENCE

| Port Range | Apps | Status |
|------------|------|--------|
| 3001-3009 | Original 9 apps | ✅ DEPLOYED |
| 3010-3019 | Insurance landing pages | ✅ DEPLOYED |
| 3020-3027 | Business apps suite | ❌ PENDING |
| 3028-3029 | Gig economy remaining | ❌ PENDING |
| 3030-3031 | Hostinger migrations | ❌ PENDING |
| 3032+ | Future expansion | - |

---

## SUMMARY

**Web Apps Ready to Deploy:** 12 apps
- 8 Business Apps (turborepo)
- 2 Gig Economy Apps
- 2 Hostinger Migrations

**Mobile Apps (Future):** 33 apps (React Native)

**Current Deployment Rate:** 31% (19/61 web apps)

**After Phase 1-3 Completion:** 51% (31/61 web apps)

---

**Next Steps:**
1. Deploy business-apps-suite (8 apps)
2. Deploy skilltrade and seasonalearns (2 apps)
3. Migrate crm-pro and pm-suite from Hostinger (2 apps)
4. Evaluate insurance monorepo upgrade
5. Plan mobile app deployment strategy
