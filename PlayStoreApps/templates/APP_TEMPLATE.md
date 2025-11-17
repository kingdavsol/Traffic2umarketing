# App Template - Rapid Deployment Guide

This template allows you to create a fully-functional app in 2-3 hours instead of 2-3 days.

## Structure

Every app has:
```
apps/[number]-[app-slug]/
├── src/
│   ├── pages/
│   │   ├── index.tsx          (Landing page)
│   │   ├── dashboard.tsx      (Main app interface)
│   │   ├── auth/              (Login, signup, reset)
│   │   ├── api/               (Backend routes)
│   │   └── [app-specific]/    (Custom pages)
│   ├── components/
│   │   └── [app-specific]/    (Custom components)
│   └── styles/
│       └── globals.css        (Tailwind + custom styles)
├── public/
│   ├── logo.svg
│   ├── icon-192.png
│   └── og-image.png
├── .env.example
├── next.config.js
├── tailwind.config.js
└── package.json
```

## Quick Start (Copy-Paste Approach)

### 1. Copy Template
```bash
cp -r templates/base-app apps/[number]-[app-slug]
cd apps/[number]-[app-slug]
npm install
```

### 2. Customize Config
Edit `.env.local`:
```
NEXT_PUBLIC_APP_ID=[app-slug]
NEXT_PUBLIC_APP_NAME=[App Display Name]
NEXTAUTH_SECRET=[generate with: openssl rand -base64 32]
NEXTAUTH_URL=http://localhost:3000
DATABASE_URL=mongodb+srv://...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLIC_KEY=pk_test_...
RESEND_API_KEY=...
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
```

### 3. Customize App Content
Files to update:
- `src/pages/index.tsx` - Landing page copy (marketing pitch)
- `src/pages/dashboard.tsx` - Main interface (unique features)
- `src/components/[AppName]/` - Custom components
- `public/` - Logo, icons, screenshots

### 4. Deploy
```bash
npm run build
npm run start
# Or deploy to Vercel: vercel --prod
```

## File Templates

### Landing Page Template (`pages/index.tsx`)

Replace these sections:
- `[APP_NAME]` - App display name
- `[TAGLINE]` - One-liner pitch
- `[DESCRIPTION]` - 1-2 sentence problem statement
- `[FEATURES]` - 6 core features (use the template provided)
- `[PRICING]` - Free/Premium tiers
- `[CTA]` - Call to action

### Dashboard Template (`pages/dashboard.tsx`)

Key sections:
1. **Header** - User name + points/level
2. **KPI Cards** - 3-4 key metrics
3. **Chart/Visualization** - Main data display
4. **Action Cards** - Primary user actions (3-4 cards)
5. **Secondary Features** - Recent activity, tips, etc.
6. **Ad Placements** - Top banner, rewarded button, bottom banner

### API Routes (`pages/api/`)

Pre-built endpoints:
- `/auth/register` - User signup
- `/auth/login` - Email login
- `/auth/logout` - Sign out
- `/user/profile` - Get current user
- `/user/update` - Update profile
- `/user/delete` - Delete account
- `/subscriptions/create` - Stripe subscription
- `/subscriptions/cancel` - Cancel subscription
- `/subscriptions/usage` - Track usage
- `/gamification/award-points` - Add points
- `/gamification/unlockBadge` - Award badge
- `/sessions/start` - Begin user session
- `/sessions/log` - Log completed action

## Common Customizations

### Change Color Scheme
Edit `tailwind.config.js`:
```js
colors: {
  primary: '#your-primary-color',
  secondary: '#your-secondary-color',
}
```

### Add App-Specific Feature
1. Create component in `src/components/[AppName]/`
2. Import in dashboard/pages
3. Add corresponding API route in `src/pages/api/`

### Database Schema
Add new model in `shared/database/models/`:
```ts
const schema = new mongoose.Schema({
  userId: ObjectId,
  data: String,
  createdAt: Date,
});
```

### Premium Feature Gating
Wrap component in:
```tsx
{user?.isPremium ? (
  <PremiumFeature />
) : (
  <FreeTierMessage />
)}
```

