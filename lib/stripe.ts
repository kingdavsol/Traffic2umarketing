import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
  typescript: true,
})

export const SUBSCRIPTION_TIERS = {
  FREE: {
    name: 'Free',
    price: 0,
    captionsPerMonth: 10,
    features: [
      '10 captions per month',
      'Basic tone options',
      '1 social platform',
      'Emoji support',
      'Basic hashtags',
    ],
  },
  BASIC: {
    name: 'Basic',
    price: 9,
    priceId: process.env.STRIPE_BASIC_PRICE_ID!,
    captionsPerMonth: 100,
    features: [
      '100 captions per month',
      'All tone options',
      'All 5 social platforms',
      'Advanced hashtag research',
      'Save unlimited captions',
      'Caption history',
    ],
  },
  BUILDER: {
    name: 'Builder',
    price: 19,
    priceId: process.env.STRIPE_BUILDER_PRICE_ID!,
    captionsPerMonth: 500,
    features: [
      '500 captions per month',
      'Everything in Basic',
      'Trending memes access',
      'Hashtag analytics',
      'Custom templates',
      'Bulk generation (5 at once)',
      'Priority support',
    ],
  },
  PREMIUM: {
    name: 'Premium',
    price: 29,
    priceId: process.env.STRIPE_PREMIUM_PRICE_ID!,
    captionsPerMonth: -1, // unlimited
    features: [
      'Unlimited captions',
      'Everything in Builder',
      'AI caption improvement',
      'Social media scheduling (coming soon)',
      'Advanced analytics',
      'Bulk generation (10 at once)',
      'API access',
      'White-label options',
      'Priority support',
    ],
  },
}

export async function createCheckoutSession(
  userId: string,
  priceId: string,
  email: string
) {
  const session = await stripe.checkout.sessions.create({
    customer_email: email,
    client_reference_id: userId,
    payment_method_types: ['card'],
    mode: 'subscription',
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?success=true`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing?canceled=true`,
    metadata: {
      userId,
    },
  })

  return session
}

export async function createBillingPortalSession(customerId: string) {
  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings`,
  })

  return session
}

export async function cancelSubscription(subscriptionId: string) {
  const subscription = await stripe.subscriptions.cancel(subscriptionId)
  return subscription
}

export function getTierLimits(tier: string) {
  switch (tier) {
    case 'FREE':
      return SUBSCRIPTION_TIERS.FREE
    case 'BASIC':
      return SUBSCRIPTION_TIERS.BASIC
    case 'BUILDER':
      return SUBSCRIPTION_TIERS.BUILDER
    case 'PREMIUM':
      return SUBSCRIPTION_TIERS.PREMIUM
    default:
      return SUBSCRIPTION_TIERS.FREE
  }
}
