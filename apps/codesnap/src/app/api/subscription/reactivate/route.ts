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
        { message: 'No subscription found' },
        { status: 404 }
      );
    }

    if (!subscription.cancelAtPeriodEnd) {
      return NextResponse.json(
        { message: 'Subscription is not scheduled for cancellation' },
        { status: 400 }
      );
    }

    // Reactivate subscription by removing cancel_at_period_end
    await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
      cancel_at_period_end: false,
    });

    // Update database
    await prisma.subscription.update({
      where: { id: subscription.id },
      data: {
        cancelAtPeriodEnd: false,
      },
    });

    return NextResponse.json({
      message: 'Subscription reactivated successfully',
    });
  } catch (error: any) {
    console.error('Subscription reactivation error:', error);
    return NextResponse.json(
      { message: error.message || 'Failed to reactivate subscription' },
      { status: 500 }
    );
  }
}
