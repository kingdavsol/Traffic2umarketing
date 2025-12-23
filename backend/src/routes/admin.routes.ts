import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import {
  getAdminStats,
  getAllUsers,
  getRecentActivity,
  updateUserTier,
} from '../controllers/adminController';

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
 * @route   PUT /api/v1/admin/users/:userId/tier
 * @desc    Update user subscription tier
 * @access  Private (Admin only)
 */
router.put('/users/:userId/tier', authenticate, isAdmin, updateUserTier);

export default router;
