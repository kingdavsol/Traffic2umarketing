# Systematic Screen Check - QuickSell Application
**Date**: January 17, 2026
**Purpose**: Verify ALL screens and features are working

---

## How to Test

### Clear Browser Cache FIRST
1. Open https://quicksell.monster in **Incognito/Private mode** OR
2. Hard refresh: `Ctrl+Shift+R` (Windows) / `Cmd+Shift+R` (Mac)  OR
3. Clear cache: Settings → Privacy → Clear browsing data → Cached images and files

---

## Screen by Screen Checklist

### 1. Landing Page (/)
**URL**: https://quicksell.monster
**Not Logged In**:
- [ ] Header with logo visible
- [ ] "Get Started" or "Sign Up" button visible
- [ ] Features section visible
- [ ] Pricing information visible
- [ ] Footer visible

---

### 2. Login Page (/login)
**URL**: https://quicksell.monster/login
**Check**:
- [ ] Email input field
- [ ] Password input field
- [ ] "Login" button
- [ ] "Sign Up" link
- [ ] Google OAuth button (if implemented)
- [ ] Test login works

---

### 3. Register Page (/register)
**URL**: https://quicksell.monster/register
**Check**:
- [ ] Username input
- [ ] Email input
- [ ] Password input
- [ ] Referral code input (optional)
- [ ] "Register" button
- [ ] "Login" link
- [ ] Test registration works

---

### 4. Dashboard (/dashboard)
**URL**: https://quicksell.monster/dashboard
**Must Be Logged In**:
- [ ] Welcome message with username
- [ ] Quick stats (total listings, sales, views, etc.)
- [ ] Recent listings
- [ ] Quick action buttons
- [ ] Navigation menu working

---

### 5. Create Listing (/create-listing)
**URL**: https://quicksell.monster/create-listing
**Must Be Logged In**:

**Photo Upload**:
- [ ] Camera button visible
- [ ] File upload button visible
- [ ] Take photo works (mobile)
- [ ] Upload photo works
- [ ] **CRITICAL**: After photo upload, "🤖 AI Analyzing" message appears at TOP of screen
- [ ] **CRITICAL**: AI Analyzing message is FIXED at top, visible even when scrolling down
- [ ] AI fills in title, description, category, price

**Form Fields**:
- [ ] Title field populated by AI
- [ ] Description field populated by AI
- [ ] Category dropdown populated by AI
- [ ] Price field populated by AI
- [ ] Condition dropdown
- [ ] Brand, model, color, size fields

**Marketplace Selector**:
- [ ] **TikTok Shop** listed FIRST
- [ ] **Instagram Shopping** listed SECOND
- [ ] eBay, Facebook, Craigslist, OfferUp, Poshmark, Mercari, Nextdoor, Etsy all listed
- [ ] **CRITICAL**: Click on **marketplace NAME** → Opens marketplace site in new tab
- [ ] **CRITICAL**: Click on **marketplace ICON** → Opens marketplace site in new tab
- [ ] Arrow icon (↗) visible next to marketplace names
- [ ] Hover over marketplace name → Underline appears
- [ ] Checkboxes work to select marketplaces

**Create/Publish**:
- [ ] "Create Listing" button visible
- [ ] Click Create Listing → Shows "Listing Saved!" message
- [ ] **CRITICAL**: "Listing Saved!" message appears at TOP in fixed position
- [ ] **CRITICAL**: Publishing status shows: "📤 Publishing to [marketplace names]..."
- [ ] **CRITICAL**: Success/error messages show marketplace-specific results
- [ ] Success messages stay for 6 seconds
- [ ] Error messages stay for 10 seconds

---

### 6. My Listings (/my-listings)
**URL**: https://quicksell.monster/my-listings
**Check**:
- [ ] List of user's listings displayed
- [ ] Listing cards show photo, title, price
- [ ] Marketplace badges visible (where posted)
- [ ] Edit button on each listing
- [ ] Delete button on each listing
- [ ] Filter options work
- [ ] Pagination works (if many listings)

---

### 7. Sales (/sales)
**URL**: https://quicksell.monster/sales
**Check**:
- [ ] Sales summary/stats visible
- [ ] Total revenue displayed
- [ ] List of completed sales
- [ ] Sale details (item, price, date, marketplace)
- [ ] Charts/graphs (if implemented)

---

### 8. Gamification (/gamification)
**URL**: https://quicksell.monster/gamification
**Check**:
- [ ] Points/credits balance displayed
- [ ] Achievements/badges section
- [ ] Leaderboard (if applicable)
- [ ] Rewards catalog
- [ ] Progress bars/levels

---

### 9. Referrals (/referrals)
**URL**: https://quicksell.monster/referrals
**Check**:
- [ ] Personal referral code displayed
- [ ] Referral link (can copy)
- [ ] Number of referrals shown
- [ ] Credits earned from referrals
- [ ] List of referred users
- [ ] Credit transaction history

