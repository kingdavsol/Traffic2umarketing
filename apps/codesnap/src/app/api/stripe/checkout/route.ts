import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@traffic2u/auth';
import { prisma } from '@traffic2u/database';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-11-20.acacia',
});

// Price IDs for CodeSnap plans (replace with your actual Stripe Price IDs)
const PRICE_IDS = {
  STARTER: process.env.STRIPE_STARTER_PRICE_ID || 'price_starter',
  PROFESSIONAL: process.env.STRIPE_PROFESSIONAL_PRICE_ID || 'price_professional',
  ENTERPRISE: process.env.STRIPE_ENTERPRISE_PRICE_ID || 'price_enterprise',
};

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

    const { plan } = await request.json();

    if (!plan || !['STARTER', 'PROFESSIONAL', 'ENTERPRISE'].includes(plan)) {
      return NextResponse.json(
        { message: 'Invalid plan selected' },
        { status: 400 }
      );
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { subscription: true },
    });

    if (!user) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }

    // Check if user already has this plan
    if (user.subscription?.plan === plan) {
      return NextResponse.json(
        { message: 'You already have this plan' },
        { status: 400 }
      );
    }

    // Get or create Stripe customer
    let customerId = user.stripeCustomerId;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email!,
        name: user.name || undefined,
        metadata: {
          userId: user.id,
          app: 'codesnap',
        },
      });

      customerId = customer.id;

      // Update user with Stripe customer ID
      await prisma.user.update({
        where: { id: user.id },
        data: { stripeCustomerId: customerId },
      });
    }

    // Create Stripe Checkout Session
    const checkoutSession = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: PRICE_IDS[plan as keyof typeof PRICE_IDS],
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXTAUTH_URL}/dashboard?success=true&plan=${plan}`,
      cancel_url: `${process.env.NEXTAUTH_URL}/pricing?canceled=true`,
      metadata: {
        userId: user.id,
        plan,
        app: 'codesnap',
      },
      subscription_data: {
        metadata: {
          userId: user.id,
          plan,
          app: 'codesnap',
        },
      },
      allow_promotion_codes: true,
    });

    return NextResponse.json({
      sessionId: checkoutSession.id,
      url: checkoutSession.url,
    });
  } catch (error: any) {
    console.error('Stripe checkout error:', error);
    return NextResponse.json(
      { message: error.message || 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
