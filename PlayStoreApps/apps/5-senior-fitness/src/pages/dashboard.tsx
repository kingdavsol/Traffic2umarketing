'use client';
import { useRouter } from 'next/router';
import { useUser } from '@/shared/hooks/useUser';
import { AdBanner } from '@/shared/components/ads/AdBanner';
import { Flame, ChevronDown } from 'lucide-react';
import { useState } from 'react';

const FALL_PREVENTION_EXERCISES = [
  {
    id: 1,
    name: 'Balance Board',
    duration: 10,
    difficulty: 'Beginner',
    fallPreventionScore: 25,
    description: 'Stand on one leg while holding a chair, alternating every 20 seconds',
    instructions: [
      'Stand with feet hip-width apart',
      'Hold back of chair with fingertips',
      'Lift one foot slightly off ground',
      'Hold for 20-30 seconds',
      'Switch legs and repeat 5 times',
      'Progress: Close eyes or use only one hand'
    ],
    warnings: 'Never lose contact with chair. Stop if dizzy.'
  },
  {
    id: 2,
    name: 'Heel-to-Toe Walking',
    duration: 8,
    difficulty: 'Beginner',
    fallPreventionScore: 15,
    description: 'Walk heel-to-toe to improve proprioception and gait stability',
    instructions: [
      'Stand with feet together',
      'Take a step forward, placing heel down first',
      'Roll through to your toes before lifting heel',
      'Walk in straight line for 20 feet',
      'Repeat 2-3 times',
      'Progress: Try walking backward'
    ],
    warnings: 'Stay near wall or furniture for balance support.'
  },
  {
    id: 3,
    name: 'Seated Leg Lifts',
    duration: 8,
    difficulty: 'Beginner',
    fallPreventionScore: 20,
    description: 'Build leg strength while seated for improved stability',
    instructions: [
      'Sit upright in sturdy chair',
      'Straighten right leg out in front',
      'Hold for 2 seconds, then lower',
      'Repeat 10 times on each leg',
      'Do 3 sets with 30-second rest between',
      'Progress: Add 1-2 second hold'
    ],
    warnings: 'Keep movements slow and controlled.'
  },
  {
    id: 4,
    name: 'Wall Push-Ups',
    duration: 10,
    difficulty: 'Intermediate',
    fallPreventionScore: 22,
    description: 'Upper body strengthening at wall (modified push-ups)',
    instructions: [
      'Face wall, arms length away',
      'Place hands on wall at shoulder height',
      'Lean in, bending elbows 45 degrees',
      'Push back to starting position',
      'Repeat 8-10 times',
      'Do 2-3 sets'
    ],
    warnings: 'Slow, controlled movements only.'
  },
  {
    id: 5,
    name: 'Sit-to-Stand',
    duration: 12,
    difficulty: 'Intermediate',
    fallPreventionScore: 30,
    description: 'Practice the movement pattern that prevents falls when rising',
    instructions: [
      'Sit in firm chair, feet flat on floor',
      'Lean forward, putting weight on balls of feet',
      'Push through legs to stand',
      'Slowly sit back down',
      'Repeat 10 times',
      'Progress: Do without using armrests'
    ],
    warnings: 'This is one of the most important exercises. Master it first.'
  }
];

const DIFFICULTY_LEVELS = ['Beginner', 'Intermediate', 'Advanced'];

