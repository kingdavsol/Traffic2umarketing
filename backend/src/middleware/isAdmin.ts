import { Request, Response, NextFunction } from 'express';
import { logger } from '../config/logger';

export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = (req as any).user;

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
        statusCode: 401,
      });
    }

    const isAdminUser = user.email?.endsWith('@admin.quicksell.monster') || user.isAdmin === true;

    if (!isAdminUser) {
      logger.warn('Non-admin user ' + user.email + ' attempted to access admin endpoint');
      return res.status(403).json({
        success: false,
        error: 'Admin access required',
        statusCode: 403,
      });
    }

    next();
  } catch (error) {
    logger.error('Admin middleware error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error',
      statusCode: 500,
    });
  }
};
