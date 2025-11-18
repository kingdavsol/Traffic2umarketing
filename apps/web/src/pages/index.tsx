import Head from 'next/head';
import Link from 'next/link';
import { useState } from 'react';

export default function Home() {
  const [email, setEmail] = useState('');

  const features = [
    {
      title: 'Vehicle Profile',
      description: 'Save your car information and track all maintenance history',
      icon: '🚗'
    },
    {
      title: 'Common Problems',
      description: 'Learn about common issues before they happen to your vehicle',
      icon: '🔧'
    },
    {
      title: 'Price Comparison',
      description: 'Find the cheapest parts from multiple retailers',
      icon: '💰'
    },
    {
      title: 'Tire Shopping',
      description: 'Get the best tires at the lowest prices',
      icon: '🛞'
    },
    {
      title: 'Maintenance Tracking',
      description: 'Keep track of all maintenance and repairs',
      icon: '📋'
    },
    {
      title: 'Car Value',
      description: 'Know your vehicle\'s current market value',
      icon: '💎'
    }
  ];

  return (
    <>
      <Head>
        <title>Car Maintenance Hub - Save Money on Vehicle Repairs</title>
        <meta name="description" content="Find the cheapest car parts, track maintenance, and save money on repairs" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      {/* Navigation */}
      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <span className="text-2xl">🚗</span>
              <span className="text-xl font-bold text-gray-900">Car Hub</span>
            </div>
            <div className="flex space-x-4">
              <Link href="/login" className="px-4 py-2 text-gray-600 hover:text-gray-900">
                Login
              </Link>
              <Link href="/register" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 to-blue-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl font-bold mb-6">Save Money on Car Repairs</h1>
            <p className="text-xl mb-8 text-blue-100">
              Get expert advice, find the cheapest parts, and track your vehicle maintenance all in one place
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link href="/register" className="px-8 py-3 bg-white text-blue-600 rounded-lg font-semibold hover:bg-gray-50">
                Get Started Free
              </Link>
              <Link href="/demo" className="px-8 py-3 border-2 border-white text-white rounded-lg font-semibold hover:bg-blue-700">
                View Demo
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center mb-16">Why Choose Car Hub?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-white rounded-lg shadow p-8 hover:shadow-lg transition">
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-blue-50 py-16">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Save Money?</h2>
          <p className="text-gray-600 mb-8">
            Join thousands of car owners saving thousands on repairs. Start tracking your vehicle today.
          </p>
          <Link href="/register" className="inline-block px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700">
            Create Free Account
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2">
                <li><Link href="/features" className="hover:text-white">Features</Link></li>
                <li><Link href="/pricing" className="hover:text-white">Pricing</Link></li>
                <li><Link href="/mobile" className="hover:text-white">Mobile App</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2">
                <li><Link href="/about" className="hover:text-white">About</Link></li>
                <li><Link href="/blog" className="hover:text-white">Blog</Link></li>
                <li><Link href="/contact" className="hover:text-white">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2">
                <li><Link href="/privacy" className="hover:text-white">Privacy</Link></li>
                <li><Link href="/terms" className="hover:text-white">Terms</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Resources</h4>
              <ul className="space-y-2">
                <li><Link href="/guides" className="hover:text-white">Guides</Link></li>
                <li><Link href="/faqs" className="hover:text-white">FAQs</Link></li>
                <li><Link href="/support" className="hover:text-white">Support</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center">
            <p>&copy; 2024 Car Maintenance Hub. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </>
  );
}
