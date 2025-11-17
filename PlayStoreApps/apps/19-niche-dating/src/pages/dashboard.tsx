'use client';
import { useRouter } from 'next/router';
import { useUser } from '@/shared/hooks/useUser';
import { AdBanner } from '@/shared/components/ads/AdBanner';
import { Flame, Heart, Shield } from 'lucide-react';
import { useState } from 'react';

const PROFILES = [
  { id: 1, name: 'Alex', age: 28, interests: ['Hiking', 'Photography', 'Music'], verified: true, rating: 4.8 },
  { id: 2, name: 'Jordan', age: 26, interests: ['Gaming', 'Tech', 'Cooking'], verified: true, rating: 4.9 },
  { id: 3, name: 'Casey', age: 29, interests: ['Travel', 'Books', 'Art'], verified: false, rating: 4.7 }
];

export default function Dashboard() {
  const router = useRouter();
  const { user, loading, isAuthenticated } = useUser();
  const [matches] = useState(12);
  const [profileViews] = useState(87);

  if (loading) return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  if (!isAuthenticated) { router.push('/login'); return null; }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white">
      {!user?.isPremium && <AdBanner placement="top" appId="niche-dating" />}
      <div className="bg-gradient-to-r from-rose-600 to-rose-400 text-white px-4 py-6">
        <h1 className="text-3xl font-bold">Find Your Perfect Match</h1>
        <div className="flex gap-2 text-2xl font-bold mt-4"><Flame className="w-6 h-6" />{user?.gamification?.streak || 0} Day Streak</div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-400">
            <p className="text-sm text-gray-600">Profile Views</p>
            <h3 className="text-3xl font-bold text-blue-600">{profileViews}</h3>
          </div>
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-400">
            <p className="text-sm text-gray-600">Matches</p>
            <h3 className="text-3xl font-bold text-green-600">{matches}</h3>
          </div>
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-purple-400">
            <p className="text-sm text-gray-600">Messages</p>
            <h3 className="text-3xl font-bold text-purple-600">23</h3>
          </div>
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-yellow-400">
            <p className="text-sm text-gray-600">Badges</p>
            <h3 className="text-3xl font-bold text-yellow-600">{user?.gamification?.badges?.length || 0}</h3>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Suggested Matches</h2>
          {PROFILES.map(profile => (
            <div key={profile.id} className="bg-white rounded-lg shadow p-6 border-2 border-gray-200">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-bold text-lg">{profile.name}, {profile.age}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    {profile.verified && <Shield className="w-4 h-4 text-green-600" />}
                    <span className="text-sm text-gray-600">⭐ {profile.rating}</span>
                  </div>
                </div>
              </div>
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">Interests:</p>
                <div className="flex flex-wrap gap-2">
                  {profile.interests.map((interest, idx) => (
                    <span key={idx} className="px-3 py-1 bg-rose-100 text-rose-800 rounded text-sm font-bold">
                      {interest}
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex gap-2">
                <button className="flex-1 bg-rose-600 text-white px-4 py-2 rounded font-bold hover:bg-rose-700 flex items-center justify-center gap-2">
                  <Heart className="w-4 h-4" /> Like
                </button>
                <button className="flex-1 bg-gray-300 text-gray-800 px-4 py-2 rounded font-bold">Pass</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
