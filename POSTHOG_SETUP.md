# PostHog Analytics Setup Guide

## Quick Setup (5 minutes)

### Step 1: Create PostHog Account
1. Go to https://app.posthog.com/signup
2. Sign up for a free account (no credit card required)
3. Create a new project named "QuickSell"

### Step 2: Get Your API Keys
1. In PostHog dashboard, go to **Project Settings** → **Project API Key**
2. Copy your **Project API Key** (starts with `phc_`)
3. You'll need this same key for both frontend and backend

### Step 3: Add to Environment Variables

**On VPS, run these commands:**

```bash
# Navigate to QuickSell directory
cd /var/www/quicksell.monster

# Add PostHog keys to backend .env
echo "" >> backend/.env
echo "# PostHog Analytics" >> backend/.env
echo "POSTHOG_API_KEY=phc_YOUR_KEY_HERE" >> backend/.env
echo "POSTHOG_HOST=https://app.posthog.com" >> backend/.env

# Add PostHog keys to frontend .env (create if doesn't exist)
cat > frontend/.env << 'EOF'
REACT_APP_API_URL=/api/v1
REACT_APP_POSTHOG_KEY=phc_YOUR_KEY_HERE
REACT_APP_POSTHOG_HOST=https://app.posthog.com
EOF

# Replace "phc_YOUR_KEY_HERE" with your actual key
nano backend/.env  # Edit and replace the key
nano frontend/.env  # Edit and replace the key

# Rebuild and restart
cd frontend && npm run build
cd ..
docker compose restart backend
systemctl reload nginx
```

### Step 4: Verify Tracking Works

After deployment, PostHog will automatically track:
- **Page views** (automatic)
- **User registrations** (tracked in authController)
- **User logins** (tracked in authController)
- **Photo analysis** (tracked in photoController)
- **User identification** (automatic on login)

Check your PostHog dashboard within 5 minutes to see events flowing in.

## What Gets Tracked

### Backend Events (Server-Side)
- `user_registered` - When new users sign up
  - Properties: email, username, signup_method
- `user_logged_in` - When users log in
  - Properties: email, login_method
- `photo_analyzed` - When AI analyzes product photos
  - Properties: success, analysis_time_ms, error

### Frontend Events (Client-Side)
- `$pageview` - All page navigations
- `$autocapture` - Button clicks, form submissions
- `$identify` - User identification with properties

### User Properties
- `email`
- `username`
- `$initial_referrer`
- `$initial_utm_source`

## Funnel Analysis Setup

Once tracking is live, create these funnels in PostHog:

### 1. Registration Funnel
1. Visit landing page
2. Click "Get Started"
3. Complete registration
4. Create first listing

### 2. Photo Analysis Funnel
1. Upload photo
2. AI analysis completes
3. Edit listing
4. Publish to marketplace

### 3. Referral Funnel
1. View referral page
2. Copy referral link
3. Referral signs up
4. Credits awarded

## Dashboard Widgets

Recommended PostHog dashboards:

1. **User Acquisition**
   - Daily signups
   - Signup sources
   - Referral conversions

2. **Product Usage**
   - Photos analyzed per day
   - Listings created
   - Active users (DAU/MAU)

3. **Revenue Metrics**
   - Credit purchases
   - Average credits per user
   - Lifetime value

## Self-Hosted Option (Advanced)

If you want to self-host PostHog:

```bash
cd /var/www
git clone https://github.com/PostHog/posthog.git
cd posthog
docker-compose up -d
```

Then use `http://your-server-ip:8000` as POSTHOG_HOST.

## Support

PostHog docs: https://posthog.com/docs
Questions: support@posthog.com
