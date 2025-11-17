/**
 * Mental Health Pro - Enhanced Dashboard with Mood Tracking & Meditation
 */

'use client';

import { useRouter } from 'next/router';
import { useUser } from '@/shared/hooks/useUser';
import { AdBanner, RewardedAdButton } from '@/shared/components/ads/AdBanner';
import { Flame, Award, TrendingUp, Heart, Zap, Phone, MessageCircle } from 'lucide-react';
import { useState } from 'react';

const BREATHING_EXERCISES = [
  { id: 1, name: '4-7-8 Breathing', description: 'Inhale (4s) → Hold (7s) → Exhale (8s)', duration: 5 },
  { id: 2, name: 'Box Breathing', description: 'Equal 4-second cycles', duration: 4 },
  { id: 3, name: 'Coherent Breathing', description: '5-second rhythm for heart rate variability', duration: 10 },
  { id: 4, name: 'Tactical Breathing', description: 'Military stress reduction technique', duration: 6 },
];

const CRISIS_RESOURCES = [
  { name: 'Crisis Text Line', number: 'Text HOME to 741741' },
  { name: 'National Suicide Prevention Lifeline', number: '988' },
  { name: 'SAMHSA National Helpline', number: '1-800-662-4357' },
];

export default function Dashboard() {
  const router = useRouter();
  const { user, loading, isAuthenticated } = useUser();
  const [moodEntries, setMoodEntries] = useState([
    { date: 'Today', mood: 3, label: 'Okay' },
    { date: 'Yesterday', mood: 2, label: 'Bad' },
    { date: '2 days ago', mood: 4, label: 'Good' },
  ]);
  const [selectedExercise, setSelectedExercise] = useState<typeof BREATHING_EXERCISES[0] | null>(null);

  if (loading) return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  if (!isAuthenticated) {
    router.push('/login');
    return null;
  }

  const handleMoodLog = (moodLevel: number) => {
    const moodLabel = ['', 'Terrible', 'Bad', 'Okay', 'Good', 'Great'][moodLevel];
    setMoodEntries([{ date: 'Today', mood: moodLevel, label: moodLabel }, ...moodEntries.slice(0, 6)]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white">
      {!user?.isPremium && <AdBanner placement="top" appId="mental-health-pro" />}

      <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-6">
        <div className="max-w-6xl mx-auto flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold">Welcome back, {user?.name?.split(' ')[0]}!</h1>
            <p className="text-white/80">How are you feeling today?</p>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-2 text-2xl font-bold mb-2">
              <Flame className="w-6 h-6" />
              {user?.gamification?.streak || 0} Day Streak
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Quick Mood Logger */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-bold mb-4">Log Your Mood</h2>
          <div className="flex gap-3 justify-center">
            {[
              { num: 1, emoji: '😞', label: 'Terrible' },
              { num: 2, emoji: '😟', label: 'Bad' },
              { num: 3, emoji: '😐', label: 'Okay' },
              { num: 4, emoji: '😊', label: 'Good' },
              { num: 5, emoji: '😄', label: 'Great' },
            ].map((m) => (
              <button
                key={m.num}
                onClick={() => handleMoodLog(m.num)}
                className="flex flex-col items-center p-3 rounded-lg hover:bg-purple-50 transition"
              >
                <span className="text-4xl mb-1">{m.emoji}</span>
                <span className="text-xs text-gray-600">{m.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Metrics Grid - Enhanced */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-400">
            <p className="text-gray-600 text-sm">Current Mood</p>
            <h3 className="text-3xl font-bold text-gray-900">{moodEntries[0]?.mood || 0}/5</h3>
            <p className="text-xs text-gray-500 mt-1">{moodEntries[0]?.label}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-purple-400">
            <p className="text-gray-600 text-sm">Sessions</p>
            <h3 className="text-3xl font-bold text-gray-900">0</h3>
            <p className="text-xs text-gray-500 mt-1">This week</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-400">
            <p className="text-gray-600 text-sm">Exercises Done</p>
            <h3 className="text-3xl font-bold text-gray-900">0</h3>
            <p className="text-xs text-gray-500 mt-1">This month</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-yellow-400">
            <p className="text-gray-600 text-sm">Badges</p>
            <h3 className="text-3xl font-bold text-gray-900">{user?.gamification?.badges?.length || 0}</h3>
            <p className="text-xs text-gray-500 mt-1">Achievements</p>
          </div>
        </div>

        {/* Mood Trend */}
        <div className="bg-white rounded-lg shadow p-8 mb-8">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-purple-600" />
            Your Mood Trend
          </h2>
          <div className="space-y-2">
            {moodEntries.map((entry, idx) => (
              <div key={idx} className="flex items-center gap-4">
                <span className="text-sm text-gray-600 w-20">{entry.date}</span>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((m) => (
                    <div
                      key={m}
                      className={`w-8 h-8 rounded ${
                        m <= entry.mood ? 'bg-purple-500' : 'bg-gray-200'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm font-medium">{entry.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Guided Exercises */}
        <div className="bg-white rounded-lg shadow p-8 mb-8">
          <h2 className="text-2xl font-bold mb-4">Guided Breathing Exercises</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {BREATHING_EXERCISES.map((exercise) => (
              <button
                key={exercise.id}
                onClick={() => setSelectedExercise(exercise)}
                className="p-4 border-2 border-gray-200 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition text-left"
              >
                <h3 className="font-bold text-lg">{exercise.name}</h3>
                <p className="text-sm text-gray-600">{exercise.description}</p>
                <p className="text-xs text-gray-500 mt-2">{exercise.duration} minutes</p>
              </button>
            ))}
          </div>
          {selectedExercise && (
            <div className="mt-6 p-6 bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg">
              <h3 className="font-bold text-lg mb-2">{selectedExercise.name}</h3>
              <p className="text-gray-700 mb-4">{selectedExercise.description}</p>
              <button className="bg-purple-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-purple-700 transition">
                Start Exercise
              </button>
            </div>
          )}
        </div>

        {/* Crisis Resources - IMPORTANT */}
        <div className="bg-red-50 border-2 border-red-200 rounded-lg p-6 mb-8">
          <h2 className="text-2xl font-bold text-red-900 mb-4 flex items-center gap-2">
            <Phone className="w-6 h-6" />
            Crisis Resources
          </h2>
          <p className="text-red-800 mb-4">If you're in crisis, reach out now. You're not alone.</p>
          <div className="space-y-2">
            {CRISIS_RESOURCES.map((resource, idx) => (
              <div key={idx} className="flex justify-between items-center bg-white p-3 rounded">
                <span className="font-bold text-gray-900">{resource.name}</span>
                <span className="font-mono text-red-600 font-bold">{resource.number}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Rewarded Ad */}
        {!user?.isPremium && (
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-6 border border-blue-200 mb-8">
            <h4 className="font-bold mb-3">Earn Bonus Points</h4>
            <p className="text-sm text-gray-700 mb-4">Watch a short video to earn 50 bonus points!</p>
            <RewardedAdButton
              appId="mental-health-pro"
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
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg p-8 text-center text-white">
            <h3 className="text-2xl font-bold mb-2">Unlock Premium Features</h3>
            <p className="mb-6 text-white/90">Get full access to all features, remove ads, and unlock advanced capabilities.</p>
            <button className="bg-white text-gray-900 font-bold py-3 px-8 rounded-lg hover:bg-gray-100 transition">Start Free Trial</button>
          </div>
        )}
      </div>

      {!user?.isPremium && <AdBanner placement="bottom" appId="mental-health-pro" />}
    </div>
  );
}
