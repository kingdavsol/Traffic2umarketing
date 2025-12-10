import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
  Sparkles,
  Zap,
  TrendingUp,
  BarChart3,
  Users,
  Shield,
  Check,
  ArrowRight,
} from 'lucide-react'

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <Sparkles className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">CaptionGenius</span>
          </Link>
          <nav className="hidden md:flex items-center space-x-6">
            <Link
              href="#features"
              className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
            >
              Features
            </Link>
            <Link
              href="#pricing"
              className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
            >
              Pricing
            </Link>
            <Link
              href="#testimonials"
              className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
            >
              Testimonials
            </Link>
            <Link href="/login">
              <Button variant="ghost">Login</Button>
            </Link>
            <Link href="/register">
              <Button>Get Started</Button>
            </Link>
          </nav>
          <div className="md:hidden">
            <Link href="/register">
              <Button size="sm">Sign Up</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="container py-20 md:py-32">
          <div className="mx-auto max-w-4xl text-center">
            <div className="mb-8 inline-flex items-center rounded-full border px-4 py-1.5 text-sm">
              <Sparkles className="mr-2 h-4 w-4 text-primary" />
              <span>Trusted by 10,000+ creators</span>
            </div>
            <h1 className="mb-6 text-4xl font-extrabold tracking-tight sm:text-6xl md:text-7xl">
              Create Viral Social Media Captions{' '}
              <span className="bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                in Seconds
              </span>
            </h1>
            <p className="mb-10 text-lg text-muted-foreground md:text-xl">
              Stop staring at a blank screen. Let AI craft perfect captions for
              Instagram, TikTok, Facebook, Twitter, and LinkedIn. Save 30-60
              minutes daily and boost engagement.
            </p>
            <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
              <Link href="/register">
                <Button size="lg" className="text-lg">
                  Start Free Trial <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="#demo">
                <Button size="lg" variant="outline" className="text-lg">
                  See How It Works
                </Button>
              </Link>
            </div>
            <p className="mt-6 text-sm text-muted-foreground">
              No credit card required • 10 free captions • Cancel anytime
            </p>
          </div>
        </section>

        {/* Social Proof */}
        <section className="border-y bg-muted/50 py-12">
          <div className="container">
            <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">50K+</div>
                <div className="text-sm text-muted-foreground">
                  Captions Generated
                </div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">10K+</div>
                <div className="text-sm text-muted-foreground">
                  Happy Creators
                </div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">4.9/5</div>
                <div className="text-sm text-muted-foreground">
                  Average Rating
                </div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">35%</div>
                <div className="text-sm text-muted-foreground">
                  Engagement Boost
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="container py-20 md:py-32">
          <div className="mx-auto max-w-2xl text-center mb-16">
            <h2 className="mb-4 text-3xl font-bold sm:text-4xl md:text-5xl">
              Everything You Need to Dominate Social Media
            </h2>
            <p className="text-lg text-muted-foreground">
              Powerful features designed for content creators, marketers, and
              businesses
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-lg border bg-card p-8">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <Sparkles className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mb-2 text-xl font-bold">AI-Powered Generation</h3>
              <p className="text-muted-foreground">
                Advanced GPT-4 AI creates unique, engaging captions tailored to
                your content and brand voice.
              </p>
            </div>

            <div className="rounded-lg border bg-card p-8">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mb-2 text-xl font-bold">5 Social Platforms</h3>
              <p className="text-muted-foreground">
                Optimized captions for Instagram, Facebook, Twitter, LinkedIn,
                and TikTok with platform-specific best practices.
              </p>
            </div>

            <div className="rounded-lg border bg-card p-8">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <TrendingUp className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mb-2 text-xl font-bold">Trending Memes</h3>
              <p className="text-muted-foreground">
                Access real-time trending memes and viral content ideas to stay
                relevant and boost engagement.
              </p>
            </div>

            <div className="rounded-lg border bg-card p-8">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <BarChart3 className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mb-2 text-xl font-bold">Hashtag Analytics</h3>
              <p className="text-muted-foreground">
                Discover high-performing hashtags with real-time analytics and
                trend data for maximum reach.
              </p>
            </div>

            <div className="rounded-lg border bg-card p-8">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <Zap className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mb-2 text-xl font-bold">Bulk Generation</h3>
              <p className="text-muted-foreground">
                Generate up to 10 captions at once and choose the perfect one
                for your post.
              </p>
            </div>

            <div className="rounded-lg border bg-card p-8">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mb-2 text-xl font-bold">Save & Organize</h3>
              <p className="text-muted-foreground">
                Save your favorite captions, create folders, and build a
                content library for future use.
              </p>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="border-y bg-muted/50 py-20 md:py-32">
          <div className="container">
            <div className="mx-auto max-w-2xl text-center mb-16">
              <h2 className="mb-4 text-3xl font-bold sm:text-4xl md:text-5xl">
                Simple, Transparent Pricing
              </h2>
              <p className="text-lg text-muted-foreground">
                Choose the plan that fits your needs. All plans include core
                features.
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
              {/* Free Tier */}
              <div className="rounded-lg border bg-card p-8">
                <h3 className="mb-2 text-2xl font-bold">Free</h3>
                <div className="mb-4">
                  <span className="text-4xl font-bold">$0</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
                <p className="mb-6 text-sm text-muted-foreground">
                  Perfect for trying out CaptionGenius
                </p>
                <Link href="/register">
                  <Button className="w-full" variant="outline">
                    Get Started
                  </Button>
                </Link>
                <ul className="mt-6 space-y-3">
                  <li className="flex items-start">
                    <Check className="mr-2 h-5 w-5 text-primary flex-shrink-0" />
                    <span className="text-sm">10 captions per month</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="mr-2 h-5 w-5 text-primary flex-shrink-0" />
                    <span className="text-sm">1 social platform</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="mr-2 h-5 w-5 text-primary flex-shrink-0" />
                    <span className="text-sm">Basic tone options</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="mr-2 h-5 w-5 text-primary flex-shrink-0" />
                    <span className="text-sm">Emoji support</span>
                  </li>
                </ul>
              </div>

              {/* Basic Tier */}
              <div className="rounded-lg border bg-card p-8">
                <h3 className="mb-2 text-2xl font-bold">Basic</h3>
                <div className="mb-4">
                  <span className="text-4xl font-bold">$9</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
                <p className="mb-6 text-sm text-muted-foreground">
                  For individual creators
                </p>
                <Link href="/register">
                  <Button className="w-full">Choose Basic</Button>
                </Link>
                <ul className="mt-6 space-y-3">
                  <li className="flex items-start">
                    <Check className="mr-2 h-5 w-5 text-primary flex-shrink-0" />
                    <span className="text-sm">100 captions per month</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="mr-2 h-5 w-5 text-primary flex-shrink-0" />
                    <span className="text-sm">All 5 social platforms</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="mr-2 h-5 w-5 text-primary flex-shrink-0" />
                    <span className="text-sm">All tone options</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="mr-2 h-5 w-5 text-primary flex-shrink-0" />
                    <span className="text-sm">Hashtag research</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="mr-2 h-5 w-5 text-primary flex-shrink-0" />
                    <span className="text-sm">Save unlimited captions</span>
                  </li>
                </ul>
              </div>

              {/* Builder Tier - Popular */}
              <div className="relative rounded-lg border-2 border-primary bg-card p-8">
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-primary px-4 py-1 text-sm font-medium text-white">
                  Popular
                </div>
                <h3 className="mb-2 text-2xl font-bold">Builder</h3>
                <div className="mb-4">
                  <span className="text-4xl font-bold">$19</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
                <p className="mb-6 text-sm text-muted-foreground">
                  For serious content creators
                </p>
                <Link href="/register">
                  <Button className="w-full">Choose Builder</Button>
                </Link>
                <ul className="mt-6 space-y-3">
                  <li className="flex items-start">
                    <Check className="mr-2 h-5 w-5 text-primary flex-shrink-0" />
                    <span className="text-sm">500 captions per month</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="mr-2 h-5 w-5 text-primary flex-shrink-0" />
                    <span className="text-sm">Everything in Basic</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="mr-2 h-5 w-5 text-primary flex-shrink-0" />
                    <span className="text-sm">Trending memes access</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="mr-2 h-5 w-5 text-primary flex-shrink-0" />
                    <span className="text-sm">Hashtag analytics</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="mr-2 h-5 w-5 text-primary flex-shrink-0" />
                    <span className="text-sm">Bulk generation (5x)</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="mr-2 h-5 w-5 text-primary flex-shrink-0" />
                    <span className="text-sm">Custom templates</span>
                  </li>
                </ul>
              </div>

              {/* Premium Tier */}
              <div className="rounded-lg border bg-card p-8">
                <h3 className="mb-2 text-2xl font-bold">Premium</h3>
                <div className="mb-4">
                  <span className="text-4xl font-bold">$29</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
                <p className="mb-6 text-sm text-muted-foreground">
                  For agencies and businesses
                </p>
                <Link href="/register">
                  <Button className="w-full">Choose Premium</Button>
                </Link>
                <ul className="mt-6 space-y-3">
                  <li className="flex items-start">
                    <Check className="mr-2 h-5 w-5 text-primary flex-shrink-0" />
                    <span className="text-sm font-bold">Unlimited captions</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="mr-2 h-5 w-5 text-primary flex-shrink-0" />
                    <span className="text-sm">Everything in Builder</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="mr-2 h-5 w-5 text-primary flex-shrink-0" />
                    <span className="text-sm">AI caption improvement</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="mr-2 h-5 w-5 text-primary flex-shrink-0" />
                    <span className="text-sm">Bulk generation (10x)</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="mr-2 h-5 w-5 text-primary flex-shrink-0" />
                    <span className="text-sm">Advanced analytics</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="mr-2 h-5 w-5 text-primary flex-shrink-0" />
                    <span className="text-sm">Priority support</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="mr-2 h-5 w-5 text-primary flex-shrink-0" />
                    <span className="text-sm">API access</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="container py-20 md:py-32">
          <div className="mx-auto max-w-3xl rounded-2xl bg-gradient-to-r from-primary to-purple-600 p-12 text-center text-white">
            <h2 className="mb-4 text-3xl font-bold sm:text-4xl">
              Ready to Transform Your Social Media?
            </h2>
            <p className="mb-8 text-lg opacity-90">
              Join thousands of creators who save hours every week with AI-powered
              captions.
            </p>
            <Link href="/register">
              <Button size="lg" variant="secondary" className="text-lg">
                Start Your Free Trial <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <p className="mt-4 text-sm opacity-75">
              No credit card required • 10 free captions • Cancel anytime
            </p>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t bg-muted/50 py-12">
        <div className="container">
          <div className="grid gap-8 md:grid-cols-4">
            <div>
              <Link href="/" className="mb-4 flex items-center space-x-2">
                <Sparkles className="h-6 w-6 text-primary" />
                <span className="text-xl font-bold">CaptionGenius</span>
              </Link>
              <p className="text-sm text-muted-foreground">
                AI-powered caption generation for social media creators.
              </p>
            </div>
            <div>
              <h3 className="mb-4 text-sm font-semibold">Product</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link
                    href="#features"
                    className="text-muted-foreground hover:text-primary"
                  >
                    Features
                  </Link>
                </li>
                <li>
                  <Link
                    href="#pricing"
                    className="text-muted-foreground hover:text-primary"
                  >
                    Pricing
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="mb-4 text-sm font-semibold">Company</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="#" className="text-muted-foreground hover:text-primary">
                    About
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-muted-foreground hover:text-primary">
                    Blog
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="mb-4 text-sm font-semibold">Legal</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="#" className="text-muted-foreground hover:text-primary">
                    Privacy
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-muted-foreground hover:text-primary">
                    Terms
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-8 border-t pt-8 text-center text-sm text-muted-foreground">
            © 2024 CaptionGenius. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}
