import { Router, Response, Request } from 'express';
import Stripe from 'stripe';
import subscriptionService from '../services/subscription.service';
import { authenticate, AuthRequest } from '../middleware/auth';
import { asyncHandler, AppError } from '../middleware/errorHandler';

const router = Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16'
});

/**
 * GET /api/subscriptions/plans
 * Get available subscription plans and pricing
 */
router.get('/plans', asyncHandler(async (req: Request, res: Response) => {
  const plans = subscriptionService.getPricing();

  res.json({
    success: true,
    data: plans,
    message: 'Successfully retrieved subscription plans'
  });
}));

/**
 * POST /api/subscriptions/create
 * Create a new subscription
 */
router.post(
  '/create',
  authenticate,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { planId, paymentMethodId } = req.body;

    if (!planId || !paymentMethodId) {
      throw new AppError(400, 'Plan ID and payment method ID are required');
    }

    const plan = subscriptionService.getPlan(planId);
    if (!plan) {
      throw new AppError(400, 'Invalid plan ID');
    }

    try {
      const subscription = await subscriptionService.createSubscription(
        req.userId!,
        planId,
        paymentMethodId
      );

      res.status(201).json({
        success: true,
        data: {
          subscriptionId: subscription.id,
          plan: planId,
          status: subscription.status
        },
        message: `Successfully subscribed to ${plan.name} plan!`
      });
    } catch (error: any) {
      throw new AppError(400, error.message);
    }
  })
);

/**
 * GET /api/subscriptions/current
 * Get user's current subscription
 */
router.get(
  '/current',
  authenticate,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const subscription = await subscriptionService.getUserSubscription(req.userId!);

    if (!subscription) {
      return res.json({
        success: true,
        data: null,
        message: 'No active subscription'
      });
    }

    res.json({
      success: true,
      data: subscription,
      message: 'Successfully retrieved subscription'
    });
  })
);

/**
 * POST /api/subscriptions/cancel
 * Cancel user's subscription
 */
router.post(
  '/cancel',
  authenticate,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    try {
      await subscriptionService.cancelSubscription(req.userId!);

      res.json({
        success: true,
        message: 'Subscription canceled successfully'
      });
    } catch (error: any) {
      throw new AppError(400, error.message);
    }
  })
);

/**
 * POST /api/subscriptions/upgrade
 * Upgrade to a different plan
 */
router.post(
  '/upgrade',
  authenticate,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { planId } = req.body;

    if (!planId) {
      throw new AppError(400, 'Plan ID is required');
    }

    const plan = subscriptionService.getPlan(planId);
    if (!plan) {
      throw new AppError(400, 'Invalid plan ID');
    }

    try {
      await subscriptionService.updatePlan(req.userId!, planId);

      res.json({
        success: true,
        message: `Successfully upgraded to ${plan.name} plan!`
      });
    } catch (error: any) {
      throw new AppError(400, error.message);
    }
  })
);

/**
 * POST /api/subscriptions/webhook
 * Handle Stripe webhooks
 */
router.post(
  '/webhook',
  asyncHandler(async (req: Request, res: Response) => {
    const sig = req.headers['stripe-signature'] as string;
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!webhookSecret) {
      throw new AppError(500, 'Webhook secret not configured');
    }

    let event;

    try {
      event = stripe.webhooks.constructEvent(JSON.stringify(req.body), sig, webhookSecret);
    } catch (err: any) {
      throw new AppError(400, `Webhook Error: ${err.message}`);
    }

    // Handle different event types
    switch (event.type) {
      case 'customer.subscription.updated':
        await subscriptionService.handleSubscriptionUpdated(event.data.object);
        break;

      case 'customer.subscription.deleted':
        await subscriptionService.handleSubscriptionDeleted(event.data.object.id);
        break;

      case 'invoice.payment_succeeded':
        // Handle successful payment
        console.log('Payment succeeded for subscription:', event.data.object.subscription);
        break;

      case 'invoice.payment_failed':
        // Handle failed payment
        console.log('Payment failed for subscription:', event.data.object.subscription);
        break;
    }

    res.json({ received: true });
  })
);

/**
 * GET /api/subscriptions/check-premium
 * Check if user has premium access
 */
router.get(
  '/check-premium',
  authenticate,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const hasPremium = await subscriptionService.hasPremiumAccess(req.userId!);

    res.json({
      success: true,
      data: {
        hasPremium
      },
      message: hasPremium ? 'User has premium access' : 'User does not have premium access'
    });
  })
);

/**
 * GET /api/subscriptions/metrics (admin)
 * Get subscription metrics
 */
router.get(
  '/metrics',
  authenticate,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    // TODO: Check if user is admin
    const metrics = await subscriptionService.getMetrics();

    res.json({
      success: true,
      data: metrics,
      message: 'Successfully retrieved subscription metrics'
    });
  })
);

export { router as subscriptionRoutes };
