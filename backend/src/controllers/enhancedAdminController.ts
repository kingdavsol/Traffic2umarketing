import { Request, Response } from 'express';
import { query } from '../database/connection';
import { logger } from '../config/logger';

/**
 * Get comprehensive admin dashboard statistics
 */
export const getEnhancedAdminStats = async (req: Request, res: Response) => {
  try {
    // User statistics
    const totalUsersResult = await query('SELECT COUNT(*) as count FROM users');
    const totalUsers = parseInt(totalUsersResult.rows[0].count);

    const tierResult = await query(
      'SELECT subscription_tier, COUNT(*) as count FROM users GROUP BY subscription_tier'
    );
    const usersByTier = tierResult.rows.reduce((acc: any, row: any) => {
      acc[row.subscription_tier] = parseInt(row.count);
      return acc;
    }, {});

    // Listing statistics
    const totalListingsResult = await query('SELECT COUNT(*) as count FROM listings');
    const totalListings = parseInt(totalListingsResult.rows[0].count);

    const activeListingsResult = await query(
      "SELECT COUNT(*) as count FROM listings WHERE status = 'active'"
    );
    const activeListings = parseInt(activeListingsResult.rows[0].count);

    // AI Analysis statistics (critical for cost monitoring)
    const totalAIRunsResult = await query('SELECT COUNT(*) as count FROM ai_analysis_log');
    const totalAIRuns = parseInt(totalAIRunsResult.rows[0].count || 0);

    const aiRunsTodayResult = await query(
      "SELECT COUNT(*) as count FROM ai_analysis_log WHERE DATE(created_at) = CURRENT_DATE"
    );
    const aiRunsToday = parseInt(aiRunsTodayResult.rows[0].count || 0);

    const aiRunsThisMonthResult = await query(
      "SELECT COUNT(*) as count FROM ai_analysis_log WHERE created_at >= DATE_TRUNC('month', CURRENT_DATE)"
    );
    const aiRunsThisMonth = parseInt(aiRunsThisMonthResult.rows[0].count || 0);

    const totalAICostResult = await query('SELECT SUM(cost_usd) as total FROM ai_analysis_log');
    const totalAICost = parseFloat(totalAICostResult.rows[0].total || 0);

    const aiCostThisMonthResult = await query(
      "SELECT SUM(cost_usd) as total FROM ai_analysis_log WHERE created_at >= DATE_TRUNC('month', CURRENT_DATE)"
    );
    const aiCostThisMonth = parseFloat(aiCostThisMonthResult.rows[0].total || 0);

    // Marketplace statistics
    const totalMarketplaceConnectionsResult = await query(
      'SELECT COUNT(*) as count FROM marketplace_accounts WHERE is_active = true'
    );
    const totalMarketplaceConnections = parseInt(totalMarketplaceConnectionsResult.rows[0].count);

    const marketplaceBreakdownResult = await query(
      'SELECT marketplace_name, COUNT(*) as count FROM marketplace_accounts WHERE is_active = true GROUP BY marketplace_name'
    );
    const marketplaceBreakdown = marketplaceBreakdownResult.rows.reduce((acc: any, row: any) => {
      acc[row.marketplace_name] = parseInt(row.count);
      return acc;
    }, {});

    // Recent activity statistics
    const newUsersToday = await query(
      "SELECT COUNT(*) as count FROM users WHERE DATE(created_at) = CURRENT_DATE"
    );

    const newListingsToday = await query(
      "SELECT COUNT(*) as count FROM listings WHERE DATE(created_at) = CURRENT_DATE"
    );

    res.status(200).json({
      success: true,
      data: {
        users: {
          total: totalUsers,
          byTier: usersByTier,
          newToday: parseInt(newUsersToday.rows[0].count),
        },
        listings: {
          total: totalListings,
          active: activeListings,
          newToday: parseInt(newListingsToday.rows[0].count),
        },
        aiAnalysis: {
          totalRuns: totalAIRuns,
          runsToday: aiRunsToday,
          runsThisMonth: aiRunsThisMonth,
          totalCost: totalAICost.toFixed(2),
          costThisMonth: aiCostThisMonth.toFixed(2),
        },
        marketplaces: {
          totalConnections: totalMarketplaceConnections,
          breakdown: marketplaceBreakdown,
        },
      },
      statusCode: 200,
    });
  } catch (error: any) {
    logger.error('Get enhanced admin stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch admin stats',
      statusCode: 500,
    });
  }
};

/**
 * Get detailed user list with listing and marketplace data
 */
