# Google Play Store Submission Guide

Complete guide to submitting all 20 apps to Google Play Store.

## Prerequisites

### 1. Google Play Developer Account
- Cost: $25 one-time
- Same account can publish 20+ apps
- Go to: https://play.google.com/console

### 2. Signed APK/AAB File
Android App Bundle (AAB) is required:
```bash
cd apps/[app-name]
npm run build
# If using Expo:
eas build --platform android --non-interactive
# If using React Native CLI:
./gradlew bundleRelease
```

### 3. Required Documents
- ✅ Privacy Policy (live URL)
- ✅ Terms of Service (live URL)
- ✅ Support email
- ✅ App description & promotional text
- ✅ App icon (512x512)
- ✅ Screenshots (5 minimum)

## Step-by-Step Submission Process

### Step 1: Create App on Play Console

1. Go to https://play.google.com/console
2. Click "Create app"
3. Enter app name (must match app internally)
4. Select category ([see below for each app](#app-categories))
5. Complete app declaration
6. Agree to Developer Agreement

### Step 2: Fill Out App Information

#### 2.1 App Name & Icon
- **App name**: [APP_NAME] (unique on Play Store)
- **Short description**: Max 80 characters (appears in search)
- **Full description**: 4,000 characters explaining features
- **Icon**: 512x512 PNG (no rounded corners, no transparency)

#### 2.2 Category & Content Rating
**Categories** (see below for each app):
- Books & Reference
- Business
- Communication
- Education
- Entertainment
- Health & Fitness
- Lifestyle
- Medical
- Personalization
- Productivity
- Shopping
- Social
- Sports
- Tools
- Utilities

**Content Rating**:
1. Fill out questionnaire at: Play Console > Your app > App content > Content rating
2. Answer questions about content type
3. Receives IARC rating (Everyone, 3+, 7+, 12+, 16+, 18+)
4. Rating appears on Play Store

### Step 3: Upload Graphics

#### 3.1 App Icon
- **Size**: 512x512 pixels
- **Format**: PNG
- **Requirements**: No rounded corners, full square
- **Transparency**: White background required

#### 3.2 Promotional Banner (Optional but Recommended)
- **Size**: 1024x500 pixels
- **Format**: PNG or JPG
- **Purpose**: Featured on store page

#### 3.3 Screenshots (Required)
- **Minimum**: 2 (3-5 recommended)
- **Size**: 1440x2560 pixels (or 1080x1920)
- **Format**: PNG or JPG
- **Tip**: Show key features, not just logo

**Best practices for screenshots**:
1. First screenshot: Main value proposition
2. Second-third: Key features
3. Fourth-fifth: Benefits/testimonials
4. Add text overlays explaining features
5. Use bright colors, clear text

#### 3.4 Feature Graphic (Recommended)
- **Size**: 1024x500 pixels
- **Purpose**: Promotional material

### Step 4: Create Store Listing

#### 4.1 Short Description (Max 80 characters)
Examples for each app:

**Mental Health Pro**: "Workplace stress management with AI-powered interventions"

**Postpartum Fitness**: "Science-backed recovery workouts for new mothers"

**Local Services**: "Find vetted, skilled professionals in your area"

**ADHD Management**: "ADHD-specific tools for focus, productivity, and mental health"

#### 4.2 Full Description (4,000 characters)
Template:

```
[APP_NAME] helps you [MAIN BENEFIT].

KEY FEATURES:
✓ [Feature 1]
✓ [Feature 2]
✓ [Feature 3]
✓ [Feature 4]
✓ [Feature 5]

FREE VS PREMIUM:
Free: [What's included in free tier]
Premium: [What's premium only]

[APP_NAME] is trusted by [NUMBER] users and has a [RATING] rating.

We take your privacy seriously. Your data is encrypted and never shared with third parties.

Questions? Email support@[yourdomain].com
```

#### 4.3 Release Notes
For version 1.0:
"Initial release of [APP_NAME]. Includes core features and gamification system."

### Step 5: Configure In-App Products (Subscriptions)

1. Go to: Play Console > Your app > Products > Subscriptions
2. Create "Free Plan" (no charge, for tracking)
3. Create "Premium Plan":
   - Billing period: Monthly
   - Price: $9.99/month (adjust per app)
   - Free trial: 7 days (optional)
4. Save and test with test account

### Step 6: Configure Content Rating

1. Play Console > Your app > App content > Content rating
2. Complete questionnaire (10-15 minutes)
3. Questions cover:
   - Violence
   - Sexual content
   - Profanity
   - Gambling
   - Alcohol/tobacco
   - Health & privacy
   - Ads
4. Submit for IARC rating

### Step 7: Set Up Privacy Policy & Terms

1. **Privacy Policy URL**: Must be live, accessible
   - Host at: `https://yourdomain.com/privacy` or similar
   - Update legally required info (see legal templates)
   - Test link works from Play Store

2. **Developer Contact**: Support email
   - Play Console > App content > Audience > Contact info
   - Email monitored by your team
   - Will receive user reports & compliance issues

3. **Terms of Service** (optional but recommended)
   - Link in app footer or settings
   - Update with app-specific legal language

### Step 8: Upload APK/AAB

1. Play Console > Your app > Releases > Create new release
2. Click "Browse files" under "Android App Bundle"
3. Select your `.aab` file
4. Review changes & confirm
5. Add release notes

### Step 9: Review & Test

Before submitting:
- [ ] All permissions are necessary
- [ ] Ads display correctly (test on device)
- [ ] Auth flows work (signup, login, reset password)
- [ ] Payment flows test (use Stripe test keys)
- [ ] All links work
- [ ] No bugs or crashes
- [ ] Performance acceptable (30+ FPS)
- [ ] Privacy policy accurate
- [ ] Contact email monitored

### Step 10: Submit for Review

1. Play Console > Your app > Setup > Your app > App access
2. Review "Permission & declaration" section
3. Declare if app is:
   - Targeting children (under 13)
   - Using restricted content
   - Requires special permissions
4. Click "Submit app"

### Step 11: Monitor Review Status

Review typically takes **2-24 hours** (occasionally longer):

1. **In review**: Your app is being checked
   - Don't make changes during review
   - Takes 2-4 hours on average

2. **Rejected**: Issues to fix
   - Play Console will specify violations
   - Common rejections:
     - Broken functionality
     - Excessive ads
     - Privacy policy missing/outdated
     - Deceptive content
     - Intellectual property violations
   - Fix issues and resubmit

3. **Published**: App is live!
   - Appears on Play Store within 1-2 hours
   - Usually ranks low (improve with ASO)

## Play Store Optimization (ASO)

To improve visibility:

### 1. Keyword Research
- Identify 10-15 target keywords
- Include in app name, short description, full description
- Check search volume with ASO tools

Example keywords for Mental Health Pro:
- "workplace stress"
- "stress relief app"
- "anxiety management"
- "professional mental health"
- "workplace wellness"

### 2. Rating Optimization
- Encourage 5-star reviews from happy users
- Respond to negative reviews professionally
- Fix issues mentioned in reviews
- Ratings significantly impact ranking

### 3. Update Regularly
- Release updates quarterly
- Add new features based on user feedback
- Mention updates in release notes

### 4. App Store Presence
- Professional screenshots
- Compelling description
- High-quality icon
- Engaged community

## Common Rejection Reasons & Fixes

| Rejection | Fix |
|-----------|-----|
| App crashes | Test thoroughly, fix bugs |
| Broken auth | Verify email service (Resend) is working |
| Payment doesn't work | Check Stripe test keys in test account |
| Privacy policy missing | Add live privacy policy URL |
| Excessive ads | Limit ads, don't show >3 ads per session |
| Deceptive content | Ensure description matches functionality |
| Intellectual property | Ensure all assets are original or licensed |
| Malware detected | Ensure no malicious code, rescan |

## Devices for Testing

Test on devices with these specs:
- Android 8.0+ (minimum requirement)
- Screen sizes: 4.5", 5.5", 6", 7"
- RAM: 2GB, 4GB, 8GB
- Storage: 500MB available

Use Android emulator or cloud testing services.

## Launch Timeline

```
Week 1:
- Day 1-2: Setup app listings (graphics, descriptions)
- Day 3-4: Configure in-app products & content rating
- Day 5: Test thoroughly

Week 2:
- Day 1: Submit for review
- Day 2-3: Monitor & respond to rejections (if any)
- Day 3-4: App published!

Week 3:
- Monitor performance
- Respond to user reviews
- Gather feedback for v1.1
```

## Post-Launch Monitoring

After your app is live:

### Daily
- Check Play Store reviews (respond to comments)
- Monitor crash reports (Sentry)
- Check ad performance

### Weekly
- Analyze user engagement metrics
- Review support emails
- Plan next update

### Monthly
- Update featured graphics (seasonal)
- Release minor bug fixes
- Plan new features

## Financial Setup

### 1. Stripe Connect (Payments)
- Go to: https://stripe.com
- Create account
- Link to your app's backend
- Test with test keys first

### 2. AdMob Account (Ads)
- Go to: https://admob.google.com
- Create account
- Set up ad units
- Generate ad unit IDs

### 3. Google Play Payment Profile
- Play Console > Setup > Payment methods
- Add payment method (bank account)
- Receive revenue monthly

**Revenue Split**:
- Google: 30%
- You: 70% (from all sources)

## Each App's Category & Keywords

### 1. Mental Health Pro
- **Category**: Health & Fitness / Medical
- **Keywords**: stress relief, anxiety, workplace wellness, meditation
- **Content Rating**: 12+
- **Restrictions**: None

### 2. Postpartum Fitness
- **Category**: Health & Fitness / Medical
- **Keywords**: postpartum, pregnancy recovery, new mom, fitness
- **Content Rating**: 3+
- **Restrictions**: Target women specifically

### 3. Local Services
- **Category**: Business / Shopping
- **Keywords**: handyman, plumber, local services, contractor
- **Content Rating**: 3+
- **Restrictions**: None

### 4. ADHD Management
- **Category**: Medical / Health & Fitness
- **Keywords**: ADHD, productivity, focus, executive function
- **Content Rating**: 12+
- **Restrictions**: None

### 5-20. [Follow similar pattern based on niche]

## Common Mistakes to Avoid

❌ **Don't**:
- Use fake ratings/reviews
- Copy competitor app descriptions
- Include copyrighted content
- Use excessive ads
- Collect data without permission
- Ignore negative reviews
- Submit broken apps
- Claim unproven health benefits (for health apps)
- Target children without appropriate controls
- Update excessively (wait 2 weeks minimum between updates)

✅ **Do**:
- Test thoroughly before submitting
- Respond professionally to all reviews
- Keep app updated regularly
- Provide excellent customer support
- Use high-quality graphics
- Monitor performance metrics
- Improve based on feedback
- Follow Google Play Policies
- Maintain accurate privacy policies
- Document your features honestly

## Support & Resources

- **Play Console Help**: https://support.google.com/googleplay/android-developer
- **Google Play Policies**: https://play.google.com/about/developer-content-policy/
- **Stripe Documentation**: https://stripe.com/docs
- **AdMob Help**: https://support.google.com/admob

---

**Next Steps**:
1. ✅ Create 20 app listings
2. ✅ Design graphics for each
3. ✅ Configure subscriptions & ads
4. ✅ Submit all apps for review
5. Monitor & optimize post-launch