export default function Dashboard() {
  const router = useRouter();
  const { user, loading, isAuthenticated } = useUser();
  const [completed, setCompleted] = useState(0);
  const [activeTab, setActiveTab] = useState('today'); // today, library, assessment
  const [difficulty, setDifficulty] = useState('Beginner');
  const [expandedExercise, setExpandedExercise] = useState(null);
  const [todayWorkouts, setTodayWorkouts] = useState([]);
  const [assessmentScore, setAssessmentScore] = useState(null);
  const [showAssessment, setShowAssessment] = useState(false);

  const filteredExercises = FALL_PREVENTION_EXERCISES.filter(e => e.difficulty === difficulty);
  const fallRisk = Math.max(0, 100 - (completed * 8));
  const totalFallPrevention = todayWorkouts.reduce((sum, id) => {
    const ex = FALL_PREVENTION_EXERCISES.find(e => e.id === id);
    return sum + (ex?.fallPreventionScore || 0);
  }, 0);

  const handleCompleteExercise = (id) => {
    if (!todayWorkouts.includes(id)) {
      setTodayWorkouts([...todayWorkouts, id]);
      setCompleted(completed + 1);
    }
  };

  const handleAssessment = () => {
    // Simulated assessment based on exercise completion
    const baseScore = Math.min(95, 50 + (completed * 4));
    const adjustedScore = Math.floor(baseScore * (1 + totalFallPrevention / 100));
    setAssessmentScore(adjustedScore);
    setShowAssessment(true);
  };

  if (loading) return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  if (!isAuthenticated) { router.push('/login'); return null; }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white">
      {!user?.isPremium && <AdBanner placement="top" appId="senior-fitness" />}
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-4 py-6">
        <h1 className="text-3xl font-bold">Stay Strong, Independent 💪</h1>
        <div className="flex gap-2 text-2xl font-bold mt-4"><Flame className="w-6 h-6" />{user?.gamification?.streak || 0} Day Streak</div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className={`p-6 mb-8 rounded border-l-4 ${fallRisk > 60 ? 'bg-red-50 border-red-500' : 'bg-green-50 border-green-500'}`}>
          <p className="font-bold text-lg">Fall Risk Assessment: <span className={`text-3xl font-bold ${fallRisk > 60 ? 'text-red-600' : 'text-green-600'}`}>{fallRisk}/100</span></p>
          <p className="text-sm text-gray-700 mt-2">{fallRisk > 60 ? '⚠️ High risk - Increase exercise frequency' : '✅ Low risk - Maintain current routine'}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-400">
            <p className="text-sm text-gray-600">Workouts Completed</p>
            <h3 className="text-3xl font-bold text-blue-600">{completed}</h3>
            <p className="text-xs text-gray-500 mt-1">This week</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-400">
            <p className="text-sm text-gray-600">Balance Score</p>
            <h3 className="text-3xl font-bold text-green-600">{Math.min(100, 40 + completed * 8)}/100</h3>
            <p className="text-xs text-gray-500 mt-1">Improving</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-purple-400">
            <p className="text-sm text-gray-600">Strength Gain</p>
            <h3 className="text-3xl font-bold text-purple-600">+{completed * 6}%</h3>
            <p className="text-xs text-gray-500 mt-1">Estimated</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-yellow-400">
            <p className="text-sm text-gray-600">Fall Prevention</p>
            <h3 className="text-3xl font-bold text-yellow-600">{totalFallPrevention}%</h3>
            <p className="text-xs text-gray-500 mt-1">Today's focus</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-2 mb-6 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('today')}
            className={`px-6 py-3 font-bold ${activeTab === 'today' ? 'border-b-4 border-green-600 text-green-600' : 'text-gray-600'}`}
          >
            Today's Plan
          </button>
          <button
            onClick={() => setActiveTab('library')}
            className={`px-6 py-3 font-bold ${activeTab === 'library' ? 'border-b-4 border-green-600 text-green-600' : 'text-gray-600'}`}
          >
            Exercise Library
          </button>
          <button
            onClick={() => setActiveTab('assessment')}
            className={`px-6 py-3 font-bold ${activeTab === 'assessment' ? 'border-b-4 border-green-600 text-green-600' : 'text-gray-600'}`}
          >
            Assessment
          </button>
        </div>

        {/* Today's Workouts Tab */}
        {activeTab === 'today' && (
          <div className="bg-white rounded-lg shadow p-8">
            <h2 className="text-2xl font-bold mb-6">Today's Fall Prevention Routine</h2>
            <p className="text-gray-600 mb-6">Complete these exercises to reduce your fall risk. Start with 2-3 exercises and progress gradually.</p>

            <div className="space-y-4">
              {FALL_PREVENTION_EXERCISES.slice(0, 3).map((exercise) => (
                <div key={exercise.id} className={`p-6 border-2 rounded-lg ${todayWorkouts.includes(exercise.id) ? 'bg-green-50 border-green-400' : 'bg-gray-50 border-gray-200'}`}>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <h3 className="font-bold text-lg">{exercise.name}</h3>
                        <span className={`px-3 py-1 rounded text-sm font-bold ${exercise.difficulty === 'Beginner' ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'}`}>
                          {exercise.difficulty}
                        </span>
                      </div>
                      <p className="text-gray-600 mt-1">{exercise.description}</p>
                      <div className="flex gap-6 mt-3 text-sm">
                        <span>⏱️ {exercise.duration} minutes</span>
                        <span>🛡️ +{exercise.fallPreventionScore}% fall prevention</span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleCompleteExercise(exercise.id)}
                      className={`ml-4 px-6 py-3 rounded font-bold whitespace-nowrap ${todayWorkouts.includes(exercise.id) ? 'bg-green-600 text-white' : 'bg-green-600 text-white hover:bg-green-700'}`}
                    >
                      {todayWorkouts.includes(exercise.id) ? '✓ Done' : 'Complete'}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 p-6 bg-blue-50 rounded-lg border-l-4 border-blue-400">
              <h3 className="font-bold mb-3">📋 Safety Tips</h3>
              <ul className="text-sm space-y-2 text-gray-700">
                <li>• Wear proper footwear with good grip</li>
                <li>• Remove hazards like loose rugs or clutter</li>
                <li>• Keep one hand on support while exercising</li>
                <li>• Stay hydrated - drink water before, during, and after</li>
                <li>• Stop immediately if you feel dizzy or in pain</li>
              </ul>
            </div>
          </div>
        )}

        {/* Exercise Library Tab */}
        {activeTab === 'library' && (
          <div className="bg-white rounded-lg shadow p-8">
            <h2 className="text-2xl font-bold mb-6">Fall Prevention Exercise Library</h2>

            <div className="mb-6">
              <label className="block text-sm font-bold mb-3">Filter by Difficulty:</label>
              <div className="flex gap-2">
                {DIFFICULTY_LEVELS.map(level => (
                  <button
                    key={level}
                    onClick={() => setDifficulty(level)}
                    className={`px-4 py-2 rounded font-bold ${difficulty === level ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-800'}`}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              {filteredExercises.map((exercise) => (
                <div key={exercise.id} className="border-2 border-gray-200 rounded-lg overflow-hidden">
                  <button
                    onClick={() => setExpandedExercise(expandedExercise === exercise.id ? null : exercise.id)}
                    className="w-full p-4 flex justify-between items-center hover:bg-gray-50"
                  >
                    <div className="text-left flex-1">
                      <h3 className="font-bold">{exercise.name}</h3>
                      <p className="text-sm text-gray-600">{exercise.duration} min • {exercise.difficulty}</p>
                    </div>
                    <ChevronDown className={`w-5 h-5 transition ${expandedExercise === exercise.id ? 'transform rotate-180' : ''}`} />
                  </button>

                  {expandedExercise === exercise.id && (
                    <div className="p-4 bg-gray-50 border-t-2 border-gray-200">
                      <p className="font-bold mb-3">{exercise.description}</p>
                      <div className="mb-4">
                        <h4 className="font-bold mb-2">Instructions:</h4>
                        <ol className="space-y-2 text-sm">
                          {exercise.instructions.map((instruction, idx) => (
                            <li key={idx} className="flex gap-2">
                              <span className="font-bold text-green-600">{idx + 1}.</span>
                              <span>{instruction}</span>
                            </li>
                          ))}
                        </ol>
                      </div>
                      <div className="p-3 bg-red-50 border-l-4 border-red-400 rounded">
                        <p className="font-bold text-sm">⚠️ Safety: {exercise.warnings}</p>
                      </div>
                      <button
                        onClick={() => handleCompleteExercise(exercise.id)}
                        className="mt-4 w-full bg-green-600 text-white px-4 py-2 rounded font-bold"
                      >
                        Mark as Completed Today
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Assessment Tab */}
        {activeTab === 'assessment' && (
          <div className="bg-white rounded-lg shadow p-8">
            <h2 className="text-2xl font-bold mb-6">Fall Risk Assessment</h2>

            {!showAssessment ? (
              <div>
                <div className="bg-blue-50 p-6 rounded-lg border-l-4 border-blue-400 mb-6">
                  <h3 className="font-bold mb-3">Quick Assessment Quiz</h3>
                  <p className="text-gray-700 text-sm mb-4">
                    Complete 5 exercises to get a personalized fall risk assessment. This uses your recent activity data to calculate your risk level.
                  </p>
                  <div className="space-y-2 text-sm">
                    <p>✓ Workouts completed: {completed}</p>
                    <p>✓ Fall prevention score: {totalFallPrevention}%</p>
                  </div>
                </div>

                <button
                  onClick={handleAssessment}
                  disabled={completed < 2}
                  className={`w-full py-3 rounded font-bold text-white text-lg ${completed < 2 ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'}`}
                >
                  {completed < 2 ? 'Complete at least 2 exercises first' : 'Generate Assessment Report'}
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                <div className={`p-6 rounded-lg text-center ${assessmentScore > 70 ? 'bg-green-50 border-2 border-green-400' : 'bg-yellow-50 border-2 border-yellow-400'}`}>
                  <p className="text-gray-600 mb-2">Your Fall Risk Score</p>
                  <h3 className={`text-5xl font-bold mb-2 ${assessmentScore > 70 ? 'text-green-600' : 'text-yellow-600'}`}>{assessmentScore}/100</h3>
                  <p className="font-bold">{assessmentScore > 70 ? 'LOW RISK' : 'MODERATE RISK'}</p>
                </div>

                <div className="space-y-4">
                  <div className="p-4 bg-gray-50 rounded">
                    <h4 className="font-bold mb-2">Your Results:</h4>
                    <ul className="text-sm space-y-2">
                      <li>📊 Balance Improvement: {Math.min(100, 40 + completed * 8)}%</li>
                      <li>💪 Strength Gain: +{completed * 6}%</li>
                      <li>🛡️ Fall Prevention: {totalFallPrevention}%</li>
                      <li>🔄 Consistency: {Math.min(100, completed * 20)}%</li>
                    </ul>
                  </div>

                  <div className="p-4 bg-blue-50 border-l-4 border-blue-400 rounded">
                    <h4 className="font-bold mb-2">Recommendations:</h4>
                    <ul className="text-sm space-y-1">
                      <li>• Continue with beginner exercises 3-4x per week</li>
                      <li>• Add one intermediate exercise per week</li>
                      <li>• Focus on the Sit-to-Stand movement daily</li>
                      <li>• Schedule a balance check-in every 2 weeks</li>
                    </ul>
                  </div>
                </div>

                <button
                  onClick={() => setShowAssessment(false)}
                  className="w-full bg-green-600 text-white px-4 py-3 rounded font-bold"
                >
                  Back to Assessment
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
