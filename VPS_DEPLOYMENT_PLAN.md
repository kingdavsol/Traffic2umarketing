# Hostinger VPS Deployment Plan - Traffic2uMarketing

**Created**: November 21, 2025
**Total Apps to Deploy**: 70+
**Target Infrastructure**: Hostinger VPS
**Deployment Status**: Ready for Implementation

---

## EXECUTIVE SUMMARY

This plan outlines how to deploy 70+ applications across 19 git branches to a Hostinger VPS with optimal domain structure, automation, and Claude Code integration for ongoing management.

### Key Objectives
1. **Domain Architecture**: Main domain with 68 subdomains + 1 dedicated domain (Quicksell)
2. **Automation**: Fastest possible directory/domain creation
3. **Claude Integration**: Seamless VPS access for deployments and updates
4. **Scalability**: Support 100M+ potential downloads across apps

---

## PART 1: COMPLETE APPLICATION INVENTORY

### Summary Statistics
- **Total Apps**: 70+
- **Branches**: 19
- **Frontend Apps**: 40+ (Next.js, React)
- **Mobile Apps**: 30+ (React Native)
- **Backend Services**: 15+
- **Monorepos**: 2

### DETAILED APP BREAKDOWN BY CATEGORY

#### **CATEGORY 1: AI & CONTENT GENERATION (2 apps)**
1. **CaptionGenius** - Social Media Caption Generator
   - Branch: `claude/ai-caption-generator-app`
   - Subdomain: `caption-genius.traffic2u.com`
   - Tech: Next.js, OpenAI GPT-4, Stripe, PostgreSQL
   - Port: 3000 (Next.js)
   - Deployment: Vercel OR Docker

2. **DraftMate** - AI Writing Assistant
   - Branch: `claude/analyze-android-app-stores` (included)
   - Subdomain: `draft-mate.traffic2u.com`
   - Tech: React Native, Express, MongoDB
   - Port: 5000
   - Deployment: Docker

---

#### **CATEGORY 2: MARKETPLACE & E-COMMERCE (5 apps)**

3. **QuickSell** - Photo to Marketplace Seller
   - Branch: `claude/skillswap-bartering`
   - **Domain: quicksell.monster** ⭐ (OWN DOMAIN)
   - Tech: React 18, React Native 0.72, Node.js, PostgreSQL, Redis
   - Ports: 3000 (frontend), 5000 (API)
   - Deployment: Docker Compose / Kubernetes
   - Features: Multi-marketplace integration (eBay, Facebook, Craigslist)

4. **ArtisanHub** - Artisan Marketplace
   - Branch: `claude/analyze-android-app-stores`
   - Subdomain: `artisan-hub.traffic2u.com`
   - Tech: React Native, Express, MongoDB
   - Port: 5000
   - Deployment: Docker

5. **LocalEats** - Hyper-Local Food Ordering
   - Branch: `claude/analyze-android-app-stores`
   - Subdomain: `local-eats.traffic2u.com`
   - Tech: React Native, Express, MongoDB
   - Port: 5000
   - Deployment: Docker

6. **QualityCheck** - Product Review Platform
   - Branch: `claude/analyze-android-app-stores`
   - Subdomain: `quality-check.traffic2u.com`
   - Tech: React Native, Express, MongoDB
   - Port: 5000
   - Deployment: Docker

7. **NoTrace** - Anonymous Messaging
   - Branch: `claude/analyze-android-app-stores`
   - Subdomain: `no-trace.traffic2u.com`
   - Tech: React Native, Express, MongoDB
   - Port: 5000
   - Deployment: Docker

---

#### **CATEGORY 3: FINANCE & FINTECH (8 apps)**

8. **SnapSave** - Smart Savings Automation
   - Branch: `claude/analyze-android-app-stores`
   - Subdomain: `snap-save.traffic2u.com`
   - Tech: React Native, Express, MongoDB
   - Port: 5000

9. **CashFlow Map** - Personal Finance Dashboard
   - Subdomain: `cashflow-map.traffic2u.com`
   - Tech: React Native, Express, MongoDB
   - Port: 5000

10. **GigStack** - Freelancer Income & Tax Management
    - Subdomain: `gig-stack.traffic2u.com`
    - Tech: React Native, Express, MongoDB
    - Port: 5000

11. **VaultPay** - Privacy-First Crypto Wallet
    - Subdomain: `vault-pay.traffic2u.com`
    - Tech: React Native, Express, MongoDB
    - Port: 5000

12. **DebtBreak** - Debt Payoff Gamification
    - Subdomain: `debt-break.traffic2u.com`
    - Tech: React Native, Express, MongoDB
    - Port: 5000

13. **GigCredit** - Gig Worker Microloans
    - Branch: `claude/gigcredit-lending`
    - Subdomain: `gig-credit.traffic2u.com`
    - Tech: Next.js, React, SQLite, JWT
    - Port: 3000
    - Deployment: Docker/Vercel

14. **DataCash** - Data Monetization Transparency
    - Branch: `claude/datacash-monetization`
    - Subdomain: `data-cash.traffic2u.com`
    - Tech: Next.js, React, SQLite, JWT
    - Port: 3000

