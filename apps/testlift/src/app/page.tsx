import { Navbar, Footer, Button, FeatureCard, PricingCard, type PricingTier } from '@traffic2u/ui';
import { FlaskConical, TrendingUp, Zap, Eye, BarChart3, Code, Users, Target } from 'lucide-react';
import Link from 'next/link';

const pricing: PricingTier[] = [
  {
    name: 'Free',
    description: 'Perfect for getting started',
    price: 0,
    interval: 'month',
    features: ['1 active test', '1,000 visitors/month', 'Basic analytics', 'Community support', 'Visual editor'],
    cta: 'Start Free',
  },
  {
    name: 'Starter',
    description: 'For growing websites',
    price: 29,
    interval: 'month',
    popular: true,
    features: ['5 active tests', '50,000 visitors/month', 'Advanced analytics', 'Heatmaps', 'Goal tracking', 'Email support', 'No TestLift branding'],
    cta: 'Start 7-Day Trial',
  },
  {
    name: 'Professional',
    description: 'For serious marketers',
    price: 74,
    interval: 'month',
    features: ['Unlimited tests', '250,000 visitors/month', 'All Starter features', 'Multivariate testing', 'API access', 'Priority support', 'Custom JS/CSS'],
    cta: 'Start 7-Day Trial',
  },
  {
    name: 'Enterprise',
    description: 'For large organizations',
    price: 199,
    interval: 'month',
    features: ['Unlimited everything', 'All Professional features', 'Dedicated account manager', 'SLA guarantee', 'White-label', 'On-premise option', 'Custom integrations'],
    cta: 'Contact Sales',
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar logo={<FlaskConical className="h-6 w-6 text-orange-600" />} appName="TestLift" onCtaClick={() => window.location.href = '/auth/signup'} />

      <section className="bg-gradient-to-b from-orange-50 to-white py-20 sm:py-32">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl text-center">
            <div className="mb-8 inline-flex items-center rounded-full bg-orange-100 px-4 py-2 text-sm font-medium text-orange-700">
              <TrendingUp className="mr-2 h-4 w-4" />
              Join 5,000+ marketers optimizing conversions
            </div>
            <h1 className="text-4xl font-bold sm:text-6xl">
              A/B Testing Made{' '}
              <span className="bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                Simple & Affordable
              </span>
            </h1>
            <p className="mt-6 text-lg text-gray-600 sm:text-xl">
              No-code A/B testing platform for landing pages. Visual editor, real-time analytics, and conversion tracking.
              75% cheaper than Optimizely and VWO.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Link href="/auth/signup"><Button size="xl">Start Free Trial</Button></Link>
              <Link href="#demo"><Button variant="outline" size="xl"><Eye className="mr-2 h-5 w-5" />Watch Demo</Button></Link>
            </div>
            <p className="mt-6 text-sm text-gray-500">No credit card • Setup in 5 minutes • Cancel anytime</p>
          </div>

          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center p-6 bg-white rounded-xl shadow-sm">
              <div className="text-4xl font-bold text-orange-600">75%</div>
              <div className="text-sm text-gray-600 mt-2">Cheaper than competitors</div>
            </div>
            <div className="text-center p-6 bg-white rounded-xl shadow-sm">
              <div className="text-4xl font-bold text-orange-600">2.4x</div>
              <div className="text-sm text-gray-600 mt-2">Average conversion lift</div>
            </div>
            <div className="text-center p-6 bg-white rounded-xl shadow-sm">
              <div className="text-4xl font-bold text-orange-600">5 min</div>
              <div className="text-sm text-gray-600 mt-2">Setup time</div>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-16">Everything you need to optimize conversions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
            <FeatureCard icon={<Eye className="h-8 w-8" />} title="Visual Editor" description="Point-and-click editor. No coding required. Change text, images, colors instantly." />
            <FeatureCard icon={<BarChart3 className="h-8 w-8" />} title="Real-Time Analytics" description="See results as they happen. Statistical significance calculator included." />
            <FeatureCard icon={<Target className="h-8 w-8" />} title="Goal Tracking" description="Track clicks, form submissions, purchases. Multiple goals per test." />
            <FeatureCard icon={<Code className="h-8 w-8" />} title="Custom Code" description="Add custom CSS/JS for advanced tests. Full control when you need it." />
            <FeatureCard icon={<Users className="h-8 w-8" />} title="Audience Targeting" description="Target by location, device, traffic source. Precise control." />
            <FeatureCard icon={<Zap className="h-8 w-8" />} title="Lightning Fast" description="< 20ms load time impact. Won't slow down your site." />
            <FeatureCard icon={<FlaskConical className="h-8 w-8" />} title="Multivariate Testing" description="Test multiple variations simultaneously. Find the winning combination." />
            <FeatureCard icon={<TrendingUp className="h-8 w-8" />} title="Heatmaps" description="See where visitors click and scroll. Identify optimization opportunities." />
          </div>
        </div>
      </section>

      <section id="pricing" className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-4">Simple, transparent pricing</h2>
          <p className="text-center text-gray-600 mb-16">75% less than Optimizely and VWO. Same features, better price.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
            {pricing.map(tier => <PricingCard key={tier.name} tier={tier} onSelect={() => window.location.href = tier.name === 'Enterprise' ? '/contact' : '/auth/signup'} />)}
          </div>
        </div>
      </section>

      <section className="bg-orange-600 py-16 sm:py-24">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white sm:text-4xl">Ready to boost conversions?</h2>
          <p className="mt-4 text-lg text-orange-100">Join thousands of marketers optimizing with TestLift</p>
          <div className="mt-10"><Link href="/auth/signup"><Button size="xl" variant="secondary">Start Free Trial</Button></Link></div>
        </div>
      </section>

      <Footer appName="TestLift" />
    </div>
  );
}
