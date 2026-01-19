import { Router, Request, Response } from 'express';
import Stripe from 'stripe';
import { authenticate } from '../middleware/auth';
import { logger } from '../config/logger';
import {
  createCheckoutSession,
  createPortalSession,
  handleWebhookEvent,
  getSubscription,
  cancelSubscription,
  canCreateListing,
} from '../services/stripeService';

const router = Router();

// Initialize Stripe for webhook signature verification
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16',
});

const FRONTEND_URL = process.env.FRONTEND_URL || 'https://quicksell.monster';

/**
 * @route   POST /api/v1/stripe/create-checkout-session
 * @desc    Create a Stripe Checkout session for subscription
 * @access  Private
 */
router.post('/create-checkout-session', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { planId } = req.body;

    if (!planId || !['premium', 'premium_plus'].includes(planId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid plan ID. Must be "premium" or "premium_plus"',
        statusCode: 400,
      });
    }

    const session = await createCheckoutSession(
      userId,
      planId,
      `${FRONTEND_URL}/settings?tab=billing&success=true`,
      `${FRONTEND_URL}/settings?tab=billing&canceled=true`
    );

    res.status(200).json({
      success: true,
      url: session.url,
      sessionId: session.id,
      statusCode: 200,
    });
  } catch (error: any) {
    logger.error('Create checkout session error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to create checkout session',
      statusCode: 500,
    });
  }
});

/**
 * @route   POST /api/v1/stripe/create-portal-session
 * @desc    Create a Stripe Customer Portal session
 * @access  Private
 */
router.post('/create-portal-session', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;

    const session = await createPortalSession(
      userId,
      `${FRONTEND_URL}/settings?tab=billing`
    );

    res.status(200).json({
      success: true,
      url: session.url,
      statusCode: 200,
    });
  } catch (error: any) {
    logger.error('Create portal session error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to create portal session',
      statusCode: 500,
    });
  }
});

/**
 * @route   GET /api/v1/stripe/subscription
 * @desc    Get current user subscription
 * @access  Private
 */
router.get('/subscription', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const subscription = await getSubscription(userId);

    res.status(200).json({
      success: true,
      data: subscription,
      statusCode: 200,
    });
  } catch (error: any) {
    logger.error('Get subscription error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get subscription',
      statusCode: 500,
    });
  }
});

/**
 * @route   POST /api/v1/stripe/cancel-subscription
 * @desc    Cancel user subscription (at end of period)
 * @access  Private
 */
router.post('/cancel-subscription', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    await cancelSubscription(userId);

    res.status(200).json({
      success: true,
      message: 'Subscription will be canceled at end of billing period',
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

/**
 * @route   GET /api/v1/stripe/can-create-listing
 * @desc    Check if user can create a new listing
 * @access  Private
 */
router.get('/can-create-listing', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const result = await canCreateListing(userId);

    res.status(200).json({
      success: true,
      data: result,
      statusCode: 200,
    });
  } catch (error: any) {
    logger.error('Check listing permission error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to check listing permission',
      statusCode: 500,
    });
  }
});

/**
 * @route   POST /api/v1/stripe/webhook
 * @desc    Handle Stripe webhook events
 * @access  Public (verified by Stripe signature)
 */
router.post(
  '/webhook',
  // Use raw body for webhook signature verification
  async (req: Request, res: Response) => {
    const sig = req.headers['stripe-signature'];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!sig) {
      return res.status(400).json({ error: 'Missing stripe-signature header' });
    }

    let event: Stripe.Event;

    try {
      // For local development without webhook secret, parse JSON directly
      if (!webhookSecret) {
        event = req.body as Stripe.Event;
        logger.warn('No STRIPE_WEBHOOK_SECRET set - skipping signature verification');
      } else {
        event = stripe.webhooks.constructEvent(
          req.body,
          sig,
          webhookSecret
        );
      }
    } catch (err: any) {
      logger.error('Webhook signature verification failed:', err.message);
      return res.status(400).json({ error: `Webhook Error: ${err.message}` });
    }

    try {
      await handleWebhookEvent(event);
      res.status(200).json({ received: true });
    } catch (error: any) {
      logger.error('Webhook handler error:', error);
      res.status(500).json({ error: 'Webhook handler failed' });
    }
  }
);

export default router;
