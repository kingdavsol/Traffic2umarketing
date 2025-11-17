/**
 * PostPartum Fitness - Enhanced Dashboard with Assessment & Tracking
 */

'use client';

import { useRouter } from 'next/router';
import { useUser } from '@/shared/hooks/useUser';
import { AdBanner, RewardedAdButton } from '@/shared/components/ads/AdBanner';
import { Flame, Award, TrendingUp, Heart, AlertCircle, CheckCircle } from 'lucide-react';
import { useState } from 'react';

const RECOVERY_PHASES = [
  { id: 1, name: 'Weeks 0-2', description: 'Early Recovery', color: 'bg-red-100 border-red-300' },
  { id: 2, name: 'Weeks 3-6', description: 'Active Recovery', color: 'bg-orange-100 border-orange-300' },
  { id: 3, name: 'Weeks 8+', description: 'Progressive Strength', color: 'bg-green-100 border-green-300' },
];

const SYMPTOM_CATEGORIES = [
  { id: 'incontinence', name: 'Leakage/Incontinence', icon: '💧' },
  { id: 'pain', name: 'Pain/Soreness', icon: '🤕' },
  { id: 'bleeding', name: 'Bleeding', icon: '📍' },
  { id: 'fatigue', name: 'Fatigue', icon: '😴' },
];

