/**
 * Mental Health for Professionals - Landing Page
 * Marketing-focused homepage with CTAs and feature highlights
 */

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Zap, Brain, TrendingUp, Award, Users, Lock } from 'lucide-react';

export default function LandingPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    // Integration with Resend
    try {
      const response = await fetch('/api/auth/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        setSubmitted(true);
        setEmail('');
      }
    } catch (error) {
      console.error('Signup failed:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur-md border-b border-purple-500/20">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Brain className="w-8 h-8 text-purple-400" />
            <span className="text-xl font-bold">MindFlow Pro</span>
          </div>
          <div className="flex gap-4">
            <Link href="/login" className="text-gray-300 hover:text-white">
              Sign In
            </Link>
            <Link
              href="/signup"
              className="bg-purple-600 hover:bg-purple-700 px-6 py-2 rounded-lg transition"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400">
          Your Workplace Stress Ends Here
        </h1>
        <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
          AI-powered stress management designed for professionals. Get personalized interventions that fit your work calendar, not generic meditation.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <Link
            href="/signup"
            className="bg-purple-600 hover:bg-purple-700 px-8 py-4 rounded-lg font-semibold text-lg transition transform hover:scale-105"
          >
            Start Free Trial (7 Days)
          </Link>
          <button
            onClick={() => document.getElementById('demo')?.scrollIntoView({ behavior: 'smooth' })}
            className="border-2 border-purple-400 hover:bg-purple-400/10 px-8 py-4 rounded-lg font-semibold text-lg transition"
          >
            Watch Demo
          </button>
        </div>

        {/* Trust Badges */}
        <div className="flex justify-center gap-8 text-sm text-gray-400 flex-wrap">
          <div>✓ 4.8★ Ratings</div>
          <div>✓ 50K+ Users</div>
          <div>✓ HIPAA Compliant</div>
          <div>✓ No ads for premium</div>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-4 py-20">
        <h2 className="text-4xl font-bold text-center mb-12">Why Professionals Choose MindFlow</h2>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Feature 1 */}
          <div className="bg-gradient-to-br from-purple-900/40 to-slate-900 border border-purple-500/30 rounded-xl p-6 hover:border-purple-400/60 transition">
            <Zap className="w-12 h-12 text-purple-400 mb-4" />
            <h3 className="text-xl font-bold mb-3">AI-Powered Stress Detection</h3>
            <p className="text-gray-300">
              Real-time stress analysis based on your calendar, deadlines, and work patterns. Get personalized interventions BEFORE burnout.
            </p>
            <div className="mt-4 text-purple-400 text-sm font-semibold">
              Free: Weekly overview • Premium: Real-time alerts
            </div>
          </div>

          {/* Feature 2 */}
          <div className="bg-gradient-to-br from-purple-900/40 to-slate-900 border border-purple-500/30 rounded-xl p-6 hover:border-purple-400/60 transition">
            <TrendingUp className="w-12 h-12 text-purple-400 mb-4" />
            <h3 className="text-xl font-bold mb-3">Micro-Interventions for Busy Pros</h3>
            <p className="text-gray-300">
              2-5 minute guided sessions that actually fit your day. Breathing exercises, quick mindfulness, or tactical anxiety relief—your choice.
            </p>
            <div className="mt-4 text-purple-400 text-sm font-semibold">
              Free: 3/day • Premium: Unlimited
            </div>
          </div>

          {/* Feature 3 */}
          <div className="bg-gradient-to-br from-purple-900/40 to-slate-900 border border-purple-500/30 rounded-xl p-6 hover:border-purple-400/60 transition">
            <Users className="w-12 h-12 text-purple-400 mb-4" />
            <h3 className="text-xl font-bold mb-3">Corporate Dashboard (Premium)</h3>
            <p className="text-gray-300">
              HR teams see aggregate wellness trends, not individual data. Reduce stress before it becomes turnover. Completely anonymous.
            </p>
            <div className="mt-4 text-purple-400 text-sm font-semibold">
              $3-5 per employee/month
            </div>
          </div>

          {/* Feature 4 */}
          <div className="bg-gradient-to-br from-purple-900/40 to-slate-900 border border-purple-500/30 rounded-xl p-6 hover:border-purple-400/60 transition">
            <Award className="w-12 h-12 text-purple-400 mb-4" />
            <h3 className="text-xl font-bold mb-3">Streak Rewards & Badges</h3>
            <p className="text-gray-300">
              Gamified wellness with daily streaks, achievement badges, and leaderboards. Make stress management fun, not another chore.
            </p>
            <div className="mt-4 text-purple-400 text-sm font-semibold">
              Free: Basic streaks • Premium: Advanced rewards
            </div>
          </div>

          {/* Feature 5 */}
          <div className="bg-gradient-to-br from-purple-900/40 to-slate-900 border border-purple-500/30 rounded-xl p-6 hover:border-purple-400/60 transition">
            <Lock className="w-12 h-12 text-purple-400 mb-4" />
            <h3 className="text-xl font-bold mb-3">Privacy-First Design</h3>
            <p className="text-gray-300">
              Your data is encrypted end-to-end. HIPAA-compliant. We never sell your stress patterns to employers or insurers.
            </p>
            <div className="mt-4 text-purple-400 text-sm font-semibold">
              Premium: Encrypted backup
            </div>
          </div>

          {/* Feature 6 */}
          <div className="bg-gradient-to-br from-purple-900/40 to-slate-900 border border-purple-500/30 rounded-xl p-6 hover:border-purple-400/60 transition">
            <Brain className="w-12 h-12 text-purple-400 mb-4" />
            <h3 className="text-xl font-bold mb-3">Science-Backed Techniques</h3>
            <p className="text-gray-300">
              CBT, mindfulness, and breathing techniques validated by clinical researchers. Not pseudoscience—real evidence-based interventions.
            </p>
            <div className="mt-4 text-purple-400 text-sm font-semibold">
              All tiers included
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="max-w-7xl mx-auto px-4 py-20">
        <h2 className="text-4xl font-bold text-center mb-4">Simple, Transparent Pricing</h2>
        <p className="text-center text-gray-400 mb-12">
          Start free. Upgrade when you're ready. Cancel anytime.
        </p>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Free Tier */}
          <div className="border border-gray-600 rounded-xl p-8">
            <h3 className="text-2xl font-bold mb-2">Free</h3>
            <p className="text-gray-400 mb-6">Perfect for getting started</p>
            <div className="text-4xl font-bold mb-6">
              $0<span className="text-lg text-gray-400">/month</span>
            </div>
            <ul className="space-y-3 mb-8 text-gray-300">
              <li>✓ 3 sessions/day</li>
              <li>✓ Weekly stress overview</li>
              <li>✓ Basic streaks & badges</li>
              <li>✗ AI stress detection</li>
              <li>✗ Unlimited sessions</li>
              <li>✗ Corporate dashboard</li>
            </ul>
            <button className="w-full border border-purple-400 text-purple-400 py-3 rounded-lg hover:bg-purple-400/10 transition">
              Get Started
            </button>
          </div>

          {/* Premium Tier - Highlighted */}
          <div className="border-2 border-purple-500 rounded-xl p-8 bg-gradient-to-br from-purple-900/20 to-transparent relative">
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-purple-600 px-4 py-1 rounded-full text-sm font-bold">
              MOST POPULAR
            </div>
            <h3 className="text-2xl font-bold mb-2">Premium</h3>
            <p className="text-gray-400 mb-6">For serious professionals</p>
            <div className="text-4xl font-bold mb-6">
              $9.99<span className="text-lg text-gray-400">/month</span>
            </div>
            <div className="text-sm text-purple-400 mb-6">7-day free trial</div>
            <ul className="space-y-3 mb-8 text-gray-300">
              <li>✓ Unlimited sessions</li>
              <li>✓ Real-time AI stress alerts</li>
              <li>✓ Advanced analytics</li>
              <li>✓ Export stress reports</li>
              <li>✓ Priority support</li>
              <li>✓ No ads, ever</li>
            </ul>
            <button className="w-full bg-purple-600 hover:bg-purple-700 py-3 rounded-lg font-semibold transition">
              Start Free Trial
            </button>
          </div>

          {/* Business Tier */}
          <div className="border border-gray-600 rounded-xl p-8">
            <h3 className="text-2xl font-bold mb-2">Business</h3>
            <p className="text-gray-400 mb-6">For teams & HR departments</p>
            <div className="text-4xl font-bold mb-6">
              $3-5<span className="text-lg text-gray-400">/user/month</span>
            </div>
            <ul className="space-y-3 mb-8 text-gray-300">
              <li>✓ All Premium features</li>
              <li>✓ Corporate dashboard</li>
              <li>✓ Wellness trends & analytics</li>
              <li>✓ Admin controls</li>
              <li>✓ SSO/SAML integration</li>
              <li>✓ Dedicated support</li>
            </ul>
            <button className="w-full border border-purple-400 text-purple-400 py-3 rounded-lg hover:bg-purple-400/10 transition">
              Contact Sales
            </button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-4xl mx-auto px-4 py-20 text-center">
        <h2 className="text-4xl font-bold mb-6">Ready to Reclaim Your Wellbeing?</h2>
        <p className="text-xl text-gray-300 mb-8">
          Join 50K+ professionals who've reduced burnout by 40% on average.
        </p>
        <form onSubmit={handleEmailSignup} className="flex flex-col sm:flex-row gap-4">
          <input
            type="email"
            placeholder="your@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="flex-1 px-6 py-4 bg-slate-800 rounded-lg border border-purple-500/30 focus:border-purple-400 outline-none text-white"
            required
          />
          <button
            type="submit"
            className="bg-purple-600 hover:bg-purple-700 px-8 py-4 rounded-lg font-semibold transition whitespace-nowrap"
          >
            {submitted ? 'Check your email!' : 'Get Started Free'}
          </button>
        </form>
        <p className="text-sm text-gray-400 mt-4">
          No credit card required. 7-day free trial on premium features.
        </p>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-purple-500/20 text-gray-400 text-sm py-8">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <h4 className="font-bold text-white mb-3">Product</h4>
            <ul className="space-y-2">
              <li><a href="#" className="hover:text-white">Features</a></li>
              <li><a href="#" className="hover:text-white">Pricing</a></li>
              <li><a href="#" className="hover:text-white">Roadmap</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-white mb-3">Company</h4>
            <ul className="space-y-2">
              <li><a href="#" className="hover:text-white">About</a></li>
              <li><a href="#" className="hover:text-white">Blog</a></li>
              <li><a href="#" className="hover:text-white">Contact</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-white mb-3">Legal</h4>
            <ul className="space-y-2">
              <li><a href="/terms" className="hover:text-white">Terms</a></li>
              <li><a href="/privacy" className="hover:text-white">Privacy</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-white mb-3">Follow</h4>
            <ul className="space-y-2">
              <li><a href="#" className="hover:text-white">Twitter</a></li>
              <li><a href="#" className="hover:text-white">LinkedIn</a></li>
            </ul>
          </div>
        </div>
        <div className="text-center mt-8 pt-8 border-t border-purple-500/20">
          <p>© 2024 MindFlow Pro. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
