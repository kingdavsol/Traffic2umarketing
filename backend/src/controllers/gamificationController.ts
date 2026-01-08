/**
 * Gamification Controller
 * Handles user points, badges, levels, and achievements
 */

import { Request, Response } from 'express';
import { logger } from '../config/logger';
import { query } from '../database/connection';

// Badge definitions
const BADGES = {
  FIRST_LISTING: { id: 'first_listing', name: 'First Listing', description: 'Create your first listing', points: 50, icon: '📝' },
  FIRST_SALE: { id: 'first_sale', name: 'First Sale', description: 'Make your first sale', points: 100, icon: '💰' },
  SPEED_SELLER: { id: 'speed_seller', name: 'Speed Seller', description: 'Sell an item within 24 hours of listing', points: 150, icon: '⚡' },
  MULTI_MARKET: { id: 'multi_market', name: 'Multi-Market Master', description: 'Post to 3 different marketplaces', points: 100, icon: '🌐' },
  SALES_5: { id: 'sales_5', name: 'Rising Seller', description: 'Complete 5 sales', points: 200, icon: '🌟' },
  SALES_10: { id: 'sales_10', name: 'Pro Seller', description: 'Complete 10 sales', points: 300, icon: '🏆' },
  SALES_25: { id: 'sales_25', name: 'Elite Seller', description: 'Complete 25 sales', points: 500, icon: '👑' },
  REVENUE_100: { id: 'revenue_100', name: 'Century Club', description: 'Earn $100 in total sales', points: 150, icon: '💵' },
  REVENUE_500: { id: 'revenue_500', name: 'High Roller', description: 'Earn $500 in total sales', points: 300, icon: '💸' },
  REVENUE_1000: { id: 'revenue_1000', name: 'Tycoon', description: 'Earn $1,000 in total sales', points: 500, icon: '🤑' },
  STREAK_7: { id: 'streak_7', name: 'Weekly Warrior', description: 'List items 7 days in a row', points: 200, icon: '🔥' },
};

// Level thresholds
const LEVELS = [
  { level: 1, minPoints: 0, name: 'Beginner' },
  { level: 2, minPoints: 500, name: 'Novice' },
  { level: 3, minPoints: 1000, name: 'Apprentice' },
  { level: 4, minPoints: 2000, name: 'Intermediate' },
  { level: 5, minPoints: 3500, name: 'Advanced' },
  { level: 6, minPoints: 5500, name: 'Expert' },
  { level: 7, minPoints: 8000, name: 'Master' },
  { level: 8, minPoints: 12000, name: 'Grandmaster' },
  { level: 9, minPoints: 17000, name: 'Legend' },
  { level: 10, minPoints: 25000, name: 'Mythic' },
];

/**
 * Calculate level from points
 */
function calculateLevel(points: number): { level: number; name: string; nextLevelPoints: number } {
  let currentLevel = LEVELS[0];

  for (const levelData of LEVELS) {
    if (points >= levelData.minPoints) {
      currentLevel = levelData;
    } else {
      break;
    }
  }

  // Find next level
  const nextLevelIndex = LEVELS.findIndex(l => l.level === currentLevel.level) + 1;
  const nextLevelPoints = nextLevelIndex < LEVELS.length
    ? LEVELS[nextLevelIndex].minPoints
    : currentLevel.minPoints;

  return {
    level: currentLevel.level,
    name: currentLevel.name,
    nextLevelPoints
  };
}

/**
 * Get user gamification stats
 * GET /api/v1/gamification/stats
 */