15. **NeighborCash** - Hyper-Local Community Rewards
    - Branch: `claude/neighborcash-local`
    - Subdomain: `neighbor-cash.traffic2u.com`
    - Tech: Next.js, React, SQLite, JWT
    - Port: 3000

---

#### **CATEGORY 4: HEALTHCARE & WELLNESS (5 apps)**

16. **PeriFlow** - Menstrual & Women's Health Analytics
    - Subdomain: `peri-flow.traffic2u.com`
    - Tech: React Native, Express, MongoDB
    - Port: 5000

17. **TeleDoc Local** - Telemedicine for Tier 2 Cities
    - Subdomain: `teledoc-local.traffic2u.com`
    - Tech: React Native, Express, MongoDB
    - Port: 5000

18. **NutriBalance** - Personalized Nutrition
    - Subdomain: `nutri-balance.traffic2u.com`
    - Tech: React Native, Express, MongoDB
    - Port: 5000

19. **MentalMate** - Mental Health Community
    - Subdomain: `mental-mate.traffic2u.com`
    - Tech: React Native, Express, MongoDB
    - Port: 5000

20. **MediSave** - Healthcare Savings Platform
    - Branch: `claude/medisave-healthcare`
    - Subdomain: `medi-save.traffic2u.com`
    - Tech: Next.js, React, SQLite, JWT
    - Port: 3000

---

#### **CATEGORY 5: SENIOR & ACTIVE LIFESTYLE (2 apps)**

21. **ActiveAge** - Senior Health Companion
    - Subdomain: `active-age.traffic2u.com`
    - Tech: React Native, Express, MongoDB
    - Port: 5000

22. **ZenGarden** - Meditation & Gardening
    - Subdomain: `zen-garden.traffic2u.com`
    - Tech: React Native, Express, MongoDB
    - Port: 5000

---

#### **CATEGORY 6: PRODUCTIVITY & LEARNING (7 apps)**

23. **TaskBrain** - AI Project Manager
    - Subdomain: `task-brain.traffic2u.com`
    - Tech: React Native, Express, MongoDB
    - Port: 5000

24. **MemoShift** - Spaced Repetition Learning
    - Subdomain: `memo-shift.traffic2u.com`
    - Tech: React Native, Express, MongoDB
    - Port: 5000

25. **CodeSnap** - Code Learning Platform
    - Subdomain: `code-snap.traffic2u.com`
    - Tech: React Native, Express, MongoDB
    - Port: 5000
    - Also: CodeSnap.com Business App (Turborepo)

26. **FocusFlow** - Pomodoro & Task Timer
    - Subdomain: `focus-flow.traffic2u.com`
    - Tech: React Native, Express, MongoDB
    - Port: 5000

27. **EarnHub** - Student Micro-Gig Platform
    - Branch: `claude/earnhub-student`
    - Subdomain: `earn-hub.traffic2u.com`
    - Tech: Next.js, React, SQLite, JWT
    - Port: 3000

28. **SeasonalEarns** - Seasonal Gig Aggregator
    - Branch: `claude/seasonalears-gigs`
    - Subdomain: `seasonal-earns.traffic2u.com`
    - Tech: Next.js, React, SQLite, JWT
    - Port: 3000

29. **Car Maintenance Hub** - Multi-Platform Vehicle Tracker
    - Branch: `claude/cross-platform-app-development`
    - Subdomain: `car-maintenance.traffic2u.com`
    - Tech: Next.js 14, React Native 0.73, Express, PostgreSQL, Prisma
    - Ports: 3000 (Web), 5000 (API)
    - Deployment: Docker Compose

---

#### **CATEGORY 7: GAMING & ENTERTAINMENT (3 apps)**

30. **PuzzleQuest** - Brain Training Games
    - Subdomain: `puzzle-quest.traffic2u.com`
    - Tech: React Native, Express, MongoDB
    - Port: 5000

31. **CityBuilderLite** - City Building Simulation
    - Subdomain: `city-builder.traffic2u.com`
    - Tech: React Native, Express, MongoDB
    - Port: 5000

32. **StoryRunner** - Interactive Fiction
    - Subdomain: `story-runner.traffic2u.com`
    - Tech: React Native, Express, MongoDB
    - Port: 5000

---

#### **CATEGORY 8: SKILL MATCHING & BARTERING (4 apps)**

33. **SkillMatch** - Skill-Based Matching
    - Subdomain: `skill-match.traffic2u.com`
    - Tech: React Native, Express, MongoDB
    - Port: 5000

34. **SkillBarter** - Skill Bartering
    - Subdomain: `skill-barter.traffic2u.com`
    - Tech: React Native, Express, MongoDB
    - Port: 5000

35. **SkillSwap** - Skill Bartering Platform
    - Branch: `claude/skillswap-bartering`
    - Subdomain: `skill-swap.traffic2u.com`
    - Tech: Next.js, React, SQLite, JWT
    - Port: 3000

36. **SkillTrade** - Blue-Collar Gig Platform
    - Branch: `claude/skilltrade-gig`
    - Subdomain: `skill-trade.traffic2u.com`
    - Tech: Next.js, React, SQLite, JWT
    - Port: 3000

---