export default function Dashboard() {
  const router = useRouter();
  const { user, loading, isAuthenticated } = useUser();
  const [currentPhase, setCurrentPhase] = useState(1);
  const [showAssessment, setShowAssessment] = useState(false);
  const [assessmentAnswers, setAssessmentAnswers] = useState({
    deliveryType: 'vaginal',
    tearDegree: 'none',
    complications: [],
  });
  const [symptomLog, setSymptomLog] = useState([
    { date: 'Today', incontinence: 2, pain: 1, bleeding: 1, fatigue: 3 },
    { date: 'Yesterday', incontinence: 2, pain: 1, bleeding: 1, fatigue: 3 },
  ]);
  const [strengthTests, setStrengthTests] = useState({
    plankHold: 15,
    pelvicFloorReps: 12,
    squatReps: 8,
  });

  if (loading) return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  if (!isAuthenticated) {
    router.push('/login');
    return null;
  }

  const handleAssessmentSubmit = async () => {
    // Save assessment to backend
    await fetch('/api/assessment/delivery', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(assessmentAnswers),
    });
    setShowAssessment(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white">
      {!user?.isPremium && <AdBanner placement="top" appId="postpartum-fitness" />}

      <div className="bg-gradient-to-r from-rose-500 to-pink-500 text-white px-4 py-6">
        <div className="max-w-6xl mx-auto flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold">Welcome back, {user?.name?.split(' ')[0]}!</h1>
            <p className="text-white/80">Your recovery journey matters. Let's track progress.</p>
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
        {/* Recovery Phase Selector */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Recovery Phase</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {RECOVERY_PHASES.map((phase) => (
              <button
                key={phase.id}
                onClick={() => setCurrentPhase(phase.id)}
                className={`p-4 rounded-lg border-2 text-left cursor-pointer transition ${
                  currentPhase === phase.id
                    ? `${phase.color} border-current font-bold`
                    : 'bg-white border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="font-bold">{phase.name}</div>
                <div className="text-sm text-gray-600">{phase.description}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Assessment Alert */}
        {!showAssessment && (
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-8 rounded">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-bold text-blue-900">Initial Assessment</h3>
                <p className="text-sm text-blue-800 mb-3">Complete a quick assessment to get personalized recommendations for your recovery type.</p>
                <button
                  onClick={() => setShowAssessment(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded font-bold hover:bg-blue-700 text-sm"
                >
                  Complete Assessment
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Assessment Form */}
        {showAssessment && (
          <div className="bg-white rounded-lg shadow p-8 mb-8 border-2 border-rose-200">
            <h2 className="text-2xl font-bold mb-6">Delivery & Recovery Assessment</h2>
            <div className="space-y-6">
              <div>
                <label className="block font-bold mb-2">Delivery Type</label>
                <div className="flex gap-3">
                  {['Vaginal', 'C-Section', 'Instrumental'].map((type) => (
                    <button
                      key={type}
                      onClick={() => setAssessmentAnswers({ ...assessmentAnswers, deliveryType: type.toLowerCase() })}
                      className={`px-4 py-2 rounded border-2 font-bold ${
                        assessmentAnswers.deliveryType === type.toLowerCase()
                          ? 'bg-rose-500 text-white border-rose-500'
                          : 'border-gray-300 bg-white'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-bold mb-2">Tearing Severity</label>
                <select
                  value={assessmentAnswers.tearDegree}
                  onChange={(e) => setAssessmentAnswers({ ...assessmentAnswers, tearDegree: e.target.value })}
                  className="w-full p-3 border-2 border-gray-300 rounded font-bold"
                >
                  <option value="none">No Tearing</option>
                  <option value="1st">1st Degree</option>
                  <option value="2nd">2nd Degree</option>
                  <option value="3rd">3rd Degree</option>
                  <option value="4th">4th Degree</option>
                </select>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={handleAssessmentSubmit}
                  className="flex-1 bg-rose-500 text-white px-6 py-3 rounded font-bold hover:bg-rose-600"
                >
                  Save Assessment
                </button>
                <button
                  onClick={() => setShowAssessment(false)}
                  className="flex-1 bg-gray-300 text-gray-900 px-6 py-3 rounded font-bold hover:bg-gray-400"
                >
                  Skip
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-400">
            <p className="text-gray-600 text-sm">Workouts Done</p>
            <h3 className="text-3xl font-bold text-gray-900">0</h3>
            <p className="text-xs text-gray-500 mt-1">This phase</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-purple-400">
            <p className="text-gray-600 text-sm">Strength Progress</p>
            <h3 className="text-3xl font-bold text-gray-900">{strengthTests.plankHold}s</h3>
            <p className="text-xs text-gray-500 mt-1">Plank hold</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-400">
            <p className="text-gray-600 text-sm">Pelvic Floor</p>
            <h3 className="text-3xl font-bold text-gray-900">{strengthTests.pelvicFloorReps}</h3>
            <p className="text-xs text-gray-500 mt-1">Reps completed</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-yellow-400">
            <p className="text-gray-600 text-sm">Achievements</p>
            <h3 className="text-3xl font-bold text-gray-900">{user?.gamification?.badges?.length || 0}</h3>
            <p className="text-xs text-gray-500 mt-1">Milestones</p>
          </div>
        </div>

        {/* Symptom Tracker */}
        <div className="bg-white rounded-lg shadow p-8 mb-8">
          <h2 className="text-2xl font-bold mb-4">Daily Symptom Tracker</h2>
          <p className="text-gray-600 mb-6">Rate your symptoms today (0-5 scale)</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {SYMPTOM_CATEGORIES.map((symptom) => (
              <div key={symptom.id} className="p-4 border-2 border-gray-200 rounded-lg text-center hover:border-rose-300 cursor-pointer">
                <div className="text-4xl mb-2">{symptom.icon}</div>
                <div className="text-sm font-bold text-gray-900">{symptom.name}</div>
                <div className="flex gap-1 mt-2 justify-center">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <button
                      key={i}
                      className={`w-6 h-6 rounded text-xs ${i <= 2 ? 'bg-green-300' : i <= 3 ? 'bg-yellow-300' : 'bg-red-300'}`}
                    >
                      {i}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Diastasis Recti Tracker */}
        <div className="bg-gradient-to-r from-rose-50 to-pink-50 rounded-lg p-8 mb-8 border-2 border-rose-200">
          <h2 className="text-2xl font-bold mb-4">Diastasis Recti Tracker</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-bold text-lg mb-2">Gap Distance</h3>
              <input
                type="number"
                placeholder="Enter gap width (cm)"
                className="w-full p-3 border-2 border-gray-300 rounded"
              />
              <p className="text-xs text-gray-600 mt-2">Measure distance between abdominal muscles</p>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-2">Recovery Status</h3>
              <div className="space-y-2">
                <label className="flex items-center gap-2">
                  <input type="radio" name="status" />
                  <span>Still separated (>2cm)</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="radio" name="status" />
                  <span>Partially closed (1-2cm)</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="radio" name="status" />
                  <span>Fully healed (<1cm)</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Rewarded Ad */}
        {!user?.isPremium && (
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-6 border border-blue-200 mb-8">
            <h4 className="font-bold mb-3">Earn Bonus Points</h4>
            <p className="text-sm text-gray-700 mb-4">Watch a short video to earn 50 bonus points!</p>
            <RewardedAdButton
              appId="postpartum-fitness"
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
          <div className="bg-gradient-to-r from-rose-500 to-pink-500 rounded-lg p-8 text-center text-white">
            <h3 className="text-2xl font-bold mb-2">Unlock Premium Features</h3>
            <p className="mb-6 text-white/90">Get full access to all features, remove ads, and unlock advanced capabilities.</p>
            <button className="bg-white text-gray-900 font-bold py-3 px-8 rounded-lg hover:bg-gray-100 transition">Start Free Trial</button>
          </div>
        )}
      </div>

      {!user?.isPremium && <AdBanner placement="bottom" appId="postpartum-fitness" />}
    </div>
  );
}