export const getUserStats = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;

    // Get or create user stats
    let statsResult = await query(
      'SELECT * FROM user_stats WHERE user_id = $1',
      [userId]
    );

    if (statsResult.rows.length === 0) {
      // Create initial stats
      statsResult = await query(
        `INSERT INTO user_stats (user_id, points, badges_earned, total_listings, total_sales, total_revenue)
         VALUES ($1, 0, '[]'::jsonb, 0, 0, 0)
         RETURNING *`,
        [userId]
      );
    }

    const stats = statsResult.rows[0];
    const levelInfo = calculateLevel(stats.points);

    res.status(200).json({
      success: true,
      data: {
        points: stats.points,
        level: levelInfo.level,
        levelName: levelInfo.name,
        nextLevelPoints: levelInfo.nextLevelPoints,
        pointsToNextLevel: levelInfo.nextLevelPoints - stats.points,
        badges: stats.badges_earned || [],
        totalListings: stats.total_listings,
        totalSales: stats.total_sales,
        totalRevenue: parseFloat(stats.total_revenue),
        streak: stats.listing_streak || 0,
        lastActivity: stats.last_activity_date,
      },
      statusCode: 200,
    });
  } catch (error) {
    logger.error('Get stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch stats',
      statusCode: 500,
    });
  }
};

/**
 * Get all available badges
 * GET /api/v1/gamification/badges
 */
export const getUserBadges = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;

    // Get user's earned badges
    const statsResult = await query(
      'SELECT badges_earned FROM user_stats WHERE user_id = $1',
      [userId]
    );

    const earnedBadges = statsResult.rows[0]?.badges_earned || [];

    // Return all badges with earned status
    const allBadges = Object.values(BADGES).map(badge => ({
      ...badge,
      earned: earnedBadges.includes(badge.id),
      earnedAt: earnedBadges.find((b: any) => b.id === badge.id)?.earnedAt || null
    }));

    res.status(200).json({
      success: true,
      data: allBadges,
      statusCode: 200,
    });
  } catch (error) {
    logger.error('Get badges error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch badges',
      statusCode: 500,
    });
  }
};

/**
 * Get leaderboard
 * GET /api/v1/gamification/leaderboard
 */
export const getLeaderboard = async (req: Request, res: Response) => {
  try {
    const { timeframe = 'all', category = 'points', limit = 50 } = req.query;

    let queryText = '';
    let params: any[] = [];

    if (category === 'points') {
      queryText = `
        SELECT
          u.id,
          u.email,
          u.full_name,
          us.points,
          us.total_sales,
          us.total_revenue
        FROM users u
        JOIN user_stats us ON u.id = us.user_id
        ORDER BY us.points DESC
        LIMIT $1
      `;
      params = [Number(limit)];
    } else if (category === 'sales') {
      queryText = `
        SELECT
          u.id,
          u.email,
          u.full_name,
          us.total_sales,
          us.total_revenue,
          us.points
        FROM users u
        JOIN user_stats us ON u.id = us.user_id
        ORDER BY us.total_sales DESC, us.total_revenue DESC
        LIMIT $1
      `;
      params = [Number(limit)];
    } else if (category === 'revenue') {
      queryText = `
        SELECT
          u.id,
          u.email,
          u.full_name,
          us.total_revenue,
          us.total_sales,
          us.points
        FROM users u
        JOIN user_stats us ON u.id = us.user_id
        ORDER BY us.total_revenue DESC
        LIMIT $1
      `;
      params = [Number(limit)];
    }

    const result = await query(queryText, params);

    // Add rank to each entry
    const leaderboard = result.rows.map((row: any, index: number) => ({
      rank: index + 1,
      userId: row.id,
      name: row.full_name || row.email.split('@')[0],
      points: row.points,
      totalSales: row.total_sales,
      totalRevenue: parseFloat(row.total_revenue || 0),
    }));

    res.status(200).json({
      success: true,
      data: leaderboard,
      statusCode: 200,
    });
  } catch (error) {
    logger.error('Get leaderboard error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch leaderboard',
      statusCode: 500,
    });
  }
};

/**
 * Award points to user and check for badge unlocks
 */
export const awardPoints = async (userId: number, points: number, reason: string) => {
  try {
    // Update user points
    await query(
      `INSERT INTO user_stats (user_id, points)
       VALUES ($1, $2)
       ON CONFLICT (user_id)
       DO UPDATE SET points = user_stats.points + $2`,
      [userId, points]
    );

    // Check for badge unlocks
    await checkBadgeUnlocks(userId);

    logger.info(`Awarded ${points} points to user ${userId} for: ${reason}`);
  } catch (error) {
    logger.error('Award points error:', error);
  }
};

/**
 * Check if user has unlocked any new badges
 */