#### **CATEGORY 9: PRIVACY & SECURITY (3 apps)**

37. **GuardVault** - Privacy-First Cloud Storage
    - Subdomain: `guard-vault.traffic2u.com`
    - Tech: React Native, Express, MongoDB
    - Port: 5000

38. **CipherText** - End-to-End Encrypted Notes
    - Subdomain: `cipher-text.traffic2u.com`
    - Tech: React Native, Express, MongoDB
    - Port: 5000

39. **ImpactReceipts** - Charity-Linked Receipt Scanning
    - Branch: `claude/impactreceipts-charity`
    - Subdomain: `impact-receipts.traffic2u.com`
    - Tech: Next.js, React, SQLite, JWT
    - Port: 3000

---

#### **CATEGORY 10: SUSTAINABILITY & TRACKING (1 app)**

40. **ClimateTrack** - Carbon Footprint Tracker
    - Subdomain: `climate-track.traffic2u.com`
    - Tech: React Native, Express, MongoDB
    - Port: 5000

---

#### **CATEGORY 11: COMMUNITY & NETWORKING (2 apps)**

41. **CrewNetwork** - Creator Networking Platform
    - Subdomain: `crew-network.traffic2u.com`
    - Tech: React Native, Express, MongoDB
    - Port: 5000

42. **AuraRead** - Fortune Telling & Astrology
    - Subdomain: `aura-read.traffic2u.com`
    - Tech: React Native, Express, MongoDB
    - Port: 5000

---

#### **CATEGORY 12: INSURANCE COMPARISON (10 apps) - Turborepo Monorepo**
Branch: `claude/analyze-insurance-markets`
Tech Stack: Turborepo, Next.js 14, TypeScript, PostgreSQL, Prisma, Resend
Parent Subdomain: `insurance.traffic2u.com`

43. **Pet Insurance Compare** → `pet-insurance.traffic2u.com`
44. **Cyber Insurance Compare** → `cyber-insurance.traffic2u.com`
45. **Disability Insurance Compare** → `disability-insurance.traffic2u.com`
46. **Drone Insurance Compare** → `drone-insurance.traffic2u.com`
47. **Landlord Insurance Compare** → `landlord-insurance.traffic2u.com`
48. **Motorcycle Insurance Compare** → `motorcycle-insurance.traffic2u.com`
49. **SR22 Insurance Compare** → `sr22-insurance.traffic2u.com`
50. **Travel Insurance Compare** → `travel-insurance.traffic2u.com`
51. **Umbrella Insurance Compare** → `umbrella-insurance.traffic2u.com`
52. **Wedding Insurance Compare** → `wedding-insurance.traffic2u.com`

---

#### **CATEGORY 13: B2B SAAS APPS (8 apps) - Turborepo Monorepo**
Branch: `claude/business-apps-setup`
Tech Stack: Turborepo, Next.js 14.2, React 18.3, TypeScript, PostgreSQL, Prisma, Stripe
Parent Subdomain: `business-tools.traffic2u.com`

53. **CodeSnap.com** - Screenshot to Code → `codesnap.traffic2u.com`
    - Premium: $19-49/month
    - OpenAI GPT-4V

54. **WarmInbox.com** - Email Warm-up → `warminbox.traffic2u.com`
    - Premium: $29-79/month
    - SMTP integration

55. **UpdateLog.com** - Changelog & Product Updates → `updatelog.traffic2u.com`
    - Premium: $19-49/month
    - Markdown, Embeddable widgets

56. **TestLift.com** - No-Code A/B Testing → `testlift.traffic2u.com`
    - Premium: $29-99/month
    - Visual editor, Analytics

57. **LinkedBoost.com** - LinkedIn Scheduler with AI → `linkedboost.traffic2u.com`
    - Premium: $15-39/month
    - LinkedIn API, OpenAI

58. **RevenueView.com** - Stripe Analytics → `revenueview.traffic2u.com`
    - Premium: $19-99/month
    - Stripe API, Chart.js

59. **MenuQR.com** - QR Code Menu Builder → `menuqr.traffic2u.com`
    - Restaurant digital menus

60. **LeadExtract** - Lead Data Extraction → `lead-extract.traffic2u.com`

---

#### **CATEGORY 14: B2B PROCUREMENT (1 app)**

61. **BizBuys** - B2B Small Business Procurement
    - Branch: `claude/bizbuys-procurement`
    - Subdomain: `biz-buys.traffic2u.com`
    - Tech: Next.js, React, SQLite, JWT
    - Port: 3000

---

#### **CATEGORY 15: SOCIAL MEDIA AUTOMATION (1 app)**

62. **Social Media Marketing Tool** - 50+ Account Management
    - Branch: `claude/social-media-marketing-tool`
    - Subdomain: `social-tools.traffic2u.com`
    - Tech: Node.js 18+, Express 4.18.2, SQLite, Redis, Bull
    - Ports: 5000 (API), 8000 (Dashboard)
    - Features: Facebook, Instagram, YouTube, TikTok automation
    - Dependencies: FFmpeg, Playwright, node-cron

---

#### **CATEGORY 16: MONITORING & ANALYTICS (1 app)**

