# QuickSell - Expo React Native Migration Plan
**Date**: February 14, 2026 18:15 UTC
**Status**: Planning Phase
**Reason**: Web app failed after 50+ deployment attempts, mobile-first app needs native solution

---

## Executive Summary

**Goal**: Convert QuickSell from React web app to React Native mobile app using Expo

**Timeline**: 5-7 days for MVP, 2 weeks for production-ready
**Risk Level**: Medium (well-defined migration path, Expo handles complexity)
**Success Criteria**:
- Camera photo capture works reliably
- Marketplace links open native apps
- Listing creation and save functions work
- AI analysis displays results visibly

---

## Current State Analysis

### Technology Stack (Web)
```json
Frontend:
- React 18.2.0 (web)
- Material-UI 5.13.0 (web-only)
- react-router-dom 6.12.0 (web routing)
- react-dropzone 14.2.3 (web file upload)
- Redux Toolkit 1.9.5 ✅ (compatible)
- axios 1.4.0 ✅ (compatible)
- formik 2.4.2 ✅ (compatible)
- yup 1.2.0 ✅ (compatible)
- chart.js 4.4.0 (needs replacement)
- react-confetti 6.4.0 (web-only, optional)
- posthog-js 1.309.1 (has React Native SDK)

Backend:
- Node.js/Express ✅ (no changes needed)
- PostgreSQL ✅ (no changes needed)
- Redis ✅ (no changes needed)
```

### Pages/Screens Inventory
```
Core Screens (Priority 1):
1. LoginPage → Login Screen
2. RegisterPage → Register Screen
3. Dashboard → Dashboard Screen
4. CreateListing → Camera/Create Listing Screen ⭐ CRITICAL
5. MyListings → My Listings Screen
6. ListingDetails → Listing Detail Screen

Secondary Screens (Priority 2):
7. Settings → Settings Screen
8. Sales → Sales History Screen
9. Gamification → Rewards Screen
10. Referrals → Referrals Screen

Marketing Screens (Priority 3 - Web Only):
11. LandingPage → Keep as web
12. Pricing → Keep as web
13. Blog → Keep as web
14. CaseStudies → Keep as web
```

---

## Dependency Migration Matrix

### ❌ Must Replace (Web-Only)

| Current Package | Expo Replacement | Reason |
|----------------|------------------|---------|
| `@mui/material` | `react-native-paper` or `@rneui/themed` | Material-UI is DOM-only |
| `@emotion/react` | Built-in StyleSheet | Emotion requires DOM |
| `react-router-dom` | `@react-navigation/native` | Web routing incompatible |
| `react-dropzone` | `expo-image-picker` | File system access different |
| `react-dom` | `react-native` | Core library change |
| `react-confetti` | `react-native-confetti-cannon` | Optional, low priority |
| `chart.js` + `react-chartjs-2` | `react-native-chart-kit` | Canvas API unavailable |

### ✅ Keep (Compatible)

| Package | Status | Notes |
|---------|--------|-------|
| `react` 18.2.0 | ✅ Keep exact version | Core library |
| `@reduxjs/toolkit` | ✅ Compatible | State management works identically |
| `axios` | ✅ Compatible | HTTP client works in RN |
| `formik` | ✅ Compatible | Form management works in RN |
| `yup` | ✅ Compatible | Validation works in RN |
| `date-fns` | ✅ Compatible | Date utilities pure JS |
| `clsx` | ✅ Compatible | Classname helper (optional in RN) |

### ➕ Add (New Expo Packages)

| Package | Purpose | Priority |
|---------|---------|----------|
| `expo` ~51.0.0 | Core Expo SDK | Critical |
| `expo-camera` | Photo capture for listings | Critical |
| `expo-image-picker` | Gallery photo selection | Critical |
| `expo-linking` | Deep links to marketplaces | Critical |
| `@react-navigation/native` | Screen navigation | Critical |
| `@react-navigation/native-stack` | Stack navigator | Critical |
| `react-native-paper` | Material Design UI | High |
| `expo-secure-store` | Secure token storage | High |
| `expo-splash-screen` | App launch screen | Medium |
| `expo-status-bar` | Status bar control | Medium |
| `react-native-chart-kit` | Charts for analytics | Low |
| `posthog-react-native` | Analytics (replace posthog-js) | Low |

---

## Architecture Changes

