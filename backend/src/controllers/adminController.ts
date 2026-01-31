import { Request, Response } from 'express';
import { query } from '../database/connection';
import { logger } from '../config/logger';

export const getAdminStats = async (req: Request, res: Response) => {
  try {
    const totalUsersResult = await query('SELECT COUNT(*) as count FROM users');
    const totalUsers = parseInt(totalUsersResult.rows[0].count);

    const tierResult = await query(
      'SELECT subscription_tier, COUNT(*) as count FROM users GROUP BY subscription_tier'
    );
    const usersByTier = tierResult.rows.reduce((acc: any, row: any) => {
      acc[row.subscription_tier] = parseInt(row.count);
      return acc;
    }, {});

    const todayResult = await query(
      "SELECT COUNT(*) as count FROM users WHERE DATE(created_at) = CURRENT_DATE"
    );
    const newUsersToday = parseInt(todayResult.rows[0].count);

    const weekResult = await query(
      "SELECT COUNT(*) as count FROM users WHERE created_at >= CURRENT_DATE - INTERVAL '7 days'"
    );
    const newUsersThisWeek = parseInt(weekResult.rows[0].count);

    const monthResult = await query(
      "SELECT COUNT(*) as count FROM users WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'"
    );
    const newUsersThisMonth = parseInt(monthResult.rows[0].count);

    const avgPointsResult = await query('SELECT AVG(points) as avg FROM users');
    const avgPoints = Math.round(parseFloat(avgPointsResult.rows[0].avg) || 0);

    const totalPointsResult = await query('SELECT SUM(points) as total FROM users');
    const totalPoints = parseInt(totalPointsResult.rows[0].total) || 0;

    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        newUsersToday,
        newUsersThisWeek,
        newUsersThisMonth,
        usersByTier,
        avgPoints,
        totalPoints,
      },
      statusCode: 200,
    });
  } catch (error: any) {
    logger.error('Get admin stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch admin stats',
      statusCode: 500,
    });
  }
};

export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = (page - 1) * limit;

    const countResult = await query('SELECT COUNT(*) as count FROM users');
    const total = parseInt(countResult.rows[0].count);

    const usersResult = await query(
      `SELECT id, username, email, subscription_tier, points, current_level, created_at 
       FROM users 
       ORDER BY created_at DESC 
       LIMIT \$1 OFFSET \$2`,
      [limit, offset]
    );

    const users = usersResult.rows.map((user: any) => ({
      id: user.id,
      username: user.username,
      email: user.email,
      subscriptionTier: user.subscription_tier,
      points: user.points,
      level: user.current_level,
      createdAt: user.created_at,
    }));

    res.status(200).json({
      success: true,
      data: {
        users,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
      statusCode: 200,
    });
  } catch (error: any) {
    logger.error('Get all users error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch users',
      statusCode: 500,
    });
  }
};

export const getRecentActivity = async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;

    const activityResult = await query(
      `SELECT id, username, email, subscription_tier, points, current_level, created_at 
       FROM users 
       ORDER BY created_at DESC 
       LIMIT \$1`,
      [limit]
    );

    const recentUsers = activityResult.rows.map((user: any) => ({
      id: user.id,
      username: user.username,
      email: user.email,
      subscriptionTier: user.subscription_tier,
      points: user.points,
      level: user.current_level,
      createdAt: user.created_at,
    }));

    res.status(200).json({
      success: true,
      data: recentUsers,
      statusCode: 200,
    });
  } catch (error: any) {
    logger.error('Get recent activity error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch recent activity',
      statusCode: 500,
    });
  }
};

export const updateUserTier = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { tier } = req.body;

    if (!['free', 'premium', 'premium_plus'].includes(tier)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid subscription tier',
        statusCode: 400,
      });
    }

    await query(
      'UPDATE users SET subscription_tier = \$1, updated_at = NOW() WHERE id = \$2',
      [tier, userId]
    );

    res.status(200).json({
      success: true,
      message: 'User tier updated successfully',
      statusCode: 200,
    });
  } catch (error: any) {
    logger.error('Update user tier error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update user tier',
      statusCode: 500,
    });
  }
};

export const getAllListings = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = (page - 1) * limit;
    const search = req.query.search as string || '';
    const status = req.query.status as string || '';
    const userId = req.query.userId as string || '';

    // Build dynamic query
    let whereClause = 'WHERE l.deleted_at IS NULL';
    const params: any[] = [];
    let paramIndex = 1;

    if (search) {
      whereClause += ` AND (l.title ILIKE $${paramIndex} OR l.description ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    if (status) {
      whereClause += ` AND l.status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    if (userId) {
      whereClause += ` AND l.user_id = $${paramIndex}`;
      params.push(parseInt(userId));
      paramIndex++;
    }

    // Get total count
    const countResult = await query(
      `SELECT COUNT(*) as count FROM listings l ${whereClause}`,
      params
    );
    const total = parseInt(countResult.rows[0].count);

    // Get listings with user info
    const listingsResult = await query(
      `SELECT
        l.id,
        l.user_id,
        l.title,
        l.description,
        l.category,
        l.price,
        l.condition,
        l.status,
        l.ai_generated,
        l.created_at,
        l.updated_at,
        CASE
          WHEN jsonb_array_length(l.photos) > 0
          THEN l.photos->0
          ELSE NULL
        END as first_photo,
        jsonb_array_length(l.photos) as photo_count,
        u.username,
        u.email
      FROM listings l
      JOIN users u ON l.user_id = u.id
      ${whereClause}
      ORDER BY l.created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
      [...params, limit, offset]
    );

    const listings = listingsResult.rows.map((row: any) => ({
      id: row.id,
      userId: row.user_id,
      title: row.title,
      description: row.description,
      category: row.category,
      price: parseFloat(row.price) || 0,
      condition: row.condition,
      status: row.status,
      aiGenerated: row.ai_generated,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      firstPhoto: row.first_photo,
      photoCount: row.photo_count,
      username: row.username,
      userEmail: row.email,
    }));

    res.status(200).json({
      success: true,
      data: {
        listings,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
      statusCode: 200,
    });
  } catch (error: any) {
    logger.error('Get all listings error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch listings',
      statusCode: 500,
    });
  }
};
