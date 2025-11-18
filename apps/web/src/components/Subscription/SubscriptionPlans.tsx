import React, { useState } from 'react';
import { CheckIcon } from '@heroicons/react/24/solid';

interface Plan {
  id: string;
  name: string;
  price: number;
  description: string;
  features: string[];
  cta: string;
  highlighted?: boolean;
}

const plans: Plan[] = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    description: 'Get started with basic features',
    features: [
      '2 vehicles',
      '3 maintenance reminders/month',
      'Basic problem lookup',
      'Community access',
      'Price alerts (limited)',
    ],
    cta: 'Get Started',
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 9.99,
    description: 'Unlock all features and priority support',
    features: [
      'Unlimited vehicles',
      'Unlimited maintenance reminders',
      'Advanced analytics',
      'Price alerts (unlimited)',
      'Affiliate earnings',
      'Priority support',
      'Ad-free experience',
    ],
    cta: 'Upgrade to Pro',
    highlighted: true,
  },
  {
    id: 'business',
    name: 'Business',
    price: 29.99,
    description: 'For fleet managers and professionals',
    features: [
      'Everything in Pro',
      'Fleet management (10+ vehicles)',
      'API access',
      'Bulk exports',
      'Custom integrations',
      'Dedicated account manager',
      'Advanced reporting',
    ],
    cta: 'Upgrade to Business',
  },
];

export const SubscriptionPlans: React.FC = () => {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleUpgrade = async (planId: string) => {
    if (planId === 'free') {
      // Free plan doesn't need checkout
      window.location.href = '/dashboard';
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/subscriptions/plans', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) throw new Error('Failed to fetch plans');

      // In real implementation, would redirect to Stripe checkout
      window.location.href = `/checkout?plan=${planId}`;
    } catch (error) {
      console.error('Error upgrading:', error);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-gray-600">
            Choose the plan that fits your needs
          </p>
        </div>

        {/* Plans Grid */}
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`relative rounded-lg border-2 transition-all ${
                plan.highlighted
                  ? 'border-blue-500 shadow-xl scale-105'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              {/* Recommended Badge */}
              {plan.highlighted && (
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  <span className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
                    Recommended
                  </span>
                </div>
              )}

              <div className="p-8">
                {/* Plan Name */}
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  {plan.name}
                </h3>
                <p className="text-gray-600 text-sm mb-6">{plan.description}</p>

                {/* Pricing */}
                <div className="mb-6">
                  <span className="text-5xl font-bold text-gray-900">
                    ${plan.price}
                  </span>
                  {plan.price > 0 && (
                    <span className="text-gray-600 ml-2">/month</span>
                  )}
                </div>

                {/* CTA Button */}
                <button
                  onClick={() => handleUpgrade(plan.id)}
                  disabled={loading}
                  className={`w-full py-2 px-4 rounded-lg font-semibold transition-colors mb-8 ${
                    plan.highlighted
                      ? 'bg-blue-500 text-white hover:bg-blue-600'
                      : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {loading && selectedPlan === plan.id ? 'Loading...' : plan.cta}
                </button>

                {/* Features List */}
                <div className="space-y-4">
                  {plan.features.map((feature, index) => (
                    <div key={index} className="flex items-start">
                      <CheckIcon className="w-5 h-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="mt-16 max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
            Frequently Asked Questions
          </h2>

          <div className="space-y-6">
            {[
              {
                q: 'Can I upgrade or downgrade anytime?',
                a: 'Yes! You can change your plan at any time. Changes take effect at the next billing cycle.',
              },
              {
                q: 'Do you offer refunds?',
                a: 'We offer a 30-day money-back guarantee. If you\'re not satisfied, contact our support team.',
              },
              {
                q: 'Is my payment secure?',
                a: 'Absolutely. We use Stripe for secure payment processing. Your data is encrypted and PCI compliant.',
              },
              {
                q: 'What payment methods do you accept?',
                a: 'We accept all major credit cards (Visa, Mastercard, American Express) and digital wallets.',
              },
            ].map((faq, index) => (
              <div
                key={index}
                className="bg-white p-6 rounded-lg border border-gray-200"
              >
                <h3 className="font-semibold text-gray-900 mb-2">{faq.q}</h3>
                <p className="text-gray-600">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionPlans;
