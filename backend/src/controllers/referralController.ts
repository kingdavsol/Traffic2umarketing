import { Request, Response } from 'express';
import { logger } from '../config/logger';
import {
  getUserReferralCode,
  getUserCredits,
  trackReferralSignup,
  completeReferral,
  getReferralStats,
  getUserReferrals,
  getCreditTransactions,
  validateReferralCode,
  awardCredits,
  useCredits,
} from '../services/referralService';

/**
 * Get user's referral code and link
 */
export const getReferralCode = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;

    const referralCode = await getUserReferralCode(userId);
    const referralLink = `${process.env.FRONTEND_URL || 'https://quicksell.monster'}/auth/register?ref=${referralCode}`;

    res.status(200).json({
      success: true,
      data: {
        referralCode,
        referralLink,
      },
      statusCode: 200,
    });
  } catch (error: any) {
    logger.error('Get referral code error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to get referral code',
      statusCode: 500,
    });
  }
};

/**
 * Get user's credit balance
 */
export const getCredits = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;

    const credits = await getUserCredits(userId);

    res.status(200).json({
      success: true,
      data: credits,
      statusCode: 200,
    });
  } catch (error: any) {
    logger.error('Get credits error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to get credits',
      statusCode: 500,
    });
  }
};

/**
 * Get referral statistics
 */
export const getStats = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;

    const stats = await getReferralStats(userId);
    const credits = await getUserCredits(userId);

    res.status(200).json({
      success: true,
      data: {
        ...stats,
        credits: credits.credits_available,
        totalCredits: credits.total_credits,
      },
      statusCode: 200,
    });
  } catch (error: any) {
    logger.error('Get referral stats error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to get referral stats',
      statusCode: 500,
    });
  }
};

/**
 * Get user's referral history
 */
export const getReferrals = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const limit = parseInt(req.query.limit as string) || 10;

    const referrals = await getUserReferrals(userId, limit);

    res.status(200).json({
      success: true,
      data: referrals,
      statusCode: 200,
    });
  } catch (error: any) {
    logger.error('Get referrals error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to get referrals',
      statusCode: 500,
    });
  }
};

/**
 * Get credit transaction history
 */
export const getTransactions = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const limit = parseInt(req.query.limit as string) || 20;

    const transactions = await getCreditTransactions(userId, limit);

    res.status(200).json({
      success: true,
      data: transactions,
      statusCode: 200,
    });
  } catch (error: any) {
    logger.error('Get transactions error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to get transactions',
      statusCode: 500,
    });
  }
};

/**
 * Validate a referral code (public endpoint)
 */
export const validateCode = async (req: Request, res: Response) => {
  try {
    const { code } = req.params;

    if (!code) {
      return res.status(400).json({
        success: false,
        error: 'Referral code is required',
        statusCode: 400,
      });
    }

    const isValid = await validateReferralCode(code);

    res.status(200).json({
      success: true,
      data: { valid: isValid },
      statusCode: 200,
    });
  } catch (error: any) {
    logger.error('Validate code error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to validate code',
      statusCode: 500,
    });
  }
};

/**
 * Track referral signup (called during registration)
 */
export const trackSignup = async (req: Request, res: Response) => {
  try {
    const { referralCode, email, userId } = req.body;

    if (!referralCode || !email) {
      return res.status(400).json({
        success: false,
        error: 'Referral code and email are required',
        statusCode: 400,
      });
    }

    const referral = await trackReferralSignup(referralCode, email, userId);

    res.status(201).json({
      success: true,
      data: referral,
      statusCode: 201,
    });
  } catch (error: any) {
    logger.error('Track signup error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to track referral',
      statusCode: 500,
    });
  }
};

/**
 * Complete a referral and award credits
 */
export const completeReferralEndpoint = async (req: Request, res: Response) => {
  try {
    const { referralId } = req.params;
    const { creditsToAward } = req.body;

    if (!referralId) {
      return res.status(400).json({
        success: false,
        error: 'Referral ID is required',
        statusCode: 400,
      });
    }

    const referral = await completeReferral(
      parseInt(referralId),
      creditsToAward || 5
    );

    res.status(200).json({
      success: true,
      data: referral,
      message: 'Referral completed and credits awarded',
      statusCode: 200,
    });
  } catch (error: any) {
    logger.error('Complete referral error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to complete referral',
      statusCode: 500,
    });
  }
};

/**
 * Award credits manually (admin endpoint)
 */
export const awardCreditsEndpoint = async (req: Request, res: Response) => {
  try {
    const { userId, amount, description } = req.body;

    if (!userId || !amount) {
      return res.status(400).json({
        success: false,
        error: 'User ID and amount are required',
        statusCode: 400,
      });
    }

    const result = await awardCredits(
      userId,
      amount,
      'manual',
      description || 'Manual credit award'
    );

    res.status(200).json({
      success: true,
      data: result,
      message: 'Credits awarded successfully',
      statusCode: 200,
    });
  } catch (error: any) {
    logger.error('Award credits error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to award credits',
      statusCode: 500,
    });
  }
};

/**
 * Use credits (deduct from balance)
 */
export const useCreditsEndpoint = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { amount, description } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Valid amount is required',
        statusCode: 400,
      });
    }

    const result = await useCredits(
      userId,
      amount,
      description || 'Credits used'
    );

    res.status(200).json({
      success: true,
      data: result,
      message: 'Credits used successfully',
      statusCode: 200,
    });
  } catch (error: any) {
    logger.error('Use credits error:', error);

    if (error.message === 'Insufficient credits') {
      return res.status(400).json({
        success: false,
        error: 'Insufficient credits',
        statusCode: 400,
      });
    }

    res.status(500).json({
      success: false,
      error: error.message || 'Failed to use credits',
      statusCode: 500,
    });
  }
};
