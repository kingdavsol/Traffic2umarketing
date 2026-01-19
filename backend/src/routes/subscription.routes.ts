import { Router, Request, Response } from 'express';
import { authenticate } from '../middleware/auth';
import { logger } from '../config/logger';
import { query } from '../database/connection';
import { getSubscription, cancelSubscription } from '../services/stripeService';

const router = Router();

/**
 * @route   GET /api/v1/subscription/plans
 * @desc    Get available subscription plans from database
 * @access  Public
 */
router.get('/plans', async (req: Request, res: Response) => {
  try {
    const result = await query(
      `SELECT id, name, description, price_monthly, features, listing_limit, marketplace_limit
       FROM pricing_plans
       WHERE is_active = true
       ORDER BY price_monthly ASC`
    );

    const plans = result.rows.map((plan: any) => ({
      id: plan.id,
      name: plan.name,
      description: plan.description,
      price: plan.price_monthly / 100,
      billingPeriod: plan.price_monthly > 0 ? 'month' : null,
      features: typeof plan.features === 'string' ? JSON.parse(plan.features) : plan.features,
      listingLimit: plan.listing_limit,
      marketplaceLimit: plan.marketplace_limit,
    }));

    res.status(200).json({
      success: true,
      data: plans,
      statusCode: 200,
    });
  } catch (error) {
    logger.error('Get plans error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch plans',
      statusCode: 500,
    });
  }
});

/**
 * @route   POST /api/v1/subscription/subscribe
 * @desc    Subscribe to a plan - redirects to Stripe checkout
 * @access  Private
 */
router.post('/subscribe', authenticate, async (req: Request, res: Response) => {
  try {
    const { planId } = req.body;

    if (!planId) {
      return res.status(400).json({
        success: false,
        error: 'Plan ID is required',
        statusCode: 400,
      });
    }

    // For free plan, just update user directly
    if (planId === 'free') {
      const userId = (req as any).userId;
      await query(
        'UPDATE users SET subscription_tier = $1 WHERE id = $2',
        ['free', userId]
      );
      return res.status(200).json({
        success: true,
        message: 'Switched to free plan',
        statusCode: 200,
      });
    }

    // For paid plans, redirect to Stripe checkout via frontend
    res.status(200).json({
      success: true,
      message: 'Please use /api/v1/stripe/create-checkout-session for paid subscriptions',
      redirectTo: '/api/v1/stripe/create-checkout-session',
      statusCode: 200,
    });
  } catch (error) {
    logger.error('Subscribe error:', error);
    res.status(500).json({
      success: false,
      error: 'Subscription failed',
      statusCode: 500,
    });
  }
});

/**
 * @route   GET /api/v1/subscription/current
 * @desc    Get current subscription from database
 * @access  Private
 */
router.get('/current', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const subscription = await getSubscription(userId);

    res.status(200).json({
      success: true,
      data: {
        planType: subscription.plan || subscription.plan_id || 'free',
        planName: subscription.plan_name || 'Free',
        status: subscription.status || 'active',
        priceMonthly: subscription.price_monthly || 0,
        features: subscription.features,
        currentPeriodEnd: subscription.current_period_end,
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
      },
      statusCode: 200,
    });
  } catch (error) {
    logger.error('Get subscription error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch subscription',
      statusCode: 500,
    });
  }
});

/**
 * @route   POST /api/v1/subscription/cancel
 * @desc    Cancel subscription
 * @access  Private
 */
router.post('/cancel', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    await cancelSubscription(userId);

    res.status(200).json({
      success: true,
      message: 'Subscription will be cancelled at end of billing period',
      statusCode: 200,
    });
  } catch (error: any) {
    logger.error('Cancel subscription error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to cancel subscription',
      statusCode: 500,
    });
  }
});

export default router;
