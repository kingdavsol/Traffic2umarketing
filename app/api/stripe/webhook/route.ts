import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { stripe } from '@/lib/stripe'
import { prisma } from '@/lib/db'
import Stripe from 'stripe'

export async function POST(req: Request) {
  const body = await req.text()
  const signature = headers().get('stripe-signature')!

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err: any) {
    return NextResponse.json(
      { error: `Webhook Error: ${err.message}` },
      { status: 400 }
    )
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const userId = session.client_reference_id || session.metadata?.userId

        if (!userId) break

        const subscription = await stripe.subscriptions.retrieve(
          session.subscription as string
        )

        const tier = getTierFromPriceId(subscription.items.data[0].price.id)

        await prisma.user.update({
          where: { id: userId },
          data: {
            stripeCustomerId: session.customer as string,
            stripeSubscriptionId: subscription.id,
            subscriptionTier: tier,
            subscriptionEndsAt: new Date(subscription.current_period_end * 1000),
            monthlyCapLimit: getCapLimit(tier),
          },
        })
        break
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice
        const subscriptionId = invoice.subscription as string

        const user = await prisma.user.findFirst({
          where: { stripeSubscriptionId: subscriptionId },
        })

        if (user) {
          await prisma.user.update({
            where: { id: user.id },
            data: {
              captionsGenerated: 0, // Reset monthly count
            },
          })
        }
        break
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription

        const user = await prisma.user.findFirst({
          where: { stripeSubscriptionId: subscription.id },
        })

        if (user) {
          const tier = getTierFromPriceId(subscription.items.data[0].price.id)

          await prisma.user.update({
            where: { id: user.id },
            data: {
              subscriptionTier: tier,
              subscriptionEndsAt: new Date(
                subscription.current_period_end * 1000
              ),
              monthlyCapLimit: getCapLimit(tier),
            },
          })
        }
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription

        await prisma.user.updateMany({
          where: { stripeSubscriptionId: subscription.id },
          data: {
            subscriptionTier: 'FREE',
            stripeSubscriptionId: null,
            subscriptionEndsAt: null,
            monthlyCapLimit: 10,
          },
        })
        break
      }
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook handler error:', error)
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    )
  }
}

function getTierFromPriceId(priceId: string): string {
  if (priceId === process.env.STRIPE_BASIC_PRICE_ID) return 'BASIC'
  if (priceId === process.env.STRIPE_BUILDER_PRICE_ID) return 'BUILDER'
  if (priceId === process.env.STRIPE_PREMIUM_PRICE_ID) return 'PREMIUM'
  return 'FREE'
}

function getCapLimit(tier: string): number {
  switch (tier) {
    case 'BASIC':
      return 100
    case 'BUILDER':
      return 500
    case 'PREMIUM':
      return -1
    default:
      return 10
  }
}
