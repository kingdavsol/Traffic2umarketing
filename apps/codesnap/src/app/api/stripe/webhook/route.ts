import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@traffic2u/database';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-11-20.acacia',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!signature) {
      return NextResponse.json(
        { message: 'No signature provided' },
        { status: 400 }
      );
    }

    // Verify webhook signature
    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err: any) {
      console.error('Webhook signature verification failed:', err.message);
      return NextResponse.json(
        { message: `Webhook signature verification failed: ${err.message}` },
        { status: 400 }
      );
    }

    // Handle different event types
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutSessionCompleted(session);
        break;
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionChange(subscription);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionDeleted(subscription);
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        await handleInvoicePaymentSucceeded(invoice);
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        await handleInvoicePaymentFailed(invoice);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { message: error.message || 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.userId;
  const plan = session.metadata?.plan;

  if (!userId || !plan) {
    console.error('Missing metadata in checkout session:', session.id);
    return;
  }

  // Get subscription ID
  const subscriptionId = session.subscription as string;

  if (!subscriptionId) {
    console.error('No subscription ID in checkout session:', session.id);
    return;
  }

  // Update or create subscription in database
  await prisma.subscription.upsert({
    where: { userId },
    create: {
      userId,
      plan: plan as 'FREE' | 'STARTER' | 'PROFESSIONAL' | 'ENTERPRISE',
      status: 'ACTIVE',
      stripeSubscriptionId: subscriptionId,
      stripeCustomerId: session.customer as string,
      currentPeriodEnd: new Date(session.expires_at! * 1000),
    },
    update: {
      plan: plan as 'FREE' | 'STARTER' | 'PROFESSIONAL' | 'ENTERPRISE',
      status: 'ACTIVE',
      stripeSubscriptionId: subscriptionId,
      stripeCustomerId: session.customer as string,
      currentPeriodEnd: new Date(session.expires_at! * 1000),
    },
  });

  console.log(`Subscription created/updated for user ${userId} with plan ${plan}`);
}

async function handleSubscriptionChange(subscription: Stripe.Subscription) {
  const userId = subscription.metadata?.userId;

  if (!userId) {
    console.error('No userId in subscription metadata:', subscription.id);
    return;
  }

  const plan = subscription.metadata?.plan || 'STARTER';
  const status = mapStripeStatus(subscription.status);

  await prisma.subscription.upsert({
    where: { userId },
    create: {
      userId,
      plan: plan as 'FREE' | 'STARTER' | 'PROFESSIONAL' | 'ENTERPRISE',
      status,
      stripeSubscriptionId: subscription.id,
      stripeCustomerId: subscription.customer as string,
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
    },
    update: {
      plan: plan as 'FREE' | 'STARTER' | 'PROFESSIONAL' | 'ENTERPRISE',
      status,
      stripeSubscriptionId: subscription.id,
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
    },
  });

  console.log(`Subscription updated for user ${userId}: ${status}`);
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const userId = subscription.metadata?.userId;

  if (!userId) {
    console.error('No userId in subscription metadata:', subscription.id);
    return;
  }

  // Downgrade to FREE plan
  await prisma.subscription.update({
    where: { userId },
    data: {
      plan: 'FREE',
      status: 'CANCELED',
      canceledAt: new Date(),
    },
  });

  console.log(`Subscription canceled for user ${userId}, downgraded to FREE`);
}

async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
  const subscriptionId = invoice.subscription as string;

  if (!subscriptionId) {
    return;
  }

  // Update subscription status to active
  await prisma.subscription.updateMany({
    where: { stripeSubscriptionId: subscriptionId },
    data: { status: 'ACTIVE' },
  });

  console.log(`Payment succeeded for subscription ${subscriptionId}`);
}

async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  const subscriptionId = invoice.subscription as string;

  if (!subscriptionId) {
    return;
  }

  // Update subscription status to past_due
  await prisma.subscription.updateMany({
    where: { stripeSubscriptionId: subscriptionId },
    data: { status: 'PAST_DUE' },
  });

  console.log(`Payment failed for subscription ${subscriptionId}`);

  // TODO: Send email notification to user about failed payment
}

function mapStripeStatus(stripeStatus: Stripe.Subscription.Status): 'ACTIVE' | 'CANCELED' | 'PAST_DUE' | 'TRIALING' {
  switch (stripeStatus) {
    case 'active':
      return 'ACTIVE';
    case 'canceled':
    case 'unpaid':
      return 'CANCELED';
    case 'past_due':
      return 'PAST_DUE';
    case 'trialing':
      return 'TRIALING';
    default:
      return 'ACTIVE';
  }
}