63. **Monitoring Dashboard** - Portfolio Analytics
    - Branch: `claude/app-monitoring-dashboard`
    - Subdomain: `dashboard.traffic2u.com`
    - Tech: Node.js, Express, SQLite, Vanilla JS
    - Port: 3000
    - Purpose: Analytics for 50-70+ apps

---

#### **CATEGORY 17: RESEARCH & ANALYSIS (1 app)**

64. **Find App Niches** - Market Research Tool
    - Branch: `claude/find-app-niches`
    - Subdomain: `app-niches.traffic2u.com`
    - Tech: Research/analysis tool
    - Function: Google Play Store analysis, competitive analysis

---

**REMAINING APPS (6-7)**: Additional mobile apps from Android branch not yet detailed

---

## PART 2: DOMAIN ARCHITECTURE

### Domain Structure

```
Primary Domain: traffic2u.com (Main dashboard/hub)
Dedicated Domain: quicksell.monster (QuickSell app only)

Subdomain Structure (68 subdomains):
├── Apps (Content Subdomain)
│   ├── caption-genius.traffic2u.com
│   ├── draft-mate.traffic2u.com
│   ├── artisan-hub.traffic2u.com
│   ├── local-eats.traffic2u.com
│   ├── quality-check.traffic2u.com
│   ├── no-trace.traffic2u.com
│   ├── snap-save.traffic2u.com
│   ├── cashflow-map.traffic2u.com
│   ├── gig-stack.traffic2u.com
│   ├── vault-pay.traffic2u.com
│   ├── debt-break.traffic2u.com
│   ├── gig-credit.traffic2u.com
│   ├── data-cash.traffic2u.com
│   ├── neighbor-cash.traffic2u.com
│   ├── peri-flow.traffic2u.com
│   ├── teledoc-local.traffic2u.com
│   ├── nutri-balance.traffic2u.com
│   ├── mental-mate.traffic2u.com
│   ├── medi-save.traffic2u.com
│   ├── active-age.traffic2u.com
│   ├── zen-garden.traffic2u.com
│   ├── task-brain.traffic2u.com
│   ├── memo-shift.traffic2u.com
│   ├── code-snap.traffic2u.com
│   ├── focus-flow.traffic2u.com
│   ├── earn-hub.traffic2u.com
│   ├── seasonal-earns.traffic2u.com
│   ├── car-maintenance.traffic2u.com
│   ├── puzzle-quest.traffic2u.com
│   ├── city-builder.traffic2u.com
│   ├── story-runner.traffic2u.com
│   ├── skill-match.traffic2u.com
│   ├── skill-barter.traffic2u.com
│   ├── skill-swap.traffic2u.com
│   ├── skill-trade.traffic2u.com
│   ├── guard-vault.traffic2u.com
│   ├── cipher-text.traffic2u.com
│   ├── impact-receipts.traffic2u.com
│   ├── climate-track.traffic2u.com
│   ├── crew-network.traffic2u.com
│   ├── aura-read.traffic2u.com
│   ├── biz-buys.traffic2u.com
│   ├── social-tools.traffic2u.com
│   ├── dashboard.traffic2u.com
│   ├── app-niches.traffic2u.com
│   │
│   ├── insurance/ (Monorepo: 10 apps)
│   │   ├── pet-insurance.traffic2u.com
│   │   ├── cyber-insurance.traffic2u.com
│   │   ├── disability-insurance.traffic2u.com
│   │   ├── drone-insurance.traffic2u.com
│   │   ├── landlord-insurance.traffic2u.com
│   │   ├── motorcycle-insurance.traffic2u.com
│   │   ├── sr22-insurance.traffic2u.com
│   │   ├── travel-insurance.traffic2u.com
│   │   ├── umbrella-insurance.traffic2u.com
│   │   └── wedding-insurance.traffic2u.com
│   │
│   └── business-tools/ (Monorepo: 8 apps)
│       ├── codesnap.traffic2u.com
│       ├── warminbox.traffic2u.com
│       ├── updatelog.traffic2u.com
│       ├── testlift.traffic2u.com
│       ├── linkedboost.traffic2u.com
│       ├── revenueview.traffic2u.com
│       ├── menuqr.traffic2u.com
│       └── lead-extract.traffic2u.com

Dedicated Domain (Special Case):
└── quicksell.monster
    ├── www.quicksell.monster
    └── api.quicksell.monster (optional subdomain for API)
```

### VPS Directory Structure

```
/var/www/
├── traffic2u.com/
│   ├── root/                          # Main hub/dashboard
│   ├── caption-genius/                # 1 app
│   ├── draft-mate/                    # 1 app
│   ├── artisan-hub/                   # 1 app
│   ├── local-eats/                    # 1 app
│   │   ... (40 more app directories)
│   │
│   ├── insurance-monorepo/            # Monorepo with 10 apps
│   │   ├── apps/
│   │   │   ├── pet-insurance/
│   │   │   ├── cyber-insurance/
│   │   │   └── ... (8 more)
│   │   ├── packages/
│   │   └── turbo.json
│   │
│   └── business-tools-monorepo/       # Monorepo with 8 apps
│       ├── apps/
│       │   ├── codesnap/
│       │   ├── warminbox/
│       │   └── ... (6 more)
│       ├── packages/
│       └── turbo.json
│
└── quicksell-monster/                 # Separate dedicated domain
    ├── frontend/
    ├── backend/
    ├── mobile/
    └── docker-compose.yml
```

