import { Navbar, Footer, Button, FeatureCard, PricingCard, type PricingTier } from '@traffic2u/ui';
import { Bell, Megaphone, Code, Users, Sparkles, Zap } from 'lucide-react';
import Link from 'next/link';

const pricing: PricingTier[] = [
  {
    name: 'Free',
    description: 'For side projects',
    price: 0,
    interval: 'month',
    features: ['10 updates/month', 'Basic widget', 'Email notifications', 'Community support'],
    cta: 'Start Free',
  },
  {
    name: 'Starter',
    description: 'For growing products',
    price: 19,
    interval: 'month',
    popular: true,
    features: ['Unlimited updates', 'Custom branding', 'Advanced analytics', 'Slack integration', 'Priority support'],
    cta: 'Start Trial',
  },
  {
    name: 'Professional',
    description: 'For established products',
    price: 39,
    interval: 'month',
    features: ['All Starter features', 'White-label', 'API access', 'Custom domain', 'Team collaboration'],
    cta: 'Start Trial',
  },
  {
    name: 'Enterprise',
    description: 'For large teams',
    price: 79,
    interval: 'month',
    features: ['All Professional features', 'SSO', 'SLA', 'Dedicated support', 'Custom integration'],
    cta: 'Contact Sales',
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar logo={<Bell className="h-6 w-6 text-purple-600" />} appName="UpdateLog" onCtaClick={() => window.location.href = '/auth/signup'} />

      <section className="bg-gradient-to-b from-purple-50 to-white py-20 sm:py-32">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl text-center">
            <h1 className="text-4xl font-bold sm:text-6xl">
              Keep Users Engaged with{' '}
              <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Beautiful Updates
              </span>
            </h1>
            <p className="mt-6 text-lg text-gray-600 sm:text-xl">
              The easiest way to publish product updates and changelogs. Engage users, announce features, and build in public.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Link href="/auth/signup"><Button size="xl">Start Free</Button></Link>
              <Link href="#demo"><Button variant="outline" size="xl"><Megaphone className="mr-2 h-5 w-5" />See Demo</Button></Link>
            </div>
            <p className="mt-6 text-sm text-gray-500">No credit card • Setup in 2 minutes</p>
          </div>
        </div>
      </section>

      <section id="features" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-16">Everything you need for great changelogs</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
            <FeatureCard icon={<Bell className="h-8 w-8" />} title="Embeddable Widget" description="Beautiful widget for your app. Customizable and responsive." />
            <FeatureCard icon={<Megaphone className="h-8 w-8" />} title="Email Notifications" description="Auto-notify users about new updates. Increase engagement." />
            <FeatureCard icon={<Code className="h-8 w-8" />} title="Markdown Editor" description="Write updates in Markdown. Preview in real-time." />
            <FeatureCard icon={<Users className="h-8 w-8" />} title="User Segmentation" description="Target specific user groups with relevant updates." />
            <FeatureCard icon={<Sparkles className="h-8 w-8" />} title="Custom Branding" description="Match your brand colors and style perfectly." />
            <FeatureCard icon={<Zap className="h-8 w-8" />} title="Instant Publishing" description="Publish updates instantly. No deploy needed." />
          </div>
        </div>
      </section>

      <section id="pricing" className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-4">Simple pricing</h2>
          <p className="text-center text-gray-600 mb-16">50% less than Beamer and Canny</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
            {pricing.map(tier => <PricingCard key={tier.name} tier={tier} onSelect={() => window.location.href = '/auth/signup'} />)}
          </div>
        </div>
      </section>

      <Footer appName="UpdateLog" />
    </div>
  );
}
