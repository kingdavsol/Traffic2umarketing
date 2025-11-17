import { Navbar, Footer, Button, FeatureCard, PricingCard, type PricingTier } from '@traffic2u/ui';
import { QrCode, Smartphone, Utensils, Image, Globe, Zap } from 'lucide-react';
import Link from 'next/link';

const pricing: PricingTier[] = [
  { name: 'Free', description: 'For trying out', price: 0, interval: 'month', features: ['1 menu', 'Basic QR code', 'Up to 10 items'], cta: 'Start Free' },
  { name: 'Starter', description: 'For single location', price: 9, interval: 'month', popular: true, features: ['Unlimited items', 'Custom branding', 'Image uploads', 'Analytics', 'Email support'], cta: 'Start Trial' },
  { name: 'Professional', description: 'For multiple locations', price: 19, interval: 'month', features: ['3 locations', 'All Starter features', 'Custom domain', 'No MenuQR branding', 'Priority support'], cta: 'Start Trial' },
  { name: 'Enterprise', description: 'For franchises', price: 49, interval: 'month', features: ['Unlimited locations', 'All Professional features', 'White-label', 'API access', 'Dedicated support'], cta: 'Contact Sales' },
];

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar logo={<QrCode className="h-6 w-6 text-red-600" />} appName="MenuQR" onCtaClick={() => window.location.href = '/auth/signup'} />

      <section className="bg-gradient-to-b from-red-50 to-white py-20 sm:py-32">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold sm:text-6xl">
            Digital Menus with{' '}
            <span className="bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">QR Codes</span>
          </h1>
          <p className="mt-6 text-lg text-gray-600 max-w-3xl mx-auto">
            Create beautiful digital menus for your restaurant. Customers scan QR code to see menu on their phone. Update instantly, no reprinting.
          </p>
          <div className="mt-10 flex justify-center gap-x-6">
            <Link href="/auth/signup"><Button size="xl">Create Free Menu</Button></Link>
          </div>
        </div>
      </section>

      <section id="features" className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-16">Everything for digital menus</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <FeatureCard icon={<QrCode className="h-8 w-8" />} title="QR Code Generation" description="Beautiful QR codes. Print and place on tables." />
            <FeatureCard icon={<Smartphone className="h-8 w-8" />} title="Mobile Optimized" description="Perfect on all devices. Fast loading." />
            <FeatureCard icon={<Image className="h-8 w-8" />} title="Image Uploads" description="Add photos of your dishes. Increase orders." />
            <FeatureCard icon={<Zap className="h-8 w-8" />} title="Instant Updates" description="Change prices or items instantly. No reprinting." />
            <FeatureCard icon={<Globe className="h-8 w-8" />} title="Multi-Language" description="Serve international customers. Auto-translate." />
            <FeatureCard icon={<Utensils className="h-8 w-8" />} title="Categories" description="Organize by appetizers, mains, desserts, drinks." />
          </div>
        </div>
      </section>

      <section id="pricing" className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-16">Pricing for restaurants</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 max-w-7xl mx-auto">
            {pricing.map(t => <PricingCard key={t.name} tier={t} />)}
          </div>
        </div>
      </section>

      <Footer appName="MenuQR" />
    </div>
  );
}
