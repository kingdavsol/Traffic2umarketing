import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import {
  getReferralCode,
  getCredits,
  getStats,
  getReferrals,
  getTransactions,
  validateCode,
  trackSignup,
  completeReferralEndpoint,
  awardCreditsEndpoint,
  useCreditsEndpoint,
} from '../controllers/referralController';

const router = Router();

/**
 * @route   GET /api/v1/referrals/code
 * @desc    Get user's referral code and link
 * @access  Private
 */
router.get('/code', authenticate, getReferralCode);

/**
 * @route   GET /api/v1/referrals/credits
 * @desc    Get user's credit balance
 * @access  Private
 */
router.get('/credits', authenticate, getCredits);

/**
 * @route   GET /api/v1/referrals/stats
 * @desc    Get referral statistics
 * @access  Private
 */
router.get('/stats', authenticate, getStats);

/**
 * @route   GET /api/v1/referrals
 * @desc    Get user's referral history
 * @access  Private
 */
router.get('/', authenticate, getReferrals);

/**
 * @route   GET /api/v1/referrals/transactions
 * @desc    Get credit transaction history
 * @access  Private
 */
router.get('/transactions', authenticate, getTransactions);

/**
 * @route   GET /api/v1/referrals/validate/:code
 * @desc    Validate a referral code
 * @access  Public
 */
router.get('/validate/:code', validateCode);

/**
 * @route   POST /api/v1/referrals/track
 * @desc    Track referral signup
 * @access  Public
 */
router.post('/track', trackSignup);

/**
 * @route   POST /api/v1/referrals/complete/:referralId
 * @desc    Complete a referral and award credits
 * @access  Private (should be internal/admin)
 */
router.post('/complete/:referralId', authenticate, completeReferralEndpoint);

/**
 * @route   POST /api/v1/referrals/award
 * @desc    Award credits manually
 * @access  Private (admin only)
 */
router.post('/award', authenticate, awardCreditsEndpoint);

/**
 * @route   POST /api/v1/referrals/use
 * @desc    Use credits
 * @access  Private
 */
router.post('/use', authenticate, useCreditsEndpoint);

export default router;
