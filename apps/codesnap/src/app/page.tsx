import { Navbar, Footer, Button, FeatureCard, PricingCard, type PricingTier } from '@traffic2u/ui';
import { Sparkles, Zap, Code, Eye, Download, Shield, Clock, Palette } from 'lucide-react';
import Link from 'next/link';

const pricingTiers: PricingTier[] = [
  {
    name: 'Free',
    description: 'Perfect for trying out CodeSnap',
    price: 0,
    interval: 'month',
    features: [
      '3 conversions per month',
      'React & HTML/CSS output',
      'Basic code optimization',
      'Community support',
      '720p screenshot resolution',
    ],
    cta: 'Start Free',
  },
  {
    name: 'Starter',
    description: 'For individual developers',
    price: 19,
    interval: 'month',
    popular: true,
    features: [
      '50 conversions per month',
      'All frameworks (React, Vue, Svelte, etc.)',
      'Advanced code optimization',
      'Priority email support',
      '1080p screenshot resolution',
      'Code download & export',
      'Custom styling options',
    ],
    cta: 'Start 7-Day Trial',
  },
  {
    name: 'Professional',
    description: 'For professional developers',
    price: 39,
    interval: 'month',
    features: [
      '200 conversions per month',
      'All Starter features',
      'Component library generation',
      'TypeScript support',
      'API access',
      '4K screenshot resolution',
      'Figma plugin integration',
      '24/7 priority support',
    ],
    cta: 'Start 7-Day Trial',
  },
  {
    name: 'Enterprise',
    description: 'For teams and agencies',
    price: 79,
    interval: 'month',
    features: [
      'Unlimited conversions',
      'All Professional features',
      'Team collaboration',
      'Custom AI model training',
      'White-label options',
      'Dedicated account manager',
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
        logo={<Sparkles className="h-6 w-6 text-blue-600" />}
        appName="CodeSnap"
        onCtaClick={() => window.location.href = '/auth/signup'}
      />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-blue-50 to-white py-20 sm:py-32">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl text-center">
            <div className="mb-8 inline-flex items-center rounded-full bg-blue-100 px-4 py-2 text-sm font-medium text-blue-700">
              <Sparkles className="mr-2 h-4 w-4" />
              Powered by GPT-4 Vision
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl lg:text-7xl">
              Transform Screenshots into{' '}
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Production Code
              </span>
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-600 sm:text-xl">
              Convert any UI screenshot into clean, production-ready code in seconds.
              Support for React, Vue, Svelte, and plain HTML/CSS. Save hours on every project.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Link href="/auth/signup">
                <Button size="xl">
                  Start Free Trial
                </Button>
              </Link>
              <Link href="#demo">
                <Button variant="outline" size="xl">
                  <Eye className="mr-2 h-5 w-5" />
                  Watch Demo
                </Button>
              </Link>
            </div>
            <p className="mt-6 text-sm text-gray-500">
              No credit card required • 3 free conversions • Cancel anytime
            </p>
          </div>

          {/* Hero Image Placeholder */}
          <div className="mt-16 mx-auto max-w-5xl">
            <div className="rounded-xl border-2 border-gray-200 bg-gradient-to-br from-gray-50 to-gray-100 p-8 shadow-2xl">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="text-sm font-semibold text-gray-700">Upload Screenshot</div>
                  <div className="aspect-video rounded-lg bg-white border-2 border-dashed border-gray-300 flex items-center justify-center">
                    <Upload className="h-12 w-12 text-gray-400" />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="text-sm font-semibold text-gray-700">Get Clean Code</div>
                  <div className="aspect-video rounded-lg bg-gray-900 p-4 overflow-hidden">
                    <pre className="text-xs text-green-400 font-mono">
                      <code>{`<div className="flex...">\n  <button>Click</button>\n</div>`}</code>
                    </pre>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 sm:py-32">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Everything you need to code faster
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Powered by advanced AI vision models and optimized for developer productivity
            </p>
          </div>

          <div className="mx-auto mt-16 grid max-w-6xl grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <FeatureCard
              icon={<Zap className="h-8 w-8" />}
              title="Lightning Fast"
              description="Get production-ready code in under 10 seconds. No waiting, no manual cleanup."
            />
            <FeatureCard
              icon={<Code className="h-8 w-8" />}
              title="Multi-Framework"
              description="Support for React, Vue, Svelte, Angular, and plain HTML/CSS. Your choice."
            />
            <FeatureCard
              icon={<Palette className="h-8 w-8" />}
              title="Pixel Perfect"
              description="AI-powered analysis ensures your code matches the design exactly."
            />
            <FeatureCard
              icon={<Shield className="h-8 w-8" />}
              title="Clean & Secure"
              description="Production-ready, optimized code following best practices and security standards."
            />
            <FeatureCard
              icon={<Clock className="h-8 w-8" />}
              title="Save Hours"
              description="Reduce development time by up to 70%. Focus on logic, not layout."
            />
            <FeatureCard
              icon={<Download className="h-8 w-8" />}
              title="Easy Export"
              description="Download as files, copy to clipboard, or integrate via API."
            />
            <FeatureCard
              icon={<Sparkles className="h-8 w-8" />}
              title="Smart Components"
              description="Automatically generates reusable components from your screenshots."
            />
            <FeatureCard
              icon={<Eye className="h-8 w-8" />}
              title="Real-time Preview"
              description="See your code come to life instantly with live preview mode."
            />
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="bg-gray-50 py-20 sm:py-32">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Simple, transparent pricing
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              25% less than competitors. Start free, upgrade when you need more.
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
      <section className="bg-blue-600 py-16 sm:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Ready to code 10x faster?
            </h2>
            <p className="mt-4 text-lg text-blue-100">
              Join thousands of developers already using CodeSnap to ship faster.
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

      <Footer appName="CodeSnap" />
    </div>
  );
}

function Upload({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className={className}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
      />
    </svg>
  );
}
