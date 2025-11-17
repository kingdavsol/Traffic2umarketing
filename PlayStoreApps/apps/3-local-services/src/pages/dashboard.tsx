/**
 * Local Services - Enhanced Marketplace Dashboard
 * Two-sided marketplace for customers and service providers
 */

'use client';

import { useRouter } from 'next/router';
import { useUser } from '@/shared/hooks/useUser';
import { AdBanner, RewardedAdButton } from '@/shared/components/ads/AdBanner';
import { Flame, Award, TrendingUp, MapPin, Star, MessageSquare, CheckCircle } from 'lucide-react';
import { useState } from 'react';

const SERVICE_CATEGORIES = [
  { id: 'plumbing', name: '🔧 Plumbing', icon: '🚰' },
  { id: 'electrical', name: '⚡ Electrical', icon: '💡' },
  { id: 'hvac', name: '❄️ HVAC', icon: '🌡️' },
  { id: 'cleaning', name: '🧹 Cleaning', icon: '✨' },
  { id: 'painting', name: '🎨 Painting', icon: '🖌️' },
  { id: 'carpentry', name: '🪵 Carpentry', icon: '🔨' },
  { id: 'landscape', name: '🌳 Landscaping', icon: '🌿' },
  { id: 'handyman', name: '🛠️ Handyman', icon: '⚙️' },
];

const MOCK_PROVIDERS = [
  {
    id: 1,
    name: 'John\'s Plumbing Pro',
    category: 'plumbing',
    rating: 4.9,
    reviews: 127,
    verified: true,
    distance: '2.3 miles',
    responseTime: '< 1 hour',
    hourlyRate: '$65',
  },
  {
    id: 2,
    name: 'Elite Electrical Services',
    category: 'electrical',
    rating: 4.8,
    reviews: 89,
    verified: true,
    distance: '1.8 miles',
    responseTime: '< 2 hours',
    hourlyRate: '$85',
  },
  {
    id: 3,
    name: 'Swift Handyman',
    category: 'handyman',
    rating: 4.7,
    reviews: 156,
    verified: true,
    distance: '3.1 miles',
    responseTime: '< 3 hours',
    hourlyRate: '$50',
  },
];

