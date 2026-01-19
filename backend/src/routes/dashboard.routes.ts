import { Router, Request, Response } from 'express';
import { authenticate } from '../middleware/auth';
import { logger } from '../config/logger';
import { query } from '../database/connection';

const router = Router();

/**
 * @route   GET /api/v1/dashboard/stats
 * @desc    Get dashboard statistics for authenticated user
 * @access  Private
 */
router.get('/stats', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;

    // Get active listings count
    const listingsResult = await query(
      `SELECT COUNT(*) as count
       FROM listings
       WHERE user_id = $1
         AND deleted_at IS NULL
         AND status IN ('published', 'draft', 'publishing')`,
      [userId]
    );

    // Get total earnings from completed sales
    const earningsResult = await query(
      `SELECT COALESCE(SUM(sale_price), 0) as total
       FROM sales
       WHERE user_id = $1
         AND status = 'completed'`,
      [userId]
    );

    // Get items sold count
    const soldResult = await query(
      `SELECT COUNT(*) as count
       FROM sales
       WHERE user_id = $1
         AND status = 'completed'`,
      [userId]
    );

    res.status(200).json({
      success: true,
      data: {
        activeListings: parseInt(listingsResult.rows[0]?.count || '0'),
        totalEarnings: parseFloat(earningsResult.rows[0]?.total || '0'),
        itemsSold: parseInt(soldResult.rows[0]?.count || '0'),
      },
      statusCode: 200
    });
  } catch (error) {
    logger.error('Get dashboard stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch dashboard stats',
      statusCode: 500
    });
  }
});

export default router;
