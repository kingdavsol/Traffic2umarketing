# PlayStore Apps - Branch Guide

Each of the 20 apps has its own independent Git branch for isolated development, testing, and deployment.

---

## 🌳 Available App Branches

| # | App Name | Branch | Status | Ready to Deploy |
|---|----------|--------|--------|-----------------|
| 1 | Mental Health Pro | `app/1-mental-health-pro` | ✅ Complete | Immediate |
| 2 | PostPartum Fitness | `app/2-postpartum-fitness` | 📋 Scaffolding | Week 1-2 |
| 3 | Local Services | `app/3-local-services` | 📋 Scaffolding | Week 1-2 |
| 4 | ADHD Management | `app/4-adhd-management` | 📋 Scaffolding | Week 2-3 |
| 5 | Senior Fitness | `app/5-senior-fitness` | 📋 Scaffolding | Week 3-4 |
| 6 | Gig Worker Finance | `app/6-gig-worker-finance` | 📋 Scaffolding | Week 3-4 |
| 7 | Coding for Founders | `app/7-coding-for-founders` | 📋 Scaffolding | Week 4-5 |
| 8 | Food Waste Market | `app/8-food-waste` | 📋 Scaffolding | Week 4-5 |
| 9 | Shift Management | `app/9-shift-management` | 📋 Scaffolding | Week 5 |
| 10 | Anxiety Journaling | `app/10-anxiety-journal` | 📋 Scaffolding | Week 5-6 |
| 11 | Freelancer PM | `app/11-freelancer-pm` | 📋 Scaffolding | Week 6 |
| 12 | Habit Tracker | `app/12-habit-tracker` | 📋 Scaffolding | Week 6 |
| 13 | AI Personal Stylist | `app/13-ai-stylist` | 📋 Scaffolding | Week 6-7 |
| 14 | Coffee Inventory | `app/14-coffee-inventory` | 📋 Scaffolding | Week 7 |
| 16 | Desk Ergonomics | `app/16-desk-ergonomics` | 📋 Scaffolding | Week 7-8 |
| 17 | Interview Prep | `app/17-interview-prep` | 📋 Scaffolding | Week 8 |
| 18 | Micro-Credentials | `app/18-micro-credentials` | 📋 Scaffolding | Week 8 |
| 19 | Niche Dating | `app/19-niche-dating` | 📋 Scaffolding | Week 9 |
| 20 | Meal Planning | `app/20-meal-planning` | 📋 Scaffolding | Week 9 |

---

## 🚀 Getting Started with Any App

### Step 1: Check Out the App Branch

```bash
# List all app branches
git branch -a | grep "app/"

# Check out a specific app
git checkout app/2-postpartum-fitness

# Or create a working copy
git checkout -b develop/postpartum-fitness app/2-postpartum-fitness
```

### Step 2: Navigate to App Directory

```bash
cd PlayStoreApps/apps/2-postpartum-fitness
```

### Step 3: Install Dependencies

```bash
npm install
```

### Step 4: Configure Environment

```bash
cp .env.example .env.local
# Edit .env.local with your configuration
```

### Step 5: Run Locally

```bash
npm run dev
# Visit http://localhost:3000
```

### Step 6: Customize & Deploy

```bash
# Edit src/pages/index.tsx (landing page)
# Edit src/pages/dashboard.tsx (main app)
# Create app-specific components
# Add API routes for your niche

# When ready to deploy:
npm run build
vercel --prod
```

---

## 📋 App-by-App Checklist

For each app, follow this implementation roadmap:

### Phase 1: Customization (1-2 hours)
- [ ] Landing page copy (problem, solution, features)
- [ ] Dashboard mockup (main metrics)
- [ ] Color scheme (update Tailwind config)
- [ ] Logo & assets (add to public/)

### Phase 2: Core Features (2-3 hours)
- [ ] API routes for app-specific logic
- [ ] Database schemas (MongoDB collections)
- [ ] Custom components
- [ ] Business logic implementation

### Phase 3: Premium Features (1 hour)
- [ ] Premium feature gates
- [ ] Subscription integration
- [ ] Premium-only content

### Phase 4: Gamification (30 min)
- [ ] Points system
- [ ] Badges setup
- [ ] Streaks & milestones
- [ ] Leaderboards (optional)

### Phase 5: Testing (30 min)
- [ ] Auth flows (signup, login, reset)
- [ ] Payment flows (upgrade, trial)
- [ ] Ad display
- [ ] Responsive design

### Phase 6: Deployment (20 min)
- [ ] Environment variables configured
- [ ] Privacy policy linked
- [ ] Terms of service linked
- [ ] Deploy to Vercel

### Phase 7: Google Play (1-2 hours)
- [ ] Create app listing
- [ ] Upload assets (icon, screenshots)
- [ ] Write description
- [ ] Submit for review

**Total: 6-10 hours per app**

---

## 🔄 Branch Workflow

