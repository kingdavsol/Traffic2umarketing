import Stripe from 'stripe';
import { query } from '../database/connection';
import { logger } from '../config/logger';

// Initialize Stripe with secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16',
});

// Price IDs for each plan (will be created/updated dynamically)
const PLAN_PRICES: Record<string, { monthly: number; name: string }> = {
  premium: { monthly: 499, name: 'Premium' },
  premium_plus: { monthly: 999, name: 'Premium Plus' },
};

/**
 * Get or create a Stripe customer for a user
 */
export async function getOrCreateStripeCustomer(userId: number): Promise<string> {
  // Check if user already has a Stripe customer ID
  const userResult = await query(
    'SELECT email, username, stripe_customer_id FROM users WHERE id = $1',
    [userId]
  );

  if (!userResult.rows[0]) {
    throw new Error('User not found');
  }

  const user = userResult.rows[0];

  if (user.stripe_customer_id) {
    return user.stripe_customer_id;
  }

  // Create new Stripe customer
  const customer = await stripe.customers.create({
    email: user.email,
    name: user.username,
    metadata: {
      userId: userId.toString(),
    },
  });

  // Save Stripe customer ID to user
  await query(
    'UPDATE users SET stripe_customer_id = $1 WHERE id = $2',
    [customer.id, userId]
  );

  return customer.id;
}

/**
 * Create a Stripe Checkout session for subscription
 */
export async function createCheckoutSession(
  userId: number,
  planId: string,
  successUrl: string,
  cancelUrl: string
): Promise<Stripe.Checkout.Session> {
  const customerId = await getOrCreateStripeCustomer(userId);

  // Get plan price
  const plan = PLAN_PRICES[planId];
  if (!plan) {
    throw new Error(`Invalid plan: ${planId}`);
  }

  // Create or get price ID
  const priceId = await getOrCreatePrice(planId, plan.monthly, plan.name);

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    subscription_data: {
      trial_period_days: 14,
      metadata: {
        userId: userId.toString(),
        planId,
      },
    },
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: {
      userId: userId.toString(),
      planId,
    },
  });

  return session;
}

/**
 * Create a Stripe Customer Portal session
 */
export async function createPortalSession(
  userId: number,
  returnUrl: string
): Promise<Stripe.BillingPortal.Session> {
  const customerId = await getOrCreateStripeCustomer(userId);

  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  });

  return session;
}

/**
 * Get or create a Stripe Price for a plan
 */
async function getOrCreatePrice(planId: string, amountInCents: number, planName: string): Promise<string> {
  // Check if we already have a price ID stored
  const planResult = await query(
    'SELECT stripe_price_id FROM pricing_plans WHERE id = $1',
    [planId]
  );

  if (planResult.rows[0]?.stripe_price_id) {
    return planResult.rows[0].stripe_price_id;
  }

  // Create a product first
  const product = await stripe.products.create({
    name: `QuickSell ${planName}`,
    description: `QuickSell ${planName} subscription`,
    metadata: { planId },
  });

  // Create a recurring price
  const price = await stripe.prices.create({
    product: product.id,
    unit_amount: amountInCents,
    currency: 'usd',
    recurring: {
      interval: 'month',
    },
    metadata: { planId },
  });

  // Store the price ID
  await query(
    'UPDATE pricing_plans SET stripe_price_id = $1 WHERE id = $2',
    [price.id, planId]
  );

  return price.id;
}

/**
 * Cancel a subscription
 */
export async function cancelSubscription(userId: number): Promise<void> {
  const subResult = await query(
    'SELECT stripe_subscription_id FROM subscriptions WHERE user_id = $1 AND status = $2',
    [userId, 'active']
  );

  if (!subResult.rows[0]?.stripe_subscription_id) {
    throw new Error('No active subscription found');
  }

  await stripe.subscriptions.update(subResult.rows[0].stripe_subscription_id, {
    cancel_at_period_end: true,
  });

  await query(
    'UPDATE subscriptions SET cancel_at_period_end = true WHERE user_id = $1 AND status = $2',
    [userId, 'active']
  );
}

