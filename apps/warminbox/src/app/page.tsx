import { Navbar, Footer, Button, FeatureCard, PricingCard, type PricingTier } from '@traffic2u/ui';
import { Mail, TrendingUp, Shield, Zap, CheckCircle, BarChart3, Clock, Globe } from 'lucide-react';
import Link from 'next/link';

const pricingTiers: PricingTier[] = [
  {
    name: 'Free',
    description: 'Try email warm-up for free',
    price: 0,
    interval: 'month',
    features: [
      '1 email account',
      'Up to 20 emails/day',
      'Basic deliverability monitoring',
      'Community support',
      'Email for 7 days',
    ],
    cta: 'Start Free',
  },
  {
    name: 'Starter',
    description: 'For individuals and small teams',
    price: 29,
    interval: 'month',
    popular: true,
    features: [
      '3 email accounts',
      'Up to 50 emails/day per account',
      'Advanced deliverability analytics',
      'Spam folder monitoring',
      'Auto-reply intelligence',
      'Priority email support',
      'Custom warmup schedules',
    ],
    cta: 'Start 7-Day Trial',
  },
  {
    name: 'Professional',
    description: 'For growing businesses',
    price: 59,
    interval: 'month',
    features: [
      '10 email accounts',
      'Up to 100 emails/day per account',
      'All Starter features',
      'Domain health monitoring',
      'Blacklist monitoring',
      'API access',
      'Team collaboration',
      '24/7 priority support',
    ],
    cta: 'Start 7-Day Trial',
  },
  {
    name: 'Enterprise',
    description: 'For agencies and large teams',
    price: 149,
    interval: 'month',
    features: [
      'Unlimited email accounts',
      'Unlimited emails/day',
      'All Professional features',
      'White-label reports',
      'Dedicated account manager',
      'Custom integration',
      'SLA guarantee',
      'On-premise deployment option',
    ],
    cta: 'Contact Sales',
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar
        logo={<Mail className="h-6 w-6 text-green-600" />}
        appName="WarmInbox"
        onCtaClick={() => window.location.href = '/auth/signup'}
      />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-green-50 to-white py-20 sm:py-32">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl text-center">
            <div className="mb-8 inline-flex items-center rounded-full bg-green-100 px-4 py-2 text-sm font-medium text-green-700">
              <CheckCircle className="mr-2 h-4 w-4" />
              Trusted by 10,000+ cold email senders
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl lg:text-7xl">
              Never Hit the{' '}
              <span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                Spam Folder
              </span>{' '}
              Again
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-600 sm:text-xl">
              Automatically warm up your email domain and improve deliverability. Build sender reputation,
              avoid spam filters, and land in the inbox every time. Perfect for cold email campaigns.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Link href="/auth/signup">
                <Button size="xl">
                  Start Free Trial
                </Button>
              </Link>
              <Link href="#features">
                <Button variant="outline" size="xl">
                  <BarChart3 className="mr-2 h-5 w-5" />
                  See How It Works
                </Button>
              </Link>
            </div>
            <p className="mt-6 text-sm text-gray-500">
              No credit card required • 7-day free trial • Setup in 2 minutes
            </p>
          </div>

          {/* Stats */}
          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="text-4xl font-bold text-green-600">98%</div>
              <div className="text-sm text-gray-600 mt-2">Inbox Placement Rate</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-green-600">10M+</div>
              <div className="text-sm text-gray-600 mt-2">Emails Warmed Up</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-green-600">14 Days</div>
              <div className="text-sm text-gray-600 mt-2">Average Warmup Time</div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 sm:py-32 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Email warmup made simple
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Set it and forget it. Our automated system handles everything.
            </p>
          </div>

          <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 text-green-600 mb-4">
                <span className="text-2xl font-bold">1</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Connect Your Email</h3>
              <p className="text-gray-600">
                Add your email accounts via SMTP or OAuth. Works with Gmail, Outlook, and any SMTP provider.
              </p>
            </div>

            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 text-green-600 mb-4">
                <span className="text-2xl font-bold">2</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">We Warm It Up</h3>
              <p className="text-gray-600">
                Our AI sends natural-looking emails to real inboxes, gradually increasing volume over 14 days.
              </p>
            </div>

            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 text-green-600 mb-4">
                <span className="text-2xl font-bold">3</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Start Cold Emailing</h3>
              <p className="text-gray-600">
                Your domain reputation is built. Send cold emails with confidence and watch your response rates soar.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 sm:py-32 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Everything you need for perfect deliverability
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Comprehensive tools to ensure your emails always reach the inbox
            </p>
          </div>

          <div className="mx-auto mt-16 grid max-w-6xl grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <FeatureCard
              icon={<TrendingUp className="h-8 w-8" />}
              title="Smart Ramp-Up"
              description="Gradually increase sending volume to build natural sender reputation without triggering spam filters."
            />
            <FeatureCard
              icon={<Shield className="h-8 w-8" />}
              title="Spam Protection"
              description="Real-time monitoring of spam scores and blacklist status. Get alerts before issues impact deliverability."
            />
            <FeatureCard
              icon={<Zap className="h-8 w-8" />}
              title="Auto Engagement"
              description="AI-powered replies and interactions to simulate real email conversations and boost engagement metrics."
            />
            <FeatureCard
              icon={<BarChart3 className="h-8 w-8" />}
              title="Advanced Analytics"
              description="Track deliverability metrics, inbox placement rates, and domain health scores in real-time."
            />
            <FeatureCard
              icon={<Mail className="h-8 w-8" />}
              title="Multi-Provider"
              description="Works with Gmail, Outlook, SMTP servers, and all major email providers. No limitations."
            />
            <FeatureCard
              icon={<Clock className="h-8 w-8" />}
              title="Automated Scheduling"
              description="Set custom warmup schedules or let our AI determine the optimal timing for your domain."
            />
            <FeatureCard
              icon={<Globe className="h-8 w-8" />}
              title="DNS Health Check"
              description="Monitor SPF, DKIM, and DMARC records. Get instant alerts for configuration issues."
            />
            <FeatureCard
              icon={<CheckCircle className="h-8 w-8" />}
              title="Peer Network"
              description="Join a network of 10,000+ real inboxes for authentic warmup conversations."
            />
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="bg-white py-20 sm:py-32">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Simple, transparent pricing
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              50% less than Warmbox and Lemwarm. Same results, better price.
            </p>
          </div>

          <div className="mx-auto mt-16 grid max-w-7xl grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {pricingTiers.map((tier) => (
              <PricingCard
                key={tier.name}
                tier={tier}
                onSelect={() => {
                  if (tier.name === 'Enterprise') {
                    window.location.href = '/contact';
                  } else {
                    window.location.href = '/auth/signup?plan=' + tier.name.toLowerCase();
                  }
                }}
              />
            ))}
          </div>

          <div className="mt-12 text-center">
            <p className="text-sm text-gray-600">
              All plans include a 7-day free trial. No credit card required.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-green-600 py-16 sm:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Ready to fix your email deliverability?
            </h2>
            <p className="mt-4 text-lg text-green-100">
              Join thousands of businesses landing in the inbox, not the spam folder.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Link href="/auth/signup">
                <Button size="xl" variant="secondary">
                  Start Free Trial
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer appName="WarmInbox" />
    </div>
  );
}