export const getEnhancedUserList = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = (page - 1) * limit;
    const search = req.query.search as string || '';

    let whereClause = '';
    let params: any[] = [limit, offset];

    if (search) {
      whereClause = 'WHERE u.email ILIKE $3 OR u.username ILIKE $3';
      params.push(`%${search}%`);
    }

    const countResult = await query(
      `SELECT COUNT(*) as count FROM users u ${whereClause}`,
      search ? [`%${search}%`] : []
    );
    const total = parseInt(countResult.rows[0].count);

    const usersResult = await query(
      `SELECT
        u.id,
        u.username,
        u.email,
        u.subscription_tier,
        u.points,
        u.current_level,
        u.is_admin,
        u.created_at,
        COUNT(DISTINCT l.id) as listing_count,
        COUNT(DISTINCT ma.id) as marketplace_count,
        COUNT(DISTINCT ai.id) as ai_analysis_count,
        SUM(ai.cost_usd) as total_ai_cost
      FROM users u
      LEFT JOIN listings l ON u.id = l.user_id AND l.deleted_at IS NULL
      LEFT JOIN marketplace_accounts ma ON u.id = ma.user_id AND ma.is_active = true
      LEFT JOIN ai_analysis_log ai ON u.id = ai.user_id
      ${whereClause}
      GROUP BY u.id, u.username, u.email, u.subscription_tier, u.points, u.current_level, u.is_admin, u.created_at
      ORDER BY u.created_at DESC
      LIMIT $1 OFFSET $2`,
      params
    );

    const users = usersResult.rows.map((user: any) => ({
      id: user.id,
      username: user.username,
      email: user.email,
      subscriptionTier: user.subscription_tier,
      points: user.points,
      level: user.current_level,
      isAdmin: user.is_admin,
      createdAt: user.created_at,
      listingCount: parseInt(user.listing_count) || 0,
      marketplaceCount: parseInt(user.marketplace_count) || 0,
      aiAnalysisCount: parseInt(user.ai_analysis_count) || 0,
      totalAICost: parseFloat(user.total_ai_cost) || 0,
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
    logger.error('Get enhanced user list error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch users',
      statusCode: 500,
    });
  }
};

/**
 * Get detailed user information including marketplaces
 */
export const getUserDetails = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    const userResult = await query(
      `SELECT
        u.id, u.username, u.email, u.subscription_tier, u.points, u.current_level, u.is_admin, u.created_at,
        COUNT(DISTINCT l.id) as listing_count,
        COUNT(DISTINCT ma.id) as marketplace_count
      FROM users u
      LEFT JOIN listings l ON u.id = l.user_id AND l.deleted_at IS NULL
      LEFT JOIN marketplace_accounts ma ON u.id = ma.user_id AND ma.is_active = true
      WHERE u.id = $1
      GROUP BY u.id`,
      [userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
        statusCode: 404,
      });
    }

    const user = userResult.rows[0];

    // Get listings
    const listingsResult = await query(
      `SELECT id, title, status, price, category, created_at, marketplace_listings
      FROM listings
      WHERE user_id = $1 AND deleted_at IS NULL
      ORDER BY created_at DESC
      LIMIT 10`,
      [userId]
    );

    // Get marketplace connections
    const marketplacesResult = await query(
      `SELECT marketplace_name, account_name, is_active, created_at
      FROM marketplace_accounts
      WHERE user_id = $1
      ORDER BY created_at DESC`,
      [userId]
    );

    // Get AI analysis history
    const aiHistoryResult = await query(
      `SELECT analysis_type, photos_count, cost_usd, success, created_at
      FROM ai_analysis_log
      WHERE user_id = $1
      ORDER BY created_at DESC
      LIMIT 20`,
      [userId]
    );

    res.status(200).json({
      success: true,
      data: {
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          subscriptionTier: user.subscription_tier,
          points: user.points,
          level: user.current_level,
          isAdmin: user.is_admin,
          createdAt: user.created_at,
          listingCount: parseInt(user.listing_count) || 0,
          marketplaceCount: parseInt(user.marketplace_count) || 0,
        },
        listings: listingsResult.rows,
        marketplaces: marketplacesResult.rows,
        aiHistory: aiHistoryResult.rows,
      },
      statusCode: 200,
    });
  } catch (error: any) {
    logger.error('Get user details error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch user details',
      statusCode: 500,
    });
  }
};

/**
 * Get AI analysis usage report
 */
export const getAIAnalysisReport = async (req: Request, res: Response) => {
  try {
    const days = parseInt(req.query.days as string) || 30;

    // Total stats
    const totalResult = await query(
      `SELECT
        COUNT(*) as total_runs,
        SUM(cost_usd) as total_cost,
        AVG(processing_time_ms) as avg_time
      FROM ai_analysis_log
      WHERE created_at >= CURRENT_DATE - INTERVAL '${days} days'`
    );

    // By user
    const byUserResult = await query(
      `SELECT
        u.id, u.username, u.email,
        COUNT(ai.id) as run_count,
        SUM(ai.cost_usd) as total_cost
      FROM ai_analysis_log ai
      JOIN users u ON ai.user_id = u.id
      WHERE ai.created_at >= CURRENT_DATE - INTERVAL '${days} days'
      GROUP BY u.id, u.username, u.email
      ORDER BY run_count DESC
      LIMIT 20`
    );

    // By day
    const byDayResult = await query(
      `SELECT
        DATE(created_at) as date,
        COUNT(*) as runs,
        SUM(cost_usd) as cost
      FROM ai_analysis_log
      WHERE created_at >= CURRENT_DATE - INTERVAL '${days} days'
      GROUP BY DATE(created_at)
      ORDER BY date DESC`
    );

    res.status(200).json({
      success: true,
      data: {
        summary: {
          totalRuns: parseInt(totalResult.rows[0].total_runs) || 0,
          totalCost: parseFloat(totalResult.rows[0].total_cost) || 0,
          avgProcessingTime: parseInt(totalResult.rows[0].avg_time) || 0,
        },
        byUser: byUserResult.rows,
        byDay: byDayResult.rows,
      },
      statusCode: 200,
    });
  } catch (error: any) {
    logger.error('Get AI analysis report error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch AI analysis report',
      statusCode: 500,
    });
  }
};
