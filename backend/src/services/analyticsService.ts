import { PostHog } from 'posthog-node';
import { logger } from '../config/logger';

// Initialize PostHog client
const posthogKey = process.env.POSTHOG_API_KEY;
const posthogHost = process.env.POSTHOG_HOST || 'https://app.posthog.com';

let posthog: PostHog | null = null;

if (posthogKey) {
  posthog = new PostHog(posthogKey, {
    host: posthogHost,
  });
  logger.info('PostHog analytics initialized');
} else {
  logger.warn('POSTHOG_API_KEY not configured - analytics disabled');
}

/**
 * Track backend events
 */
export const trackEvent = async (
  distinctId: string,
  event: string,
  properties?: Record<string, any>
) => {
  if (!posthog) return;

  try {
    posthog.capture({
      distinctId: distinctId.toString(),
      event,
      properties: {
        ...properties,
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'production',
      },
    });
  } catch (error) {
    logger.error('Analytics tracking error:', error);
  }
};

/**
 * Identify user with properties
 */
export const identifyUser = async (
  userId: string | number,
  properties?: Record<string, any>
) => {
  if (!posthog) return;

  try {
    posthog.identify({
      distinctId: userId.toString(),
      properties: {
        ...properties,
        $set: properties,
      },
    });
  } catch (error) {
    logger.error('Analytics identify error:', error);
  }
};

/**
 * Shutdown PostHog gracefully
 */
export const shutdownAnalytics = async () => {
  if (posthog) {
    await posthog.shutdown();
  }
};

// Track key backend events
export const trackUserRegistration = (userId: number, email: string, username: string) => {
  trackEvent(userId.toString(), 'user_registered', {
    email,
    username,
    signup_method: 'email',
  });
};

export const trackUserLogin = (userId: number, email: string) => {
  trackEvent(userId.toString(), 'user_logged_in', {
    email,
    login_method: 'email',
  });
};

export const trackPhotoAnalysis = (
  userId: number,
  success: boolean,
  analysisTimeMs: number,
  error?: string
) => {
  trackEvent(userId.toString(), 'photo_analyzed', {
    success,
    analysis_time_ms: analysisTimeMs,
    error,
  });
};

export const trackListingCreated = (
  userId: number,
  listingId: number,
  category?: string,
  price?: number
) => {
  trackEvent(userId.toString(), 'listing_created', {
    listing_id: listingId,
    category,
    price,
  });
};

export const trackMarketplaceConnected = (
  userId: number,
  marketplace: string,
  method: string
) => {
  trackEvent(userId.toString(), 'marketplace_connected', {
    marketplace,
    connection_method: method,
  });
};

export const trackListingPublished = (
  userId: number,
  listingId: number,
  marketplaces: string[]
) => {
  trackEvent(userId.toString(), 'listing_published', {
    listing_id: listingId,
    marketplaces,
    marketplace_count: marketplaces.length,
  });
};

export const trackError = (
  userId: number | string,
  errorType: string,
  errorMessage: string,
  context?: Record<string, any>
) => {
  trackEvent(userId.toString(), 'error_occurred', {
    error_type: errorType,
    error_message: errorMessage,
    ...context,
  });
};
