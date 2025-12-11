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
