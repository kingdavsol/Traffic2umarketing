# Play Store Apps - Architecture

## Each App is Completely Independent

Each of the 20 apps is a **standalone, self-contained application** with:

### Frontend (Next.js)
- Own Next.js project
- Own components, pages, styling
- Own UI/UX unique to the niche

### Backend (Node.js/MongoDB)
- Own MongoDB database
- Own API routes & business logic
- Own authentication (though all use NextAuth.js pattern)
- Own payment processing (though all use Stripe)

### Deployment
- Own Vercel/hosting instance
- Own environment variables
- Own domain (or subdomain)
- Completely separate from other apps

## Repository Structure

```
PlayStoreApps/
├── apps/
│   ├── 1-mental-health-pro/
│   │   ├── src/
│   │   │   ├── pages/
│   │   │   │   ├── index.tsx
│   │   │   │   ├── dashboard.tsx
│   │   │   │   ├── api/
│   │   │   │   │   ├── auth/
│   │   │   │   │   ├── sessions/      [UNIQUE TO THIS APP]
│   │   │   │   │   ├── stress-check/
│   │   │   │   │   ├── interventions/
│   │   │   │   │   └── analytics/
│   │   │   │   ├── auth/
│   │   │   │   └── dashboard/
│   │   │   ├── components/
│   │   │   │   ├── StressChart/     [UNIQUE TO THIS APP]
│   │   │   │   ├── SessionCard/
│   │   │   │   └── InterventionSelector/
│   │   │   ├── utils/
│   │   │   │   └── stress-calculator.ts
│   │   │   └── styles/
│   │   ├── public/
│   │   ├── .env.example
│   │   ├── package.json
│   │   ├── next.config.js
│   │   ├── tsconfig.json
│   │   └── vercel.json
│   │
│   ├── 2-postpartum-fitness/
│   │   ├── src/
│   │   │   ├── pages/
│   │   │   │   ├── api/
│   │   │   │   │   ├── workouts/      [UNIQUE TO THIS APP]
│   │   │   │   │   ├── recovery/
│   │   │   │   │   ├── pelvic-floor/
│   │   │   │   │   └── nutrition/
│   │   │   │   └── [postpartum-specific pages]
│   │   │   ├── components/
│   │   │   │   ├── WorkoutPlayer/    [UNIQUE TO THIS APP]
│   │   │   │   ├── RecoveryPhase/
│   │   │   │   └── BiofeedbackDisplay/
│   │   │   ├── utils/
│   │   │   │   └── recovery-tracker.ts
│   │   ├── public/
│   │   └── [independent app files]
│   │
│   ├── [3-20: Same pattern - completely independent]
│   │
│   └── template/
│       ├── src/           [Starter template for new apps]
│       ├── public/
│       └── package.json
│
├── shared/
│   └── setup-guide.md     [Instructions for setting up each app independently]
│
├── designs/
│   ├── logos/
│   ├── screenshots/
│   └── play-store-assets/
│
├── legal/
│   ├── terms-of-service.md
│   ├── privacy-policy.md
│   └── [customizable templates]
│
└── docs/
    ├── deployment.md
    ├── database-setup.md
    └── google-play-submission.md
```

## Key Principles

### 1. **Complete Independence**
- Each app can be built, deployed, and maintained separately
- Different teams can work on different apps
- Apps can have different tech stacks if needed (though all use Next.js)
- One app failing doesn't affect others

### 2. **Unique Databases**
Each app has its own MongoDB database:
- `mental-health-pro` database with collections: users, sessions, stress_checks, interventions
- `postpartum-fitness` database with collections: users, workouts, recovery_phases, pelvic_floor_data
- Etc. for all 20 apps

### 3. **Unique Business Logic**
Each app implements its specific problem domain:
- **Stress checking algorithm** for mental health app
- **Workout progression system** for fitness app
- **Service provider vetting** for local services app
- **ADHD-specific widgets** for ADHD app

### 4. **Shared Best Practices (Not Code)**
Pattern across all apps:
- NextAuth.js for auth (configured per-app)
- Stripe for payments (different product IDs per app)
- MongoDB (different databases per app)
- Google AdMob ads (different ad units per app)
- Similar UI patterns (but not shared components - each app owns its styling)