async function checkBadgeUnlocks(userId: number) {
  try {
    // Get user stats
    const statsResult = await query(
      `SELECT
        us.*,
        (SELECT COUNT(*) FROM listings WHERE user_id = $1 AND deleted_at IS NULL) as listing_count,
        (SELECT COUNT(*) FROM sales WHERE user_id = $1 AND status = 'completed') as sale_count,
        (SELECT COALESCE(SUM(sale_price), 0) FROM sales WHERE user_id = $1 AND status = 'completed') as revenue,
        (SELECT COUNT(DISTINCT marketplace) FROM sales WHERE user_id = $1) as marketplace_count
       FROM user_stats us
       WHERE us.user_id = $1`,
      [userId]
    );

    if (statsResult.rows.length === 0) return;

    const stats = statsResult.rows[0];
    const earnedBadges = stats.badges_earned || [];
    const newBadges: string[] = [];

    // Check each badge condition
    if (stats.listing_count >= 1 && !earnedBadges.includes('first_listing')) {
      newBadges.push('first_listing');
    }
    if (stats.sale_count >= 1 && !earnedBadges.includes('first_sale')) {
      newBadges.push('first_sale');
    }
    if (stats.sale_count >= 5 && !earnedBadges.includes('sales_5')) {
      newBadges.push('sales_5');
    }
    if (stats.sale_count >= 10 && !earnedBadges.includes('sales_10')) {
      newBadges.push('sales_10');
    }
    if (stats.sale_count >= 25 && !earnedBadges.includes('sales_25')) {
      newBadges.push('sales_25');
    }
    if (parseFloat(stats.revenue) >= 100 && !earnedBadges.includes('revenue_100')) {
      newBadges.push('revenue_100');
    }
    if (parseFloat(stats.revenue) >= 500 && !earnedBadges.includes('revenue_500')) {
      newBadges.push('revenue_500');
    }
    if (parseFloat(stats.revenue) >= 1000 && !earnedBadges.includes('revenue_1000')) {
      newBadges.push('revenue_1000');
    }
    if (stats.marketplace_count >= 3 && !earnedBadges.includes('multi_market')) {
      newBadges.push('multi_market');
    }

    // Award new badges
    if (newBadges.length > 0) {
      const updatedBadges = [
        ...earnedBadges,
        ...newBadges.map(id => ({ id, earnedAt: new Date().toISOString() }))
      ];

      // Calculate bonus points for new badges
      const bonusPoints = newBadges.reduce((sum, badgeId) => {
        const badge = Object.values(BADGES).find(b => b.id === badgeId);
        return sum + (badge?.points || 0);
      }, 0);

      await query(
        `UPDATE user_stats
         SET badges_earned = $1, points = points + $2
         WHERE user_id = $3`,
        [JSON.stringify(updatedBadges), bonusPoints, userId]
      );

      logger.info(`User ${userId} unlocked badges: ${newBadges.join(', ')} (+${bonusPoints} points)`);
    }
  } catch (error) {
    logger.error('Check badge unlocks error:', error);
  }
}

/**
 * Update user stats after listing creation
 */
export const onListingCreated = async (userId: number) => {
  await query(
    `INSERT INTO user_stats (user_id, total_listings)
     VALUES ($1, 1)
     ON CONFLICT (user_id)
     DO UPDATE SET total_listings = user_stats.total_listings + 1`,
    [userId]
  );
  await awardPoints(userId, 10, 'listing created');
  await checkBadgeUnlocks(userId);
};

/**
 * Update user stats after sale
 */
export const onSaleCompleted = async (userId: number, saleAmount: number) => {
  await query(
    `INSERT INTO user_stats (user_id, total_sales, total_revenue)
     VALUES ($1, 1, $2)
     ON CONFLICT (user_id)
     DO UPDATE SET
       total_sales = user_stats.total_sales + 1,
       total_revenue = user_stats.total_revenue + $2`,
    [userId, saleAmount]
  );
  await awardPoints(userId, 50, 'sale completed');
  await checkBadgeUnlocks(userId);
};

export default {
  getUserStats,
  getUserBadges,
  getLeaderboard,
  awardPoints,
  onListingCreated,
  onSaleCompleted,
};
