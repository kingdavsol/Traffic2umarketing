'use client';

import { useState } from 'react';
import { Button, Card, CardHeader, CardTitle, CardDescription, CardContent, Badge } from '@traffic2u/ui';
import { Mail, Plus, TrendingUp, Activity, AlertCircle, CheckCircle2, Settings } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface EmailAccount {
  id: string;
  email: string;
  provider: string;
  status: 'warming' | 'active' | 'paused' | 'error';
  dailySent: number;
  dailyLimit: number;
  progress: number;
  deliverabilityScore: number;
  daysActive: number;
}

const mockAccounts: EmailAccount[] = [
  {
    id: '1',
    email: 'sales@yourcompany.com',
    provider: 'Gmail',
    status: 'warming',
    dailySent: 35,
    dailyLimit: 50,
    progress: 65,
    deliverabilityScore: 87,
    daysActive: 9,
  },
  {
    id: '2',
    email: 'outreach@yourcompany.com',
    provider: 'Outlook',
    status: 'active',
    dailySent: 48,
    dailyLimit: 50,
    progress: 100,
    deliverabilityScore: 94,
    daysActive: 21,
  },
];

const mockChartData = [
  { day: 'Day 1', sent: 5, delivered: 5 },
  { day: 'Day 2', sent: 8, delivered: 8 },
  { day: 'Day 3', sent: 12, delivered: 11 },
  { day: 'Day 4', sent: 18, delivered: 17 },
  { day: 'Day 5', sent: 25, delivered: 24 },
  { day: 'Day 6', sent: 32, delivered: 31 },
  { day: 'Day 7', sent: 40, delivered: 39 },
];

export default function DashboardPage() {
  const [accounts, setAccounts] = useState<EmailAccount[]>(mockAccounts);
  const [showAddAccount, setShowAddAccount] = useState(false);

  const getStatusBadge = (status: EmailAccount['status']) => {
    const variants = {
      warming: { variant: 'default' as const, text: 'Warming Up' },
      active: { variant: 'success' as const, text: 'Active' },
      paused: { variant: 'secondary' as const, text: 'Paused' },
      error: { variant: 'destructive' as const, text: 'Error' },
    };
    const config = variants[status];
    return <Badge variant={config.variant}>{config.text}</Badge>;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center space-x-2">
              <Mail className="h-6 w-6 text-green-600" />
              <span className="text-xl font-bold">WarmInbox</span>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm">Dashboard</Button>
              <Button variant="ghost" size="sm">Accounts</Button>
              <Button variant="ghost" size="sm">Analytics</Button>
              <Button variant="ghost" size="sm">Settings</Button>
              <Button variant="ghost" size="sm">Sign Out</Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Email Accounts</h1>
            <p className="mt-2 text-gray-600">Manage and monitor your email warm-up campaigns</p>
          </div>
          <Button onClick={() => setShowAddAccount(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Email Account
          </Button>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Accounts</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">2</p>
                </div>
                <div className="p-3 bg-green-100 rounded-lg">
                  <Mail className="h-8 w-8 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Emails Sent Today</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">83</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Activity className="h-8 w-8 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Avg. Deliverability</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">91%</p>
                </div>
                <div className="p-3 bg-purple-100 rounded-lg">
                  <TrendingUp className="h-8 w-8 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Health Status</p>
                  <p className="text-3xl font-bold text-green-600 mt-2">Good</p>
                </div>
                <div className="p-3 bg-green-100 rounded-lg">
                  <CheckCircle2 className="h-8 w-8 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Email Accounts List */}
        <div className="space-y-6">
          {accounts.map((account) => (
            <Card key={account.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-green-100 rounded-lg">
                      <Mail className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <CardTitle className="text-xl">{account.email}</CardTitle>
                      <CardDescription>{account.provider} • {account.daysActive} days active</CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    {getStatusBadge(account.status)}
                    <Button variant="outline" size="sm">
                      <Settings className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Stats */}
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">Daily Progress</span>
                        <span className="text-sm text-gray-600">{account.dailySent}/{account.dailyLimit} emails</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-green-600 h-2 rounded-full"
                          style={{ width: `${(account.dailySent / account.dailyLimit) * 100}%` }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">Warmup Progress</span>
                        <span className="text-sm text-gray-600">{account.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${account.progress}%` }}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-2">
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-600">Deliverability Score</p>
                        <p className="text-2xl font-bold text-gray-900 mt-1">{account.deliverabilityScore}%</p>
                      </div>
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-600">Est. Completion</p>
                        <p className="text-2xl font-bold text-gray-900 mt-1">{14 - account.daysActive}d</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 p-3 bg-blue-50 rounded-lg">
                      <AlertCircle className="h-5 w-5 text-blue-600" />
                      <p className="text-sm text-blue-900">
                        {account.status === 'warming'
                          ? 'Warmup in progress. Avoid sending cold emails until complete.'
                          : 'Warmup complete! You can now send cold emails.'}
                      </p>
                    </div>
                  </div>

                  {/* Chart */}
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-4">Last 7 Days Activity</h4>
                    <ResponsiveContainer width="100%" height={200}>
                      <LineChart data={mockChartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                        <YAxis tick={{ fontSize: 12 }} />
                        <Tooltip />
                        <Line type="monotone" dataKey="sent" stroke="#22c55e" strokeWidth={2} name="Sent" />
                        <Line type="monotone" dataKey="delivered" stroke="#3b82f6" strokeWidth={2} name="Delivered" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {accounts.length === 0 && (
          <Card>
            <CardContent className="py-16 text-center">
              <Mail className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No email accounts yet</h3>
              <p className="text-gray-600 mb-6">Add your first email account to start warming up</p>
              <Button onClick={() => setShowAddAccount(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Email Account
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