---

## PART 3: FASTEST DOMAIN SETUP AUTOMATION

### Option A: Automated Bash Script (Recommended for Speed)

```bash
#!/bin/bash
# File: /home/setup-vps-domains.sh
# Purpose: Create all domains and directories in one script
# Execution time: ~2 minutes for all 69 domains

set -e

MAIN_DOMAIN="traffic2u.com"
QUICKSELL_DOMAIN="quicksell.monster"
WEB_ROOT="/var/www"
NGINX_SITES="/etc/nginx/sites-available"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Starting VPS Domain Setup...${NC}"

# Function to create domain structure
create_app_domain() {
    local app_name=$1
    local subdomain=$2
    local port=$3
    local monorepo=$4

    local full_domain="${subdomain}.${MAIN_DOMAIN}"
    local app_dir="${WEB_ROOT}/${MAIN_DOMAIN}/${app_name}"

    echo -e "${YELLOW}Setting up: $full_domain${NC}"

    # Create directories
    mkdir -p "$app_dir"/{frontend,backend,nginx,logs,data}

    # Create nginx config
    cat > "${NGINX_SITES}/${full_domain}.conf" <<EOF
server {
    listen 80;
    listen [::]:80;
    server_name ${full_domain};

    location / {
        proxy_pass http://127.0.0.1:${port};
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;

        # WebSocket support
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
    }

    # Logs
    access_log ${app_dir}/logs/access.log;
    error_log ${app_dir}/logs/error.log;
}
EOF

    echo -e "${GREEN}✓ Created ${full_domain}${NC}"
}

# Function for monorepo
create_monorepo_apps() {
    local monorepo_name=$1
    local parent_path=$2
    shift 2
    local apps=("$@")

    local monorepo_dir="${WEB_ROOT}/${MAIN_DOMAIN}/${monorepo_name}-monorepo"
    mkdir -p "$monorepo_dir"/{apps,packages,logs}

    for app in "${apps[@]}"; do
        IFS='|' read -r app_name port <<< "$app"
        mkdir -p "$monorepo_dir/apps/${app_name}"

        # Create nginx for each app in monorepo
        cat > "${NGINX_SITES}/${app_name}.${MAIN_DOMAIN}.conf" <<EOF
server {
    listen 80;
    listen [::]:80;
    server_name ${app_name}.${MAIN_DOMAIN};

    location / {
        proxy_pass http://127.0.0.1:${port};
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
    }

    access_log ${monorepo_dir}/logs/${app_name}.log;
}
EOF
        echo -e "${GREEN}✓ Created ${app_name}.${MAIN_DOMAIN}${NC}"
    done
}

# Function for dedicated domain
create_dedicated_domain() {
    local domain=$1
    local app_name=$2

    local app_dir="${WEB_ROOT}/${domain}"
    mkdir -p "$app_dir"/{frontend,backend,mobile,nginx,logs,data}

    # Create nginx configs for main domain and www
    for prefix in "" "www."; do
        local site_name="${prefix}${domain}"
        cat > "${NGINX_SITES}/${site_name}.conf" <<EOF
server {
    listen 80;
    listen [::]:80;
    server_name ${site_name};

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
    }

    location /api {
        proxy_pass http://127.0.0.1:5000;
        proxy_set_header Host \$host;
    }

    access_log ${app_dir}/logs/access.log;
}
EOF
        echo -e "${GREEN}✓ Created nginx config for ${site_name}${NC}"
    done
}

# ============================================
# EXECUTE DOMAIN CREATION
# ============================================

# 1. Regular Apps (45 apps)
echo -e "\n${YELLOW}Creating 45 regular app domains...${NC}"
declare -a REGULAR_APPS=(
    "caption-genius|caption-genius|3000"
    "draft-mate|draft-mate|5000"
    "artisan-hub|artisan-hub|5000"
    "local-eats|local-eats|5000"
    "quality-check|quality-check|5000"
    "no-trace|no-trace|5000"
    "snap-save|snap-save|5000"
    "cashflow-map|cashflow-map|5000"
    "gig-stack|gig-stack|5000"
    "vault-pay|vault-pay|5000"
    "debt-break|debt-break|5000"
    "gig-credit|gig-credit|3000"
    "data-cash|data-cash|3000"
    "neighbor-cash|neighbor-cash|3000"
    "peri-flow|peri-flow|5000"
    "teledoc-local|teledoc-local|5000"
    "nutri-balance|nutri-balance|5000"
    "mental-mate|mental-mate|5000"
    "medi-save|medi-save|3000"
    "active-age|active-age|5000"
    "zen-garden|zen-garden|5000"
    "task-brain|task-brain|5000"
    "memo-shift|memo-shift|5000"
    "code-snap|code-snap|5000"
    "focus-flow|focus-flow|5000"
    "earn-hub|earn-hub|3000"
    "seasonal-earns|seasonal-earns|3000"
    "car-maintenance|car-maintenance|3000"
    "puzzle-quest|puzzle-quest|5000"
    "city-builder|city-builder|5000"
    "story-runner|story-runner|5000"
    "skill-match|skill-match|5000"
    "skill-barter|skill-barter|5000"
    "skill-swap|skill-swap|3000"
    "skill-trade|skill-trade|3000"
    "guard-vault|guard-vault|5000"
    "cipher-text|cipher-text|5000"
    "impact-receipts|impact-receipts|3000"
    "climate-track|climate-track|5000"
    "crew-network|crew-network|5000"
    "aura-read|aura-read|5000"
    "biz-buys|biz-buys|3000"
    "social-tools|social-tools|5000"
    "dashboard|dashboard|3000"
    "app-niches|app-niches|3000"
)

for app_spec in "${REGULAR_APPS[@]}"; do
    IFS='|' read -r app_name subdomain port <<< "$app_spec"
    create_app_domain "$app_name" "$subdomain" "$port" "false"
done

# 2. Insurance Monorepo (10 apps)
echo -e "\n${YELLOW}Creating Insurance Monorepo (10 apps)...${NC}"
declare -a INSURANCE_APPS=(
    "pet-insurance|9001"
    "cyber-insurance|9002"
    "disability-insurance|9003"
    "drone-insurance|9004"
    "landlord-insurance|9005"
    "motorcycle-insurance|9006"
    "sr22-insurance|9007"
    "travel-insurance|9008"
    "umbrella-insurance|9009"
    "wedding-insurance|9010"
)

create_monorepo_apps "insurance" "insurance" "${INSURANCE_APPS[@]}"

# 3. Business Tools Monorepo (8 apps)
echo -e "\n${YELLOW}Creating Business Tools Monorepo (8 apps)...${NC}"
declare -a BUSINESS_APPS=(
    "codesnap|9011"
    "warminbox|9012"
    "updatelog|9013"
    "testlift|9014"
    "linkedboost|9015"
    "revenueview|9016"
    "menuqr|9017"
    "lead-extract|9018"
)

create_monorepo_apps "business-tools" "business-tools" "${BUSINESS_APPS[@]}"

# 4. QuickSell Dedicated Domain
echo -e "\n${YELLOW}Creating QuickSell dedicated domain...${NC}"
create_dedicated_domain "$QUICKSELL_DOMAIN" "quicksell"

# 5. Test nginx configuration
echo -e "\n${YELLOW}Testing nginx configuration...${NC}"
if nginx -t; then
    echo -e "${GREEN}✓ Nginx configuration is valid${NC}"
    systemctl reload nginx || systemctl restart nginx
else
    echo -e "${RED}✗ Nginx configuration test failed${NC}"
    exit 1
fi

# 6. Create main hub landing page
echo -e "\n${YELLOW}Creating main hub directory...${NC}"
mkdir -p "${WEB_ROOT}/${MAIN_DOMAIN}/root"
cat > "${WEB_ROOT}/${MAIN_DOMAIN}/root/index.html" <<EOF
<!DOCTYPE html>
<html>
<head>
    <title>Traffic2uMarketing - Hub</title>
</head>
<body>
    <h1>Traffic2u Hub - 70+ Apps</h1>
    <p>Welcome to Traffic2uMarketing portal</p>
</body>
</html>
EOF

echo -e "\n${GREEN}═══════════════════════════════════════${NC}"
echo -e "${GREEN}✓ Domain Setup Complete!${NC}"
echo -e "${GREEN}═══════════════════════════════════════${NC}"
echo -e "\nSummary:"
echo -e "  Main Domain: ${YELLOW}${MAIN_DOMAIN}${NC}"
echo -e "  Dedicated Domain: ${YELLOW}${QUICKSELL_DOMAIN}${NC}"
echo -e "  Regular Apps: ${YELLOW}45${NC}"
echo -e "  Monorepo Apps: ${YELLOW}18${NC} (Insurance + Business Tools)"
echo -e "  Total Subdomains: ${YELLOW}68${NC}"
echo -e "  Total Domains: ${YELLOW}69${NC}"
echo -e "  Web Root: ${YELLOW}${WEB_ROOT}${NC}"
echo -e "  Nginx Config Dir: ${YELLOW}${NGINX_SITES}${NC}"
echo -e "\nNext Steps:"
echo -e "  1. Deploy apps to respective directories"
echo -e "  2. Configure SSL certificates (Let's Encrypt)"
echo -e "  3. Set environment variables for each app"
echo -e "  4. Start Docker containers for each app"
echo -e "  5. Configure DNS records for all domains"
```

