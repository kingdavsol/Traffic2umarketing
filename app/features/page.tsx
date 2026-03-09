'use client';

import Link from 'next/link';
import { ArrowRight, Zap, BarChart3, Sparkles, Lock, Share2, Trello } from 'lucide-react';

export default function FeaturesPage() {
  const features = [
    {
      icon: Zap,
      title: 'AI-Powered Generation',
      description: 'Advanced GPT-4 AI creates unique, engaging captions tailored to your content and brand voice.',
    },
    {
      icon: Share2,
      title: '5 Social Platforms',
      description: 'Optimized captions for Instagram, Facebook, Twitter, LinkedIn, and TikTok with platform-specific best practices.',
    },
    {
      icon: BarChart3,
      title: 'Trending Memes',
      description: 'Access real-time trending memes and viral content ideas to stay relevant and boost engagement.',
    },
    {
      icon: Sparkles,
      title: 'Hashtag Analytics',
      description: 'Discover high-performing hashtags with real-time analytics and trend data for maximum reach.',
    },
    {
      icon: Trello,
      title: 'Bulk Generation',
      description: 'Generate up to 10 captions at once and choose the perfect one for your post.',
    },
    {
      icon: Lock,
      title: 'Save & Organize',
      description: 'Save your favorite captions, create folders, and build a content library for future use.',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 text-white">
      {/* Navigation */}
      <nav className="flex items-center justify-between px-6 py-4 border-b border-slate-700">
        <Link href="/" className="text-2xl font-bold text-blue-400">
          CaptionGenius
        </Link>
        <Link
          href="/login"
          className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition"
        >
          Login
        </Link>
      </nav>

      {/* Header */}
      <div className="max-w-4xl mx-auto px-6 py-20 text-center">
        <h1 className="text-5xl font-bold mb-6">Everything You Need to Dominate Social Media</h1>
        <p className="text-xl text-slate-300 mb-8">
          Powerful features designed for content creators, marketers, and businesses
        </p>
      </div>

      {/* Features Grid */}
      <div className="max-w-6xl mx-auto px-6 pb-20">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="p-8 rounded-lg border border-slate-700 hover:border-blue-500 bg-slate-800/50 hover:bg-slate-800 transition group"
              >
                <Icon className="w-12 h-12 text-blue-400 mb-4 group-hover:text-blue-300 transition" />
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-slate-400">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* CTA */}
      <div className="max-w-4xl mx-auto px-6 pb-20 text-center">
        <div className="bg-slate-800/80 border border-slate-700 rounded-xl p-12">
          <h2 className="text-3xl font-bold mb-4">Ready to Transform Your Social Media?</h2>
          <p className="text-slate-400 mb-8">
            Join thousands of creators saving hours and boosting engagement with CaptionGenius
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-8 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition"
          >
            Get Started Free <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