## Premium Feature Examples

Each app should have 3-5 premium features:

1. **Analytics/Insights**
   - Detailed reports, trends, predictions
   - Export data (PDF, CSV)
   - Custom date ranges

2. **Advanced Features**
   - API integrations (Calendar, Slack, etc.)
   - Bulk actions
   - Custom automation

3. **Support**
   - Priority support
   - Personal onboarding call
   - Weekly check-ins

4. **Cosmetics**
   - No ads
   - Custom branding
   - Dark mode (even on free tier in this template)

5. **Community**
   - Private communities
   - Access to expert content
   - Group features

## Gamification System (Pre-Built)

All apps include:
- **Points**: 10 pts per action (session, completion, referral)
- **Badges**: Unlock at milestones (10 sessions, 7-day streak, etc.)
- **Levels**: Level up every 100 points
- **Streaks**: Consecutive days of engagement
- **Leaderboards**: User rankings (optional, opt-in)

Track with: `/api/gamification/*`

## Ad Integration (Pre-Built)

All free-tier apps show:
- **Banner ads** (top + bottom)
- **Interstitial ads** (after major actions)
- **Rewarded ads** (earn premium currency)
- **Native ads** (content-matched)

Configure in: `shared/config/ad-config.ts`

## Submission Checklist

Before submitting to Google Play:

- [ ] Privacy Policy (at `/privacy`)
- [ ] Terms of Service (at `/terms`)
- [ ] Privacy Policy URL
- [ ] Support email configured
- [ ] Proper error handling
- [ ] Loading states on all buttons
- [ ] Mobile responsive (test on 320px width)
- [ ] App icons (192x192, 512x512)
- [ ] Promotional banner (1024x500)
- [ ] 5 screenshots (1080x1920)
- [ ] App description written
- [ ] Content rating submitted
- [ ] All links work (no 404s)
- [ ] Auth flows tested (signup, login, reset)
- [ ] Payment flows tested (free + premium)
- [ ] Ads displaying properly
- [ ] No sensitive data in client code

## Deployment

### Vercel (Recommended for Next.js)
```bash
npm i -g vercel
vercel --prod
```

### Self-Hosted (Railway/Render)
1. Set all env vars
2. `npm run build`
3. `npm start`

### Google Play Store
1. Create release APK/AAB (using Expo or React Native)
2. Upload to Play Console
3. Fill app store listing
4. Submit for review (2-24 hours)

## Performance Checklist

- [ ] Lighthouse score 90+
- [ ] Time to Interactive < 2s
- [ ] Largest Contentful Paint < 2.5s
- [ ] Core Web Vitals passing
- [ ] Mobile usability 100%

Test with:
```bash
npm install -g lighthouse
lighthouse https://your-app.com
```

## Troubleshooting

### Database connection fails
- Check `DATABASE_URL` in `.env.local`
- Ensure MongoDB cluster is accessible
- Add your IP to MongoDB whitelist

### Auth not working
- Verify `NEXTAUTH_SECRET` is set
- Check `NEXTAUTH_URL` matches your domain
- Ensure Google OAuth credentials are correct

### Stripe payment fails
- Use test keys for development
- Check Stripe keys are correct
- Ensure webhook endpoint is configured

### Ads not displaying
- Verify AdMob account is set up
- Check ad unit IDs in `ad-config.ts`
- Ensure user tier is 'free' (not 'premium')

## Metrics to Track

- **DAU** (Daily Active Users)
- **Retention** (D1, D7, D30)
- **Premium conversion** (% of free → premium)
- **ARPU** (Average Revenue Per User)
- **RPM** (Revenue Per Mille, per 1000 impressions)
- **CAC** (Customer Acquisition Cost)
- **LTV** (Lifetime Value)

## Time Estimates

- **Setup**: 15 min
- **Customize landing page**: 30 min
- **Customize dashboard/features**: 1-2 hours
- **Custom components**: 30 min - 2 hours
- **Testing**: 30 min
- **Deploy**: 10 min
- **Google Play submission**: 1-2 days (review time)

**Total: 2-5 hours development time per app**
