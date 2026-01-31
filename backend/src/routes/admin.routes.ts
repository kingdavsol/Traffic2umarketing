import { Router, Request, Response } from 'express';
import { authenticate } from '../middleware/auth';
import { query } from '../database/connection';
import { logger } from '../config/logger';
import {
  getAdminStats,
  getAllUsers,
  getRecentActivity,
  updateUserTier,
  getAllListings,
} from '../controllers/adminController';
import {
  getEnhancedAdminStats,
  getEnhancedUserList,
  getUserDetails,
  getAIAnalysisReport,
} from '../controllers/enhancedAdminController';

const router = Router();

// Admin middleware - check if user is admin
const isAdmin = async (req: any, res: any, next: any) => {
  try {
    const { query } = require('../database/connection');
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
        statusCode: 401,
      });
    }

    // Check if user has admin role
    const result = await query('SELECT is_admin FROM users WHERE id = $1', [userId]);

    if (!result.rows[0] || !result.rows[0].is_admin) {
      return res.status(403).json({
        success: false,
        error: 'Forbidden - Admin access required',
        statusCode: 403,
      });
    }

    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      statusCode: 500,
    });
  }
};

/**
 * @route   GET /api/v1/admin/stats
 * @desc    Get admin dashboard statistics
 * @access  Private (Admin only)
 */
router.get('/stats', authenticate, isAdmin, getAdminStats);

/**
 * @route   GET /api/v1/admin/users
 * @desc    Get all users with pagination
 * @access  Private (Admin only)
 */
router.get('/users', authenticate, isAdmin, getAllUsers);

/**
 * @route   GET /api/v1/admin/activity
 * @desc    Get recent user activity
 * @access  Private (Admin only)
 */
router.get('/activity', authenticate, isAdmin, getRecentActivity);

/**
 * @route   GET /api/v1/admin/listings
 * @desc    Get all listings across all users
 * @access  Private (Admin only)
 */
router.get('/listings', authenticate, isAdmin, getAllListings);

/**
 * @route   PUT /api/v1/admin/users/:userId/tier
 * @desc    Update user subscription tier
 * @access  Private (Admin only)
 */
router.put('/users/:userId/tier', authenticate, isAdmin, updateUserTier);

/**
 * Enhanced Admin Routes
 */

/**
 * @route   GET /api/v1/admin/stats/enhanced
 * @desc    Get comprehensive admin dashboard statistics
 * @access  Private (Admin only)
 */
router.get('/stats/enhanced', authenticate, isAdmin, getEnhancedAdminStats);

/**
 * @route   GET /api/v1/admin/users/enhanced
 * @desc    Get detailed user list with listings and marketplace data
 * @access  Private (Admin only)
 */
router.get('/users/enhanced', authenticate, isAdmin, getEnhancedUserList);

/**
 * @route   GET /api/v1/admin/users/:userId/details
 * @desc    Get detailed user information
 * @access  Private (Admin only)
 */
router.get('/users/:userId/details', authenticate, isAdmin, getUserDetails);

/**
 * @route   GET /api/v1/admin/ai-analysis/report
 * @desc    Get AI analysis usage report
 * @access  Private (Admin only)
 */
router.get('/ai-analysis/report', authenticate, isAdmin, getAIAnalysisReport);

/**
 * @route   DELETE /api/v1/admin/users/:userId
 * @desc    Delete a user account (soft delete)
 * @access  Private (Admin only)
 */
router.delete('/users/:userId', authenticate, isAdmin, async (req: Request, res: Response) => {
  try {
    const adminUserId = (req as any).userId;
    const { userId } = req.params;

    // Prevent admin from deleting themselves
    if (parseInt(userId) === adminUserId) {
      return res.status(400).json({
        success: false,
        error: 'Cannot delete your own account',
        statusCode: 400,
      });
    }

    // Check if user exists
    const userResult = await query('SELECT id, username, email FROM users WHERE id = $1', [userId]);
    if (userResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
        statusCode: 404,
      });
    }

    const user = userResult.rows[0];

    // Soft delete user's listings
    await query(
      'UPDATE listings SET deleted_at = CURRENT_TIMESTAMP WHERE user_id = $1 AND deleted_at IS NULL',
      [userId]
    );

    // Delete user's marketplace accounts
    await query('DELETE FROM marketplace_accounts WHERE user_id = $1', [userId]);

    // Delete user's notifications
    await query('DELETE FROM notifications WHERE user_id = $1', [userId]);

    // Delete user's notification preferences
    await query('DELETE FROM notification_preferences WHERE user_id = $1', [userId]);

    // Delete user's gamification data
    await query('DELETE FROM user_stats WHERE user_id = $1', [userId]);
    await query('DELETE FROM user_challenges WHERE user_id = $1', [userId]);

    // Finally, delete the user
    await query('DELETE FROM users WHERE id = $1', [userId]);

    // Log admin action
    logger.info(`Admin ${adminUserId} deleted user ${userId} (${user.username})`);

    res.status(200).json({
      success: true,
      message: `User ${user.username} (${user.email}) has been deleted`,
      statusCode: 200,
    });
  } catch (error: any) {
    logger.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete user',
      statusCode: 500,
    });
  }
});

