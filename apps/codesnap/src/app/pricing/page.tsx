'use client';

import { useState } from 'react';
import { Button, Card, CardHeader, CardTitle, CardDescription, CardContent, Badge } from '@traffic2u/ui';
import { Check, Sparkles, Zap, Rocket } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import toast from 'react-hot-toast';

const plans = [
  {
    name: 'Free',
    price: '$0',
    period: 'forever',
    description: 'Perfect for trying out CodeSnap',
    features: [
      '5 conversions per month',
      'React, Vue, HTML support',
      'Basic code generation',
      'Community support',
    ],
    limitations: [
      'No Tailwind CSS support',
      'No advanced frameworks',
      'Limited customization',
    ],
    icon: Sparkles,
    color: 'text-gray-600',
    plan: 'FREE',
    cta: 'Get Started',
    href: '/auth/signup',
  },
  {
    name: 'Starter',
    price: '$19',
    period: 'month',
    description: 'For freelancers and small projects',
    features: [
      '100 conversions per month',
      'All frameworks (React, Vue, Svelte)',
      'Tailwind CSS support',
      'Priority support',
      'Export code history',
      'Custom templates',
    ],
    popular: true,
    icon: Zap,
    color: 'text-blue-600',
    plan: 'STARTER',
    cta: 'Start Free Trial',
  },
  {
    name: 'Professional',
    price: '$49',
    period: 'month',
    description: 'For professionals and teams',
    features: [
      'Unlimited conversions',
      'All Starter features',
      'API access',
      'Bulk conversion',
      'Team collaboration (up to 5)',
      'Advanced customization',
      'Priority email support',
      'Custom branding',
    ],
    icon: Rocket,
    color: 'text-purple-600',
    plan: 'PROFESSIONAL',
    cta: 'Start Free Trial',
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    description: 'For large teams and organizations',
    features: [
      'Everything in Professional',
      'Unlimited team members',
      'Dedicated account manager',
      'SLA guarantee',
      'Custom integration',
      'On-premise deployment option',
      'Advanced security features',
      'Training & onboarding',
    ],
    icon: Rocket,
    color: 'text-indigo-600',
    plan: 'ENTERPRISE',
    cta: 'Contact Sales',
    href: '/contact',
  },
];

export default function PricingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState<string | null>(null);

  // Show cancellation message if user canceled checkout
  if (searchParams.get('canceled') === 'true') {
    toast.error('Checkout canceled. You can try again anytime!');
  }

  const handleSubscribe = async (plan: string) => {
    if (plan === 'FREE') {
      router.push('/auth/signup');
      return;
    }

    if (plan === 'ENTERPRISE') {
      router.push('/contact');
      return;
    }

    setLoading(plan);

    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create checkout session');
      }

      const { url } = await response.json();

      // Redirect to Stripe Checkout
      window.location.href = url;
    } catch (error: any) {
      console.error('Subscription error:', error);
      toast.error(error.message || 'Failed to start subscription');
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Navigation */}
      <nav className="bg-white border-b">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <Sparkles className="h-6 w-6 text-blue-600" />
            <span className="text-xl font-bold">CodeSnap</span>
          </Link>
          <div className="flex items-center space-x-4">
            <Link href="/auth/signin">
              <Button variant="ghost">Sign In</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Pricing Header */}
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-5xl font-bold mb-4">Simple, Transparent Pricing</h1>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Choose the perfect plan for your needs. All plans include a 14-day free trial.
        </p>
      </div>

      {/* Pricing Cards */}
      <div className="container mx-auto px-4 pb-24">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
          {plans.map((planItem) => {
            const Icon = planItem.icon;
            return (
              <Card
                key={planItem.name}
                className={`relative ${
                  planItem.popular ? 'border-2 border-blue-500 shadow-xl scale-105' : ''
                }`}
              >
                {planItem.popular && (
                  <div className="absolute -top-4 left-0 right-0 flex justify-center">
                    <Badge className="bg-blue-500 text-white">Most Popular</Badge>
                  </div>
                )}
                <CardHeader>
                  <div className="flex items-center justify-between mb-4">
                    <Icon className={`h-8 w-8 ${planItem.color}`} />
                  </div>
                  <CardTitle className="text-2xl">{planItem.name}</CardTitle>
                  <CardDescription>{planItem.description}</CardDescription>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">{planItem.price}</span>
                    {planItem.period && (
                      <span className="text-gray-600 ml-2">/ {planItem.period}</span>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 mb-6">
                    {planItem.features.map((feature, index) => (
                      <li key={index} className="flex items-start">
                        <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button
                    className="w-full"
                    size="lg"
                    variant={planItem.popular ? 'default' : 'outline'}
                    onClick={() => handleSubscribe(planItem.plan)}
                    disabled={loading === planItem.plan}
                  >
                    {loading === planItem.plan ? 'Loading...' : planItem.cta}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* FAQ Section */}
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-2">Can I change plans later?</h3>
            <p className="text-gray-600">
              Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately,
              and we'll prorate any charges.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-2">What payment methods do you accept?</h3>
            <p className="text-gray-600">
              We accept all major credit cards (Visa, MasterCard, American Express) through our secure
              payment processor, Stripe.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-2">Is there a free trial?</h3>
            <p className="text-gray-600">
              Yes! All paid plans include a 14-day free trial. No credit card required to start.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-2">What happens when I reach my conversion limit?</h3>
            <p className="text-gray-600">
              You'll receive a notification when you're close to your limit. If you reach it, you can
              upgrade your plan or wait until the next billing cycle.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-2">Can I cancel anytime?</h3>
            <p className="text-gray-600">
              Absolutely. You can cancel your subscription at any time from your account settings. You'll
              retain access until the end of your billing period.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
