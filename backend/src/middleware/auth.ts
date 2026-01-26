import { Request, Response, NextFunction } from 'express';
import jwt from 'jwt-simple';
import { logger } from '../config/logger';
import { AppError } from './errorHandler';
import { query } from '../database/connection';

export interface AuthRequest extends Request {
  userId?: number;
  token?: string;
  userRole?: string;
  isAdmin?: boolean;
}

export const authenticate = (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      throw new AppError('No authentication token provided', 401);
    }

    const decoded = jwt.decode(
      token,
      process.env.JWT_SECRET || 'your-secret-key',
      true
    );

    if (!decoded.userId) {
      throw new AppError('Invalid token', 401);
    }

    req.userId = decoded.userId;
    req.token = token;

    next();
  } catch (error) {
    logger.error('Authentication error:', error);
    res.status(401).json({
      success: false,
      error: 'Unauthorized',
      statusCode: 401
    });
  }
};

export const authorize = (...roles: string[]) => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.userId) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
        statusCode: 401
      });
    }

    try {
      // Check user roles in database
      const result = await query(
        'SELECT subscription_tier, is_admin FROM users WHERE id = $1',
        [req.userId]
      );

      if (result.rows.length === 0) {
        return res.status(401).json({
          success: false,
          error: 'User not found',
          statusCode: 401
        });
      }

      const user = result.rows[0];
      req.userRole = user.subscription_tier;
      req.isAdmin = user.is_admin || false;

      // Admin users bypass role checks
      if (user.is_admin) {
        return next();
      }

      // Check if user's subscription tier is in allowed roles
      // Roles hierarchy: premium_plus > premium > free
      const roleHierarchy: Record<string, number> = {
        free: 1,
        premium: 2,
        premium_plus: 3,
      };

      const userLevel = roleHierarchy[user.subscription_tier] || 0;
      const hasRequiredRole = roles.some(role => {
        const requiredLevel = roleHierarchy[role] || 0;
        return userLevel >= requiredLevel;
      });

      if (!hasRequiredRole && roles.length > 0) {
        return res.status(403).json({
          success: false,
          error: `This feature requires ${roles.join(' or ')} subscription`,
          statusCode: 403
        });
      }

      next();
    } catch (error) {
      logger.error('Authorization error:', error);
      return res.status(500).json({
        success: false,
        error: 'Authorization check failed',
        statusCode: 500
      });
    }
  };
};

// Export alias for backward compatibility
export const authMiddleware = authenticate;
