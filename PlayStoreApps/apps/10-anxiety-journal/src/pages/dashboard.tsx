/**
 * Anxiety Journaling - CBT-Based Journaling with Trigger Detection
 */

'use client';

import { useRouter } from 'next/router';
import { useUser } from '@/shared/hooks/useUser';
import { AdBanner, RewardedAdButton } from '@/shared/components/ads/AdBanner';
import { Flame, Award, TrendingUp, Heart, AlertCircle, Lightbulb } from 'lucide-react';
import { useState } from 'react';

interface JournalEntry {
  id: string;
  date: string;
  anxietyLevel: number;
  triggers: string[];
  copingStrategies: string[];
  thoughts: string;
  outcome: string;
}

const COPING_STRATEGIES = {
  breathing: ['4-7-8 breathing', 'Box breathing', 'Progressive muscle relaxation'],
  grounding: ['5-4-3-2-1 technique', 'Ice cube hold', 'Naming objects'],
  thoughts: ['Thought challenging', 'Reframing', 'Perspective shift'],
  actions: ['Go for walk', 'Call friend', 'Exercise', 'Creative activity'],
};

export default function Dashboard() {
  const router = useRouter();
  const { user, loading, isAuthenticated } = useUser();
  const [entries, setEntries] = useState<JournalEntry[]>([
    {
      id: '1',
      date: 'Nov 16',
      anxietyLevel: 7,
      triggers: ['Work deadline', 'Sleep deprivation'],
      copingStrategies: ['breathing', 'grounding'],
      thoughts: 'Worried about presentation',
      outcome: 'Talked to manager, feeling better',
    },
    {
      id: '2',
      date: 'Nov 15',
      anxietyLevel: 5,
      triggers: ['Social event'],
      copingStrategies: ['breathing'],
      thoughts: 'Nervous about making conversation',
      outcome: 'Went, had good time',
    },
  ]);
  const [showJournalForm, setShowJournalForm] = useState(false);
  const [anxietyLevel, setAnxietyLevel] = useState(5);
  const [selectedTriggers, setSelectedTriggers] = useState<string[]>([]);
  const [selectedStrategies, setSelectedStrategies] = useState<string[]>([]);

  if (loading) return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  if (!isAuthenticated) {
    router.push('/login');
    return null;
  }

  const averageAnxiety = entries.length > 0 ? Math.round(entries.reduce((sum, e) => sum + e.anxietyLevel, 0) / entries.length) : 0;
  const allTriggers = [...new Set(entries.flatMap(e => e.triggers))];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white">
      {!user?.isPremium && <AdBanner placement="top" appId="anxiety-journal" />}

      <div className="bg-gradient-to-r from-fuchsia-600 to-pink-600 text-white px-4 py-6">
        <div className="max-w-6xl mx-auto flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold">Welcome back, {user?.name?.split(' ')[0]}!</h1>
            <p className="text-white/80">Your safe space to process anxiety 💚</p>
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
        {/* Quick CTA */}
        <button
          onClick={() => setShowJournalForm(true)}
          className="w-full mb-8 bg-gradient-to-r from-fuchsia-500 to-pink-500 text-white p-6 rounded-lg font-bold hover:shadow-lg transition text-lg"
        >
          📝 Start New Journal Entry
        </button>

        {/* Anxiety Level Tracker */}
        <div className="bg-white rounded-lg shadow p-8 mb-8">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <Heart className="w-6 h-6 text-pink-500" />
            Anxiety Tracking
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-4 border-l-4 border-pink-400 bg-pink-50">
              <p className="text-gray-600 text-sm font-bold">Today's Level</p>
              <h3 className="text-4xl font-bold text-pink-600 mt-2">{entries[0]?.anxietyLevel || 0}/10</h3>
            </div>
            <div className="p-4 border-l-4 border-purple-400 bg-purple-50">
              <p className="text-gray-600 text-sm font-bold">Weekly Average</p>
              <h3 className="text-4xl font-bold text-purple-600 mt-2">{averageAnxiety}/10</h3>
            </div>
            <div className="p-4 border-l-4 border-green-400 bg-green-50">
              <p className="text-gray-600 text-sm font-bold">Entries Written</p>
              <h3 className="text-4xl font-bold text-green-600 mt-2">{entries.length}</h3>
            </div>
            <div className="p-4 border-l-4 border-blue-400 bg-blue-50">
              <p className="text-gray-600 text-sm font-bold">Badges Earned</p>
              <h3 className="text-4xl font-bold text-blue-600 mt-2">{user?.gamification?.badges?.length || 0}</h3>
            </div>
          </div>
        </div>

        {/* Grounding Exercises (5-4-3-2-1) */}
        <div className="bg-white rounded-lg shadow p-8 mb-8">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <Lightbulb className="w-6 h-6 text-yellow-500" />
            Grounding Exercise
          </h2>
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 border-l-4 border-blue-500 rounded">
              <p className="font-bold text-blue-900">5 Things I can SEE</p>
              <p className="text-sm text-blue-800 mt-1">Name 5 visible objects around you</p>
            </div>
            <div className="p-4 bg-green-50 border-l-4 border-green-500 rounded">
              <p className="font-bold text-green-900">4 Things I can TOUCH</p>
              <p className="text-sm text-green-800 mt-1">Texture, temperature, sensation</p>
            </div>
            <div className="p-4 bg-yellow-50 border-l-4 border-yellow-500 rounded">
              <p className="font-bold text-yellow-900">3 Things I can HEAR</p>
              <p className="text-sm text-yellow-800 mt-1">Sounds in your environment</p>
            </div>
            <div className="p-4 bg-purple-50 border-l-4 border-purple-500 rounded">
              <p className="font-bold text-purple-900">2 Things I can SMELL</p>
              <p className="text-sm text-purple-800 mt-1">Pleasant or neutral scents</p>
            </div>
            <div className="p-4 bg-pink-50 border-l-4 border-pink-500 rounded">
              <p className="font-bold text-pink-900">1 Thing I can TASTE</p>
              <p className="text-sm text-pink-800 mt-1">Gum, mint, drink, or food</p>
            </div>
          </div>
          <button className="w-full mt-6 bg-yellow-500 text-white py-3 rounded-lg font-bold hover:bg-yellow-600">
            Start Grounding Exercise
          </button>
        </div>

        {/* Trigger Cloud */}
        {allTriggers.length > 0 && (
          <div className="bg-white rounded-lg shadow p-8 mb-8">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <AlertCircle className="w-6 h-6 text-red-500" />
              Your Common Triggers
            </h2>
            <div className="flex flex-wrap gap-3">
              {allTriggers.map((trigger, idx) => (
                <span
                  key={idx}
                  className="px-4 py-2 bg-red-100 text-red-800 rounded-full font-bold text-sm border-2 border-red-300"
                >
                  #{trigger}
                </span>
              ))}
            </div>
            <p className="text-sm text-gray-600 mt-4">
              💡 Tip: Notice patterns? Share with your therapist or counselor.
            </p>
          </div>
        )}

        {/* Journal Entries */}
        <div className="bg-white rounded-lg shadow p-8">
          <h2 className="text-2xl font-bold mb-6">Recent Entries</h2>
          <div className="space-y-4">
            {entries.map((entry) => (
              <div key={entry.id} className="p-4 border-2 border-gray-200 rounded-lg hover:border-fuchsia-300">
                <div className="flex justify-between items-start mb-2">
                  <p className="font-bold text-gray-900">{entry.date}</p>
                  <span
                    className={`px-3 py-1 rounded-full font-bold text-white ${
                      entry.anxietyLevel > 7
                        ? 'bg-red-500'
                        : entry.anxietyLevel > 4
                        ? 'bg-yellow-500'
                        : 'bg-green-500'
                    }`}
                  >
                    Anxiety {entry.anxietyLevel}/10
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-2"><strong>Outcome:</strong> {entry.outcome}</p>
                {entry.triggers.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-2">
                    {entry.triggers.map((t, idx) => (
                      <span key={idx} className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">
                        {t}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-400">
            <p className="text-gray-600 text-sm">Streak</p>
            <h3 className="text-3xl font-bold text-gray-900">0</h3>
          </div>
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-purple-400">
            <p className="text-gray-600 text-sm">Entries</p>
            <h3 className="text-3xl font-bold text-gray-900">0</h3>
          </div>
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-400">
            <p className="text-gray-600 text-sm">Score</p>
            <h3 className="text-3xl font-bold text-gray-900">0</h3>
          </div>
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-yellow-400">
            <p className="text-gray-600 text-sm">Badges</p>
            <h3 className="text-3xl font-bold text-gray-900">{user?.gamification?.badges?.length || 0}</h3>
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
              appId="anxiety-journal"
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
          <div className="bg-gradient-to-r from-fuchsia-500 to-pink-500 rounded-lg p-8 text-center text-white">
            <h3 className="text-2xl font-bold mb-2">Unlock Premium Features</h3>
            <p className="mb-6 text-white/90">Get full access to all features, remove ads, and unlock advanced capabilities.</p>
            <button className="bg-white text-gray-900 font-bold py-3 px-8 rounded-lg hover:bg-gray-100 transition">Start Free Trial</button>
          </div>
        )}
      </div>

      {!user?.isPremium && <AdBanner placement="bottom" appId="anxiety-journal" />}
    </div>
  );
}