---

### 10. Settings (/settings)
**URL**: https://quicksell.monster/settings
**Must Be Logged In**:

#### Tab 1: Profile
- [ ] **CRITICAL**: NOT "coming soon" placeholder
- [ ] Profile photo/avatar section
- [ ] Upload photo button
- [ ] Name field (editable)
- [ ] Email field (editable)
- [ ] Phone field (editable)
- [ ] Bio field (editable)
- [ ] "Save Changes" button
- [ ] Password change section
- [ ] Current password field
- [ ] New password field
- [ ] Confirm password field
- [ ] "Change Password" button
- [ ] Account deletion section (danger zone)
- [ ] "Delete Account" button (red)

#### Tab 2: Marketplaces
- [ ] **CRITICAL**: All 10 marketplaces listed:
  1. **TikTok Shop** (FIRST)
  2. **Instagram Shopping** (SECOND)
  3. eBay
  4. Facebook Marketplace
  5. Craigslist
  6. OfferUp
  7. Poshmark
  8. Mercari
  9. Nextdoor
  10. Etsy
- [ ] **CRITICAL**: Click marketplace NAME → Opens marketplace site
- [ ] **CRITICAL**: Click marketplace ICON → Opens marketplace site
- [ ] Arrow icon (↗) visible next to marketplace names
- [ ] Hover over name → Underline appears
- [ ] "Connect" button for unconnected marketplaces
- [ ] "Disconnect" button for connected marketplaces
- [ ] Connection status chips (Connected/Not Connected)
- [ ] Auto-publish vs Manual badges

#### Tab 3: Notifications
- [ ] **CRITICAL**: NOT "coming soon" placeholder
- [ ] Email notifications section
- [ ] Toggles for: New Sale, New Message, Price Drop, Marketplace Updates, System Updates, Weekly Report
- [ ] Push notifications section
- [ ] Toggles for: New Sale, New Message, Price Drop
- [ ] SMS notifications section
- [ ] Toggles for: New Sale, Critical Alerts
- [ ] Quiet Hours section
- [ ] Enable Quiet Hours toggle
- [ ] Start time dropdown
- [ ] End time dropdown
- [ ] "Save Preferences" button
- [ ] "Send Test Notification" button

#### Tab 4: Billing
- [ ] **CRITICAL**: NOT "coming soon" placeholder
- [ ] Current subscription section
- [ ] Plan name displayed (Free/Pro/Business)
- [ ] Status chip (Active/Cancelled)
- [ ] Next billing date (if paid)
- [ ] Amount (if paid)
- [ ] "Cancel Subscription" button (if paid)
- [ ] Available plans section
- [ ] 3 plan cards: Free, Pro, Business
- [ ] Feature lists for each plan
- [ ] "Upgrade"/"Downgrade" buttons
- [ ] Payment methods section
- [ ] "Add Payment Method" button
- [ ] List of saved cards (if any)
- [ ] Billing history section
- [ ] Table with: Date, Amount, Status
- [ ] "Download" button for each invoice

#### Tab 5: Security
- [ ] **CRITICAL**: NOT "coming soon" placeholder
- [ ] Two-Factor Authentication section
- [ ] 2FA enable/disable toggle
- [ ] "Protected" chip when enabled
- [ ] Active sessions section
- [ ] "Logout All Other Sessions" button
- [ ] Table showing: Device, Location, Last Active
- [ ] "Logout" button for each session (except current)
- [ ] "Current" chip for current session
- [ ] Login history section
- [ ] Table showing: Date/Time, Device, Location, Status
- [ ] Success/Failed chips
- [ ] Privacy & Data section
- [ ] "Export My Data" button

---

### 11. Case Studies (/case-studies)
**URL**: https://quicksell.monster/case-studies
**Check**:
- [ ] List of case studies
- [ ] Study cards with images
- [ ] Click to read full study

---

### 12. Blog (/blog)
**URL**: https://quicksell.monster/blog
**Check**:
- [ ] List of blog posts
- [ ] Post cards with titles, dates
- [ ] Click to read full post
- [ ] Working navigation

---

### 13. Pricing (/pricing)
**URL**: https://quicksell.monster/pricing
**Check**:
- [ ] Pricing table visible
- [ ] Free, Pro, Business plans
- [ ] Feature comparison
- [ ] "Get Started" buttons
- [ ] FAQs section

---

### 14. Admin Dashboard (/admin)
**URL**: https://quicksell.monster/admin
**Must Be Admin**:
- [ ] User management section
- [ ] Listing management
- [ ] Analytics/reports
- [ ] System settings

---

## Critical Features to Test

