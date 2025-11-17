'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/components/ui/use-toast'
import { Check, Sparkles, ArrowLeft } from 'lucide-react'
import { SUBSCRIPTION_TIERS } from '@/lib/stripe'

export default function PricingPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState<string | null>(null)

  const handleSubscribe = async (priceId: string, tier: string) => {
    if (!session) {
      router.push('/login')
      return
    }

    setIsLoading(tier)

    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId }),
      })

      const data = await response.json()

      if (data.url) {
        window.location.href = data.url
      } else {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to create checkout session',
        })
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Something went wrong. Please try again.',
      })
    } finally {
      setIsLoading(null)
    }
  }

  const tiers = [
    {
      ...SUBSCRIPTION_TIERS.FREE,
      tier: 'FREE',
    },
    {
      ...SUBSCRIPTION_TIERS.BASIC,
      tier: 'BASIC',
    },
    {
      ...SUBSCRIPTION_TIERS.BUILDER,
      tier: 'BUILDER',
      popular: true,
    },
    {
      ...SUBSCRIPTION_TIERS.PREMIUM,
      tier: 'PREMIUM',
    },
  ]

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <Link href={session ? '/dashboard' : '/'} className="flex items-center gap-2">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          </Link>
          <Link href="/" className="flex items-center space-x-2">
            <Sparkles className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">CaptionGenius</span>
          </Link>
          <div className="w-20" />
        </div>
      </header>

      <main className="flex-1 py-20">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center mb-16">
            <h1 className="mb-4 text-4xl font-bold sm:text-5xl">
              Choose Your Plan
            </h1>
            <p className="text-lg text-muted-foreground">
              Start free and upgrade as you grow. All plans include core features.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {tiers.map((tier) => (
              <Card
                key={tier.tier}
                className={tier.popular ? 'relative border-2 border-primary' : ''}
              >
                {tier.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-primary px-4 py-1 text-sm font-medium text-white">
                    Popular
                  </div>
                )}
                <CardHeader>
                  <CardTitle className="text-2xl">{tier.name}</CardTitle>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">${tier.price}</span>
                    <span className="text-muted-foreground">/month</span>
                  </div>
                  <CardDescription className="mt-2">
                    {tier.captionsPerMonth === -1
                      ? 'Unlimited captions'
                      : `${tier.captionsPerMonth} captions per month`}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {tier.features.map((feature, index) => (
                      <li key={index} className="flex items-start">
                        <Check className="mr-2 h-5 w-5 flex-shrink-0 text-primary" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  {tier.tier === 'FREE' ? (
                    <Link href="/register" className="w-full">
                      <Button variant="outline" className="w-full">
                        Get Started
                      </Button>
                    </Link>
                  ) : (
                    <Button
                      className="w-full"
                      variant={tier.popular ? 'default' : 'outline'}
                      onClick={() => handleSubscribe(tier.priceId, tier.tier)}
                      disabled={isLoading === tier.tier}
                    >
                      {isLoading === tier.tier
                        ? 'Processing...'
                        : `Choose ${tier.name}`}
                    </Button>
                  )}
                </CardFooter>
              </Card>
            ))}
          </div>

          <div className="mt-16 text-center">
            <h2 className="mb-8 text-2xl font-bold">Frequently Asked Questions</h2>
            <div className="mx-auto max-w-3xl space-y-6 text-left">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Can I change plans later?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Yes! You can upgrade or downgrade your plan at any time. Changes will be
                    reflected in your next billing cycle.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">What happens when I reach my limit?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    You won't be able to generate new captions until your monthly limit resets or
                    you upgrade to a higher plan. Your saved captions will always remain accessible.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Do you offer refunds?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Yes, we offer a 14-day money-back guarantee on all paid plans. If you're not
                    satisfied, contact us for a full refund.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
