import { Navbar, Footer, Button, FeatureCard, PricingCard, type PricingTier } from '@traffic2u/ui';
import { UserPlus, Download, Zap, Shield, Users, BarChart3 } from 'lucide-react';
import Link from 'next/link';

const pricing: PricingTier[] = [
  { name: 'Free', description: 'Try it out', price: 0, interval: 'month', features: ['50 exports/month', 'Basic fields', 'Community support'], cta: 'Install Extension' },
  { name: 'Starter', description: 'For individuals', price: 19, interval: 'month', popular: true, features: ['500 exports/month', 'All profile fields', 'CSV export', 'Email support'], cta: 'Start Trial' },
  { name: 'Professional', description: 'For sales teams', price: 39, interval: 'month', features: ['2,000 exports/month', 'All Starter features', 'CRM integration', 'Bulk export', 'Priority support'], cta: 'Start Trial' },
  { name: 'Enterprise', description: 'For agencies', price: 99, interval: 'month', features: ['Unlimited exports', 'All Professional features', 'API access', 'White-label', 'Dedicated support'], cta: 'Contact Sales' },
];

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar logo={<UserPlus className="h-6 w-6 text-purple-600" />} appName="LeadExtract" onCtaClick={() => window.location.href = '/auth/signup'} />

      <section className="bg-gradient-to-b from-purple-50 to-white py-20 sm:py-32">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold sm:text-6xl">
            Extract LinkedIn Leads in{' '}
            <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">One Click</span>
          </h1>
          <p className="mt-6 text-lg text-gray-600 max-w-3xl mx-auto">
            Chrome extension for extracting LinkedIn profile data. Build prospect lists faster. Export to CSV or your CRM. 70% cheaper than ZoomInfo.
          </p>
          <div className="mt-10 flex justify-center gap-x-6">
            <Link href="/auth/signup"><Button size="xl">Install Extension</Button></Link>
          </div>
        </div>
      </section>

      <section id="features" className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-16">Built for sales teams</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <FeatureCard icon={<Zap className="h-8 w-8" />} title="One-Click Extract" description="Click extension icon on any LinkedIn profile. Instant export." />
            <FeatureCard icon={<Download className="h-8 w-8" />} title="CSV Export" description="Download leads as CSV. Import to Salesforce, HubSpot, etc." />
            <FeatureCard icon={<Users className="h-8 w-8" />} title="Bulk Extract" description="Extract multiple profiles at once. Save hours." />
            <FeatureCard icon={<Shield className="h-8 w-8" />} title="Compliant" description="Respects LinkedIn's terms. Safe to use." />
            <FeatureCard icon={<BarChart3 className="h-8 w-8" />} title="Dashboard" description="Track extracted leads. View history." />
            <FeatureCard icon={<UserPlus className="h-8 w-8" />} title="Enrichment" description="Get email, phone, company data automatically." />
          </div>
        </div>
      </section>

      <section id="pricing" className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-4">Pricing for sales teams</h2>
          <p className="text-center text-gray-600 mb-16">70% cheaper than ZoomInfo and Apollo</p>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 max-w-7xl mx-auto">
            {pricing.map(t => <PricingCard key={t.name} tier={t} />)}
          </div>
        </div>
      </section>

      <Footer appName="LeadExtract" />
    </div>
  );
}
