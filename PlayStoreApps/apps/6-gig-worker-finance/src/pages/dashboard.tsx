/**
 * Gig Worker Finance - Advanced Income & Tax Planning
 */

'use client';

import { useRouter } from 'next/router';
import { useUser } from '@/shared/hooks/useUser';
import { AdBanner, RewardedAdButton } from '@/shared/components/ads/AdBanner';
import { Flame, Award, TrendingUp, DollarSign, AlertCircle, TrendingDown, Calendar } from 'lucide-react';
import { useState } from 'react';

interface GigJob {
  id: string;
  date: string;
  platform: string;
  earnings: number;
  category: string;
}

interface Expense {
  id: string;
  date: string;
  category: string;
  amount: number;
  description: string;
}

const TAX_CATEGORIES = [
  { id: 'self-employment', name: 'Self-Employment Tax (15.3%)', rate: 0.153 },
  { id: 'federal', name: 'Federal Income Tax (Est.)', rate: 0.22 },
  { id: 'state', name: 'State Income Tax (Varies)', rate: 0.05 },
];

const EXPENSE_CATEGORIES = [
  { id: 'vehicle', name: '🚗 Vehicle Mileage', deductible: true },
  { id: 'equipment', name: '💻 Equipment & Supplies', deductible: true },
  { id: 'phone', name: '📱 Phone & Internet', deductible: true },
  { id: 'insurance', name: '🛡️ Insurance', deductible: true },
  { id: 'other', name: '📋 Other Expenses', deductible: true },
];

