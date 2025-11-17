/**
 * Google AdMob Configuration
 * Ad formats: Banner, Interstitial, Rewarded Video, Native
 */

export const AD_FORMATS = {
  BANNER: 'banner',
  INTERSTITIAL: 'interstitial',
  REWARDED: 'rewarded',
  NATIVE: 'native',
  REWARDED_INTERSTITIAL: 'rewarded_interstitial',
} as const;

export const AD_PLACEMENTS = {
  // Banner placements
  BANNER_TOP: 'top',
  BANNER_BOTTOM: 'bottom',

  // Interstitial placements (between actions)
  AFTER_WORKOUT_COMPLETE: 'after_workout',
  AFTER_MEDITATION: 'after_meditation',
  BEFORE_PREMIUM_FEATURE: 'premium_gate',
  AFTER_TASK_COMPLETION: 'task_complete',

  // Rewarded placements (earn premium currency)
  UNLOCK_EXTRA_FEATURES: 'unlock_features',
  DOUBLE_POINTS: 'double_points',
  REMOVE_ADS_TEMP: 'remove_ads_temp',
  PREMIUM_TRIAL_UNLOCK: 'premium_trial',
} as const;

// Ad Unit IDs (replace with real IDs from AdMob console)
export const AD_UNITS = {
  // Development/Test IDs (Google's test IDs)
  DEV: {
    BANNER: 'ca-app-pub-3940256099942544/6300978111',
    INTERSTITIAL: 'ca-app-pub-3940256099942544/1033173712',
    REWARDED: 'ca-app-pub-3940256099942544/5224354917',
    REWARDED_INTERSTITIAL: 'ca-app-pub-3940256099942544/5354046379',
    NATIVE: 'ca-app-pub-3940256099942544/2247696110',
  },
  // Production IDs - Replace with real app IDs
  PROD: {
    'mental-health-pro': {
      BANNER: 'ca-app-pub-[YOUR-ID]/[YOUR-BANNER-ID]',
      INTERSTITIAL: 'ca-app-pub-[YOUR-ID]/[YOUR-INTERSTITIAL-ID]',
      REWARDED: 'ca-app-pub-[YOUR-ID]/[YOUR-REWARDED-ID]',
    },
    'postpartum-fitness': {
      BANNER: 'ca-app-pub-[YOUR-ID]/[YOUR-BANNER-ID]',
      INTERSTITIAL: 'ca-app-pub-[YOUR-ID]/[YOUR-INTERSTITIAL-ID]',
      REWARDED: 'ca-app-pub-[YOUR-ID]/[YOUR-REWARDED-ID]',
    },
    // More apps...
  },
};

// Ad frequency limits (prevent ad fatigue)
export const AD_FREQUENCY = {
  INTERSTITIAL_MIN_INTERVAL: 60000, // 60 seconds between interstitials
  BANNER_REFRESH_RATE: 30000, // Refresh banner every 30 seconds
  REWARDED_DAILY_LIMIT: 5, // Max 5 rewarded videos per day
  INTERSTITIAL_DAILY_LIMIT: 20, // Max 20 interstitials per day
} as const;

// User segments (don't show as many ads to paying users)
export const AD_VISIBILITY = {
  FREE_USER: {
    show_banner: true,
    show_interstitial: true,
    show_rewarded: true,
    interstitial_frequency: 'high', // After every major action
    banner_visibility: 'always',
  },
  PREMIUM_USER: {
    show_banner: false,
    show_interstitial: false,
    show_rewarded: false,
    interstitial_frequency: 'none',
    banner_visibility: 'never',
  },
  TRIAL_USER: {
    show_banner: false,
    show_interstitial: false,
    show_rewarded: true,
    interstitial_frequency: 'low',
    banner_visibility: 'never',
  },
} as const;

// Revenue optimization (average RPM varies by category)
export const REVENUE_TARGETS = {
  'mental-health-pro': {
    estimated_rpm: 8.5, // High CPM for health category
    expected_daily_ads: 50,
  },
  'postpartum-fitness': {
    estimated_rpm: 7.8,
    expected_daily_ads: 45,
  },
  'adhd-management': {
    estimated_rpm: 8.2,
    expected_daily_ads: 48,
  },
  // Average across all apps: $5-10 RPM
} as const;
