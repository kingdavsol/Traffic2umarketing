import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@traffic2u/auth';
import { prisma } from '@traffic2u/database';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-11-20.acacia',
});

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { message: 'Unauthorized. Please sign in.' },
        { status: 401 }
      );
    }

    // Get user's subscription
    const subscription = await prisma.subscription.findFirst({
      where: { userId: session.user.id },
    });

    if (!subscription || !subscription.stripeSubscriptionId) {
      return NextResponse.json(
        { message: 'No active subscription found' },
        { status: 404 }
      );
    }

    // Cancel subscription at period end (don't immediately cancel)
    const updatedSubscription = await stripe.subscriptions.update(
      subscription.stripeSubscriptionId,
      {
        cancel_at_period_end: true,
      }
    );

    // Update database
    await prisma.subscription.update({
      where: { id: subscription.id },
      data: {
        cancelAtPeriodEnd: true,
      },
    });

    return NextResponse.json({
      message: 'Subscription will be canceled at the end of the billing period',
      cancelAt: new Date(updatedSubscription.current_period_end * 1000),
    });
  } catch (error: any) {
    console.error('Subscription cancellation error:', error);
    return NextResponse.json(
      { message: error.message || 'Failed to cancel subscription' },
      { status: 500 }
    );
  }
}
