import { Router, Request, Response } from 'express';
import { authenticate } from '../middleware/auth';
import { logger } from '../config/logger';
import { query } from '../database/connection';

const router = Router();

/**
 * @route   GET /api/v1/notifications
 * @desc    Get user notifications
 * @access  Private
 */
router.get('/', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { limit = 50, unreadOnly = false } = req.query;

    let queryText = `
      SELECT id, type, title, message, data, is_read, read_at, created_at
      FROM notifications
      WHERE user_id = $1
    `;
    const params: any[] = [userId];

    if (unreadOnly === 'true') {
      queryText += ' AND is_read = false';
    }

    queryText += ` ORDER BY created_at DESC LIMIT $${params.length + 1}`;
    params.push(Number(limit));

    const result = await query(queryText, params);

    // Get unread count
    const unreadResult = await query(
      'SELECT COUNT(*) FROM notifications WHERE user_id = $1 AND is_read = false',
      [userId]
    );

    res.status(200).json({
      success: true,
      data: result.rows,
      unreadCount: parseInt(unreadResult.rows[0].count),
      statusCode: 200,
    });
  } catch (error) {
    logger.error('Get notifications error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch notifications',
      statusCode: 500,
    });
  }
});

/**
 * @route   PUT /api/v1/notifications/:id/read
 * @desc    Mark notification as read
 * @access  Private
 */
router.put('/:id/read', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { id } = req.params;

    const result = await query(
      `UPDATE notifications
       SET is_read = true, read_at = CURRENT_TIMESTAMP
       WHERE id = $1 AND user_id = $2
       RETURNING id`,
      [id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Notification not found',
        statusCode: 404,
      });
    }

    res.status(200).json({
      success: true,
      message: 'Notification marked as read',
      statusCode: 200,
    });
  } catch (error) {
    logger.error('Mark read error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to mark notification',
      statusCode: 500,
    });
  }
});

/**
 * @route   PUT /api/v1/notifications/read-all
 * @desc    Mark all notifications as read
 * @access  Private
 */
router.put('/read-all', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;

    await query(
      `UPDATE notifications
       SET is_read = true, read_at = CURRENT_TIMESTAMP
       WHERE user_id = $1 AND is_read = false`,
      [userId]
    );

    res.status(200).json({
      success: true,
      message: 'All notifications marked as read',
      statusCode: 200,
    });
  } catch (error) {
    logger.error('Mark all read error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to mark notifications',
      statusCode: 500,
    });
  }
});

/**
 * @route   DELETE /api/v1/notifications/:id
 * @desc    Delete notification
 * @access  Private
 */
router.delete('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { id } = req.params;

    const result = await query(
      'DELETE FROM notifications WHERE id = $1 AND user_id = $2 RETURNING id',
      [id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Notification not found',
        statusCode: 404,
      });
    }

    res.status(200).json({
      success: true,
      message: 'Notification deleted',
      statusCode: 200,
    });
  } catch (error) {
    logger.error('Delete notification error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete notification',
      statusCode: 500,
    });
  }
});

/**
 * @route   DELETE /api/v1/notifications
 * @desc    Delete all notifications
 * @access  Private
 */
router.delete('/', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;

    await query('DELETE FROM notifications WHERE user_id = $1', [userId]);

    res.status(200).json({
      success: true,
      message: 'All notifications deleted',
      statusCode: 200,
    });
  } catch (error) {
    logger.error('Delete all notifications error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete notifications',
      statusCode: 500,
    });
  }
});

// Helper function to create notifications (exported for use in other services)
export async function createNotification(
  userId: number,
  type: string,
  title: string,
  message: string,
  data?: any
): Promise<void> {
  try {
    await query(
      `INSERT INTO notifications (user_id, type, title, message, data)
       VALUES ($1, $2, $3, $4, $5)`,
      [userId, type, title, message, data ? JSON.stringify(data) : null]
    );
  } catch (error) {
    logger.error('Create notification error:', error);
  }
}

export default router;