/**
 * Get subscription details for a user
 */
export async function getSubscription(userId: number): Promise<any> {
  const result = await query(
    `SELECT s.*, p.name as plan_name, p.price_monthly, p.features
     FROM subscriptions s
     LEFT JOIN pricing_plans p ON s.plan_id = p.id
     WHERE s.user_id = $1 AND s.status IN ('active', 'trialing')
     ORDER BY s.created_at DESC
     LIMIT 1`,
    [userId]
  );

  if (!result.rows[0]) {
    // Return free plan info
    return {
      plan: 'free',
      plan_name: 'Free',
      status: 'active',
      price_monthly: 0,
    };
  }

  return result.rows[0];
}

/**
 * Handle Stripe webhook events
 */
export async function handleWebhookEvent(event: Stripe.Event): Promise<void> {
  // Check if we've already processed this event
  const existingEvent = await query(
    'SELECT id FROM subscription_events WHERE stripe_event_id = $1',
    [event.id]
  );

  if (existingEvent.rows[0]) {
    logger.info(`Webhook event ${event.id} already processed`);
    return;
  }

  // Store the event
  await query(
    `INSERT INTO subscription_events (stripe_event_id, event_type, data)
     VALUES ($1, $2, $3)`,
    [event.id, event.type, JSON.stringify(event.data)]
  );

  switch (event.type) {
    case 'checkout.session.completed':
      await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
      break;

    case 'customer.subscription.created':
    case 'customer.subscription.updated':
      await handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
      break;

    case 'customer.subscription.deleted':
      await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
      break;

    case 'invoice.paid':
      await handleInvoicePaid(event.data.object as Stripe.Invoice);
      break;

    case 'invoice.payment_failed':
      await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice);
      break;

    default:
      logger.info(`Unhandled webhook event type: ${event.type}`);
  }

  // Mark event as processed
  await query(
    'UPDATE subscription_events SET processed = true WHERE stripe_event_id = $1',
    [event.id]
  );
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session): Promise<void> {
  const userId = session.metadata?.userId;
  const planId = session.metadata?.planId;

  if (!userId || !planId) {
    logger.error('Missing userId or planId in checkout session metadata');
    return;
  }

  logger.info(`Checkout completed for user ${userId}, plan ${planId}`);

  // Update user subscription tier
  await query(
    'UPDATE users SET subscription_tier = $1 WHERE id = $2',
    [planId, userId]
  );
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription): Promise<void> {
  const customerId = subscription.customer as string;

  // Find user by Stripe customer ID
  const userResult = await query(
    'SELECT id FROM users WHERE stripe_customer_id = $1',
    [customerId]
  );

  if (!userResult.rows[0]) {
    logger.error(`No user found for Stripe customer ${customerId}`);
    return;
  }

  const userId = userResult.rows[0].id;
  const planId = subscription.metadata?.planId || 'premium';
  const status = subscription.status;

  // Upsert subscription record
  await query(
    `INSERT INTO subscriptions (user_id, stripe_subscription_id, stripe_customer_id, plan_id, status,
       current_period_start, current_period_end, cancel_at_period_end, trial_start, trial_end)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
     ON CONFLICT (stripe_subscription_id)
     DO UPDATE SET
       status = $5,
       current_period_start = $6,
       current_period_end = $7,
       cancel_at_period_end = $8,
       updated_at = NOW()`,
    [
      userId,
      subscription.id,
      customerId,
      planId,
      status,
      new Date(subscription.current_period_start * 1000),
      new Date(subscription.current_period_end * 1000),
      subscription.cancel_at_period_end,
      subscription.trial_start ? new Date(subscription.trial_start * 1000) : null,
      subscription.trial_end ? new Date(subscription.trial_end * 1000) : null,
    ]
  );

  // Update user subscription tier based on status
  if (status === 'active' || status === 'trialing') {
    await query(
      'UPDATE users SET subscription_tier = $1 WHERE id = $2',
      [planId, userId]
    );
  } else if (status === 'canceled' || status === 'unpaid') {
    await query(
      'UPDATE users SET subscription_tier = $1 WHERE id = $2',
      ['free', userId]
    );
  }
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription): Promise<void> {
  const customerId = subscription.customer as string;

  const userResult = await query(
    'SELECT id FROM users WHERE stripe_customer_id = $1',
    [customerId]
  );

  if (!userResult.rows[0]) return;

  const userId = userResult.rows[0].id;

  // Update subscription status
  await query(
    `UPDATE subscriptions SET status = 'canceled', canceled_at = NOW()
     WHERE stripe_subscription_id = $1`,
    [subscription.id]
  );

  // Downgrade user to free
  await query(
    'UPDATE users SET subscription_tier = $1 WHERE id = $2',
    ['free', userId]
  );
}

