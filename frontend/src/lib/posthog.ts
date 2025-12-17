import posthog from 'posthog-js';

// Initialize PostHog
export const initializePostHog = () => {
  const posthogKey = process.env.REACT_APP_POSTHOG_KEY;
  const posthogHost = process.env.REACT_APP_POSTHOG_HOST || 'https://app.posthog.com';

  if (posthogKey) {
    posthog.init(posthogKey, {
      api_host: posthogHost,
      autocapture: true,
      capture_pageview: true,
      capture_pageleave: true,
      session_recording: {
        enabled: true,
        recordCrossOriginIframes: false,
      },
      persistence: 'localStorage',
      loaded: (ph) => {
        if (process.env.NODE_ENV === 'development') {
          console.log('PostHog initialized');
        }
      },
    });
  } else {
    console.warn('PostHog key not configured. Analytics disabled.');
  }
};

// Track custom events
export const trackEvent = (eventName: string, properties?: Record<string, any>) => {
  if (posthog.__loaded) {
    posthog.capture(eventName, properties);
  }
};

// Identify user
export const identifyUser = (userId: string | number, userProperties?: Record<string, any>) => {
  if (posthog.__loaded) {
    posthog.identify(userId.toString(), userProperties);
  }
};

// Track page view
export const trackPageView = (pageName: string, properties?: Record<string, any>) => {
  if (posthog.__loaded) {
    posthog.capture('$pageview', {
      ...properties,
      page: pageName,
    });
  }
};

// Reset user (on logout)
export const resetUser = () => {
  if (posthog.__loaded) {
    posthog.reset();
  }
};

export default posthog;
