'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Badge } from '@traffic2u/ui';
import { Users, DollarSign, Activity, TrendingUp, Mail, AlertTriangle } from 'lucide-react';

interface Stats {
  totalUsers: number;
  activeAccounts: number;
  totalRevenue: number;
  monthlyRevenue: number;
  emailsSent: number;
  emailsToday: number;
}

interface User {
  id: string;
  name: string;
  email: string;
  plan: string;
  accounts: number;
  emailsSent: number;
  status: string;
  createdAt: string;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({
    totalUsers: 856,
    activeAccounts: 1423,
    totalRevenue: 38420,
    monthlyRevenue: 9840,
    emailsSent: 2456789,
    emailsToday: 12450,
  });

  const [users, setUsers] = useState<User[]>([
    {
      id: '1',
      name: 'John Doe',
      email: 'john@company.com',
      plan: 'PROFESSIONAL',
      accounts: 5,
      emailsSent: 24500,
      status: 'ACTIVE',
      createdAt: '2024-01-15',
    },
    {
      id: '2',
      name: 'Jane Smith',
      email: 'jane@startup.io',
      plan: 'STARTER',
      accounts: 2,
      emailsSent: 8900,
      status: 'ACTIVE',
      createdAt: '2024-02-10',
    },
  ]);

  const planColors: Record<string, 'default' | 'secondary' | 'success'> = {
    FREE: 'secondary',
    STARTER: 'default',
    PROFESSIONAL: 'success',
    ENTERPRISE: 'success',
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center space-x-2">
              <Mail className="h-6 w-6 text-green-600" />
              <span className="text-xl font-bold">WarmInbox Admin</span>
            </div>
            <Badge variant="destructive">Admin</Badge>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="mt-2 text-gray-600">Monitor and manage WarmInbox platform</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Users</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalUsers.toLocaleString()}</p>
                  <p className="text-sm text-green-600 mt-1">+{stats.activeAccounts} accounts</p>
                </div>
                <div className="p-3 bg-green-100 rounded-lg">
                  <Users className="h-8 w-8 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">${stats.totalRevenue.toLocaleString()}</p>
                  <p className="text-sm text-green-600 mt-1">+${stats.monthlyRevenue.toLocaleString()} this month</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-lg">
                  <DollarSign className="h-8 w-8 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Emails Warmed</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{(stats.emailsSent / 1000000).toFixed(1)}M</p>
                  <p className="text-sm text-green-600 mt-1">+{stats.emailsToday.toLocaleString()} today</p>
                </div>
                <div className="p-3 bg-purple-100 rounded-lg">
                  <Mail className="h-8 w-8 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Avg Deliverability</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">94%</p>
                  <p className="text-sm text-green-600 mt-1">+2% vs last month</p>
                </div>
                <div className="p-3 bg-orange-100 rounded-lg">
                  <TrendingUp className="h-8 w-8 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Users Table */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Users</CardTitle>
            <CardDescription>Monitor user accounts and activity</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">User</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Plan</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Accounts</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Emails Sent</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Joined</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="px-4 py-4">
                        <div>
                          <p className="font-medium text-gray-900">{user.name}</p>
                          <p className="text-sm text-gray-600">{user.email}</p>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <Badge variant={planColors[user.plan]}>{user.plan}</Badge>
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-600">{user.accounts}</td>
                      <td className="px-4 py-4 text-sm text-gray-600">{user.emailsSent.toLocaleString()}</td>
                      <td className="px-4 py-4">
                        <Badge variant="success">{user.status}</Badge>
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-600">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-4">
                        <button className="text-green-600 hover:text-green-800 text-sm font-medium">
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
