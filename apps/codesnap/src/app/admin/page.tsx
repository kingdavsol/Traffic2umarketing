'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Badge } from '@traffic2u/ui';
import { Users, DollarSign, Activity, TrendingUp, Sparkles } from 'lucide-react';

interface Stats {
  totalUsers: number;
  activeUsers: number;
  totalRevenue: number;
  monthlyRevenue: number;
  totalConversions: number;
  conversionsTodayToday: number;
}

interface User {
  id: string;
  name: string;
  email: string;
  plan: string;
  status: string;
  createdAt: string;
  lastActive: string;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    activeUsers: 0,
    totalRevenue: 0,
    monthlyRevenue: 0,
    totalConversions: 0,
    conversionsToday: 0,
  });

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: Fetch real data from API
    setStats({
      totalUsers: 1247,
      activeUsers: 893,
      totalRevenue: 45670,
      monthlyRevenue: 12340,
      totalConversions: 34567,
      conversionsToday: 234,
    });

    setUsers([
      {
        id: '1',
        name: 'John Doe',
        email: 'john@example.com',
        plan: 'PROFESSIONAL',
        status: 'ACTIVE',
        createdAt: '2024-01-15',
        lastActive: '2 hours ago',
      },
      {
        id: '2',
        name: 'Jane Smith',
        email: 'jane@example.com',
        plan: 'STARTER',
        status: 'ACTIVE',
        createdAt: '2024-02-20',
        lastActive: '5 minutes ago',
      },
      {
        id: '3',
        name: 'Bob Johnson',
        email: 'bob@example.com',
        plan: 'ENTERPRISE',
        status: 'ACTIVE',
        createdAt: '2024-01-10',
        lastActive: '1 day ago',
      },
    ]);

    setLoading(false);
  }, []);

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
              <Sparkles className="h-6 w-6 text-blue-600" />
              <span className="text-xl font-bold">CodeSnap Admin</span>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="destructive">Admin</Badge>
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="mt-2 text-gray-600">Monitor and manage your CodeSnap platform</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Users</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalUsers.toLocaleString()}</p>
                  <p className="text-sm text-green-600 mt-1">
                    +{stats.activeUsers} active
                  </p>
                </div>
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Users className="h-8 w-8 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">
                    ${stats.totalRevenue.toLocaleString()}
                  </p>
                  <p className="text-sm text-green-600 mt-1">
                    +${stats.monthlyRevenue.toLocaleString()} this month
                  </p>
                </div>
                <div className="p-3 bg-green-100 rounded-lg">
                  <DollarSign className="h-8 w-8 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Conversions</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">
                    {stats.totalConversions.toLocaleString()}
                  </p>
                  <p className="text-sm text-green-600 mt-1">
                    +{stats.conversionsToday} today
                  </p>
                </div>
                <div className="p-3 bg-purple-100 rounded-lg">
                  <Activity className="h-8 w-8 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Growth Rate</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">+24%</p>
                  <p className="text-sm text-green-600 mt-1">
                    vs last month
                  </p>
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
            <CardDescription>Monitor and manage user accounts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">User</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Plan</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Joined</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Last Active</th>
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
                        <Badge variant={planColors[user.plan]}>
                          {user.plan}
                        </Badge>
                      </td>
                      <td className="px-4 py-4">
                        <Badge variant={user.status === 'ACTIVE' ? 'success' : 'secondary'}>
                          {user.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-600">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-600">
                        {user.lastActive}
                      </td>
                      <td className="px-4 py-4">
                        <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
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