### 1. Navigation Structure
```
Web (react-router):
  / → Landing
  /login → Login
  /dashboard → Dashboard
  /create → CreateListing

Expo (React Navigation):
  AuthStack:
    - LoginScreen
    - RegisterScreen

  MainStack (after auth):
    - DashboardScreen
    - CreateListingScreen
    - MyListingsScreen
    - SettingsScreen

  Tab Navigator (bottom tabs):
    - Dashboard
    - Create (Camera)
    - Listings
    - Profile
```

### 2. Camera Integration
```typescript
// Web (react-dropzone) - REMOVE
const { getRootProps, getInputProps } = useDropzone({
  accept: { 'image/*': [] },
  onDrop: files => handleFiles(files)
});

// Expo (expo-camera) - NEW
import { Camera } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';

// Camera capture
const takePhoto = async () => {
  const permission = await Camera.requestCameraPermissionsAsync();
  if (permission.granted) {
    const photo = await cameraRef.current.takePictureAsync();
    handlePhoto(photo.uri);
  }
};

// Gallery picker
const pickImage = async () => {
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    quality: 0.8,
    allowsMultipleSelection: true,
  });
  if (!result.canceled) {
    handlePhotos(result.assets);
  }
};
```

### 3. UI Component Migration

#### Material-UI → React Native Paper
```typescript
// BEFORE (Material-UI)
import { Button, TextField, Card, Snackbar } from '@mui/material';

<Button variant="contained" color="primary" onClick={handleClick}>
  Create Listing
</Button>

// AFTER (React Native Paper)
import { Button, TextInput, Card, Snackbar } from 'react-native-paper';

<Button mode="contained" onPress={handlePress}>
  Create Listing
</Button>
```

#### Styling Migration
```typescript
// BEFORE (MUI sx prop)
<Box sx={{ padding: 2, backgroundColor: 'primary.main' }}>

// AFTER (StyleSheet)
import { StyleSheet } from 'react-native';

<View style={styles.container}>

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#1976d2',
  },
});
```

### 4. Marketplace Link Handling
```typescript
// Web - window.open (BROKEN)
window.open(marketplace.url, '_blank');

// Expo - Linking API (WORKS)
import * as Linking from 'expo-linking';

const openMarketplace = async (url: string) => {
  const canOpen = await Linking.canOpenURL(url);
  if (canOpen) {
    await Linking.openURL(url);
  }
};
```

### 5. Storage Migration
```typescript
// Web - localStorage
localStorage.setItem('token', token);

// Expo - SecureStore
import * as SecureStore from 'expo-secure-store';

await SecureStore.setItemAsync('token', token);
```

---

## Implementation Phases

### Phase 1: Project Setup (Day 1)
**Tasks**:
- [ ] Create new Expo project: `npx create-expo-app quicksell-mobile`
- [ ] Install dependencies (navigation, UI, camera)
- [ ] Configure TypeScript
- [ ] Set up project structure (screens, components, services)
- [ ] Configure app.json (name, icon, splash, permissions)

**Deliverable**: Empty Expo app that builds and runs

### Phase 2: Core Infrastructure (Day 1-2)
**Tasks**:
- [ ] Set up React Navigation (auth + main stacks)
- [ ] Implement Redux store (copy from web, test compatibility)
- [ ] Create axios API service (copy from web)
- [ ] Implement SecureStore auth token management
- [ ] Create theme provider (React Native Paper)
- [ ] Build reusable UI components (Button, Input, Card)

**Deliverable**: Navigation works, API calls functional, auth flow ready

### Phase 3: Authentication Screens (Day 2)
**Tasks**:
- [ ] Build Login screen (email/password)
- [ ] Build Register screen
- [ ] Implement Google Sign-In (expo-auth-session)
- [ ] Connect to backend API
- [ ] Handle token storage
- [ ] Implement auth state management

**Deliverable**: Users can login/register, tokens persist

### Phase 4: Critical Camera Screen (Day 3-4)
**Tasks**:
- [ ] Request camera permissions
- [ ] Build camera UI with capture button
- [ ] Implement photo capture
- [ ] Implement gallery picker (multiple selection)
- [ ] Display photo thumbnails
- [ ] Implement AI analysis API call
- [ ] Show analysis results in modal/alert
- [ ] Implement photo approval flow

**Deliverable**: Camera capture works, AI analysis shows results visibly

### Phase 5: Listing Creation (Day 4-5)
**Tasks**:
- [ ] Build CreateListing screen
- [ ] Form inputs (title, description, price, category)
- [ ] Marketplace selector (checkboxes)
- [ ] Marketplace "Open" buttons with Linking API
- [ ] Photo display grid
- [ ] Save listing API integration
- [ ] Success/error feedback

