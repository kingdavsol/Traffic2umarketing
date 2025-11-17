/**
 * Gig Worker Finance - Landing Page
 * AI-powered financial management for gig workers with income forecasting and tax tracking.
 */

import { useState } from 'react';
import Link from 'next/link';
import { Heart, TrendingUp, Award, Users, Lock, CheckCircle } from 'lucide-react';

export default function LandingPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault();
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="text-2xl">💰</span>
            <span className="text-xl font-bold text-gray-900">Gig Worker Finance</span>
          </div>
          <div className="flex gap-4">
            <Link href="/login" className="text-gray-700 hover:text-gray-900">Sign In</Link>
            <Link href="/signup" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition">Get Started</Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-purple-500 to-pink-500">
          Smart budgeting for variable income earners
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          AI-powered financial management for gig workers with income forecasting and tax tracking.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <Link href="/signup" className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-8 py-4 rounded-lg font-semibold text-lg transition transform hover:scale-105">
            Start Free Trial (7 Days)
          </Link>
          <button onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })} className="border-2 border-gray-400 hover:bg-gray-100 px-8 py-4 rounded-lg font-semibold text-lg transition">
            Learn More
          </button>
        </div>

        <div className="flex justify-center gap-8 text-sm text-gray-600 flex-wrap">
          <div>✓ Premium Content</div>
          <div>✓ Ad-Supported</div>
          <div>✓ Gamified</div>
          <div>✓ Mobile-First</div>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-4 py-20" id="features">
        <h2 className="text-4xl font-bold text-center mb-12">Key Features</h2>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Feature 1 */}
          <div className="bg-white rounded-lg shadow-lg p-8 border-l-4 purple-500">
            <h3 className="text-xl font-bold mb-3">Income Forecasting</h3>
            <p className="text-gray-600">Premium access to advanced income forecasting capabilities</p>
          </div>

          {/* Feature 2 */}
          <div className="bg-white rounded-lg shadow-lg p-8 border-l-4">
            <h3 className="text-xl font-bold mb-3">Auto Tax Deductions</h3>
            <p className="text-gray-600">Specialized tools built for your specific needs</p>
          </div>

          {/* Feature 3 */}
          <div className="bg-white rounded-lg shadow-lg p-8 border-l-4">
            <h3 className="text-xl font-bold mb-3">Quarterly Taxes</h3>
            <p className="text-gray-600">Expert-backed features you won't find elsewhere</p>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="max-w-7xl mx-auto px-4 py-20">
        <h2 className="text-4xl font-bold text-center mb-12">Pricing</h2>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Free */}
          <div className="border border-gray-300 rounded-xl p-8">
            <h3 className="text-2xl font-bold mb-2">Free</h3>
            <div className="text-4xl font-bold mb-6">$0<span className="text-lg text-gray-600">/month</span></div>
            <ul className="space-y-3 mb-8">
              <li>✓ Basic features</li>
              <li>✓ Ad-supported</li>
              <li>✓ Community access</li>
              <li>✗ Advanced features</li>
            </ul>
            <button className="w-full border border-blue-400 text-blue-600 py-3 rounded-lg hover:bg-blue-50">Get Started</button>
          </div>

          {/* Premium - Highlighted */}
          <div className="border-2 border-blue-500 rounded-xl p-8 bg-blue-50 relative transform md:scale-105">
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-bold">POPULAR</div>
            <h3 className="text-2xl font-bold mb-2">Premium</h3>
            <div className="text-4xl font-bold mb-6">$8.99<span className="text-lg text-gray-600">/month</span></div>
            <div className="text-sm text-blue-600 mb-6">7-day free trial</div>
            <ul className="space-y-3 mb-8">
              <li>✓ All features</li>
              <li>✓ No ads</li>
              <li>✓ Priority support</li>
              <li>✓ Advanced analytics</li>
            </ul>
            <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold">Start Free Trial</button>
          </div>

          {/* Enterprise */}
          <div className="border border-gray-300 rounded-xl p-8">
            <h3 className="text-2xl font-bold mb-2">Business</h3>
            <div className="text-4xl font-bold mb-6">Custom</div>
            <ul className="space-y-3 mb-8">
              <li>✓ All Premium</li>
              <li>✓ Team features</li>
              <li>✓ API access</li>
              <li>✓ Dedicated support</li>
            </ul>
            <button className="w-full border border-gray-400 py-3 rounded-lg hover:bg-gray-50">Contact Sales</button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-4xl mx-auto px-4 py-20 text-center">
        <h2 className="text-4xl font-bold mb-6">Ready to Get Started?</h2>
        <form onSubmit={handleEmailSignup} className="flex flex-col sm:flex-row gap-4 justify-center">
          <input type="email" placeholder="your@email.com" value={email} onChange={(e) => setEmail(e.target.value)} className="flex-1 px-6 py-4 bg-white border border-gray-300 rounded-lg focus:border-blue-500 outline-none" required />
          <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg font-semibold transition">Get Started Free</button>
        </form>
        <p className="text-sm text-gray-600 mt-4">No credit card required. 7-day free trial.</p>
        {submitted && <p className="text-green-600 mt-4">Check your email!</p>}
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 text-sm py-8">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p>© 2024 Gig Worker Finance. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