### Option B: Terraform/IaC (For Infrastructure as Code)

If you prefer infrastructure as code, Terraform can automate this further. However, Bash script above is fastest for manual setup.

---

## PART 4: VPS ACCESS STRATEGY FOR CLAUDE CODE

### **RECOMMENDED APPROACH: SSH via MCP (Best)**

#### Why SSH via MCP is Best:
1. **Real-time execution** - Claude runs commands directly on VPS
2. **Fastest deployment** - No intermediate steps or GitHub Actions delays
3. **Interactive debugging** - Can test and verify deployment immediately
4. **Security** - SSH keys can be rotated, access controlled
5. **Cost-effective** - No GitHub Actions minutes used
6. **Full control** - Direct file access, logs, diagnostics

#### Implementation Steps:

**Step 1: Set up SSH Key on Hostinger VPS**
```bash
# On VPS as root:
useradd -m -s /bin/bash claude-deploy
usermod -aG sudo claude-deploy  # If needed for sudo commands

# Create .ssh directory
mkdir -p /home/claude-deploy/.ssh
chmod 700 /home/claude-deploy/.ssh

# Generate key pair (locally, securely)
ssh-keygen -t ed25519 -f ~/.ssh/id_claude_vps -N "" -C "claude-vps-deployment"
```

**Step 2: Install MCP SSH Server on Hostinger**
```bash
# Add to .claude/mcp.json in your project:
{
  "mcpServers": {
    "ssh-vps": {
      "command": "npx",
      "args": ["@modelcontextprotocol/server-ssh"],
      "env": {
        "SSH_HOST": "your-vps-ip.hostinger.com",
        "SSH_USER": "claude-deploy",
        "SSH_PORT": "22",
        "SSH_KEY_PATH": "/path/to/.ssh/id_claude_vps",
        "SSH_KEY_PASSPHRASE": "if-encrypted"
      }
    }
  }
}
```

