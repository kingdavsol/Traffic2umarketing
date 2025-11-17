/**
 * Interview Prep - Advanced Mock Interview & Coaching
 */

'use client';

import { useRouter } from 'next/router';
import { useUser } from '@/shared/hooks/useUser';
import { AdBanner, RewardedAdButton } from '@/shared/components/ads/AdBanner';
import { Flame, Award, TrendingUp, Video, Mic, CheckCircle, Star } from 'lucide-react';
import { useState } from 'react';

const INTERVIEW_QUESTIONS = [
  { id: 1, category: 'Behavioral', question: 'Tell me about a time you overcame a challenge.' },
  { id: 2, category: 'Behavioral', question: 'Describe your proudest professional achievement.' },
  { id: 3, category: 'Technical', question: 'What is your experience with [specific technology]?' },
  { id: 4, category: 'Technical', question: 'How do you approach problem-solving?' },
  { id: 5, category: 'Experience', question: 'Why do you want to work for our company?' },
  { id: 6, category: 'Experience', question: 'What are your long-term career goals?' },
];

interface MockInterview {
  id: string;
  date: string;
  jobTitle: string;
  score: number;
  duration: number;
  feedbackItems: string[];
}

export default function Dashboard() {
  const router = useRouter();
  const { user, loading, isAuthenticated } = useUser();
  const [interviews, setInterviews] = useState<MockInterview[]>([
    {
      id: '1',
      date: 'Nov 14',
      jobTitle: 'Software Engineer',
      score: 82,
      duration: 25,
      feedbackItems: ['Great eye contact', 'Good technical knowledge', 'Work on pacing'],
    },
    {
      id: '2',
      date: 'Nov 10',
      jobTitle: 'Product Manager',
      score: 76,
      duration: 30,
      feedbackItems: ['Strong problem-solving', 'Improve answer clarity', 'Add more examples'],
    },
  ]);
  const [showMockInterview, setShowMockInterview] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState<typeof INTERVIEW_QUESTIONS[0] | null>(null);
  const [isRecording, setIsRecording] = useState(false);

  if (loading) return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  if (!isAuthenticated) {
    router.push('/login');
    return null;
  }

  const averageScore = interviews.length > 0 ? Math.round(interviews.reduce((sum, i) => sum + i.score, 0) / interviews.length) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white">
      {!user?.isPremium && <AdBanner placement="top" appId="interview-prep" />}

      <div className="bg-gradient-to-r from-rose-600 to-red-600 text-white px-4 py-6">
        <div className="max-w-6xl mx-auto flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold">Welcome back, {user?.name?.split(' ')[0]}!</h1>
            <p className="text-white/80">Master your next interview 🎯</p>
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
        {/* CTA to Start Practice */}
        <div className="bg-gradient-to-r from-rose-100 to-red-100 rounded-lg p-6 mb-8 border-2 border-rose-300">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-rose-900">Ready to Practice?</h2>
              <p className="text-rose-800">Record a mock interview and get instant feedback</p>
            </div>
            <button
              onClick={() => setShowMockInterview(true)}
              className="bg-rose-600 text-white px-8 py-4 rounded-lg font-bold hover:bg-rose-700 flex items-center gap-2"
            >
              <Video className="w-5 h-5" />
              Start Mock Interview
            </button>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-400">
            <p className="text-gray-600 text-sm">Mock Interviews Done</p>
            <h3 className="text-3xl font-bold text-gray-900">{interviews.length}</h3>
            <p className="text-xs text-gray-500 mt-1">Total practice sessions</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-purple-400">
            <p className="text-gray-600 text-sm">Average Score</p>
            <h3 className="text-3xl font-bold text-gray-900">{averageScore}</h3>
            <p className="text-xs text-gray-500 mt-1">Out of 100</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-400">
            <p className="text-gray-600 text-sm">Questions Practiced</p>
            <h3 className="text-3xl font-bold text-gray-900">{INTERVIEW_QUESTIONS.length}</h3>
            <p className="text-xs text-gray-500 mt-1">Available questions</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-yellow-400">
            <p className="text-gray-600 text-sm">Achievements</p>
            <h3 className="text-3xl font-bold text-gray-900">{user?.gamification?.badges?.length || 0}</h3>
            <p className="text-xs text-gray-500 mt-1">Badges earned</p>
          </div>
        </div>

        {/* Mock Interview Interface */}
        {showMockInterview && (
          <div className="bg-white rounded-lg shadow p-8 mb-8 border-2 border-rose-300">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Practice Interview</h2>
              <button
                onClick={() => setShowMockInterview(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>

            {!selectedQuestion ? (
              <div>
                <h3 className="font-bold text-lg mb-4">Select a Question to Practice</h3>
                <div className="space-y-2">
                  {INTERVIEW_QUESTIONS.map((q) => (
                    <button
                      key={q.id}
                      onClick={() => setSelectedQuestion(q)}
                      className="w-full p-4 text-left border-2 border-gray-200 rounded-lg hover:border-rose-400 hover:bg-rose-50 transition"
                    >
                      <span className="text-xs font-bold text-rose-600">{q.category}</span>
                      <p className="font-bold text-gray-900 mt-1">{q.question}</p>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="p-4 bg-gradient-to-r from-rose-50 to-red-50 rounded-lg border-l-4 border-rose-500">
                  <p className="text-sm text-gray-600 font-bold mb-2">{selectedQuestion.category} Question</p>
                  <h3 className="text-xl font-bold text-gray-900">{selectedQuestion.question}</h3>
                </div>

                <div className="p-6 bg-gray-50 rounded-lg border-2 border-gray-300 text-center">
                  <div className="flex justify-center mb-4">
                    <Mic className={`w-12 h-12 ${isRecording ? 'text-red-600 animate-pulse' : 'text-gray-600'}`} />
                  </div>
                  <p className="font-bold text-lg mb-4">
                    {isRecording ? '🔴 Recording...' : '⏸️ Ready to record'}
                  </p>
                  <p className="text-sm text-gray-600 mb-6">Aim for 1-2 minutes. Use the STAR method for best results.</p>
                  <button
                    onClick={() => setIsRecording(!isRecording)}
                    className={`px-8 py-3 rounded-lg font-bold text-white transition ${
                      isRecording
                        ? 'bg-red-600 hover:bg-red-700'
                        : 'bg-green-600 hover:bg-green-700'
                    }`}
                  >
                    {isRecording ? 'Stop Recording' : 'Start Recording'}
                  </button>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setSelectedQuestion(null)}
                    className="flex-1 px-6 py-3 bg-gray-300 text-gray-900 rounded-lg font-bold hover:bg-gray-400"
                  >
                    Back
                  </button>
                  {!isRecording && (
                    <button className="flex-1 px-6 py-3 bg-rose-600 text-white rounded-lg font-bold hover:bg-rose-700">
                      Get Feedback
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Interview History */}
        <div className="bg-white rounded-lg shadow p-8">
          <h2 className="text-2xl font-bold mb-6">Recent Practice Sessions</h2>
          <div className="space-y-4">
            {interviews.map((interview) => (
              <div key={interview.id} className="p-4 border-2 border-gray-200 rounded-lg hover:border-rose-300 transition">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-bold text-lg text-gray-900">{interview.jobTitle}</h3>
                    <p className="text-sm text-gray-600">{interview.date} • {interview.duration} minutes</p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1 text-yellow-500 mb-2">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${i < Math.round(interview.score / 20) ? 'fill-yellow-500' : 'text-gray-300'}`}
                        />
                      ))}
                    </div>
                    <p className="text-2xl font-bold text-rose-600">{interview.score}</p>
                  </div>
                </div>
                <div className="space-y-1">
                  {interview.feedbackItems.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-sm text-gray-700">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
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
              appId="interview-prep"
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
          <div className="bg-gradient-to-r from-rose-500 to-red-500 rounded-lg p-8 text-center text-white">
            <h3 className="text-2xl font-bold mb-2">Unlock Premium Features</h3>
            <p className="mb-6 text-white/90">Get full access to all features, remove ads, and unlock advanced capabilities.</p>
            <button className="bg-white text-gray-900 font-bold py-3 px-8 rounded-lg hover:bg-gray-100 transition">Start Free Trial</button>
          </div>
        )}
      </div>

      {!user?.isPremium && <AdBanner placement="bottom" appId="interview-prep" />}
    </div>
  );
}