**Deliverable**: Users can create and save listings with photos

### Phase 6: Listings & Dashboard (Day 5-6)
**Tasks**:
- [ ] Build Dashboard screen (stats, recent listings)
- [ ] Build MyListings screen (list view)
- [ ] Build ListingDetails screen
- [ ] Implement pull-to-refresh
- [ ] Implement listing filters
- [ ] Chart components for analytics

**Deliverable**: Users can view and manage their listings

### Phase 7: Secondary Screens (Day 6-7)
**Tasks**:
- [ ] Settings screen (profile, notifications, security)
- [ ] Sales history screen
- [ ] Gamification/rewards screen
- [ ] Referrals screen
- [ ] About/Help screens

**Deliverable**: Complete app functionality

### Phase 8: Polish & Testing (Day 7-10)
**Tasks**:
- [ ] Design app icon and splash screen
- [ ] Implement error boundaries
- [ ] Add loading states
- [ ] Improve UX animations
- [ ] Test on physical iOS device
- [ ] Test on physical Android device
- [ ] Fix bugs and edge cases
- [ ] Performance optimization

**Deliverable**: Production-ready app

### Phase 9: Deployment (Day 10-14)
**Tasks**:
- [ ] Configure EAS Build
- [ ] Build iOS IPA
- [ ] Build Android APK
- [ ] Submit to TestFlight (iOS beta)
- [ ] Submit to Google Play Internal Testing
- [ ] User acceptance testing
- [ ] Fix critical issues
- [ ] Production release

**Deliverable**: App live in stores

---

## Potential Conflicts & Solutions

### 1. File Upload to Backend
**Issue**: Backend expects FormData from web browsers
**Solution**: Use `expo-file-system` and create FormData compatible with RN
```typescript
import * as FileSystem from 'expo-file-system';

const uploadPhoto = async (uri: string) => {
  const formData = new FormData();
  formData.append('photo', {
    uri,
    type: 'image/jpeg',
    name: 'photo.jpg',
  } as any);

  await axios.post('/api/photos/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};
```

### 2. Redux Persist in React Native
**Issue**: Web uses localStorage, RN needs AsyncStorage
**Solution**: Use `@react-native-async-storage/async-storage`
```typescript
import AsyncStorage from '@react-native-async-storage/async-storage';
import { persistStore, persistReducer } from 'redux-persist';

const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  whitelist: ['auth', 'listings'],
};
```

### 3. CORS Not Needed
**Issue**: Backend has CORS for web browsers
**Solution**: React Native doesn't need CORS (direct HTTP), but keep for web compatibility

### 4. Push Notifications
**Issue**: Web uses service workers, RN uses native
**Solution**: Implement `expo-notifications` for native push
```typescript
import * as Notifications from 'expo-notifications';

const token = await Notifications.getExpoPushTokenAsync();
// Send token to backend for push notifications
```

### 5. Deep Linking (Marketplace Return)
**Issue**: When user opens marketplace app, need way to return
**Solution**: Implement deep links with `expo-linking`
```typescript
// app.json
"scheme": "quicksell",

// Usage
const url = Linking.createURL('listing/123');
// quicksell://listing/123
```

---

## Backend API Compatibility

### No Changes Required ✅
The existing Express backend is fully compatible with React Native:
- REST API endpoints work identically
- JWT authentication unchanged
- File uploads compatible with FormData
- PostgreSQL queries unchanged
- Redis sessions work the same

### Optional Enhancements
```typescript
// Add device info to login
POST /api/auth/login
{
  email: string,
  password: string,
  deviceInfo?: {
    platform: 'ios' | 'android',
    deviceId: string,
    pushToken?: string
  }
}

// Register push token
POST /api/users/push-token
{
  token: string,
  platform: 'ios' | 'android'
}
```

---

## Testing Strategy

### Unit Tests
- Redux actions/reducers (existing tests should work)
- API service functions
- Utility functions (date formatting, validation)

### Integration Tests
- Authentication flow
- Listing creation flow
- Photo upload flow
- Marketplace linking

### Manual Testing Checklist
- [ ] Camera permission request
- [ ] Photo capture quality
- [ ] Gallery multi-select
- [ ] AI analysis response time
- [ ] Marketplace app switching
- [ ] Offline error handling
- [ ] Token persistence across app restarts
- [ ] Pull-to-refresh lists
- [ ] Form validation
- [ ] Image compression before upload