export default function Dashboard() {
  const router = useRouter();
  const { user, loading, isAuthenticated } = useUser();
  const [jobs, setJobs] = useState<GigJob[]>([
    { id: '1', date: 'Nov 15', platform: 'DoorDash', earnings: 45.50, category: 'delivery' },
    { id: '2', date: 'Nov 14', platform: 'Uber', earnings: 62.30, category: 'rideshare' },
    { id: '3', date: 'Nov 13', platform: 'Fiverr', earnings: 125.00, category: 'freelance' },
  ]);
  const [expenses, setExpenses] = useState<Expense[]>([
    { id: '1', date: 'Nov 15', category: 'vehicle', amount: 12.50, description: 'Mileage (18 miles)' },
    { id: '2', date: 'Nov 14', category: 'phone', amount: 25.00, description: 'Phone bill portion' },
  ]);
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [expenseInput, setExpenseInput] = useState({ category: 'vehicle', amount: '', description: '' });

  if (loading) return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  if (!isAuthenticated) {
    router.push('/login');
    return null;
  }

  const thisWeekEarnings = jobs.reduce((sum, job) => sum + job.earnings, 0);
  const thisWeekExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const netIncome = thisWeekEarnings - thisWeekExpenses;
  const estimatedTaxes = thisWeekEarnings * 0.30; // 30% estimated tax

  const handleAddExpense = () => {
    if (expenseInput.amount && expenseInput.category) {
      const newExpense: Expense = {
        id: Date.now().toString(),
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        category: expenseInput.category,
        amount: parseFloat(expenseInput.amount),
        description: expenseInput.description,
      };
      setExpenses([newExpense, ...expenses]);
      setExpenseInput({ category: 'vehicle', amount: '', description: '' });
      setShowExpenseForm(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white">
      {!user?.isPremium && <AdBanner placement="top" appId="gig-worker-finance" />}

      <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-6">
        <div className="max-w-6xl mx-auto flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold">Welcome back, {user?.name?.split(' ')[0]}!</h1>
            <p className="text-white/80">Stay on top of your gig income and taxes</p>
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
        {/* Income & Tax Alert */}
        <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 mb-8 rounded">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-600 mt-1 flex-shrink-0" />
            <div>
              <h3 className="font-bold text-yellow-900">Quarterly Tax Deadline Reminder</h3>
              <p className="text-sm text-yellow-800">Next payment due: January 16, 2025 (Q1)</p>
              <p className="text-sm text-yellow-800 mt-1">Estimated quarterly tax: ${estimatedTaxes.toFixed(2)}</p>
            </div>
          </div>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-400">
            <p className="text-gray-600 text-sm">This Week Earnings</p>
            <h3 className="text-3xl font-bold text-green-600">${thisWeekEarnings.toFixed(2)}</h3>
            <p className="text-xs text-gray-500 mt-1">{jobs.length} gigs completed</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-red-400">
            <p className="text-gray-600 text-sm">Deductible Expenses</p>
            <h3 className="text-3xl font-bold text-red-600">${thisWeekExpenses.toFixed(2)}</h3>
            <p className="text-xs text-gray-500 mt-1">Saves ${(thisWeekExpenses * 0.25).toFixed(2)} in taxes</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-400">
            <p className="text-gray-600 text-sm">Net Income</p>
            <h3 className="text-3xl font-bold text-blue-600">${netIncome.toFixed(2)}</h3>
            <p className="text-xs text-gray-500 mt-1">After deductions</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-yellow-400">
            <p className="text-gray-600 text-sm">Est. Tax Liability</p>
            <h3 className="text-3xl font-bold text-yellow-600">${estimatedTaxes.toFixed(2)}</h3>
            <p className="text-xs text-gray-500 mt-1">30% set-aside</p>
          </div>
        </div>

        {/* Income Forecast */}
        <div className="bg-white rounded-lg shadow p-8 mb-8">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-purple-600" />
            Income Forecast
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg border-2 border-purple-200">
              <p className="text-sm text-gray-600 font-bold">This Month (Est.)</p>
              <h3 className="text-2xl font-bold text-purple-600 mt-2">${(thisWeekEarnings * 4.3).toFixed(2)}</h3>
              <p className="text-xs text-gray-500 mt-1">Based on current week pace</p>
            </div>
            <div className="p-4 bg-gradient-to-br from-green-50 to-blue-50 rounded-lg border-2 border-green-200">
              <p className="text-sm text-gray-600 font-bold">This Quarter (Est.)</p>
              <h3 className="text-2xl font-bold text-green-600 mt-2">${(thisWeekEarnings * 13).toFixed(2)}</h3>
              <p className="text-xs text-gray-500 mt-1">3-month projection</p>
            </div>
            <div className="p-4 bg-gradient-to-br from-yellow-50 to-blue-50 rounded-lg border-2 border-yellow-200">
              <p className="text-sm text-gray-600 font-bold">This Year (Est.)</p>
              <h3 className="text-2xl font-bold text-yellow-600 mt-2">${(thisWeekEarnings * 52).toFixed(2)}</h3>
              <p className="text-xs text-gray-500 mt-1">Annual projection</p>
            </div>
          </div>
        </div>

        {/* Recent Gig Jobs */}
        <div className="bg-white rounded-lg shadow p-8 mb-8">
          <h2 className="text-2xl font-bold mb-4">Recent Gig Work</h2>
          <div className="space-y-3">
            {jobs.map((job) => (
              <div key={job.id} className="flex items-center justify-between p-4 border-2 border-gray-200 rounded-lg hover:border-purple-300">
                <div>
                  <p className="font-bold text-gray-900">{job.platform}</p>
                  <p className="text-sm text-gray-600">{job.date}</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-green-600">${job.earnings.toFixed(2)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Expense Tracker */}
        <div className="bg-white rounded-lg shadow p-8 mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Tax-Deductible Expenses</h2>
            <button
              onClick={() => setShowExpenseForm(!showExpenseForm)}
              className="bg-purple-600 text-white px-4 py-2 rounded font-bold hover:bg-purple-700"
            >
              + Add Expense
            </button>
          </div>

          {showExpenseForm && (
            <div className="bg-purple-50 p-6 rounded-lg mb-6 border-2 border-purple-200">
              <h3 className="font-bold text-lg mb-4">Log Deductible Expense</h3>
              <div className="space-y-4">
                <div>
                  <label className="block font-bold mb-2">Category</label>
                  <select
                    value={expenseInput.category}
                    onChange={(e) => setExpenseInput({ ...expenseInput, category: e.target.value })}
                    className="w-full p-3 border-2 border-gray-300 rounded-lg"
                  >
                    {EXPENSE_CATEGORIES.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold mb-2">Amount</label>
                    <input
                      type="number"
                      placeholder="$0.00"
                      value={expenseInput.amount}
                      onChange={(e) => setExpenseInput({ ...expenseInput, amount: e.target.value })}
                      className="w-full p-3 border-2 border-gray-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block font-bold mb-2">Description</label>
                    <input
                      type="text"
                      placeholder="e.g., Gas, Supplies"
                      value={expenseInput.description}
                      onChange={(e) => setExpenseInput({ ...expenseInput, description: e.target.value })}
                      className="w-full p-3 border-2 border-gray-300 rounded-lg"
                    />
                  </div>
                </div>
                <button
                  onClick={handleAddExpense}
                  className="w-full bg-purple-600 text-white py-3 rounded font-bold hover:bg-purple-700"
                >
                  Save Expense
                </button>
              </div>
            </div>
          )}

          <div className="space-y-2">
            {expenses.map((expense) => (
              <div key={expense.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border-l-4 border-purple-400">
                <div>
                  <p className="font-bold text-gray-900">{EXPENSE_CATEGORIES.find((c) => c.id === expense.category)?.name}</p>
                  <p className="text-sm text-gray-600">{expense.description} • {expense.date}</p>
                </div>
                <p className="text-lg font-bold text-red-600">-${expense.amount.toFixed(2)}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Tax Planning */}
        <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg p-8 border-2 border-purple-300 mb-8">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <Calendar className="w-6 h-6 text-purple-600" />
            Quarterly Tax Planning
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-bold text-lg mb-3">Estimated Tax Breakdown</h3>
              <div className="space-y-2">
                {TAX_CATEGORIES.map((tax) => (
                  <div key={tax.id} className="flex justify-between p-3 bg-white rounded border-l-4 border-purple-500">
                    <span className="font-medium">{tax.name}</span>
                    <span className="font-bold text-purple-600">${(thisWeekEarnings * 4.3 * tax.rate).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 p-3 bg-white rounded border-2 border-purple-500 font-bold">
                <div className="flex justify-between">
                  <span>Total Est. Quarterly Tax:</span>
                  <span className="text-purple-600">${(thisWeekEarnings * 4.3 * 0.40).toFixed(2)}</span>
                </div>
              </div>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-3">Money-Saving Tips</h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>✅ Track all mileage for 58.5¢/mile deduction (2024)</li>
                <li>✅ Save receipts for equipment purchases</li>
                <li>✅ Deduct home office if you work from home</li>
                <li>✅ Track internet and phone as business expenses</li>
                <li>✅ Set aside 30-40% for estimated taxes</li>
                <li>✅ Consider forming an LLC for liability protection</li>
              </ul>
            </div>
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
              appId="gig-worker-finance"
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
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg p-8 text-center text-white">
            <h3 className="text-2xl font-bold mb-2">Unlock Premium Features</h3>
            <p className="mb-6 text-white/90">Get full access to all features, remove ads, and unlock advanced capabilities.</p>
            <button className="bg-white text-gray-900 font-bold py-3 px-8 rounded-lg hover:bg-gray-100 transition">Start Free Trial</button>
          </div>
        )}
      </div>

      {!user?.isPremium && <AdBanner placement="bottom" appId="gig-worker-finance" />}
    </div>
  );
}
