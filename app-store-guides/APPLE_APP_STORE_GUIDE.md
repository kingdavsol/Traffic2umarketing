# Apple App Store Submission Guide

## Prerequisites
1. Apple Developer Account ($99/year)
2. Apple Developer Program enrollment
3. App Store Connect access
4. Signed IPA (iOS app)
5. Provisioning profiles and certificates
6. App icons (1024x1024px)
7. Screenshots (multiple device sizes)
8. App preview video (optional)
9. Privacy policy and terms

## Device Requirements for Screenshots

- iPhone 6.5-inch (Super Retina XS Max): 1242x2688px
- iPhone 6.1-inch: 1170x2532px
- iPad Pro 12.9-inch: 2048x2732px
- iPad Pro 11-inch: 2048x2732px
- iPhone 5.5-inch: 1242x2208px

## Step-by-Step Submission

### 1. Prepare Signing

```bash
# Install certificates and provisioning profiles
# Download from Apple Developer account
# Place in ~/Library/MobileDevice/Provisioning\ Profiles/

# Build using Xcode or EAS
eas build --platform ios --type release

# Or build with Xcode
xcodebuild archive -scheme [AppName] -archivePath [path].xcarchive
xcodebuild -exportArchive -archivePath [path].xcarchive \
  -exportOptionsPlist [options.plist] -exportPath [path]
```

### 2. Create App Record in App Store Connect

1. Go to App Store Connect
2. Click "My Apps"
3. Click "+" and select "New App"
4. Fill in app information:
   - App Name (30 chars max)
   - Bundle ID (com.company.appname)
   - SKU (unique identifier, not visible to users)
   - Platform (iOS, macOS, watchOS, tvOS)

### 3. App Information

**Privacy Policy**
- REQUIRED
- Must be accessible via URL
- Should explain data collection
- Disclose third-party services

**Category**
- Select primary category
- Supported categories include:
  - Business, Education, Finance
  - Health & Fitness, Lifestyle
  - Social Networking, Utilities, etc.

**Age Rating**
- Questionnaire-based
- Ratings: 4+, 12+, 17+
- Based on content type
- Must be accurate

### 4. Metadata

**App Name** (30 chars max)
- Clear, concise
- Include keywords
- Memorable

**Subtitle** (30 chars max)
- Additional description
- Short benefits
- Keyword-rich

**Keywords** (100 chars max)
```
Example: "app, productivity, task management, todo"
```

**Description** (4000 chars max)
```
[App Name] is the ultimate app for [benefit].

Key Features:
• Feature 1 with benefit
• Feature 2 with benefit
• Feature 3 with benefit
• Feature 4 with benefit

Privacy:
We protect your data. Learn more in our Privacy Policy.

Support:
• Email: support@appname.com
• Website: www.appname.com
• Feedback: We'd love to hear from you!
```

**Support URL** (REQUIRED)
- Company website
- Support page
- Documentation

**Marketing URL** (Optional)
- App-specific page
- Marketing materials
- Social media links

### 5. Screenshots

**Minimum Requirements**
- At least 1 screenshot per device
- Maximum 10 screenshots per device
- JPG or PNG format
- RGB color space

**Screenshot Strategy**
- Screen 1: Key feature or benefit
- Screen 2: Core functionality
- Screen 3: Unique features
- Screen 4: User benefits
- Screen 5: Call-to-action

**Text Overlay Tips**
- Keep text large and readable
- Use contrasting colors
- Maximum 2-3 lines per screen
- Focus on benefits, not features
- Include app branding

### 6. App Preview (Optional)

- 30-second video
- Shows app in action
- Portrait orientation
- iPhoneorPad framing
- No external audio
- H.264 codec

### 7. Version Release Information

**Release Notes** (for users)
```
Version 1.0.0

What's New:
• New feature 1
• Improved feature 2
• Bug fixes and improvements

Performance and design enhancements.
```

**What to Prepare** (internal notes)
```
Initial release with complete feature set:
- User authentication
- Core app functionality
- In-app purchases
- Premium features
- Analytics integration
- Push notifications
```

### 8. Build Information

1. Select build from list
2. Verify build contains correct app
3. Check dependencies are included
4. Confirm signing certificate

### 9. Pricing and Availability

**Pricing Tier**
- Free
- $0.99 - $999.99
- Subscription options

**Availability**
- Select countries
- Select platforms
- Set release date

### 10. Submit for Review

1. Verify all information
2. Accept Terms and Conditions
3. Click "Submit for Review"
4. Typical review: 24-48 hours
5. Status updates via email

## Content Review Guidelines

### What Apple Reviews
- Functionality (does app work as advertised)
- Performance (crashes, bugs)
- Design (UI/UX quality)
- Privacy (data collection transparency)
- Legal compliance (licenses, IP)
- Metadata accuracy (no misleading info)
- Content appropriateness

### Common Rejection Reasons

1. **Crashes or Bugs**
   - Test thoroughly on devices
   - Fix all runtime errors
   - Test all features

2. **Incomplete Functionality**
   - Don't mark placeholder features
   - Include all advertised features
   - Complete all user flows

3. **Misleading Metadata**
   - Screenshots match functionality
   - Description is accurate
   - No false claims

4. **Privacy Issues**
   - Privacy policy required
   - Explain data usage
   - Request permission before access

5. **Intellectual Property**
   - No unauthorized use
   - Proper licensing
   - Original content/assets

6. **Performance Issues**
   - No excessive battery drain
   - Reasonable memory usage
   - Fast response time

## Best Practices

### Metadata Optimization
- Research competitor keywords
- Include keywords naturally
- Highlight unique features
- Clear value proposition
- Professional appearance

### User Engagement
- Respond to reviews quickly
- Implement feedback
- Regular updates (every 1-3 months)
- Monitor crash reports
- Track analytics

### Marketing
- Plan pre-launch promotion
- Prepare press materials
- Social media announcement
- Review websites notified
- Influencer partnerships

## Post-Launch Checklist
- [ ] Monitor crash reports
- [ ] Respond to user reviews
- [ ] Track download metrics
- [ ] Monitor star rating
- [ ] Update screenshots
- [ ] Plan next version
- [ ] A/B test metadata
- [ ] Test on new iOS versions

## Resources
- App Store Connect: https://appstoreconnect.apple.com
- App Store Review Guidelines: https://developer.apple.com/app-store/review/guidelines/
- Human Interface Guidelines: https://developer.apple.com/design/human-interface-guidelines/
- TestFlight: https://developer.apple.com/testflight/
