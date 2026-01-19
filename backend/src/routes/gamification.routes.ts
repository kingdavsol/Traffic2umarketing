import { Router, Request, Response } from 'express';
import { authenticate } from '../middleware/auth';
import { logger } from '../config/logger';
import { query } from '../database/connection';
import { getUserStats, getUserBadges, getLeaderboard } from '../controllers/gamificationController';

const router = Router();

/**
 * @route   GET /api/v1/gamification/user/stats
 * @desc    Get user gamification statistics
 * @access  Private
 */
router.get('/user/stats', authenticate, getUserStats);

/**
 * @route   GET /api/v1/gamification/user/badges
 * @desc    Get user's earned badges
 * @access  Private
 */
router.get('/user/badges', authenticate, getUserBadges);

/**
 * @route   GET /api/v1/gamification/user/level
 * @desc    Get user's current level
 * @access  Private
 */
router.get('/user/level', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;

    const result = await query(
      'SELECT points FROM user_stats WHERE user_id = $1',
      [userId]
    );

    const points = result.rows[0]?.points || 0;

    // Level calculation
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

    let currentLevel = LEVELS[0];
    for (const level of LEVELS) {
      if (points >= level.minPoints) {
        currentLevel = level;
      } else {
        break;
      }
    }

    const nextLevelIndex = LEVELS.findIndex(l => l.level === currentLevel.level) + 1;
    const nextLevelPoints = nextLevelIndex < LEVELS.length
      ? LEVELS[nextLevelIndex].minPoints
      : currentLevel.minPoints;

    res.status(200).json({
      success: true,
      data: {
        currentLevel: currentLevel.level,
        levelName: currentLevel.name,
        currentPoints: points,
        nextLevelPoints,
        pointsToNextLevel: Math.max(0, nextLevelPoints - points),
        progress: nextLevelPoints > currentLevel.minPoints
          ? ((points - currentLevel.minPoints) / (nextLevelPoints - currentLevel.minPoints)) * 100
          : 100
      },
      statusCode: 200,
    });
  } catch (error) {
    logger.error('Get level error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch level',
      statusCode: 500,
    });
  }
});

/**
 * @route   GET /api/v1/gamification/challenges
 * @desc    Get active challenges with user progress
 * @access  Private
 */
router.get('/challenges', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;

    const result = await query(
      `SELECT
        c.id,
        c.name,
        c.description,
        c.type,
        c.target_value,
        c.reward_points,
        c.start_date,
        c.end_date,
        COALESCE(uc.progress, 0) as progress,
        COALESCE(uc.completed, false) as completed,
        uc.completed_at
       FROM challenges c
       LEFT JOIN user_challenges uc ON c.id = uc.challenge_id AND uc.user_id = $1
       WHERE c.is_active = true
       ORDER BY c.reward_points DESC`,
      [userId]
    );

    const challenges = result.rows.map((c: any) => ({
      id: c.id,
      name: c.name,
      description: c.description,
      type: c.type,
      targetValue: c.target_value,
      rewardPoints: c.reward_points,
      progress: c.progress,
      completed: c.completed,
      completedAt: c.completed_at,
      percentComplete: Math.min(100, (c.progress / c.target_value) * 100),
      startDate: c.start_date,
      endDate: c.end_date,
    }));

    res.status(200).json({
      success: true,
      data: challenges,
      statusCode: 200,
    });
  } catch (error) {
    logger.error('Get challenges error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch challenges',
      statusCode: 500,
    });
  }
});

/**
 * @route   GET /api/v1/gamification/leaderboard
 * @desc    Get leaderboard rankings
 * @access  Public
 */
router.get('/leaderboard', getLeaderboard);

export default router;
