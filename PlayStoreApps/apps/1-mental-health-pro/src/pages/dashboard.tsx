/**
 * Mental Health Pro - Main Dashboard
 * Stress tracking, session logs, and gamification
 */

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useUser } from '@/shared/hooks/useUser';
import { AdBanner, RewardedAdButton } from '@/shared/components/ads/AdBanner';
import { Zap, Flame, Award, TrendingUp, Plus } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function Dashboard() {
  const router = useRouter();
  const { user, loading, isAuthenticated } = useUser();
  const [sessions, setSessions] = useState<any[]>([]);
  const [showSessionModal, setShowSessionModal] = useState(false);
  const [selectedSessionType, setSelectedSessionType] = useState<'breathing' | 'mindfulness' | 'tactical'>('breathing');

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  if (!isAuthenticated) {
    router.push('/login');
    return null;
  }

  // Stress data (mock)
  const stressData = [
    { day: 'Mon', stress: 65 },
    { day: 'Tue', stress: 72 },
    { day: 'Wed', stress: 58 },
    { day: 'Thu', stress: 45 },
    { day: 'Fri', stress: 38 },
    { day: 'Sat', stress: 25 },
    { day: 'Sun', stress: 30 },
  ];

  const sessionTypes = {
    breathing: {
      name: '4-7-8 Breathing',
      duration: '5 min',
      description: 'Quick box breathing for immediate calm',
      icon: '🫁',
    },
    mindfulness: {
      name: 'Mindfulness Break',
      duration: '10 min',
      description: 'Body scan & present moment awareness',
      icon: '🧘',
    },
    tactical: {
      name: 'Tactical Relief',
      duration: '7 min',
      description: 'Anxiety-specific CBT techniques',
      icon: '🎯',
    },
  };

  const handleStartSession = async (type: 'breathing' | 'mindfulness' | 'tactical') => {
    try {
      const response = await fetch('/api/sessions/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type }),
      });

      if (response.ok) {
        const session = await response.json();
        setSessions([...sessions, session]);
        setSelectedSessionType(type);
        setShowSessionModal(true);

        // Award points
        await fetch('/api/gamification/award-points', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ points: 10, type: 'session_complete' }),
        });
      }
    } catch (error) {
      console.error('Failed to start session:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white">
      {/* Top Banner Ad (Free tier only) */}
      {!user?.subscription?.tier?.includes('premium') && (
        <AdBanner placement="top" appId="mental-health-pro" />
      )}

      {/* Header */}
      <div className="bg-gradient-to-r from-purple-900 to-slate-900 border-b border-purple-500/20 px-4 py-6">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Welcome back, {user?.name?.split(' ')[0]}!</h1>
            <p className="text-gray-400 mt-2">
              {new Date().toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-2 text-2xl font-bold text-purple-400">
              <Zap className="w-6 h-6" />
              {user?.gamification?.points || 0} pts
            </div>
            <div className="text-sm text-gray-400">
              Level {user?.gamification?.level || 1}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Stress Level Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Current Stress */}
          <div className="bg-gradient-to-br from-purple-900/40 to-slate-900 border border-purple-500/30 rounded-lg p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-gray-400 text-sm">Today's Stress Level</p>
                <h3 className="text-4xl font-bold text-purple-400 mt-2">38%</h3>
              </div>
              <TrendingUp className="w-8 h-8 text-green-400" />
            </div>
            <p className="text-sm text-gray-400">↓ 27% from yesterday</p>
          </div>

          {/* Streak */}
          <div className="bg-gradient-to-br from-orange-900/40 to-slate-900 border border-orange-500/30 rounded-lg p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-gray-400 text-sm">Current Streak</p>
                <h3 className="text-4xl font-bold text-orange-400 mt-2">12 days</h3>
              </div>
              <Flame className="w-8 h-8 text-orange-400" />
            </div>
            <p className="text-sm text-gray-400">🔥 Keep it going!</p>
          </div>

          {/* Weekly Achievement */}
          <div className="bg-gradient-to-br from-blue-900/40 to-slate-900 border border-blue-500/30 rounded-lg p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-gray-400 text-sm">Sessions This Week</p>
                <h3 className="text-4xl font-bold text-blue-400 mt-2">14</h3>
              </div>
              <Award className="w-8 h-8 text-blue-400" />
            </div>
            <p className="text-sm text-gray-400">5 badges earned 🎖️</p>
          </div>
        </div>

        {/* Stress Trend Chart */}
        <div className="bg-gradient-to-br from-purple-900/40 to-slate-900 border border-purple-500/30 rounded-lg p-6 mb-8">
          <h3 className="text-xl font-bold mb-6">Weekly Stress Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={stressData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#444" />
              <XAxis dataKey="day" stroke="#999" />
              <YAxis stroke="#999" />
              <Tooltip
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #6b21a8' }}
                labelStyle={{ color: '#fff' }}
              />
              <Line
                type="monotone"
                dataKey="stress"
                stroke="#a78bfa"
                dot={{ fill: '#c084fc', r: 4 }}
                strokeWidth={3}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Session Options */}
        <div>
          <h3 className="text-xl font-bold mb-4">Start a Session</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Object.entries(sessionTypes).map(([key, session]) => (
              <button
                key={key}
                onClick={() => handleStartSession(key as 'breathing' | 'mindfulness' | 'tactical')}
                className="bg-gradient-to-br from-purple-900/40 to-slate-900 border border-purple-500/30 rounded-lg p-6 hover:border-purple-400/60 hover:bg-purple-900/60 transition text-left"
              >
                <div className="text-4xl mb-3">{session.icon}</div>
                <h4 className="text-lg font-bold mb-2">{session.name}</h4>
                <p className="text-sm text-gray-400 mb-4">{session.description}</p>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-purple-400">{session.duration}</span>
                  <Plus className="w-4 h-4 text-purple-400" />
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Recent Sessions */}
        <div className="mt-8">
          <h3 className="text-xl font-bold mb-4">Recent Activity</h3>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {sessions.length === 0 ? (
              <p className="text-gray-400">No sessions yet. Start one to see your activity!</p>
            ) : (
              sessions.map((session, idx) => (
                <div key={idx} className="bg-slate-800/50 rounded p-3 flex justify-between items-center">
                  <div>
                    <p className="font-semibold">{sessionTypes[session.type as keyof typeof sessionTypes].name}</p>
                    <p className="text-xs text-gray-400">{new Date(session.createdAt).toLocaleString()}</p>
                  </div>
                  <span className="text-purple-400 text-sm">+10 pts</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Rewarded Ad Section (Free users) */}
        {!user?.isPremium && (
          <div className="mt-8 bg-gradient-to-r from-blue-900/40 to-purple-900/40 border border-blue-500/30 rounded-lg p-6">
            <h4 className="font-bold mb-3">Earn Bonus Points</h4>
            <p className="text-sm text-gray-300 mb-4">
              Watch a short video to earn 50 bonus points. Use them to unlock premium features!
            </p>
            <RewardedAdButton
              appId="mental-health-pro"
              reward={{ type: 'points', amount: 50, label: 'Bonus Points' }}
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
          <div className="mt-8 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg p-8 text-center">
            <h3 className="text-2xl font-bold mb-2">Unlock Premium Features</h3>
            <p className="text-purple-100 mb-6">
              Get real-time stress alerts, unlimited sessions, and advanced analytics.
            </p>
            <button className="bg-white text-purple-600 font-bold py-3 px-8 rounded-lg hover:bg-purple-50 transition">
              Start 7-Day Free Trial
            </button>
          </div>
        )}
      </div>

      {/* Bottom Ad (Free tier) */}
      {!user?.isPremium && (
        <AdBanner placement="bottom" appId="mental-health-pro" />
      )}

      {/* Session Modal */}
      {showSessionModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-slate-800 rounded-lg p-8 max-w-md">
            <h3 className="text-2xl font-bold mb-4">Session in Progress</h3>
            <div className="text-center py-8">
              <p className="text-4xl mb-4">
                {sessionTypes[selectedSessionType as keyof typeof sessionTypes].icon}
              </p>
              <p className="text-gray-300 mb-6">
                {sessionTypes[selectedSessionType as keyof typeof sessionTypes].description}
              </p>
              <div className="bg-purple-900/50 rounded p-4 mb-6">
                <div className="text-5xl font-bold text-purple-400">5:00</div>
                <p className="text-gray-400 text-sm mt-2">Follow along with the guided audio</p>
              </div>
            </div>
            <button
              onClick={() => setShowSessionModal(false)}
              className="w-full bg-purple-600 hover:bg-purple-700 py-3 rounded-lg font-semibold transition"
            >
              End Session & Continue
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
