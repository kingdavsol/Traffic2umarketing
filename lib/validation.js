/**
 * Input validation utilities for metrics
 */

const VALID_METRICS = [
  'users', 'activeUsers', 'downloads', 'revenue',
  'adImpressions', 'adClicks', 'sessions'
];

const CUSTOM_METRIC_LIMIT = 50; // Max custom metrics per submission
const METRIC_VALUE_LIMIT = 1000000000; // 1 billion max value

/**
 * Validate app name
 * @param {string} appName - App name to validate
 * @returns {object} { isValid, errors }
 */
function validateAppName(appName) {
  const errors = [];

  if (!appName || typeof appName !== 'string') {
    errors.push('appName is required and must be a string');
    return { isValid: false, errors };
  }

  if (appName.length < 2 || appName.length > 100) {
    errors.push('appName must be between 2 and 100 characters');
  }

  if (!/^[a-zA-Z0-9\-_]+$/.test(appName)) {
    errors.push('appName must contain only alphanumeric characters, hyphens, and underscores');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Validate display name
 * @param {string} displayName - Display name to validate
 * @returns {object} { isValid, errors }
 */
function validateDisplayName(displayName) {
  const errors = [];

  if (!displayName || typeof displayName !== 'string') {
    errors.push('displayName is required and must be a string');
    return { isValid: false, errors };
  }

  if (displayName.length < 2 || displayName.length > 200) {
    errors.push('displayName must be between 2 and 200 characters');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Validate single metric value
 * @param {string} metricName - Name of metric
 * @param {*} value - Value to validate
 * @returns {object} { isValid, error }
 */
function validateMetricValue(metricName, value) {
  if (value === undefined || value === null) {
    return { isValid: true }; // Optional metrics
  }

  if (typeof value !== 'number') {
    return {
      isValid: false,
      error: `${metricName} must be a number, got ${typeof value}`
    };
  }

  if (!Number.isFinite(value)) {
    return {
      isValid: false,
      error: `${metricName} must be a finite number`
    };
  }

  if (value < 0) {
    return {
      isValid: false,
      error: `${metricName} cannot be negative (got ${value})`
    };
  }

  if (value > METRIC_VALUE_LIMIT) {
    return {
      isValid: false,
      error: `${metricName} exceeds maximum value of ${METRIC_VALUE_LIMIT}`
    };
  }

  return { isValid: true };
}

/**
 * Validate metrics object
 * @param {object} metrics - Metrics object to validate
 * @returns {object} { isValid, errors }
 */
function validateMetrics(metrics) {
  const errors = [];

  if (!metrics || typeof metrics !== 'object') {
    return {
      isValid: false,
      errors: ['metrics is required and must be an object']
    };
  }

  // Validate standard metrics
  VALID_METRICS.forEach(metric => {
    if (metrics[metric] !== undefined) {
      const validation = validateMetricValue(metric, metrics[metric]);
      if (!validation.isValid) {
        errors.push(validation.error);
      }
    }
  });

  // Validate custom metrics if present
  if (metrics.custom) {
    if (typeof metrics.custom !== 'object' || Array.isArray(metrics.custom)) {
      errors.push('custom metrics must be an object');
    } else {
      const customKeys = Object.keys(metrics.custom);
      if (customKeys.length > CUSTOM_METRIC_LIMIT) {
        errors.push(`Maximum ${CUSTOM_METRIC_LIMIT} custom metrics allowed`);
      }

      customKeys.forEach(key => {
        if (key.length > 100) {
          errors.push(`Custom metric key "${key}" exceeds 100 character limit`);
        }
      });
    }
  }

  // At least one metric should be present
  const hasStandardMetrics = VALID_METRICS.some(m => metrics[m] !== undefined);
  const hasCustomMetrics = metrics.custom && Object.keys(metrics.custom).length > 0;

  if (!hasStandardMetrics && !hasCustomMetrics) {
    errors.push('At least one metric must be provided');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Validate date format (YYYY-MM-DD)
 * @param {string} dateStr - Date string to validate
 * @returns {object} { isValid, error }
 */
function validateDate(dateStr) {
  if (!dateStr) {
    return { isValid: true }; // Optional, defaults to today
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return {
      isValid: false,
      error: 'date must be in YYYY-MM-DD format'
    };
  }

  const date = new Date(dateStr);
  if (isNaN(date.getTime())) {
    return {
      isValid: false,
      error: 'date is not a valid date'
    };
  }

  // Don't allow future dates
  if (date > new Date()) {
    return {
      isValid: false,
      error: 'date cannot be in the future'
    };
  }

  return { isValid: true };
}

/**
 * Validate entire metrics submission
 * @param {object} submission - Complete metrics submission
 * @returns {object} { isValid, errors }
 */
function validateMetricsSubmission(submission) {
  const errors = [];

  if (!submission || typeof submission !== 'object') {
    return {
      isValid: false,
      errors: ['submission must be an object']
    };
  }

  // Validate appName
  const appValidation = validateAppName(submission.appName);
  if (!appValidation.isValid) {
    errors.push(...appValidation.errors);
  }

  // Validate displayName if provided
  if (submission.displayName) {
    const displayValidation = validateDisplayName(submission.displayName);
    if (!displayValidation.isValid) {
      errors.push(...displayValidation.errors);
    }
  }

  // Validate date if provided
  if (submission.date) {
    const dateValidation = validateDate(submission.date);
    if (!dateValidation.isValid) {
      errors.push(dateValidation.error);
    }
  }

  // Validate metrics
  const metricsValidation = validateMetrics(submission.metrics);
  if (!metricsValidation.isValid) {
    errors.push(...metricsValidation.errors);
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

module.exports = {
  validateAppName,
  validateDisplayName,
  validateMetricValue,
  validateMetrics,
  validateDate,
  validateMetricsSubmission,
  VALID_METRICS,
  CUSTOM_METRIC_LIMIT,
  METRIC_VALUE_LIMIT
};
