import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@traffic2u/auth';
import { prisma } from '@traffic2u/database';

export async function GET(request: NextRequest) {
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

    if (!subscription) {
      return NextResponse.json(
        { message: 'No subscription found' },
        { status: 404 }
      );
    }

    // Get usage count for current month
    const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
    const usageCount = await prisma.usageRecord.count({
      where: {
        userId: session.user.id,
        feature: 'code_generation',
        createdAt: {
          gte: new Date(currentMonth + '-01'),
        },
      },
    });

    // Determine usage limit based on plan
    const planLimits = {
      FREE: 5,
      STARTER: 100,
      PROFESSIONAL: Infinity,
      ENTERPRISE: Infinity,
    };

    const usageLimit = planLimits[subscription.plan as keyof typeof planLimits];

    return NextResponse.json({
      plan: subscription.plan,
      status: subscription.status,
      currentPeriodEnd: subscription.currentPeriodEnd,
      cancelAtPeriodEnd: subscription.cancelAtPeriodEnd || false,
      usageCount,
      usageLimit,
    });
  } catch (error: any) {
    console.error('Subscription fetch error:', error);
    return NextResponse.json(
      { message: error.message || 'Failed to fetch subscription' },
      { status: 500 }
    );
  }
}
