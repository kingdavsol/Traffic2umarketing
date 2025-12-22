import posthog from 'posthog-js';

/**
 * A/B Testing Utility using PostHog Feature Flags
 * Implements A/B testing for conversion optimization
 */

export interface ABTest {
  name: string;
  variants: string[];
  defaultVariant: string;
}

// Define A/B tests
export const AB_TESTS = {
  HERO_CTA: {
    name: 'hero-cta-text',
    variants: ['start-selling-free', 'get-started-free', 'try-now-free'],
    defaultVariant: 'start-selling-free',
  },
  HERO_SECONDARY: {
    name: 'hero-secondary-button',
    variants: ['see-how-it-works', 'try-demo', 'watch-video'],
    defaultVariant: 'try-demo',
  },
  PRICING_CTA: {
    name: 'pricing-page-cta',
    variants: ['start-free-trial', 'get-started-now', 'sign-up-free'],
    defaultVariant: 'start-free-trial',
  },
  DEMO_PLACEMENT: {
    name: 'demo-section-placement',
    variants: ['after-how-it-works', 'after-hero', 'before-features'],
    defaultVariant: 'after-how-it-works',
  },
} as const;

/**
 * Get variant for an A/B test
 * Returns the assigned variant or default if PostHog is not loaded
 */
export const getVariant = (test: ABTest): string => {
  if (!posthog.__loaded) {
    return test.defaultVariant;
  }

  // Check if user has a variant assigned via feature flag
  const variant = posthog.getFeatureFlag(test.name);

  if (variant && test.variants.includes(variant as string)) {
    return variant as string;
  }

  return test.defaultVariant;
};

/**
 * Get all active variants for the current user
 */
export const getAllVariants = (): Record<string, string> => {
  if (!posthog.__loaded) {
    return {
      [AB_TESTS.HERO_CTA.name]: AB_TESTS.HERO_CTA.defaultVariant,
      [AB_TESTS.HERO_SECONDARY.name]: AB_TESTS.HERO_SECONDARY.defaultVariant,
      [AB_TESTS.PRICING_CTA.name]: AB_TESTS.PRICING_CTA.defaultVariant,
      [AB_TESTS.DEMO_PLACEMENT.name]: AB_TESTS.DEMO_PLACEMENT.defaultVariant,
    };
  }

  return {
    [AB_TESTS.HERO_CTA.name]: getVariant(AB_TESTS.HERO_CTA),
    [AB_TESTS.HERO_SECONDARY.name]: getVariant(AB_TESTS.HERO_SECONDARY),
    [AB_TESTS.PRICING_CTA.name]: getVariant(AB_TESTS.PRICING_CTA),
    [AB_TESTS.DEMO_PLACEMENT.name]: getVariant(AB_TESTS.DEMO_PLACEMENT),
  };
};

/**
 * Track conversion event for A/B test
 */
export const trackConversion = (
  testName: string,
  variant: string,
  conversionType: string,
  properties?: Record<string, any>
) => {
  if (posthog.__loaded) {
    posthog.capture('ab_test_conversion', {
      test_name: testName,
      variant,
      conversion_type: conversionType,
      ...properties,
    });
  }
};

/**
 * Get CTA text based on variant
 */
export const getHeroCTAText = (): string => {
  const variant = getVariant(AB_TESTS.HERO_CTA);

  switch (variant) {
    case 'start-selling-free':
      return 'Start Selling Free →';
    case 'get-started-free':
      return 'Get Started Free →';
    case 'try-now-free':
      return 'Try Now Free →';
    default:
      return 'Start Selling Free →';
  }
};

/**
 * Get secondary CTA text based on variant
 */
export const getHeroSecondaryCTAText = (): string => {
  const variant = getVariant(AB_TESTS.HERO_SECONDARY);

  switch (variant) {
    case 'see-how-it-works':
      return 'See How It Works';
    case 'try-demo':
      return 'Try Demo';
    case 'watch-video':
      return 'Watch Video';
    default:
      return 'Try Demo';
  }
};

/**
 * Get pricing page CTA text based on variant
 */
export const getPricingCTAText = (): string => {
  const variant = getVariant(AB_TESTS.PRICING_CTA);

  switch (variant) {
    case 'start-free-trial':
      return 'Start Free Trial';
    case 'get-started-now':
      return 'Get Started Now';
    case 'sign-up-free':
      return 'Sign Up Free';
    default:
      return 'Start Free Trial';
  }
};

/**
 * Check if demo should be shown at specific position
 */
export const shouldShowDemoAt = (position: string): boolean => {
  const variant = getVariant(AB_TESTS.DEMO_PLACEMENT);
  return variant === position;
};

/**
 * Track button click conversion
 */
export const trackButtonClick = (
  buttonLocation: string,
  buttonText: string,
  testName?: string
) => {
  if (posthog.__loaded) {
    const properties: Record<string, any> = {
      button_location: buttonLocation,
      button_text: buttonText,
      timestamp: new Date().toISOString(),
    };

    // Add A/B test context if available
    if (testName) {
      const variants = getAllVariants();
      properties.ab_test_variants = variants;
      properties.test_name = testName;
    }

    posthog.capture('button_click', properties);
  }
};

/**
 * Track signup conversion with A/B test context
 */
export const trackSignupConversion = (source: string) => {
  if (posthog.__loaded) {
    const variants = getAllVariants();

    posthog.capture('signup_completed', {
      source,
      ab_test_variants: variants,
      timestamp: new Date().toISOString(),
    });

    // Track conversions for each active A/B test
    Object.entries(variants).forEach(([testName, variant]) => {
      trackConversion(testName, variant, 'signup', { source });
    });
  }
};

/**
 * Track demo usage conversion
 */
export const trackDemoConversion = (photosUploaded: number, analysisSuccessful: boolean) => {
  if (posthog.__loaded) {
    const variants = getAllVariants();

    posthog.capture('demo_used', {
      photos_uploaded: photosUploaded,
      analysis_successful: analysisSuccessful,
      ab_test_variants: variants,
      timestamp: new Date().toISOString(),
    });

    // Track conversion for demo placement test
    trackConversion(
      AB_TESTS.DEMO_PLACEMENT.name,
      variants[AB_TESTS.DEMO_PLACEMENT.name],
      'demo_used',
      { photos_uploaded: photosUploaded, analysis_successful: analysisSuccessful }
    );
  }
};

export default {
  getVariant,
  getAllVariants,
  trackConversion,
  getHeroCTAText,
  getHeroSecondaryCTAText,
  getPricingCTAText,
  shouldShowDemoAt,
  trackButtonClick,
  trackSignupConversion,
  trackDemoConversion,
};