**Step 3: Configure MCP Server Locally**
```bash
# Install SSH MCP server
npm install @modelcontextprotocol/server-ssh

# Add to Claude Code configuration
# Create ~/.claude/config.json or update existing config
{
  "mcpServers": {
    "vps-ssh": {
      "command": "npx",
      "args": ["@modelcontextprotocol/server-ssh"],
      "env": {
        "SSH_HOST": "your-hostinger-ip",
        "SSH_USER": "claude-deploy",
        "SSH_PRIVATE_KEY": "${SSH_PRIVATE_KEY_VPS}",
        "SSH_PORT": "22"
      }
    }
  }
}
```

**Step 4: Verify Connection**
```bash
# Test SSH access
ssh -i ~/.ssh/id_claude_vps claude-deploy@your-vps-ip "pwd"
# Should output: /home/claude-deploy
```

---

### **ALTERNATIVE APPROACH: GitHub Actions (Fallback)**

Use this if MCP SSH is not available or as backup.

#### How It Works:
1. **Push to GitHub** → Triggers workflow
2. **GitHub Actions runs tests** → Builds and tests
3. **Deploys to VPS** → Via SSH in action

#### GitHub Actions Workflow:
```yaml
# File: .github/workflows/deploy.yml
name: Deploy to Hostinger VPS

on:
  push:
    branches:
      - claude/plan-vps-deployment-*

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Build app
        run: npm install && npm run build

      - name: Deploy to VPS
        env:
          DEPLOY_KEY: ${{ secrets.VPS_DEPLOY_KEY }}
          DEPLOY_HOST: ${{ secrets.VPS_HOST }}
          DEPLOY_USER: ${{ secrets.VPS_USER }}
        run: |
          mkdir -p ~/.ssh
          echo "$DEPLOY_KEY" > ~/.ssh/deploy_key
          chmod 600 ~/.ssh/deploy_key
          ssh -i ~/.ssh/deploy_key $DEPLOY_USER@$DEPLOY_HOST << 'EOF'
            cd /var/www/traffic2u.com/${{ github.ref_name }}
            git pull origin ${{ github.ref }}
            npm install
            npm run build
            pm2 restart app || pm2 start --name "app" npm -- start
          EOF
```

#### Pros/Cons:

| Aspect | SSH via MCP | GitHub Actions |
|--------|-----------|-----------------|
| Speed | Fastest (direct) | Slower (CI/CD pipeline) |
| Real-time feedback | Yes | No (async) |
| Cost | Free | Free tier + paid |
| Setup complexity | Medium | Low |
| Security | High (SSH keys) | Medium (secrets) |
| Debugging | Interactive | Logs only |
| Best for | Development/debugging | Automated deploys |

---

## PART 5: DEPLOYMENT SEQUENCE & AUTOMATION

### Phase 1: VPS Preparation (30 minutes)
```bash
# 1. Update system
sudo apt update && sudo apt upgrade -y

# 2. Install required tools
sudo apt install -y \
    curl wget git \
    nodejs npm \
    docker.io docker-compose \
    nginx certbot python3-certbot-nginx \
    postgresql postgresql-contrib \
    redis-server \
    pm2

# 3. Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# 4. Create deployment user
sudo useradd -m -s /bin/bash appuser
sudo usermod -aG docker appuser
sudo usermod -aG sudo appuser

# 5. Setup SSL with Let's Encrypt
sudo certbot certonly --nginx -d traffic2u.com -d *.traffic2u.com -d quicksell.monster -d www.quicksell.monster
```

