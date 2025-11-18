# App Building & Signing Guide

## Prerequisites
- Node.js 18+
- Expo CLI: `npm install -g eas-cli`
- Android SDK (for Android)
- Xcode (for iOS)
- Java Development Kit (JDK)

## Expo EAS Build (Recommended)

### Setup

```bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo
eas login

# Initialize EAS in project
eas build:configure
```

### Android Build

```bash
# Build AAB for Play Store
eas build --platform android --type release

# Build APK for distribution
eas build --platform android --type release --force

# Build for preview
eas build --platform android --type preview
```

### iOS Build

```bash
# Build IPA for App Store
eas build --platform ios --type release

# Build for preview
eas build --platform ios --type preview
```

### Configuration (eas.json)

```json
{
  "builds": {
    "ios": {
      "release": {
        "ios": {
          "buildNumber": "1"
        }
      }
    },
    "android": {
      "release": {
        "android": {
          "buildType": "release"
        }
      }
    }
  }
}
```

## Manual Building

### Android (Using Gradle)

```bash
# Generate keystore (first time only)
keytool -genkey -v -keystore release.keystore \
  -keyalg RSA -keysize 2048 -validity 10000 \
  -alias traffic2u_key

# Build signed APK
cd android
./gradlew assembleRelease

# Build AAB
./gradlew bundleRelease
```

### iOS (Using Xcode)

```bash
# Build archive
xcodebuild archive \
  -workspace ios/[AppName].xcworkspace \
  -scheme [AppName] \
  -configuration Release \
  -archivePath build/[AppName].xcarchive

# Export IPA
xcodebuild -exportArchive \
  -archivePath build/[AppName].xcarchive \
  -exportPath build \
  -exportOptionsPlist options.plist
```

## Code Signing

### Android Signing

```bash
# View signing certificate
keytool -list -v -keystore release.keystore -alias traffic2u_key

# Create signing config in build.gradle
signingConfigs {
  release {
    storeFile file('release.keystore')
    storePassword 'password'
    keyAlias 'traffic2u_key'
    keyPassword 'password'
  }
}
```

### iOS Signing

```bash
# Create certificate signing request in Keychain
# Upload to Apple Developer account
# Download certificate
# Download provisioning profile
# Import in Xcode

# In Xcode:
# 1. Select project
# 2. Select target
# 3. Go to Signing & Capabilities
# 4. Select Team
# 5. Select Provisioning Profile
```

## Version Management

### Update Version

```bash
# Android
# In android/app/build.gradle:
versionCode 1
versionName "1.0.0"

# iOS
# In ios/[AppName]/Info.plist:
CFBundleShortVersionString: 1.0.0
CFBundleVersion: 1

# React Native
# In app.json:
{
  "expo": {
    "version": "1.0.0"
  }
}
```

### Increment Version for Release

```bash
# Semantic Versioning: MAJOR.MINOR.PATCH
# 1.0.0 -> 1.1.0 (minor release)
# 1.0.0 -> 2.0.0 (major release)
# 1.0.0 -> 1.0.1 (patch/bugfix)

# Update all files:
# 1. app.json version
# 2. Android versionCode and versionName
# 3. iOS CFBundleVersion and CFBundleShortVersionString
```

## Pre-Release Checklist

- [ ] All tests passing
- [ ] No console errors/warnings
- [ ] No security vulnerabilities (npm audit)
- [ ] Bundle size optimized
- [ ] Images optimized
- [ ] Strings externalized (i18n)
- [ ] ProGuard rules configured
- [ ] Privacy policy updated
- [ ] Terms of service updated
- [ ] Release notes prepared
- [ ] Version number incremented
- [ ] Build signed with production key
- [ ] Tested on multiple devices
- [ ] Analytics properly configured
- [ ] Crash reporting enabled

## Post-Build Verification

```bash
# Verify APK
aapt dump badging app-release.apk

# Verify IPA
unzip app.ipa -d app
cat app/Payload/[AppName].app/Info.plist

# Check file signatures
jarsigner -verify -verbose -certs app-release.apk
```

## Distribution Channels

### Direct Distribution
- Host APK on website
- Email to users
- Distribute via cloud storage

### TestFlight (iOS)
- Upload IPA
- Invite testers
- Get feedback before release

### Google Play Internal Testing
- Limited users for beta testing
- Gather feedback
- Fix critical issues

## Build Troubleshooting

### Common Issues

**Memory Issues**
```bash
# Increase Gradle memory
export GRADLE_OPTS="-Xmx2048m"
```

**Signing Issues**
```bash
# Verify keystore
keytool -list -v -keystore release.keystore

# Regenerate if needed
keytool -delete -alias traffic2u_key -keystore release.keystore
keytool -genkey -v -keystore release.keystore ...
```

**Build Failures**
- Check logs carefully
- Update dependencies: `npm update`
- Clear cache: `rm -rf node_modules && npm install`
- Clean gradle: `./gradlew clean`
- Try EAS build if local fails

## CI/CD Integration

### GitHub Actions

```yaml
name: Build and Release

on:
  push:
    tags:
      - 'v*'

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - name: Build with EAS
        run: eas build --platform android --type release
```