### Recommended Development Flow

```
main branch (claude/find-app-niches-*)
├── Infrastructure & Docs
└── app/[number]-[app-name]
    ├── Your working branch
    ├── All app-specific code
    ├── App configuration
    └── Ready to merge back when complete

Suggested workflow:
1. git checkout app/2-postpartum-fitness
2. git checkout -b develop/postpartum
3. Make changes & commit
4. When ready: push develop/postpartum
5. Create PR back to app/2-postpartum-fitness
6. Merge when tests pass
7. Deploy from app branch
```

### Keeping Apps Updated

As shared infrastructure changes:

```bash
# Update from main branch
git fetch origin
git checkout app/2-postpartum-fitness
git merge claude/find-app-niches-* --no-ff

# Resolve any conflicts
# Test locally
# Push updated app branch
git push origin app/2-postpartum-fitness
```

---

## 📊 Branch Status

### Complete Apps (Ready to Deploy)
- `app/1-mental-health-pro` - ✅ Fully implemented

### Ready for Development (Scaffolding Complete)
```bash
# Check out any of these and start building:
git checkout app/2-postpartum-fitness
git checkout app/3-local-services
git checkout app/4-adhd-management
# ... and 16 more
```

### Development Tips

For each app branch:

1. **Keep changes isolated** - Only modify your app's folder
2. **Use meaningful commits** - Reference the app name
   ```bash
   git commit -m "feat(postpartum-fitness): Add workout video player"
   ```
3. **Sync with main** - Periodically pull latest docs/templates
4. **Test thoroughly** - Before pushing to production

---

## 🚢 Deployment per App

### Option 1: Deploy from GitHub Branch

```bash
# 1. Push your app branch
git push origin app/2-postpartum-fitness

# 2. Deploy from Vercel
# - Connect GitHub to Vercel
# - Select app/2-postpartum-fitness branch
# - Configure environment variables
# - Deploy!
```

### Option 2: Deploy from Local

```bash
# 1. Check out app branch
git checkout app/2-postpartum-fitness

# 2. Install Vercel CLI
npm i -g vercel

# 3. Deploy
vercel --prod
```

### Option 3: Deploy via Script

```bash
# From main directory
bash scripts/deploy-app.sh 2-postpartum-fitness
```

---

## 🔍 Checking Out Specific Apps

Quick reference - copy/paste to check out any app:

```bash
# PostPartum Fitness
git checkout app/2-postpartum-fitness

# Local Services
git checkout app/3-local-services

# ADHD Management
git checkout app/4-adhd-management

# Senior Fitness
git checkout app/5-senior-fitness

# Gig Worker Finance
git checkout app/6-gig-worker-finance

# Coding for Founders
git checkout app/7-coding-for-founders

# Food Waste Market
git checkout app/8-food-waste

# Shift Management
git checkout app/9-shift-management

# Anxiety Journaling
git checkout app/10-anxiety-journal

# Freelancer PM
git checkout app/11-freelancer-pm

# Habit Tracker
git checkout app/12-habit-tracker

# AI Personal Stylist
git checkout app/13-ai-stylist

# Coffee Inventory
git checkout app/14-coffee-inventory

# Desk Ergonomics
git checkout app/16-desk-ergonomics

# Interview Prep
git checkout app/17-interview-prep

# Micro-Credentials
git checkout app/18-micro-credentials

# Niche Dating
git checkout app/19-niche-dating

# Meal Planning
git checkout app/20-meal-planning
```

---

## 📚 Documentation per App

Each app has detailed specs in the main branch:

- **APPS_INDEX.md** - Full specifications for all apps
- **GENERATE_APPS.md** - Building instructions per app
- **COMPLETE_DEPLOYMENT_GUIDE.md** - Deployment steps
- **GOOGLE_PLAY_SUBMISSION.md** - App store launch checklist

---

## 🛠️ Troubleshooting

### "fatal: not a valid ref"
The branch doesn't exist yet. Create it first:
```bash
git checkout -b app/[app-name]
```

### "Your branch is diverged"
If app branch diverged from main:
```bash
git fetch origin
git rebase origin/main
```

### "Working tree is dirty"
Commit or stash changes:
```bash
git add .
git commit -m "WIP: Work in progress"
# Or
git stash
```

---

## 📞 Support

For each app:
1. Check **APPS_INDEX.md** for specifications
2. Check **APP_TEMPLATE.md** for implementation patterns
3. Look at **1-mental-health-pro** for a complete example
4. Follow **COMPLETE_DEPLOYMENT_GUIDE.md** for deployment

---

## ✅ Summary

You now have:
- ✅ 1 complete, fully-built app (Mental Health Pro)
- ✅ 19 app scaffolds ready for development
- ✅ Individual branches for each app
- ✅ Complete documentation
- ✅ Deployment guides

Each branch is a complete, independent development environment. Pick any app, check it out, and start building!

Happy coding! 🚀