### Phase 2: Clone and Setup Apps (1-2 hours per branch)
```bash
#!/bin/bash
# File: /home/deploy-single-branch.sh

BRANCH_NAME=$1  # e.g., claude/ai-caption-generator-app-01Wy8LNC4ojprjMW5s8G2ing
REPO_URL="http://local_proxy@127.0.0.1:45069/git/kingdavsol/Traffic2umarketing"
WEB_ROOT="/var/www/traffic2u.com"

# Clone branch
git clone --branch $BRANCH_NAME --single-branch $REPO_URL temp_app
cd temp_app

# Detect app type and build
if [ -f "package.json" ]; then
    npm install

    # Check if Next.js, React, or Node.js app
    if grep -q '"next"' package.json; then
        npm run build
        # Deploy as Next.js
    elif grep -q '"react"' package.json; then
        npm run build
        # Deploy as React SPA
    else
        npm run build
        # Deploy as Node.js
    fi
fi

# Copy to web root
cp -r . ${WEB_ROOT}/app-name/

# Start with PM2
cd ${WEB_ROOT}/app-name/
pm2 start "npm start" --name "app-name"
pm2 save
```

### Phase 3: Database & Configuration
```bash
# For apps using PostgreSQL
sudo -u postgres createdb app_name
sudo -u postgres createuser app_user -P

# For apps using MongoDB
docker run -d --name app-mongodb -p 27017:27017 mongo:latest

# Create environment files for each app
cat > /var/www/traffic2u.com/app-name/.env <<EOF
NODE_ENV=production
DATABASE_URL=postgresql://user:pass@localhost/dbname
API_KEY=xxx
STRIPE_KEY=xxx
OPENAI_KEY=xxx
EOF
```

### Phase 4: Monitoring & Health Checks
```bash
# Install monitoring tools
sudo apt install -y htop iotop nethogs

# Setup PM2 monitoring
pm2 install pm2-logrotate
pm2 install pm2-auto-pull

# Create health check script
cat > /home/appuser/health-check.sh <<'EOF'
#!/bin/bash
for app in $(pm2 list --no-color | grep -E '^\s+\│' | awk '{print $3}'); do
    status=$(pm2 list --no-color | grep "$app" | awk '{print $10}')
    if [ "$status" != "online" ]; then
        echo "APP DOWN: $app - Status: $status" >> /var/log/app-health.log
        pm2 restart $app
    fi
done
EOF

chmod +x /home/appuser/health-check.sh

# Add crontab for health checks
(crontab -l 2>/dev/null; echo "*/5 * * * * /home/appuser/health-check.sh") | crontab -
```

---

## PART 6: DEPLOYMENT CHECKLIST

### Pre-Deployment
- [ ] All 70+ apps tested locally
- [ ] Environment variables documented
- [ ] Database schemas ready
- [ ] API keys/secrets secured in VPS secrets management
- [ ] SSL certificates obtained
- [ ] Nginx configs generated
- [ ] Docker images built (if applicable)
- [ ] Backup strategy in place
- [ ] Monitoring configured

### Deployment (Per App)
- [ ] Clone from branch
- [ ] Install dependencies
- [ ] Build application
- [ ] Copy to VPS directory
- [ ] Create environment file
- [ ] Setup database (if needed)
- [ ] Start service (PM2/Docker)
- [ ] Verify health check
- [ ] Test HTTP/HTTPS access
- [ ] Update DNS records
- [ ] Monitor logs for 24 hours

### Post-Deployment
- [ ] Test all domains accessible
- [ ] Verify SSL certificates
- [ ] Check app functionality
- [ ] Monitor performance
- [ ] Setup automated backups
- [ ] Document deployment notes
- [ ] Setup alerting for downtime

---

## PART 7: COST ANALYSIS

### Hostinger VPS Costs (Monthly)
- **VPS with 8 CPU, 16GB RAM, 160GB SSD**: ~$20-30/month
- **SSL Certificates (Let's Encrypt)**: Free
- **Domain registration** (.com, .monster): ~$10-15/year
- **Backup service**: ~$5-10/month
- **CDN (optional)**: $20-50/month

### Total Monthly: ~$35-50 for infrastructure

### Revenue Potential (at scale):
- **SaaS Apps**: $50K-500K+ per app
- **Insurance Affiliate**: $1.2M-2.5M
- **Mobile Apps**: 100M+ downloads @ $0.50-2.00 CPM = $50K-200K+ annually
- **Total Potential**: $5M-15M+ annually

---

## SUMMARY & RECOMMENDATIONS

### ✅ Recommended Path:
1. **SSH via MCP** - Use for Claude direct VPS access
2. **Bash automation script** - Fastest domain setup (~2 min)
3. **Docker Compose** - For complex apps (QuickSell, Social Media Tool)
4. **PM2** - For Node.js apps and process management
5. **Nginx reverse proxy** - Frontend for all apps
6. **PostgreSQL** - Shared database server (or per-app)

### Timeline:
- **Day 1**: VPS setup + domain structure creation (1-2 hours)
- **Day 2-3**: Deploy first batch of apps (10-15 apps)
- **Week 1**: Deploy remaining apps with testing
- **Week 2**: Optimize, monitor, adjust

### Next Steps:
1. Create MCP SSH server configuration
2. Run domain automation script
3. Deploy apps in batches by category
4. Setup monitoring dashboard
5. Configure CI/CD for future updates

---

**Document Generated**: November 21, 2025
**Status**: Ready for Implementation
**Estimated Total Setup Time**: 1-2 weeks for full deployment