## Database Schema per App

### Example: Mental Health Pro

```typescript
// users collection
{
  _id: ObjectId,
  email: string,
  password: hashed,
  name: string,
  subscription: { tier: 'free' | 'premium', endsAt: Date },
  createdAt: Date,
}

// sessions collection
{
  _id: ObjectId,
  userId: ObjectId,
  type: 'breathing' | 'mindfulness' | 'tactical',
  duration: number,
  stressLevelBefore: number,
  stressLevelAfter: number,
  createdAt: Date,
}

// stress_checks collection
{
  _id: ObjectId,
  userId: ObjectId,
  level: number,
  triggers: string[],
  timestamp: Date,
}

// gamification collection
{
  _id: ObjectId,
  userId: ObjectId,
  points: number,
  badges: string[],
  level: number,
  streak: number,
  updatedAt: Date,
}
```

### Example: Postpartum Fitness

```typescript
// users collection
{
  _id: ObjectId,
  email: string,
  name: string,
  subscription: { tier: 'free' | 'premium', endsAt: Date },
  pregnancyInfo: {
    dueDate: Date,
    deliveryDate: Date,
    deliveryType: 'vaginal' | 'c-section',
  },
  createdAt: Date,
}

// workouts collection
{
  _id: ObjectId,
  userId: ObjectId,
  week: number,
  day: number,
  type: 'pelvic-floor' | 'strength' | 'cardio',
  videoUrl: string,
  duration: number,
  completed: boolean,
  completedAt: Date,
}

// recovery_tracking collection
{
  _id: ObjectId,
  userId: ObjectId,
  week: number,
  symptoms: string[],
  painLevel: number,
  mobility: number,
  timestamp: Date,
}
```

## Deployment Strategy

### Option 1: Separate Vercel Projects (Recommended)
Each app deployed to own Vercel project:
- `mental-health-pro.vercel.app`
- `postpartum-fitness.vercel.app`
- Etc.

```bash
cd apps/1-mental-health-pro
vercel --prod
```

### Option 2: Subdomains on Single Domain
All under your domain:
- `mhp.yourcompany.com`
- `ppf.yourcompany.com`
- Etc.

### Option 3: Native Mobile Apps
Convert to React Native + Expo for true Google Play Store:
Each app is separate native app downloaded from Play Store

## Development Workflow

### To create a new app:

1. Copy template:
```bash
cp -r apps/template apps/N-app-name
```

2. Set up environment:
```bash
cd apps/N-app-name
npm install
cp .env.example .env.local
```

3. Create MongoDB database:
- Atlas: Create new cluster (or new database in existing cluster)
- Set `DATABASE_URL` in `.env.local`

4. Create Stripe products:
- Go to Stripe dashboard
- Create "Free" and "Premium" products
- Set price IDs in `.env.local`

5. Configure NextAuth.js:
- Generate `NEXTAUTH_SECRET`
- Set up Google OAuth app
- Configure email provider (Resend)

6. Develop unique features:
- Create app-specific API routes in `pages/api/`
- Create app-specific components
- Implement niche-specific business logic

7. Test locally:
```bash
npm run dev
# Visit http://localhost:3000
```

8. Deploy:
```bash
vercel --prod
```

## Cost Breakdown per App

- **Hosting** (Vercel): $0-20/month
- **Database** (MongoDB Atlas): $0-50/month (free tier available)
- **Email** (Resend): $0-20/month (free tier: 100/day)
- **Payments** (Stripe): 2.9% + $0.30 per transaction
- **Ads** (Google AdMob): No upfront cost (revenue share)
- **Domain**: $0-12/year

**Total per app**: $0-100/month (or free with generous free tiers)

## Scaling Strategy

### Year 1: Launch
- Build 4 complete apps (1-4)
- Deploy to Vercel
- Get Google Play Store approval

### Months 6-12: Growth
- Launch remaining 16 apps (5-20)
- Cross-promote between apps
- Build marketing/landing pages

### Year 2: Optimization
- Optimize retention & conversion
- Improve monetization (ads, premium tiers)
- Add enterprise/B2B features to suitable apps

### Year 3+: Ecosystem
- Platform play: Users can use multiple apps with single account
- API integrations between apps
- Advanced analytics across app portfolio