### Device Testing
- [ ] iPhone 12+ (iOS 15+)
- [ ] iPhone SE (small screen)
- [ ] iPad (tablet layout)
- [ ] Samsung Galaxy S21+ (Android 12+)
- [ ] Pixel 6 (Android 13+)
- [ ] Budget Android (Android 11)

---

## Risk Mitigation

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Camera API changes in Expo SDK | High | Low | Pin Expo SDK version, test before upgrading |
| iOS App Store rejection | High | Medium | Follow guidelines, request camera permission with clear explanation |
| Android permissions issues | Medium | Medium | Test on multiple devices, clear permission requests |
| Large app size | Low | High | Use Expo optimization, implement code splitting |
| Backend API incompatibility | High | Low | Existing API is REST-based, fully compatible |
| Redux state migration bugs | Medium | Medium | Thoroughly test Redux persist, add migrations |

---

## Success Metrics

### Technical Metrics
- [ ] App bundle size < 50MB (iOS), < 30MB (Android)
- [ ] Cold start time < 3 seconds
- [ ] Photo upload < 5 seconds on 4G
- [ ] AI analysis response < 15 seconds
- [ ] Crash-free rate > 99.5%

### User Experience Metrics
- [ ] Camera capture works 100% of time
- [ ] Marketplace links open native apps 100% of time
- [ ] Listing save success rate > 99%
- [ ] AI snackbar/alert visible to all users
- [ ] User rating > 4.5 stars

---

## Project Structure

```
quicksell-mobile/
├── app.json                 # Expo config
├── package.json
├── tsconfig.json
├── App.tsx                  # Root component
├── src/
│   ├── navigation/
│   │   ├── AuthNavigator.tsx
│   │   ├── MainNavigator.tsx
│   │   └── TabNavigator.tsx
│   ├── screens/
│   │   ├── auth/
│   │   │   ├── LoginScreen.tsx
│   │   │   └── RegisterScreen.tsx
│   │   ├── dashboard/
│   │   │   └── DashboardScreen.tsx
│   │   ├── listings/
│   │   │   ├── CreateListingScreen.tsx ⭐
│   │   │   ├── MyListingsScreen.tsx
│   │   │   └── ListingDetailScreen.tsx
│   │   └── profile/
│   │       └── SettingsScreen.tsx
│   ├── components/
│   │   ├── CameraView.tsx
│   │   ├── PhotoGrid.tsx
│   │   ├── MarketplaceSelector.tsx
│   │   └── ui/
│   │       ├── Button.tsx
│   │       ├── Input.tsx
│   │       └── Card.tsx
│   ├── services/
│   │   ├── api.ts           # axios instance (copy from web)
│   │   ├── auth.ts          # auth helpers
│   │   ├── camera.ts        # camera/gallery helpers
│   │   └── storage.ts       # SecureStore wrapper
│   ├── store/
│   │   ├── index.ts
│   │   └── slices/          # Copy from web
│   │       ├── authSlice.ts
│   │       ├── listingsSlice.ts
│   │       └── uiSlice.ts
│   ├── types/
│   │   └── index.ts         # TypeScript types
│   ├── utils/
│   │   ├── validation.ts
│   │   └── formatting.ts
│   └── theme/
│       └── index.ts         # React Native Paper theme
└── assets/
    ├── icon.png
    └── splash.png
```

---

## Next Steps

1. **User Decision Required**: Approve this migration plan
2. **Create Expo Project**: Initialize new quicksell-mobile repo
3. **Set Up Development Environment**: Install Expo CLI, configure emulators
4. **Begin Phase 1**: Project setup and dependency installation
5. **Daily Progress Updates**: Report completion of each phase

---

## Estimated Costs

### Development Time
- MVP (Phases 1-6): 5-7 days
- Production Ready (Phases 1-9): 10-14 days

### Apple Developer Account
- **$99/year** - Required for TestFlight and App Store

### Google Play Developer Account
- **$25 one-time** - Required for Play Store

### Expo EAS Build
- **Free tier**: 30 builds/month (sufficient for development)
- **Production tier**: $29/month (unlimited builds)

### Total Initial Cost
- **$124** (Apple + Google accounts)
- **Optional**: $29/month for unlimited builds

---

## Recommendation

**Proceed with Expo migration immediately.**

The web app has proven fundamentally incompatible with mobile browsers after 50+ failed attempts. A native mobile app using Expo will:
- Solve all current issues (camera, links, touch events)
- Provide better user experience
- Enable App Store distribution
- Take 5-7 days vs. continuing to fail with web version

The migration path is well-defined, risks are manageable, and 80% of backend/logic code is reusable.
