import { Request, Response, NextFunction } from 'express';
import { logger } from '../config/logger';

// In-memory store for login attempts (in production, use Redis)
const loginAttempts = new Map<string, { count: number; lastAttempt: number; lockedUntil?: number }>();
const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes
const ATTEMPT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes

/**
 * Account lockout middleware - prevents brute force attacks
 * Locks account after MAX_LOGIN_ATTEMPTS failed attempts
 */
export const accountLockout = (req: Request, res: Response, next: NextFunction) => {
  const identifier = req.body.email || req.ip || 'unknown';
  const now = Date.now();

  const attempts = loginAttempts.get(identifier);

  if (attempts) {
    // Check if currently locked out
    if (attempts.lockedUntil && now < attempts.lockedUntil) {
      const remainingTime = Math.ceil((attempts.lockedUntil - now) / 1000 / 60);
      logger.warn('Login attempt on locked account', { identifier, remainingMinutes: remainingTime });
      return res.status(429).json({
        success: false,
        error: `Account temporarily locked. Try again in ${remainingTime} minutes.`,
        statusCode: 429,
      });
    }

    // Reset if outside window
    if (now - attempts.lastAttempt > ATTEMPT_WINDOW_MS) {
      loginAttempts.delete(identifier);
    }
  }

  next();
};

/**
 * Record a failed login attempt
 */
export const recordFailedAttempt = (identifier: string): void => {
  const now = Date.now();
  const attempts = loginAttempts.get(identifier) || { count: 0, lastAttempt: now };

  attempts.count += 1;
  attempts.lastAttempt = now;

  if (attempts.count >= MAX_LOGIN_ATTEMPTS) {
    attempts.lockedUntil = now + LOCKOUT_DURATION_MS;
    logger.warn('Account locked due to too many failed attempts', { identifier, attempts: attempts.count });
  }

  loginAttempts.set(identifier, attempts);
};

/**
 * Clear login attempts on successful login
 */
export const clearLoginAttempts = (identifier: string): void => {
  loginAttempts.delete(identifier);
};

/**
 * reCAPTCHA verification middleware
 * Verifies Google reCAPTCHA v3 token
 */
export const verifyCaptcha = async (req: Request, res: Response, next: NextFunction) => {
  const recaptchaSecret = process.env.RECAPTCHA_SECRET_KEY;

  // Skip captcha if no secret configured (with warning)
  if (!recaptchaSecret) {
    if (process.env.NODE_ENV === 'production') {
      logger.warn('RECAPTCHA_SECRET_KEY not configured - CAPTCHA verification skipped. Configure reCAPTCHA for spam protection.');
    } else {
      logger.warn('Skipping CAPTCHA verification - RECAPTCHA_SECRET_KEY not set');
    }
    return next();
  }

  const captchaToken = req.body.captchaToken || req.body.recaptchaToken;

  if (!captchaToken) {
    return res.status(400).json({
      success: false,
      error: 'CAPTCHA verification required',
      statusCode: 400,
    });
  }

  try {
    const response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `secret=${recaptchaSecret}&response=${captchaToken}&remoteip=${req.ip}`,
    });

    const data = await response.json() as { success: boolean; score?: number; action?: string };

    if (!data.success) {
      logger.warn('CAPTCHA verification failed', { ip: req.ip });
      return res.status(400).json({
        success: false,
        error: 'CAPTCHA verification failed. Please try again.',
        statusCode: 400,
      });
    }

    // For reCAPTCHA v3, check score (0.0 - 1.0, higher is more likely human)
    if (data.score !== undefined && data.score < 0.5) {
      logger.warn('Low CAPTCHA score - possible bot', { ip: req.ip, score: data.score });
      return res.status(400).json({
        success: false,
        error: 'Suspicious activity detected. Please try again.',
        statusCode: 400,
      });
    }

    next();
  } catch (error) {
    logger.error('CAPTCHA verification error:', error);
    // In production, fail closed (deny access)
    if (process.env.NODE_ENV === 'production') {
      return res.status(500).json({
        success: false,
        error: 'CAPTCHA verification service unavailable',
        statusCode: 500,
      });
    }
    // In development, allow through with warning
    logger.warn('CAPTCHA verification failed, allowing in development mode');
    next();
  }
};

/**
 * HTTPS enforcement middleware
 * Redirects HTTP to HTTPS in production
 */
export const enforceHttps = (req: Request, res: Response, next: NextFunction) => {
  if (process.env.NODE_ENV !== 'production') {
    return next();
  }

  // Skip HTTPS enforcement for health check endpoint (internal monitoring)
  if (req.path === '/health') {
    return next();
  }

  // Check various headers that indicate HTTPS
  const isSecure =
    req.secure ||
    req.headers['x-forwarded-proto'] === 'https' ||
    req.headers['x-forwarded-ssl'] === 'on';

  if (!isSecure) {
    // For API requests, reject with error
    return res.status(403).json({
      success: false,
      error: 'HTTPS required',
      statusCode: 403,
    });
  }

  next();
};

/**
 * Security headers middleware (supplements helmet)
 */
export const securityHeaders = (req: Request, res: Response, next: NextFunction) => {
  // Strict Transport Security (HSTS)
  if (process.env.NODE_ENV === 'production') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }

  // Prevent clickjacking
  res.setHeader('X-Frame-Options', 'DENY');

  // Prevent MIME type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');

  // XSS Protection
  res.setHeader('X-XSS-Protection', '1; mode=block');

  // Referrer Policy
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Permissions Policy
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');

  next();
};

/**
 * Validate JWT secret is configured
 * Should be called at startup
 */
export const validateJwtSecret = (): void => {
  const secret = process.env.JWT_SECRET;

  if (!secret || secret === 'your-secret-key' || secret === 'your-secret-key-here') {
    if (process.env.NODE_ENV === 'production') {
      logger.error('CRITICAL: JWT_SECRET must be set to a secure value in production!');
      throw new Error('JWT_SECRET not properly configured');
    } else {
      logger.warn('WARNING: Using insecure default JWT_SECRET. Set JWT_SECRET environment variable.');
    }
  }

  if (secret && secret.length < 32) {
    logger.warn('WARNING: JWT_SECRET should be at least 32 characters for security');
  }
};