/**
 * @route   POST /api/v1/admin/stats/reset
 * @desc    Reset all gamification statistics
 * @access  Private (Admin only)
 */
router.post('/stats/reset', authenticate, isAdmin, async (req: Request, res: Response) => {
  try {
    const adminUserId = (req as any).userId;
    const { resetType } = req.body; // 'all', 'points', 'badges', 'challenges'

    let resetCount = 0;

    if (!resetType || resetType === 'all') {
      // Reset all user stats
      const result = await query(`
        UPDATE user_stats SET
          points = 0,
          badges_earned = '[]'::jsonb,
          listing_streak = 0,
          updated_at = CURRENT_TIMESTAMP
      `);
      resetCount = result.rowCount || 0;

      // Reset all challenge progress
      await query(`
        UPDATE user_challenges SET
          progress = 0,
          completed = false,
          completed_at = NULL
      `);

      // Reset user points in users table
      await query('UPDATE users SET points = 0, current_level = 1');

      logger.info(`Admin ${adminUserId} reset ALL gamification stats`);
    } else if (resetType === 'points') {
      const result = await query('UPDATE user_stats SET points = 0, updated_at = CURRENT_TIMESTAMP');
      await query('UPDATE users SET points = 0');
      resetCount = result.rowCount || 0;
      logger.info(`Admin ${adminUserId} reset points for all users`);
    } else if (resetType === 'badges') {
      const result = await query("UPDATE user_stats SET badges_earned = '[]'::jsonb, updated_at = CURRENT_TIMESTAMP");
      resetCount = result.rowCount || 0;
      logger.info(`Admin ${adminUserId} reset badges for all users`);
    } else if (resetType === 'challenges') {
      const result = await query(`
        UPDATE user_challenges SET
          progress = 0,
          completed = false,
          completed_at = NULL
      `);
      resetCount = result.rowCount || 0;
      logger.info(`Admin ${adminUserId} reset challenge progress for all users`);
    } else {
      return res.status(400).json({
        success: false,
        error: 'Invalid reset type. Use: all, points, badges, or challenges',
        statusCode: 400,
      });
    }

    res.status(200).json({
      success: true,
      message: `Successfully reset ${resetType || 'all'} statistics`,
      data: {
        resetType: resetType || 'all',
        usersAffected: resetCount,
      },
      statusCode: 200,
    });
  } catch (error: any) {
    logger.error('Reset stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to reset statistics',
      statusCode: 500,
    });
  }
});

/**
 * @route   PUT /api/v1/admin/users/:userId/admin
 * @desc    Toggle admin status for a user
 * @access  Private (Admin only)
 */
router.put('/users/:userId/admin', authenticate, isAdmin, async (req: Request, res: Response) => {
  try {
    const adminUserId = (req as any).userId;
    const { userId } = req.params;
    const { isAdmin: makeAdmin } = req.body;

    // Prevent admin from removing their own admin status
    if (parseInt(userId) === adminUserId && !makeAdmin) {
      return res.status(400).json({
        success: false,
        error: 'Cannot remove your own admin status',
        statusCode: 400,
      });
    }

    const result = await query(
      'UPDATE users SET is_admin = $1 WHERE id = $2 RETURNING id, username, email, is_admin',
      [makeAdmin, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
        statusCode: 404,
      });
    }

    const user = result.rows[0];
    logger.info(`Admin ${adminUserId} ${makeAdmin ? 'granted' : 'revoked'} admin status for user ${userId}`);

    res.status(200).json({
      success: true,
      message: `Admin status ${makeAdmin ? 'granted to' : 'revoked from'} ${user.username}`,
      data: {
        userId: user.id,
        username: user.username,
        email: user.email,
        isAdmin: user.is_admin,
      },
      statusCode: 200,
    });
  } catch (error: any) {
    logger.error('Toggle admin status error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update admin status',
      statusCode: 500,
    });
  }
});

export default router;
