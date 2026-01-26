import { Request, Response } from 'express';
import jwt from 'jwt-simple';
import bcryptjs from 'bcryptjs';
import { logger } from '../config/logger';
import { AppError } from '../middleware/errorHandler';
import { createUser, getUserByEmail } from '../services/userService';
import { sendWelcomeEmail } from '../services/emailService';
import { trackUserRegistration, trackUserLogin } from '../services/analyticsService';
import { trackReferralSignup, validateReferralCode, completeReferral } from '../services/referralService';

export const register = async (req: Request, res: Response) => {
  try {
    const { username, email, password, referralCode } = req.body;

    // Validate input
    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields',
        statusCode: 400,
      });
    }

    // Validate referral code if provided
    if (referralCode) {
      const isValid = await validateReferralCode(referralCode);
      if (!isValid) {
        return res.status(400).json({
          success: false,
          error: 'Invalid referral code',
          statusCode: 400,
        });
      }
    }

    // Check if user exists
    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      return res.status(409).json({
        success: false,
        error: 'User with this email already exists',
        statusCode: 409,
      });
    }

    // Hash password
    const salt = await bcryptjs.genSalt(10);
    const passwordHash = await bcryptjs.hash(password, salt);

    // Create user in database
    const user = await createUser(username, email, passwordHash);

    // Track referral if code was provided
    if (referralCode) {
      try {
        const referral = await trackReferralSignup(referralCode, email, user.id);
        // Complete referral immediately and award credits
        await completeReferral(referral.id, 5);
        logger.info('Referral tracked and completed', { referralId: referral.id, userId: user.id });
      } catch (error: any) {
        // Log but don't block registration if referral tracking fails
        logger.error('Failed to track referral during registration', {
          email,
          referralCode,
          error: error.message
        });
      }
    }

    // Send welcome email with referral link (non-blocking - don't wait for result)
    // Email failure should not block user registration
    sendWelcomeEmail({ email, username, userId: user.id }).catch((error) => {
      logger.error('Failed to send welcome email during registration', {
        email,
        error: error.message
      });
    });

    // Track user registration in analytics
    trackUserRegistration(user.id, email, username);

    // Create JWT token
    const token = jwt.encode(
      {
        userId: user.id,
        email: user.email,
        exp: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60) // 7 days
      },
      process.env.JWT_SECRET || 'your-secret-key'
    );

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      statusCode: 201,
      data: {
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
        },
      },
    });
  } catch (error: any) {
    logger.error('Registration error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Registration failed',
      statusCode: 500,
    });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password required',
        statusCode: 400,
      });
    }

    // Find user by email
    const user = await getUserByEmail(email);
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password',
        statusCode: 401,
      });
    }

    // Compare passwords
    const isPasswordValid = await bcryptjs.compare(password, user.password_hash);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password',
        statusCode: 401,
      });
    }

    // Track user login in analytics
    trackUserLogin(user.id, user.email);

    // Generate JWT token
    const token = jwt.encode(
      {
        userId: user.id,
        email: user.email,
        exp: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60) // 7 days
      },
      process.env.JWT_SECRET || 'your-secret-key'
    );

    res.status(200).json({
      success: true,
      message: 'Login successful',
      statusCode: 200,
      data: {
        token,
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          isAdmin: user.is_admin || false,
        },
      },
    });
  } catch (error: any) {
    logger.error('Login error:', error);
    res.status(401).json({
      success: false,
      error: error.message || 'Login failed',
      statusCode: 401,
    });
  }
};

export const logout = async (req: Request, res: Response) => {
  try {
    res.status(200).json({
      success: true,
      message: 'Logged out successfully',
      statusCode: 200,
    });
  } catch (error) {
    logger.error('Logout error:', error);
    res.status(500).json({
      success: false,
      error: 'Logout failed',
      statusCode: 500,
    });
  }
};

export const refreshToken = async (req: Request, res: Response) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'No token provided',
        statusCode: 401,
      });
    }

    const oldToken = authHeader.replace('Bearer ', '');

    // Decode existing token (allow expired tokens for refresh)
    let decoded;
    try {
      decoded = jwt.decode(oldToken, process.env.JWT_SECRET || 'your-secret-key', true);
    } catch (decodeError) {
      return res.status(401).json({
        success: false,
        error: 'Invalid token',
        statusCode: 401,
      });
    }

    if (!decoded.userId) {
      return res.status(401).json({
        success: false,
        error: 'Invalid token payload',
        statusCode: 401,
      });
    }

    // Verify user still exists and is active
    const user = await getUserByEmail(decoded.email);
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'User no longer exists',
        statusCode: 401,
      });
    }

    // Generate new token with fresh expiration
    const newToken = jwt.encode(
      {
        userId: user.id,
        email: user.email,
        exp: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60), // 7 days
      },
      process.env.JWT_SECRET || 'your-secret-key'
    );

    res.status(200).json({
      success: true,
      message: 'Token refreshed successfully',
      data: {
        token: newToken,
        expiresIn: 7 * 24 * 60 * 60, // seconds
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          subscriptionTier: user.subscription_tier,
          isAdmin: user.is_admin || false,
        },
      },
      statusCode: 200,
    });
  } catch (error) {
    logger.error('Token refresh error:', error);
    res.status(401).json({
      success: false,
      error: 'Token refresh failed',
      statusCode: 401,
    });
  }
};
