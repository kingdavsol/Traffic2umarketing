import { Navbar, Footer, Button, FeatureCard, PricingCard, type PricingTier } from '@traffic2u/ui';
import { DollarSign, TrendingUp, BarChart3, Users, Zap, Shield } from 'lucide-react';
import Link from 'next/link';

const pricing: PricingTier[] = [
  { name: 'Free', description: 'For testing', price: 0, interval: 'month', features: ['Up to $10K MRR', 'Basic analytics', 'Community support'], cta: 'Start Free' },
  { name: 'Starter', description: 'For startups', price: 19, interval: 'month', popular: true, features: ['Up to $50K MRR', 'All metrics (MRR, churn, LTV)', 'Advanced analytics', 'Email support'], cta: 'Start Trial' },
  { name: 'Professional', description: 'For growing businesses', price: 49, interval: 'month', features: ['Up to $250K MRR', 'All Starter features', 'Cohort analysis', 'API access', 'Priority support'], cta: 'Start Trial' },
  { name: 'Enterprise', description: 'For large companies', price: 149, interval: 'month', features: ['Unlimited MRR', 'All Professional features', 'Custom reports', 'Dedicated support', 'White-label'], cta: 'Contact Sales' },
];

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar logo={<DollarSign className="h-6 w-6 text-green-600" />} appName="RevenueView" onCtaClick={() => window.location.href = '/auth/signup'} />

      <section className="bg-gradient-to-b from-green-50 to-white py-20 sm:py-32">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold sm:text-6xl">
            Beautiful Analytics for{' '}
            <span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">Stripe</span>
          </h1>
          <p className="mt-6 text-lg text-gray-600 max-w-3xl mx-auto">
            Track MRR, churn, LTV, and all your revenue metrics in one place. Built specifically for Stripe users. 80% cheaper than Baremetrics.
          </p>
          <div className="mt-10 flex justify-center gap-x-6">
            <Link href="/auth/signup"><Button size="xl">Start Free</Button></Link>
            <Link href="#features"><Button variant="outline" size="xl">See Features</Button></Link>
          </div>
        </div>
      </section>

      <section id="features" className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-16">Everything for revenue analytics</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <FeatureCard icon={<TrendingUp className="h-8 w-8" />} title="MRR Tracking" description="Real-time Monthly Recurring Revenue. New, expansion, contraction, churn." />
            <FeatureCard icon={<BarChart3 className="h-8 w-8" />} title="Cohort Analysis" description="Understand retention by signup cohort. Find your best customers." />
            <FeatureCard icon={<Users className="h-8 w-8" />} title="Customer LTV" description="Lifetime value calculations. Optimize acquisition spend." />
            <FeatureCard icon={<Zap className="h-8 w-8" />} title="Real-Time" description="Data syncs every hour. Always up-to-date metrics." />
            <FeatureCard icon={<Shield className="h-8 w-8" />} title="Secure" description="Read-only Stripe access. Bank-level encryption." />
            <FeatureCard icon={<DollarSign className="h-8 w-8" />} title="Forecasting" description="Revenue predictions based on historical trends." />
          </div>
        </div>
      </section>

      <section id="pricing" className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-4">Simple pricing</h2>
          <p className="text-center text-gray-600 mb-16">80% less than Baremetrics and ChartMogul</p>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 max-w-7xl mx-auto">
            {pricing.map(t => <PricingCard key={t.name} tier={t} />)}
          </div>
        </div>
      </section>

      <Footer appName="RevenueView" />
    </div>
  );
}
