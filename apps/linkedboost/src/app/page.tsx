import { Navbar, Footer, Button, FeatureCard, PricingCard, type PricingTier } from '@traffic2u/ui';
import { Linkedin, TrendingUp, Sparkles, Calendar, BarChart3, Zap, Users, Target } from 'lucide-react';
import Link from 'next/link';

const pricing: PricingTier[] = [
  { name: 'Free', description: 'Get started', price: 0, interval: 'month', features: ['3 posts/week', 'Basic scheduling', 'Community support'], cta: 'Start Free' },
  { name: 'Starter', description: 'For individuals', price: 15, interval: 'month', popular: true, features: ['Unlimited posts', 'AI optimization', 'Best time to post', 'Analytics', 'Priority support'], cta: 'Start Trial' },
  { name: 'Professional', description: 'For creators', price: 29, interval: 'month', features: ['All Starter features', 'Team collaboration', 'Content calendar', 'Hashtag suggestions', 'API access'], cta: 'Start Trial' },
  { name: 'Enterprise', description: 'For agencies', price: 79, interval: 'month', features: ['All Professional features', 'White-label', 'Dedicated support', 'Custom integrations', 'SLA'], cta: 'Contact Sales' },
];

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar logo={<Linkedin className="h-6 w-6 text-blue-600" />} appName="LinkedBoost" onCtaClick={() => window.location.href = '/auth/signup'} />

      <section className="bg-gradient-to-b from-blue-50 to-white py-20 sm:py-32">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl text-center">
            <h1 className="text-4xl font-bold sm:text-6xl">
              Grow Your LinkedIn with{' '}
              <span className="bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">AI-Powered Posts</span>
            </h1>
            <p className="mt-6 text-lg text-gray-600 sm:text-xl">
              Schedule LinkedIn posts, optimize content with AI, and track engagement. Build authority and grow your network effortlessly.
            </p>
            <div className="mt-10 flex justify-center gap-x-6">
              <Link href="/auth/signup"><Button size="xl">Start Free</Button></Link>
              <Link href="#features"><Button variant="outline" size="xl"><Sparkles className="mr-2 h-5 w-5" />See Features</Button></Link>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-16">Everything to dominate LinkedIn</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
            <FeatureCard icon={<Sparkles className="h-8 w-8" />} title="AI Optimization" description="AI rewrites your posts for max engagement. Perfect tone and structure." />
            <FeatureCard icon={<Calendar className="h-8 w-8" />} title="Smart Scheduling" description="Post at optimal times for your audience. Auto-schedule or manual." />
            <FeatureCard icon={<BarChart3 className="h-8 w-8" />} title="Analytics" description="Track views, likes, comments, shares. Understand what works." />
            <FeatureCard icon={<Target className="h-8 w-8" />} title="Hashtag Suggestions" description="AI suggests best hashtags for reach. Stay trending." />
            <FeatureCard icon={<Users className="h-8 w-8" />} title="Team Collaboration" description="Multiple users, approval workflows, content calendar." />
            <FeatureCard icon={<Zap className="h-8 w-8" />} title="Content Ideas" description="AI generates post ideas based on your niche. Never run out." />
            <FeatureCard icon={<TrendingUp className="h-8 w-8" />} title="Growth Tracking" description="Monitor follower growth, engagement rate, profile views." />
            <FeatureCard icon={<Linkedin className="h-8 w-8" />} title="Native Integration" description="Direct LinkedIn API. Seamless posting experience." />
          </div>
        </div>
      </section>

      <section id="pricing" className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-4">Simple pricing</h2>
          <p className="text-center text-gray-600 mb-16">60% cheaper than Buffer and Hootsuite</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
            {pricing.map(t => <PricingCard key={t.name} tier={t} onSelect={() => window.location.href = '/auth/signup'} />)}
          </div>
        </div>
      </section>

      <section className="bg-blue-600 py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white">Ready to grow on LinkedIn?</h2>
          <p className="mt-4 text-lg text-blue-100">Join 10,000+ professionals using LinkedBoost</p>
          <div className="mt-10"><Link href="/auth/signup"><Button size="xl" variant="secondary">Start Free</Button></Link></div>
        </div>
      </section>

      <Footer appName="LinkedBoost" />
    </div>
  );
}
