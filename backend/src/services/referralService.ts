import { query } from '../database/connection';
import { logger } from '../config/logger';
import crypto from 'crypto';

/**
 * Generate a unique referral code for a user
 */
export const generateReferralCode = (userId: number): string => {
  const timestamp = Date.now().toString(36);
  const random = crypto.randomBytes(4).toString('hex');
  return `QS${userId}${timestamp}${random}`.toUpperCase().substring(0, 16);
};

/**
 * Get or create user credits record
 */
export const getUserCredits = async (userId: number) => {
  try {
    let result = await query('SELECT * FROM user_credits WHERE user_id = $1', [userId]);

    // If no record exists, create one
    if (result.rows.length === 0) {
      result = await query(
        'INSERT INTO user_credits (user_id, total_credits, credits_used, credits_available) VALUES ($1, 0, 0, 0) RETURNING *',
        [userId]
      );
    }

    return result.rows[0];
  } catch (error) {
    logger.error('Get user credits error:', error);
    throw error;
  }
};

/**
 * Get or create referral code for a user
 */
export const getUserReferralCode = async (userId: number) => {
  try {
    // Check if user already has a referral code
    let result = await query(
      'SELECT referral_code FROM referrals WHERE referrer_user_id = $1 AND status = $2 LIMIT 1',
      [userId, 'active']
    );

    if (result.rows.length > 0) {
      return result.rows[0].referral_code;
    }

    // Generate new unique referral code
    let referralCode = generateReferralCode(userId);
    let attempts = 0;

    // Ensure uniqueness
    while (attempts < 5) {
      const existing = await query('SELECT id FROM referrals WHERE referral_code = $1', [referralCode]);
      if (existing.rows.length === 0) break;
      referralCode = generateReferralCode(userId);
      attempts++;
    }

    // Create new referral record (as template for future referrals)
    result = await query(
      'INSERT INTO referrals (referrer_user_id, referral_code, status) VALUES ($1, $2, $3) RETURNING referral_code',
      [userId, referralCode, 'active']
    );

    return result.rows[0].referral_code;
  } catch (error) {
    logger.error('Get user referral code error:', error);
    throw error;
  }
};

/**
 * Track when someone uses a referral code
 */
export const trackReferralSignup = async (referralCode: string, referredEmail: string, referredUserId?: number) => {
  try {
    // Find the referrer
    const referrerResult = await query(
      'SELECT referrer_user_id FROM referrals WHERE referral_code = $1 AND status = $2',
      [referralCode, 'active']
    );

    if (referrerResult.rows.length === 0) {
      throw new Error('Invalid referral code');
    }

    const referrerId = referrerResult.rows[0].referrer_user_id;

    // Don't allow self-referrals
    if (referredUserId && referredUserId === referrerId) {
      throw new Error('Cannot refer yourself');
    }

    // Create new referral tracking record
    const result = await query(
      'INSERT INTO referrals (referrer_user_id, referral_code, referred_email, referred_user_id, status, referred_at) VALUES ($1, $2, $3, $4, $5, NOW()) RETURNING *',
      [referrerId, referralCode, referredEmail, referredUserId, 'pending']
    );

    return result.rows[0];
  } catch (error) {
    logger.error('Track referral signup error:', error);
    throw error;
  }
};

/**
 * Complete a referral and award credits
 */
export const completeReferral = async (referralId: number, creditsToAward: number = 5) => {
  try {
    // Get referral details
    const referralResult = await query('SELECT * FROM referrals WHERE id = $1', [referralId]);

    if (referralResult.rows.length === 0) {
      throw new Error('Referral not found');
    }

    const referral = referralResult.rows[0];

    if (referral.status === 'completed') {
      logger.info('Referral already completed', { referralId });
      return referral;
    }

    // Update referral status
    await query(
      'UPDATE referrals SET status = $1, credits_awarded = $2, completed_at = NOW() WHERE id = $3',
      ['completed', creditsToAward, referralId]
    );

    // Award credits to referrer
    await awardCredits(referral.referrer_user_id, creditsToAward, 'referral', `Referral completed for ${referral.referred_email}`, referralId);

    logger.info('Referral completed', { referralId, referrerId: referral.referrer_user_id, creditsAwarded: creditsToAward });

    return referral;
  } catch (error) {
    logger.error('Complete referral error:', error);
    throw error;
  }
};

