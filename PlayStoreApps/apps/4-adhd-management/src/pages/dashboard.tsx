/**
 * ADHD Management - Enhanced Dashboard with Timer & Task Management
 */

'use client';

import { useRouter } from 'next/router';
import { useUser } from '@/shared/hooks/useUser';
import { AdBanner, RewardedAdButton } from '@/shared/components/ads/AdBanner';
import { Flame, Award, TrendingUp, Clock, Zap, Target, AlertCircle } from 'lucide-react';
import { useState, useEffect } from 'react';

interface Task {
  id: string;
  title: string;
  subtasks: string[];
  status: 'todo' | 'in-progress' | 'done';
  estimatedTime?: number;
}

export default function Dashboard() {
  const router = useRouter();
  const { user, loading, isAuthenticated } = useUser();
  const [sessionLength, setSessionLength] = useState(25);
  const [isRunning, setIsRunning] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(sessionLength * 60);
  const [taskInput, setTaskInput] = useState('');
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: '1',
      title: 'Email response',
      subtasks: [],
      status: 'todo',
    },
  ]);
  const [showTaskBreakdown, setShowTaskBreakdown] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [focusSessions, setFocusSessions] = useState(0);

  if (loading) return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  if (!isAuthenticated) {
    router.push('/login');
    return null;
  }

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining((prev) => prev - 1);
      }, 1000);
    } else if (timeRemaining === 0 && isRunning) {
      setIsRunning(false);
      setFocusSessions(focusSessions + 1);
      setTimeRemaining(sessionLength * 60);
      // Celebrate the completed session
      alert('🎉 Focus session complete! Take a break.');
    }
    return () => clearInterval(interval);
  }, [isRunning, timeRemaining, sessionLength, focusSessions]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleTaskBreakdown = async () => {
    if (!selectedTask) return;
    // In production, call AI API to break down task
    const subtasks = [
      'Research topic',
      'Create outline',
      'Write draft',
      'Edit and proofread',
    ];
    setSelectedTask({ ...selectedTask, subtasks });
  };

  const handleAddTask = () => {
    if (taskInput.trim()) {
      const newTask: Task = {
        id: Date.now().toString(),
        title: taskInput,
        subtasks: [],
        status: 'todo',
      };
      setTasks([...tasks, newTask]);
      setTaskInput('');
    }
  };

  const handleTaskComplete = (taskId: string) => {
    setTasks(tasks.map((t) => (t.id === taskId ? { ...t, status: 'done' } : t)));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white">
      {!user?.isPremium && <AdBanner placement="top" appId="adhd-management" />}

      <div className="bg-gradient-to-r from-orange-500 to-yellow-500 text-white px-4 py-6">
        <div className="max-w-6xl mx-auto flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold">Welcome back, {user?.name?.split(' ')[0]}!</h1>
            <p className="text-white/80">Let's focus and get things done! 🚀</p>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-2 text-2xl font-bold mb-2">
              <Flame className="w-6 h-6" />
              {user?.gamification?.streak || 0} Day Streak
            </div>
            <div className="text-sm text-white/90">{focusSessions} focus sessions completed</div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Hyperfocus Timer - HERO SECTION */}
        <div className="bg-gradient-to-br from-orange-100 to-yellow-100 rounded-lg shadow-xl p-8 mb-8 border-2 border-orange-300">
          <h2 className="text-2xl font-bold text-orange-900 mb-6 text-center">Hyperfocus Timer</h2>

          {/* Timer Display */}
          <div className="text-center mb-6">
            <div className="text-6xl font-bold text-orange-600 font-mono mb-4">{formatTime(timeRemaining)}</div>
            <div className="text-lg text-orange-700 font-semibold mb-4">
              {isRunning ? '⏱️ Focus Mode Active' : '⏸️ Ready to Focus?'}
            </div>
          </div>

          {/* Timer Controls */}
          <div className="flex gap-3 justify-center mb-6">
            <button
              onClick={() => setIsRunning(!isRunning)}
              className={`px-8 py-3 rounded-lg font-bold text-white transition ${
                isRunning ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'
              }`}
            >
              {isRunning ? 'Pause' : 'Start Focus'}
            </button>
            <button
              onClick={() => setTimeRemaining(sessionLength * 60)}
              className="px-6 py-3 bg-gray-300 text-gray-900 rounded-lg font-bold hover:bg-gray-400"
            >
              Reset
            </button>
          </div>

          {/* Timer Options */}
          <div className="flex gap-2 justify-center flex-wrap">
            {[15, 25, 45, 90].map((mins) => (
              <button
                key={mins}
                onClick={() => {
                  setSessionLength(mins);
                  setTimeRemaining(mins * 60);
                  setIsRunning(false);
                }}
                className={`px-4 py-2 rounded font-bold transition ${
                  sessionLength === mins
                    ? 'bg-orange-600 text-white'
                    : 'bg-white border-2 border-orange-300 text-orange-700 hover:bg-orange-50'
                }`}
              >
                {mins}m
              </button>
            ))}
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-400">
            <p className="text-gray-600 text-sm">Focus Sessions Today</p>
            <h3 className="text-3xl font-bold text-gray-900">{focusSessions}</h3>
            <p className="text-xs text-gray-500 mt-1">Average: {sessionLength}min each</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-purple-400">
            <p className="text-gray-600 text-sm">Tasks Done</p>
            <h3 className="text-3xl font-bold text-gray-900">{tasks.filter((t) => t.status === 'done').length}</h3>
            <p className="text-xs text-gray-500 mt-1">Out of {tasks.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-400">
            <p className="text-gray-600 text-sm">Focus Score</p>
            <h3 className="text-3xl font-bold text-gray-900">{focusSessions * 10}/100</h3>
            <p className="text-xs text-gray-500 mt-1">Consistency bonus</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-yellow-400">
            <p className="text-gray-600 text-sm">Achievements</p>
            <h3 className="text-3xl font-bold text-gray-900">{user?.gamification?.badges?.length || 0}</h3>
            <p className="text-xs text-gray-500 mt-1">Badges earned</p>
          </div>
        </div>

        {/* Task Breakdown AI */}
        <div className="bg-white rounded-lg shadow p-8 mb-8">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <Zap className="w-6 h-6 text-yellow-500" />
            AI Task Breakdown
          </h2>
          <p className="text-gray-600 mb-4">
            Feeling overwhelmed? Let AI break down your tasks into micro-steps.
          </p>

          {showTaskBreakdown && selectedTask ? (
            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-6 rounded-lg">
              <h3 className="font-bold text-lg mb-4">{selectedTask.title}</h3>
              <p className="text-sm text-gray-700 mb-4">Breaking down task into smaller, manageable steps...</p>

              <div className="space-y-2">
                {selectedTask.subtasks.length === 0 ? (
                  <button
                    onClick={handleTaskBreakdown}
                    className="w-full bg-yellow-500 text-white py-2 rounded font-bold hover:bg-yellow-600"
                  >
                    Generate Breakdown
                  </button>
                ) : (
                  <>
                    {selectedTask.subtasks.map((subtask, idx) => (
                      <div key={idx} className="flex items-center gap-3 p-3 bg-white rounded border-l-4 border-yellow-500">
                        <input type="checkbox" className="w-4 h-4" />
                        <span className="font-medium text-gray-900">{subtask}</span>
                      </div>
                    ))}
                    <button
                      onClick={() => setShowTaskBreakdown(false)}
                      className="w-full bg-gray-300 text-gray-900 py-2 rounded font-bold hover:bg-gray-400 mt-4"
                    >
                      Done
                    </button>
                  </>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-lg hover:border-yellow-400 cursor-pointer"
                  onClick={() => {
                    setSelectedTask(task);
                    setShowTaskBreakdown(true);
                  }}
                >
                  <Target className="w-5 h-5 text-orange-500" />
                  <span className="font-bold text-gray-900 flex-1">{task.title}</span>
                  <button className="text-yellow-500 font-bold">Break it Down →</button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Tasks List */}
        <div className="bg-white rounded-lg shadow p-8 mb-8">
          <h2 className="text-2xl font-bold mb-4">Today's Tasks</h2>

          <div className="flex gap-3 mb-6">
            <input
              type="text"
              value={taskInput}
              onChange={(e) => setTaskInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddTask()}
              placeholder="Add a new task..."
              className="flex-1 p-3 border-2 border-gray-300 rounded-lg focus:border-orange-500 outline-none"
            />
            <button
              onClick={handleAddTask}
              className="bg-orange-500 text-white px-6 py-3 rounded-lg font-bold hover:bg-orange-600"
            >
              Add
            </button>
          </div>

          <div className="space-y-2">
            {tasks.map((task) => (
              <div
                key={task.id}
                className={`flex items-center gap-3 p-4 border-2 rounded-lg transition ${
                  task.status === 'done' ? 'bg-green-50 border-green-300' : 'bg-white border-gray-200'
                }`}
              >
                <input
                  type="checkbox"
                  checked={task.status === 'done'}
                  onChange={() => handleTaskComplete(task.id)}
                  className="w-5 h-5 cursor-pointer"
                />
                <span
                  className={`flex-1 font-medium ${
                    task.status === 'done' ? 'line-through text-gray-500' : 'text-gray-900'
                  }`}
                >
                  {task.title}
                </span>
                {task.subtasks.length > 0 && (
                  <span className="text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded">
                    {task.subtasks.length} steps
                  </span>
                )}
              </div>
            ))}
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
              appId="adhd-management"
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
          <div className="bg-gradient-to-r from-orange-500 to-yellow-500 rounded-lg p-8 text-center text-white">
            <h3 className="text-2xl font-bold mb-2">Unlock Premium Features</h3>
            <p className="mb-6 text-white/90">Get full access to all features, remove ads, and unlock advanced capabilities.</p>
            <button className="bg-white text-gray-900 font-bold py-3 px-8 rounded-lg hover:bg-gray-100 transition">Start Free Trial</button>
          </div>
        )}
      </div>

      {!user?.isPremium && <AdBanner placement="bottom" appId="adhd-management" />}
    </div>
  );
}
