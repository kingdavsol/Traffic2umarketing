import React, { useState } from 'react';
import Link from 'next/link';
import Head from 'next/head';

export default function Home() {
  return (
    <>
      <Head>
        <title>MediSave - Healthcare Cashback Rewards</title>
        <meta name="description" content="Save money on healthcare with cashback rewards" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        {/* Navigation */}
        <nav className="bg-white shadow">
          <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
            <h1 className="text-2xl font-bold text-blue-600">💊 MediSave</h1>
            <div className="space-x-4">
              <Link href="/login">
                <button className="px-4 py-2 text-gray-700 hover:text-blue-600">Login</button>
              </Link>
              <Link href="/signup">
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  Sign Up
                </button>
              </Link>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="max-w-6xl mx-auto px-4 py-20 text-center">
          <h2 className="text-5xl font-bold text-gray-900 mb-6">
            Save Money on Healthcare
          </h2>
          <p className="text-xl text-gray-700 mb-8">
            Earn cashback rewards on prescriptions, doctor visits, dental, vision, and more.
          </p>
          <div className="space-x-4">
            <Link href="/signup">
              <button className="px-8 py-3 bg-blue-600 text-white text-lg rounded-lg hover:bg-blue-700">
                Get Started Free
              </button>
            </Link>
            <Link href="/providers">
              <button className="px-8 py-3 bg-white text-blue-600 text-lg rounded-lg border-2 border-blue-600 hover:bg-blue-50">
                Find Providers
              </button>
            </Link>
          </div>
        </section>

        {/* Features */}
        <section className="max-w-6xl mx-auto px-4 py-16">
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: '💰', title: 'Instant Cashback', desc: 'Earn cashback on every healthcare purchase' },
              { icon: '🏥', title: '1000+ Providers', desc: 'Pharmacies, clinics, dental, vision and more' },
              { icon: '📱', title: 'Easy to Use', desc: 'Simple app to track and redeem your savings' },
            ].map((feature, i) => (
              <div key={i} className="bg-white p-8 rounded-lg shadow text-center">
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Stats */}
        <section className="bg-blue-600 text-white py-16">
          <div className="max-w-6xl mx-auto px-4 grid md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold">50K+</div>
              <div className="text-blue-100">Active Users</div>
            </div>
            <div>
              <div className="text-4xl font-bold">$5M+</div>
              <div className="text-blue-100">Saved</div>
            </div>
            <div>
              <div className="text-4xl font-bold">1000+</div>
              <div className="text-blue-100">Providers</div>
            </div>
            <div>
              <div className="text-4xl font-bold">3.5%</div>
              <div className="text-blue-100">Avg. Cashback</div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