async function handleInvoicePaid(invoice: Stripe.Invoice): Promise<void> {
  const customerId = invoice.customer as string;

  const userResult = await query(
    'SELECT id FROM users WHERE stripe_customer_id = $1',
    [customerId]
  );

  if (!userResult.rows[0]) return;

  const userId = userResult.rows[0].id;

  // Store invoice
  await query(
    `INSERT INTO invoices (user_id, stripe_invoice_id, amount_due, amount_paid, currency, status,
       invoice_url, invoice_pdf, hosted_invoice_url, paid_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
     ON CONFLICT (stripe_invoice_id) DO UPDATE SET
       amount_paid = $4,
       status = $6,
       paid_at = NOW()`,
    [
      userId,
      invoice.id,
      invoice.amount_due,
      invoice.amount_paid,
      invoice.currency,
      'paid',
      invoice.invoice_pdf,
      invoice.invoice_pdf,
      invoice.hosted_invoice_url,
    ]
  );
}

async function handleInvoicePaymentFailed(invoice: Stripe.Invoice): Promise<void> {
  const customerId = invoice.customer as string;

  const userResult = await query(
    'SELECT id FROM users WHERE stripe_customer_id = $1',
    [customerId]
  );

  if (!userResult.rows[0]) return;

  const userId = userResult.rows[0].id;

  await query(
    `INSERT INTO invoices (user_id, stripe_invoice_id, amount_due, amount_paid, currency, status)
     VALUES ($1, $2, $3, $4, $5, $6)
     ON CONFLICT (stripe_invoice_id) DO UPDATE SET status = $6`,
    [userId, invoice.id, invoice.amount_due, 0, invoice.currency, 'failed']
  );

  // Could trigger email notification here
  logger.warn(`Payment failed for user ${userId}, invoice ${invoice.id}`);
}

/**
 * Check if user can create a new listing based on their plan
 */
export async function canCreateListing(userId: number): Promise<{ allowed: boolean; reason?: string }> {
  const userResult = await query(
    `SELECT subscription_tier, free_listings_remaining, listings_count
     FROM users WHERE id = $1`,
    [userId]
  );

  if (!userResult.rows[0]) {
    return { allowed: false, reason: 'User not found' };
  }

  const user = userResult.rows[0];
  const tier = user.subscription_tier || 'free';

  // Paid users have unlimited listings
  if (tier === 'premium' || tier === 'premium_plus') {
    return { allowed: true };
  }

  // Free users get 3 listings total
  if (user.free_listings_remaining > 0) {
    return { allowed: true };
  }

  return {
    allowed: false,
    reason: 'You have used all 3 free listings. Upgrade to Premium for unlimited listings!',
  };
}

/**
 * Decrement free listings count after creating a listing
 */
export async function decrementFreeListings(userId: number): Promise<void> {
  await query(
    `UPDATE users SET
       free_listings_remaining = GREATEST(0, free_listings_remaining - 1),
       listings_count = listings_count + 1
     WHERE id = $1 AND subscription_tier = 'free'`,
    [userId]
  );
}

export { stripe };
