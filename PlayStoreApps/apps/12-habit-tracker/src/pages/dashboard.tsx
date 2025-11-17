'use client';
import { useRouter } from 'next/router';
import { useUser } from '@/shared/hooks/useUser';
import { AdBanner } from '@/shared/components/ads/AdBanner';
import { Flame, Plus } from 'lucide-react';
import { useState } from 'react';

const CHILDREN = [
  { id: 1, name: 'Emma', age: 7, color: 'purple', points: 450 },
  { id: 2, name: 'Noah', age: 10, color: 'blue', points: 620 }
];

const HABITS = [
  { id: 1, name: 'Brush Teeth', frequency: 'daily', icon: '🪥', reward: 10 },
  { id: 2, name: 'Read', frequency: 'daily', icon: '📖', reward: 15 },
  { id: 3, name: 'Exercise', frequency: 'daily', icon: '🏃', reward: 20 },
  { id: 4, name: 'Homework', frequency: 'daily', icon: '📚', reward: 25 }
];

const REWARDS_STORE = [
  { id: 1, name: 'Ice Cream', cost: 100, icon: '🍦' },
  { id: 2, name: 'Movie Night', cost: 150, icon: '🎬' },
  { id: 3, name: 'Extra Playtime', cost: 75, icon: '🎮' }
];

export default function Dashboard() {
  const router = useRouter();
  const { user, loading, isAuthenticated } = useUser();
  const [selectedChild, setSelectedChild] = useState(CHILDREN[0]);
  const [completedToday, setCompletedToday] = useState([]);
  const [totalPoints] = useState(selectedChild.points + completedToday.length * 15);

  if (loading) return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  if (!isAuthenticated) { router.push('/login'); return null; }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white">
      {!user?.isPremium && <AdBanner placement="top" appId="habit-tracker" />}
      <div className="bg-gradient-to-r from-purple-600 to-purple-400 text-white px-4 py-6">
        <h1 className="text-3xl font-bold">Build Better Habits Together</h1>
        <div className="flex gap-2 text-2xl font-bold mt-4"><Flame className="w-6 h-6" />{user?.gamification?.streak || 0} Day Streak</div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-400">
            <p className="text-sm text-gray-600">Today's Completions</p>
            <h3 className="text-3xl font-bold text-blue-600">{completedToday.length}/{HABITS.length}</h3>
          </div>
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-400">
            <p className="text-sm text-gray-600">{selectedChild.name}'s Points</p>
            <h3 className="text-3xl font-bold text-green-600">{totalPoints}</h3>
          </div>
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-purple-400">
            <p className="text-sm text-gray-600">Children Tracked</p>
            <h3 className="text-3xl font-bold text-purple-600">{CHILDREN.length}</h3>
          </div>
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-yellow-400">
            <p className="text-sm text-gray-600">Total Badges</p>
            <h3 className="text-3xl font-bold text-yellow-600">{user?.gamification?.badges?.length || 0}</h3>
          </div>
        </div>

        <div className="flex gap-2 mb-6">
          {CHILDREN.map(child => (
            <button
              key={child.id}
              onClick={() => setSelectedChild(child)}
              className={`px-6 py-3 rounded font-bold ${selectedChild.id === child.id ? 'bg-purple-600 text-white' : 'bg-white text-gray-800 border-2 border-gray-200'}`}
            >
              {child.name}, {child.age}
            </button>
          ))}
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow p-8">
            <h2 className="text-2xl font-bold mb-6">Today's Habits for {selectedChild.name}</h2>
            <div className="space-y-3">
              {HABITS.map(habit => (
                <div key={habit.id} className={`p-4 rounded-lg border-2 ${completedToday.includes(habit.id) ? 'bg-green-50 border-green-400' : 'bg-gray-50 border-gray-200'}`}>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{habit.icon}</span>
                      <div>
                        <p className="font-bold">{habit.name}</p>
                        <p className="text-sm text-gray-600">+{habit.reward} points</p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        if (!completedToday.includes(habit.id)) {
                          setCompletedToday([...completedToday, habit.id]);
                        }
                      }}
                      className={`px-6 py-2 rounded font-bold ${completedToday.includes(habit.id) ? 'bg-green-600 text-white' : 'bg-purple-600 text-white hover:bg-purple-700'}`}
                    >
                      {completedToday.includes(habit.id) ? '✓ Done' : 'Mark Done'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-8">
            <h2 className="text-2xl font-bold mb-6">Rewards Store</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {REWARDS_STORE.map(reward => (
                <div key={reward.id} className="p-4 border-2 border-gray-200 rounded-lg text-center">
                  <p className="text-4xl mb-2">{reward.icon}</p>
                  <p className="font-bold">{reward.name}</p>
                  <p className="text-lg text-purple-600 font-bold mt-2">{reward.cost} points</p>
                  <button className={`w-full mt-3 py-2 rounded font-bold ${totalPoints >= reward.cost ? 'bg-purple-600 text-white hover:bg-purple-700' : 'bg-gray-300 text-gray-600 cursor-not-allowed'}`}>
                    Redeem
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
