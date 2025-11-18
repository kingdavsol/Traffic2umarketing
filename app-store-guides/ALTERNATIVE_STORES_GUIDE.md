# Alternative App Stores Submission Guide

## F-Droid (Open Source Apps Only)

### Requirements
- App must be open source
- Source code on GitHub
- OSI-approved license
- No proprietary libraries
- No ads or tracking

### Submission Process
1. Fork F-Droid Repository
2. Add app metadata:
   ```
   apps/com.company.appname/metadata.yml
   ```
3. Create Pull Request
4. F-Droid team reviews
5. Automatic build on acceptance

### F-Droid Metadata
```yaml
Categories:
  - Office
  - Finance
  - Health

License: GPL-3.0

Name: App Name
Summary: One-line summary
Description: |
  Full description of the app.
  Supports multiple lines.

Changelog:
  - Version: 1.0.0
    Date: 2024-01-01
```

## Aptoide (Android Alternative Store)

### Requirements
- APK file (v8.0+)
- Developer account (free)
- App metadata
- Icons and screenshots
- Privacy policy

### Submission Steps
1. Visit Aptoide Developer Console
2. Create publisher account
3. Upload APK
4. Fill metadata:
   - Icon (512x512px)
   - Banners (1024x500px)
   - Screenshots (min 2)
   - Description (500 chars)
5. Set pricing/permissions
6. Submit for review
7. Review within 24-48 hours

### Aptoide Benefits
- High user base
- Fast review process
- Lower content restrictions
- Good monetization options
- Geographic targeting

## TapTap (Asia-Focused)

### Requirements
- APK or AAB file
- Account with valid email
- App icon (512x512px)
- 3-5 screenshots
- Description (Chinese/English)
- Age rating

### Submission Steps
1. Register on TapTap
2. Navigate to "Developer Services"
3. Submit game/app info:
   - Title
   - Category
   - Description
   - Keywords
4. Upload APK/AAB
5. Submit metadata
6. Wait for review (1-3 days)

### TapTap Markets
- China (very popular)
- Southeast Asia
- Korea
- Hong Kong
- Taiwan

## Amazon App Store

### Requirements
- APK file
- Amazon Developer account ($99)
- Valid US Tax ID
- App icon (512x512px)
- Screenshots
- Description
- Privacy policy

### Submission Steps
1. Enroll in Amazon Appstore
2. Create app entry
3. Upload APK
4. Fill Availability & Pricing
5. Add Description & Images
6. Configure Content Rating
7. Submit for review
8. Typical approval: 24-48 hours

### Amazon Benefits
- Fire tablet users
- Kindle Fire TV apps
- Good monetization
- Lower competition
- Amazon Prime integration

## Samsung Galaxy Store

### Requirements
- APK file
- Samsung Developer account (free)
- App icon (192x192px to 512x512px)
- Screenshots (540x960px minimum)
- Detailed description
- Privacy URL
- Email support

### Submission Steps
1. Go to Samsung Sellers
2. Create seller account
3. Register app
4. Upload APK
5. Fill metadata:
   - Title (100 chars max)
   - Description (4000 chars max)
   - Category
   - Keywords
   - Screenshots (3-10)
6. Content rating
7. Submit for review

### Samsung Benefits
- 300+ million devices
- Galaxy Store exclusive features
- Samsung Internet integration
- Good monetization options

## Huawei App Gallery

### Requirements
- APK file
- Huawei Developer account
- App information
- Screenshots
- Privacy policy
- Support email

### Submission Steps
1. Enroll in Huawei AppGallery
2. Create app entry
3. Upload APK
4. Fill app info:
   - Title
   - Description
   - Category
   - Keywords
   - Screenshots
5. Set pricing
6. Submit for review

## General Submission Checklist

For ALL Stores:
- [ ] APK/AAB properly signed
- [ ] App icon (high quality)
- [ ] Screenshots (consistent style)
- [ ] Description (accurate, engaging)
- [ ] Privacy policy (accessible)
- [ ] Content rating appropriate
- [ ] No broken links
- [ ] Tested thoroughly
- [ ] Version number incremented
- [ ] Release notes prepared

## Store Comparison

| Store | Users | Review Time | Monetization | Content Policy | Special Features |
|-------|-------|-------------|--------------|-----------------|------------------|
| Google Play | 3B+ | 24-48h | All | Strict | Recommended |
| Apple App Store | 1.6B+ | 24-48h | All | Very Strict | Required for iOS |
| Aptoide | 200M+ | 24-48h | All | Moderate | Good for Android |
| TapTap | 500M+ | 1-3d | All | Moderate | Asia-focused |
| Amazon | 200M+ | 24-48h | All | Strict | Fire tablet native |
| Samsung Galaxy | 300M+ | 24-48h | All | Moderate | Device optimized |
| F-Droid | 2M+ | Variable | None (free) | Very Strict | OSS only |

## Multi-Store Strategy

### Priority Tier 1
- Google Play Store (Android must)
- Apple App Store (iOS must)

### Priority Tier 2
- Aptoide (large user base)
- TapTap (growth market)
- Samsung Galaxy (device-specific)

### Optional
- Amazon (Kindle/Fire TV)
- Huawei (China market)
- F-Droid (open source only)

## Maintenance Across Stores

### Regular Updates
- Release simultaneously across stores
- Keep version numbers synchronized
- Update metadata consistently
- Monitor user reviews
- Respond to feedback

### Performance Tracking
- Track downloads per store
- Monitor star ratings
- Analyze user feedback
- Identify store-specific issues
- Optimize store listings

### Store-Specific Optimization
- Customize screenshots per store
- Translate descriptions for regions
- Optimize keywords per store
- A/B test metadata
- Leverage store-specific features