/**
 * Award credits to a user
 */
export const awardCredits = async (
  userId: number,
  amount: number,
  transactionType: string,
  description: string,
  referralId?: number
) => {
  try {
    // Get or create user credits
    const credits = await getUserCredits(userId);

    // Update credits
    const newTotal = credits.total_credits + amount;
    const newAvailable = credits.credits_available + amount;

    await query(
      'UPDATE user_credits SET total_credits = $1, credits_available = $2 WHERE user_id = $3',
      [newTotal, newAvailable, userId]
    );

    // Record transaction
    await query(
      'INSERT INTO credit_transactions (user_id, transaction_type, amount, balance_after, description, referral_id) VALUES ($1, $2, $3, $4, $5, $6)',
      [userId, transactionType, amount, newAvailable, description, referralId]
    );

    logger.info('Credits awarded', { userId, amount, transactionType });

    return { total: newTotal, available: newAvailable };
  } catch (error) {
    logger.error('Award credits error:', error);
    throw error;
  }
};

/**
 * Use credits (deduct from available)
 */
export const useCredits = async (userId: number, amount: number, description: string) => {
  try {
    const credits = await getUserCredits(userId);

    if (credits.credits_available < amount) {
      throw new Error('Insufficient credits');
    }

    const newUsed = credits.credits_used + amount;
    const newAvailable = credits.credits_available - amount;

    await query(
      'UPDATE user_credits SET credits_used = $1, credits_available = $2 WHERE user_id = $3',
      [newUsed, newAvailable, userId]
    );

    // Record transaction (negative amount for deduction)
    await query(
      'INSERT INTO credit_transactions (user_id, transaction_type, amount, balance_after, description) VALUES ($1, $2, $3, $4, $5)',
      [userId, 'used', -amount, newAvailable, description]
    );

    logger.info('Credits used', { userId, amount });

    return { used: newUsed, available: newAvailable };
  } catch (error) {
    logger.error('Use credits error:', error);
    throw error;
  }
};

/**
 * Get referral statistics for a user
 */
export const getReferralStats = async (userId: number) => {
  try {
    const result = await query(
      `SELECT
        COUNT(*) as total_referrals,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_referrals,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_referrals,
        SUM(CASE WHEN status = 'completed' THEN credits_awarded ELSE 0 END) as total_credits_earned
      FROM referrals
      WHERE referrer_user_id = $1 AND referred_user_id IS NOT NULL`,
      [userId]
    );

    return result.rows[0];
  } catch (error) {
    logger.error('Get referral stats error:', error);
    throw error;
  }
};

/**
 * Get recent referrals for a user
 */
export const getUserReferrals = async (userId: number, limit: number = 10) => {
  try {
    const result = await query(
      'SELECT id, referred_email, status, credits_awarded, referred_at, completed_at FROM referrals WHERE referrer_user_id = $1 AND referred_user_id IS NOT NULL ORDER BY created_at DESC LIMIT $2',
      [userId, limit]
    );

    return result.rows;
  } catch (error) {
    logger.error('Get user referrals error:', error);
    throw error;
  }
};

/**
 * Get credit transaction history
 */
export const getCreditTransactions = async (userId: number, limit: number = 20) => {
  try {
    const result = await query(
      'SELECT * FROM credit_transactions WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2',
      [userId, limit]
    );

    return result.rows;
  } catch (error) {
    logger.error('Get credit transactions error:', error);
    throw error;
  }
};

/**
 * Validate referral code exists and is active
 */
export const validateReferralCode = async (referralCode: string) => {
  try {
    const result = await query(
      'SELECT referrer_user_id FROM referrals WHERE referral_code = $1 AND status = $2',
      [referralCode, 'active']
    );

    return result.rows.length > 0;
  } catch (error) {
    logger.error('Validate referral code error:', error);
    return false;
  }
};