### A. Floating Snackbars (Status Messages)
**Location**: Create Listing page
**Test**:
1. Upload a photo
2. Scroll down the page
3. **VERIFY**: "🤖 AI Analyzing" message stays at TOP of viewport (doesn't disappear)
4. Save listing
5. **VERIFY**: "Listing Saved!" message appears at TOP (doesn't require scrolling)
6. Select marketplaces and publish
7. **VERIFY**: "📤 Publishing to..." message at TOP
8. **VERIFY**: Success/error messages at TOP showing which marketplaces succeeded/failed

### B. Clickable Marketplace Links
**Location 1**: Create Listing page → Marketplace selector
**Location 2**: Settings → Marketplaces tab

**Test Each Marketplace**:
1. TikTok Shop → https://seller-us.tiktok.com
2. Instagram Shopping → https://www.instagram.com
3. eBay → https://www.ebay.com/sh/lst/active
4. Facebook → https://www.facebook.com/marketplace/create/item
5. Craigslist → https://accounts.craigslist.org/login
6. OfferUp → https://offerup.com/sell/
7. Poshmark → https://poshmark.com/create-listing
8. Mercari → https://www.mercari.com/sell/
9. Nextdoor → https://nextdoor.com/sell/
10. Etsy → https://www.etsy.com/your/shops/me/tools/listings

**For Each Marketplace**:
- [ ] Click on NAME → Opens correct URL in new tab
- [ ] Click on ICON → Opens correct URL in new tab
- [ ] Arrow icon (↗) visible
- [ ] Hover shows underline

### C. Settings Pages (NOT "Coming Soon")
**Test**: Go to Settings and click each tab:
1. **Profile** → Must show FORM, not "coming soon"
2. **Notifications** → Must show TOGGLES, not "coming soon"
3. **Billing** → Must show SUBSCRIPTION INFO, not "coming soon"
4. **Security** → Must show 2FA/SESSIONS, not "coming soon"

---

## Expected Bundle Information

**Current Bundle**: `main.96bbe5fa.js` (319.6 KB gzipped)
**Previous Bundle**: `main.72b71f6b.js` (312.96 KB gzipped)

If you see the old bundle hash (72b71f6b), your browser is cached.

**How to check**:
1. Open Dev Tools (F12)
2. Go to Network tab
3. Refresh page
4. Look for `main.*.js` file
5. Verify hash is `96bbe5fa` (latest) not `72b71f6b` (old)

---

## Common Issues

### Issue 1: "Coming Soon" Placeholders Still Showing
**Symptom**: Settings tabs show "coming soon" text
**Cause**: Browser cache
**Fix**: Hard refresh or use Incognito mode

### Issue 2: Marketplace Links Not Clickable
**Symptom**: Can't click marketplace names/icons
**Cause**: Old bundle cached
**Fix**: Hard refresh or use Incognito mode

### Issue 3: Status Messages Hidden
**Symptom**: Need to scroll to see "AI Analyzing"
**Cause**: Old bundle cached
**Fix**: Hard refresh or use Incognito mode

### Issue 4: Missing Marketplaces
**Symptom**: Don't see TikTok, Instagram, Poshmark, Nextdoor
**Cause**: Old bundle OR on wrong page
**Fix**:
- Check you're on Create Listing page or Settings → Marketplaces
- Hard refresh browser

---

## How to Report Issues

When reporting problems, include:
1. **Which page** you're on (exact URL)
2. **What you see** (screenshot if possible)
3. **What you expected** to see
4. **Browser** and version (Chrome 120, Safari 17, etc.)
5. **Device** (Desktop, iPhone, Android, etc.)
6. **Bundle hash** from Network tab (96bbe5fa vs 72b71f6b)

---

## Summary: What Should Be Different Now

### Before (Old Version):
- ❌ Settings → Profile: "Coming soon" placeholder
- ❌ Settings → Notifications: "Coming soon" placeholder
- ❌ Settings → Billing: "Coming soon" placeholder
- ❌ Settings → Security: "Coming soon" placeholder
- ❌ Only 6 marketplaces (missing TikTok, Instagram, Poshmark, Nextdoor)
- ❌ Marketplace names not clickable
- ❌ Status messages get hidden when scrolling

### After (New Version - Bundle 96bbe5fa):
- ✅ Settings → Profile: Full form with photo upload, password change, account deletion
- ✅ Settings → Notifications: Complete preferences with email/push/SMS toggles
- ✅ Settings → Billing: Subscription management, payment methods, invoices
- ✅ Settings → Security: 2FA, active sessions, login history, data export
- ✅ All 10 marketplaces present (TikTok #1, Instagram #2)
- ✅ Marketplace names AND icons clickable (opens marketplace site)
- ✅ Status messages FIXED at top (always visible, no scrolling needed)

---

**End of Checklist**
