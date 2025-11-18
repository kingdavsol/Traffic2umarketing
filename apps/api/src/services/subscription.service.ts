import { PrismaClient } from '@prisma/client';
import Stripe from 'stripe';

const prisma = new PrismaClient();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16'
});

interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  interval: string;
  features: string[];
}

class SubscriptionService {
  // Define pricing plans
  plans: Record<string, SubscriptionPlan> = {
    free: {
      id: 'free',
      name: 'Free',
      price: 0,
      interval: 'month',
      features: [
        'Up to 2 vehicles',
        'Basic problem lookup',
        '3 maintenance reminders per month',
        'Community access'
      ]
    },
    pro: {
      id: 'pro',
      name: 'Pro',
      price: 999, // $9.99
      interval: 'month',
      features: [
        'Unlimited vehicles',
        'All problem guides',
        'Unlimited reminders',
        'Priority support',
        'Advanced analytics',
        'DIY tutorial access'
      ]
    },
    business: {
      id: 'business',
      name: 'Business',
      price: 2999, // $29.99
      interval: 'month',
      features: [
        'Everything in Pro',
        'Fleet management (10+ vehicles)',
        'API access',
        'Bulk exports',
        'Dedicated support',
        'Custom integrations'
      ]
    }
  };

  /**
   * Create a subscription for a user
   */
  async createSubscription(
    userId: string,
    planId: string,
    paymentMethodId: string
  ): Promise<any> {
    if (!this.plans[planId]) {
      throw new Error(`Invalid plan: ${planId}`);
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new Error('User not found');
    }

    let customerId = user.stripeCustomerId;

    // Create Stripe customer if doesn't exist
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.name || 'User'
      });

      customerId = customer.id;

      await prisma.user.update({
        where: { id: userId },
        data: { stripeCustomerId: customerId }
      });
    }

    // Attach payment method to customer
    await stripe.paymentMethods.attach(paymentMethodId, {
      customer: customerId
    });

    // Set as default payment method
    await stripe.customers.update(customerId, {
      invoice_settings: {
        default_payment_method: paymentMethodId
      }
    });

    const priceId = this.getPriceId(planId);

    // Create subscription
    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: priceId }],
      default_payment_method: paymentMethodId,
      expand: ['latest_invoice.payment_intent']
    });

    // Save to database
    await prisma.subscription.create({
      data: {
        userId,
        stripeSubscriptionId: subscription.id,
        plan: planId,
        status: subscription.status,
        currentPeriodStart: new Date(subscription.current_period_start * 1000),
        currentPeriodEnd: new Date(subscription.current_period_end * 1000)
      }
    });

    return subscription;
  }

  /**
   * Handle Stripe webhook - subscription updated
   */
  async handleSubscriptionUpdated(stripeSubscription: any): Promise<void> {
    const subscription = await prisma.subscription.findUnique({
      where: { stripeSubscriptionId: stripeSubscription.id }
    });

    if (subscription) {
      await prisma.subscription.update({
        where: { id: subscription.id },
        data: {
          status: stripeSubscription.status,
          currentPeriodStart: new Date(stripeSubscription.current_period_start * 1000),
          currentPeriodEnd: new Date(stripeSubscription.current_period_end * 1000)
        }
      });
    }
  }

  /**
   * Handle Stripe webhook - subscription deleted
   */
  async handleSubscriptionDeleted(stripeSubscriptionId: string): Promise<void> {
    const subscription = await prisma.subscription.findUnique({
      where: { stripeSubscriptionId: stripeSubscriptionId }
    });

    if (subscription) {
      await prisma.subscription.update({
        where: { id: subscription.id },
        data: { status: 'canceled' }
      });
    }
  }

  /**
   * Cancel subscription
   */
  async cancelSubscription(userId: string): Promise<void> {
    const subscription = await prisma.subscription.findUnique({
      where: { userId }
    });

    if (!subscription) {
      throw new Error('No subscription found');
    }

    await stripe.subscriptions.del(subscription.stripeSubscriptionId);

    await prisma.subscription.update({
      where: { id: subscription.id },
      data: { status: 'canceled' }
    });
  }

  /**
   * Get user's active subscription
   */
  async getUserSubscription(userId: string): Promise<any> {
    return await prisma.subscription.findUnique({
      where: { userId }
    });
  }

  /**
   * Check if user has premium access
   */
  async hasPremiumAccess(userId: string): Promise<boolean> {
    const subscription = await this.getUserSubscription(userId);

    if (!subscription) {
      return false;
    }

    return subscription.status === 'active' || subscription.status === 'past_due';
  }

  /**
   * Check if user has specific plan
   */
  async hasPlan(userId: string, planId: string): Promise<boolean> {
    const subscription = await this.getUserSubscription(userId);

    if (!subscription) {
      return false;
    }

    return subscription.plan === planId && (subscription.status === 'active' || subscription.status === 'past_due');
  }

  /**
   * Update subscription plan
   */
  async updatePlan(userId: string, newPlanId: string): Promise<any> {
    if (!this.plans[newPlanId]) {
      throw new Error(`Invalid plan: ${newPlanId}`);
    }

    const subscription = await this.getUserSubscription(userId);
    if (!subscription) {
      throw new Error('No subscription found');
    }

    const newPriceId = this.getPriceId(newPlanId);

    const updated = await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
      items: [
        {
          id: (await stripe.subscriptions.retrieve(subscription.stripeSubscriptionId)).items.data[0].id,
          price: newPriceId
        }
      ]
    });

    await prisma.subscription.update({
      where: { userId },
      data: { plan: newPlanId }
    });

    return updated;
  }

  /**
   * Get pricing for all plans
   */
  getPricing(): Record<string, SubscriptionPlan> {
    return this.plans;
  }

  /**
   * Get specific plan
   */
  getPlan(planId: string): SubscriptionPlan | undefined {
    return this.plans[planId];
  }

  /**
   * Map local plan ID to Stripe price ID
   */
  private getPriceId(planId: string): string {
    const priceIds: Record<string, string> = {
      pro: process.env.STRIPE_PRICE_PRO || '',
      business: process.env.STRIPE_PRICE_BUSINESS || ''
    };

    if (!priceIds[planId]) {
      throw new Error(`Stripe price ID not configured for plan: ${planId}`);
    }

    return priceIds[planId];
  }

  /**
   * Get subscription metrics (admin)
   */
  async getMetrics(): Promise<{
    totalSubscriptions: number;
    activeSubscriptions: number;
    canceledSubscriptions: number;
    pastDueSubscriptions: number;
    mrr: number;
    churnRate: number;
  }> {
    const subscriptions = await prisma.subscription.findMany();

    const active = subscriptions.filter(s => s.status === 'active').length;
    const pastDue = subscriptions.filter(s => s.status === 'past_due').length;
    const canceled = subscriptions.filter(s => s.status === 'canceled').length;

    // Calculate MRR
    let mrr = 0;
    for (const sub of subscriptions) {
      if (sub.status === 'active' || sub.status === 'past_due') {
        const plan = this.plans[sub.plan];
        if (plan) {
          mrr += plan.price;
        }
      }
    }

    // Calculate churn rate (canceled / total at start of period)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const canceledLastMonth = subscriptions.filter(
      s => s.status === 'canceled' && new Date(s.updatedAt) > thirtyDaysAgo
    ).length;

    const churnRate = subscriptions.length > 0 ? (canceledLastMonth / subscriptions.length) * 100 : 0;

    return {
      totalSubscriptions: subscriptions.length,
      activeSubscriptions: active,
      canceledSubscriptions: canceled,
      pastDueSubscriptions: pastDue,
      mrr,
      churnRate: Math.round(churnRate * 100) / 100
    };
  }
}

export default new SubscriptionService();
