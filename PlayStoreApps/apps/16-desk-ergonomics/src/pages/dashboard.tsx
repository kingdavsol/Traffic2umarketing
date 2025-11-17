'use client';
import { useRouter } from 'next/router';
import { useUser } from '@/shared/hooks/useUser';
import { AdBanner } from '@/shared/components/ads/AdBanner';
import { Flame, Clock } from 'lucide-react';
import { useState } from 'react';

const BREAK_TYPES = [
  { id: 1, name: 'Eye Rest', duration: 20, emoji: '👁️', description: 'Look 20ft away for 20 seconds' },
  { id: 2, name: 'Stretch', duration: 5, emoji: '🧘', description: 'Full body stretch routine' },
  { id: 3, name: 'Walk', duration: 10, emoji: '🚶', description: 'Quick walk around office' },
  { id: 4, name: 'Hydrate', duration: 3, emoji: '💧', description: 'Drink water & relax' }
];

export default function Dashboard() {
  const router = useRouter();
  const { user, loading, isAuthenticated } = useUser();
  const [breaksTaken, setBreaksTaken] = useState(0);
  const [postureScore] = useState(78);
  const [activeTab, setActiveTab] = useState('today');
  const [scheduledBreaks, setScheduledBreaks] = useState([
    { time: '10:00 AM', type: 'Eye Rest', completed: true },
    { time: '12:00 PM', type: 'Stretch', completed: false }
  ]);

  if (loading) return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  if (!isAuthenticated) { router.push('/login'); return null; }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white">
      {!user?.isPremium && <AdBanner placement="top" appId="desk-ergonomics" />}
      <div className="bg-gradient-to-r from-indigo-600 to-indigo-400 text-white px-4 py-6">
        <h1 className="text-3xl font-bold">Sit Better, Feel Better</h1>
        <div className="flex gap-2 text-2xl font-bold mt-4"><Flame className="w-6 h-6" />{user?.gamification?.streak || 0} Day Streak</div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-400">
            <p className="text-sm text-gray-600">Breaks Taken</p>
            <h3 className="text-3xl font-bold text-blue-600">{breaksTaken}</h3>
            <p className="text-xs text-gray-500 mt-1">Today</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-400">
            <p className="text-sm text-gray-600">Posture Score</p>
            <h3 className="text-3xl font-bold text-green-600">{postureScore}/100</h3>
            <p className="text-xs text-gray-500 mt-1">Excellent</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-purple-400">
            <p className="text-sm text-gray-600">Strain Level</p>
            <h3 className="text-3xl font-bold text-purple-600">Low</h3>
            <p className="text-xs text-gray-500 mt-1">Well monitored</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-yellow-400">
            <p className="text-sm text-gray-600">Badges</p>
            <h3 className="text-3xl font-bold text-yellow-600">{user?.gamification?.badges?.length || 0}</h3>
          </div>
        </div>

        <div className="flex gap-2 mb-6 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('today')}
            className={`px-6 py-3 font-bold ${activeTab === 'today' ? 'border-b-4 border-indigo-600 text-indigo-600' : 'text-gray-600'}`}
          >
            Today's Schedule
          </button>
          <button
            onClick={() => setActiveTab('breaks')}
            className={`px-6 py-3 font-bold ${activeTab === 'breaks' ? 'border-b-4 border-indigo-600 text-indigo-600' : 'text-gray-600'}`}
          >
            Break Types
          </button>
        </div>

        {activeTab === 'today' && (
          <div className="bg-white rounded-lg shadow p-8">
            <h2 className="text-2xl font-bold mb-6">Today's Schedule</h2>
            <div className="space-y-3">
              {scheduledBreaks.map((b, idx) => (
                <div key={idx} className={`p-4 rounded-lg border-2 ${b.completed ? 'bg-green-50 border-green-400' : 'bg-yellow-50 border-yellow-400'}`}>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <Clock className="w-5 h-5" />
                      <div>
                        <p className="font-bold">{b.type}</p>
                        <p className="text-sm text-gray-600">{b.time}</p>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded text-sm font-bold ${b.completed ? 'bg-green-200 text-green-800' : 'bg-yellow-200 text-yellow-800'}`}>
                      {b.completed ? '✓ Done' : 'Upcoming'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'breaks' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {BREAK_TYPES.map(breakType => (
              <div key={breakType.id} className="bg-white rounded-lg shadow p-6 border-2 border-gray-200">
                <p className="text-5xl mb-3">{breakType.emoji}</p>
                <h3 className="font-bold text-lg">{breakType.name}</h3>
                <p className="text-sm text-gray-600 mt-2">{breakType.description}</p>
                <p className="text-sm text-indigo-600 font-bold mt-3">⏱️ {breakType.duration} minutes</p>
                <button
                  onClick={() => setBreaksTaken(breaksTaken + 1)}
                  className="w-full mt-3 bg-indigo-600 text-white px-4 py-2 rounded font-bold hover:bg-indigo-700"
                >
                  Take This Break
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
