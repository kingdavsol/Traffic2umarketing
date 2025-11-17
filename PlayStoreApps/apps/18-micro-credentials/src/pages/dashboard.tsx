'use client';
import { useRouter } from 'next/router';
import { useUser } from '@/shared/hooks/useUser';
import { AdBanner } from '@/shared/components/ads/AdBanner';
import { Flame, Award } from 'lucide-react';
import { useState } from 'react';

const CREDENTIALS = [
  { id: 1, name: 'Google Analytics', issuer: 'Google', date: '2024-11-15', status: 'active' },
  { id: 2, name: 'AWS Cloud Practitioner', issuer: 'Amazon', date: '2024-10-20', status: 'active' },
  { id: 3, name: 'Figma Design', issuer: 'Figma', date: '2024-09-15', status: 'expiring-soon' }
];

export default function Dashboard() {
  const router = useRouter();
  const { user, loading, isAuthenticated } = useUser();
  const [credentials] = useState(CREDENTIALS);
  const [portfolioViews] = useState(342);

  if (loading) return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  if (!isAuthenticated) { router.push('/login'); return null; }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white">
      {!user?.isPremium && <AdBanner placement="top" appId="micro-credentials" />}
      <div className="bg-gradient-to-r from-teal-600 to-teal-400 text-white px-4 py-6">
        <h1 className="text-3xl font-bold">Prove Your Skills</h1>
        <div className="flex gap-2 text-2xl font-bold mt-4"><Flame className="w-6 h-6" />{user?.gamification?.streak || 0} Day Streak</div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-400">
            <p className="text-sm text-gray-600">Credentials Earned</p>
            <h3 className="text-3xl font-bold text-blue-600">{credentials.length}</h3>
          </div>
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-400">
            <p className="text-sm text-gray-600">Portfolio Views</p>
            <h3 className="text-3xl font-bold text-green-600">{portfolioViews}</h3>
          </div>
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-purple-400">
            <p className="text-sm text-gray-600">Profile Strength</p>
            <h3 className="text-3xl font-bold text-purple-600">95%</h3>
          </div>
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-yellow-400">
            <p className="text-sm text-gray-600">Badges</p>
            <h3 className="text-3xl font-bold text-yellow-600">{user?.gamification?.badges?.length || 0}</h3>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Your Credentials</h2>
          {credentials.map(cred => (
            <div key={cred.id} className="bg-white rounded-lg shadow p-6 border-2 border-gray-200">
              <div className="flex justify-between items-start">
                <div className="flex items-start gap-3">
                  <Award className="w-6 h-6 text-teal-600 mt-1" />
                  <div>
                    <h3 className="font-bold text-lg">{cred.name}</h3>
                    <p className="text-sm text-gray-600">Issued by {cred.issuer}</p>
                    <p className="text-xs text-gray-500 mt-1">Earned: {cred.date}</p>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded text-sm font-bold ${cred.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                  {cred.status === 'active' ? 'Active' : 'Expiring Soon'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