export default function Dashboard() {
  const router = useRouter();
  const { user, loading, isAuthenticated } = useUser();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<'customer' | 'provider'>('customer');
  const [showJobPosting, setShowJobPosting] = useState(false);

  if (loading) return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  if (!isAuthenticated) {
    router.push('/login');
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white">
      {!user?.isPremium && <AdBanner placement="top" appId="local-services" />}

      <div className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-4 py-6">
        <div className="max-w-6xl mx-auto flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold">Welcome back, {user?.name?.split(' ')[0]}!</h1>
            <p className="text-white/80">
              {userRole === 'customer' ? 'Find trusted professionals' : 'Find your next job opportunity'}
            </p>
          </div>
          <div className="text-right flex gap-2">
            <button
              onClick={() => setUserRole('customer')}
              className={`px-4 py-2 rounded font-bold ${
                userRole === 'customer' ? 'bg-white text-blue-600' : 'bg-white/20 text-white'
              }`}
            >
              Customer
            </button>
            <button
              onClick={() => setUserRole('provider')}
              className={`px-4 py-2 rounded font-bold ${
                userRole === 'provider' ? 'bg-white text-blue-600' : 'bg-white/20 text-white'
              }`}
            >
              Provider
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Quick CTA */}
        <div className="mb-8 flex gap-4">
          {userRole === 'customer' && (
            <>
              <button
                onClick={() => setShowJobPosting(true)}
                className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-blue-700 transition"
              >
                Post a Job
              </button>
              <button className="flex-1 bg-white border-2 border-blue-600 text-blue-600 px-6 py-3 rounded-lg font-bold hover:bg-blue-50 transition">
                Browse Providers
              </button>
            </>
          )}
          {userRole === 'provider' && (
            <>
              <button className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-blue-700 transition">
                View Available Jobs
              </button>
              <button className="flex-1 bg-white border-2 border-blue-600 text-blue-600 px-6 py-3 rounded-lg font-bold hover:bg-blue-50 transition">
                Edit My Profile
              </button>
            </>
          )}
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-400">
            <p className="text-gray-600 text-sm">
              {userRole === 'customer' ? 'Jobs Posted' : 'Jobs Completed'}
            </p>
            <h3 className="text-3xl font-bold text-gray-900">0</h3>
            <p className="text-xs text-gray-500 mt-1">This month</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-purple-400">
            <p className="text-gray-600 text-sm">
              {userRole === 'customer' ? 'Quotes Received' : 'Providers in Network'}
            </p>
            <h3 className="text-3xl font-bold text-gray-900">{MOCK_PROVIDERS.length}</h3>
            <p className="text-xs text-gray-500 mt-1">Verified professionals</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-400">
            <p className="text-gray-600 text-sm">Average Rating</p>
            <h3 className="text-3xl font-bold text-gray-900">4.8</h3>
            <p className="text-xs text-gray-500 mt-1">From {MOCK_PROVIDERS.length + 50} reviews</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-yellow-400">
            <p className="text-gray-600 text-sm">Achievements</p>
            <h3 className="text-3xl font-bold text-gray-900">{user?.gamification?.badges?.length || 0}</h3>
            <p className="text-xs text-gray-500 mt-1">Milestones</p>
          </div>
        </div>

        {/* Job Posting Modal */}
        {showJobPosting && (
          <div className="bg-white rounded-lg shadow p-8 mb-8 border-2 border-blue-300">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Post a Job</h2>
              <button
                onClick={() => setShowJobPosting(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block font-bold mb-2">Service Category</label>
                <select className="w-full p-3 border-2 border-gray-300 rounded-lg">
                  {SERVICE_CATEGORIES.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block font-bold mb-2">Job Description</label>
                <textarea
                  placeholder="Describe what you need..."
                  className="w-full p-3 border-2 border-gray-300 rounded-lg h-24"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold mb-2">Budget</label>
                  <input type="number" placeholder="$" className="w-full p-3 border-2 border-gray-300 rounded-lg" />
                </div>
                <div>
                  <label className="block font-bold mb-2">Timeline</label>
                  <select className="w-full p-3 border-2 border-gray-300 rounded-lg">
                    <option>ASAP</option>
                    <option>This week</option>
                    <option>This month</option>
                    <option>Flexible</option>
                  </select>
                </div>
              </div>
              <button className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700">
                Post Job
              </button>
            </div>
          </div>
        )}

        {/* Service Category Browse */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Browse Services</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {SERVICE_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`p-4 rounded-lg border-2 text-center font-bold transition ${
                  selectedCategory === cat.id
                    ? 'bg-blue-100 border-blue-500'
                    : 'bg-white border-gray-200 hover:border-blue-300'
                }`}
              >
                <div className="text-3xl mb-2">{cat.icon}</div>
                <div className="text-sm">{cat.name.split(' ')[1]}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Provider Listings */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Top Rated Professionals</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {MOCK_PROVIDERS.map((provider) => (
              <div key={provider.id} className="bg-white rounded-lg shadow p-6 border border-gray-200 hover:shadow-lg transition">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-bold text-lg">{provider.name}</h3>
                    <div className="flex items-center gap-1 text-yellow-500">
                      <Star className="w-4 h-4 fill-yellow-500" />
                      <span className="font-bold">{provider.rating}</span>
                      <span className="text-gray-600 text-sm">({provider.reviews})</span>
                    </div>
                  </div>
                  {provider.verified && <CheckCircle className="w-6 h-6 text-green-500" />}
                </div>

                <div className="space-y-2 text-sm text-gray-600 mb-4">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    {provider.distance}
                  </div>
                  <div className="flex items-center gap-2">
                    <span>⏱️ {provider.responseTime}</span>
                  </div>
                  <div className="text-green-600 font-bold">{provider.hourlyRate}/hour</div>
                </div>

                <div className="flex gap-2">
                  <button className="flex-1 bg-blue-600 text-white py-2 rounded font-bold hover:bg-blue-700">
                    Hire
                  </button>
                  <button className="flex-1 bg-gray-200 text-gray-900 py-2 rounded font-bold hover:bg-gray-300 flex items-center justify-center gap-1">
                    <MessageSquare className="w-4 h-4" />
                    Message
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Main Content Area */}
        <div className="bg-white rounded-lg shadow p-8 mb-8">
          <h2 className="text-2xl font-bold mb-4">Your Activity</h2>
          <p className="text-gray-600">Start using the app to see your progress here!</p>
        </div>

        {/* Rewarded Ad */}
        {!user?.isPremium && (
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-6 border border-blue-200 mb-8">
            <h4 className="font-bold mb-3">Earn Bonus Points</h4>
            <p className="text-sm text-gray-700 mb-4">Watch a short video to earn 50 bonus points!</p>
            <RewardedAdButton
              appId="local-services"
              reward={ type: 'points', amount: 50, label: 'Bonus Points' }
              onRewardEarned={async () => {
                await fetch('/api/gamification/award-points', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ points: 50, type: 'rewarded_ad' }),
                });
              }}
            />
          </div>
        )}

        {/* Premium CTA */}
        {!user?.isPremium && (
          <div className="bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg p-8 text-center text-white">
            <h3 className="text-2xl font-bold mb-2">Unlock Premium Features</h3>
            <p className="mb-6 text-white/90">Get full access to all features, remove ads, and unlock advanced capabilities.</p>
            <button className="bg-white text-gray-900 font-bold py-3 px-8 rounded-lg hover:bg-gray-100 transition">Start Free Trial</button>
          </div>
        )}
      </div>

      {!user?.isPremium && <AdBanner placement="bottom" appId="local-services" />}
    </div>
  );
}
