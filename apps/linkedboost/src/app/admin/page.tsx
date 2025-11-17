'use client';
import { Card, CardContent, Badge } from '@traffic2u/ui';
import { Users, Linkedin, TrendingUp, DollarSign } from 'lucide-react';

export default function AdminPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Linkedin className="h-6 w-6 text-blue-600" />
            <span className="text-xl font-bold">LinkedBoost Admin</span>
          </div>
          <Badge variant="destructive">Admin</Badge>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card><CardContent className="p-6"><div className="flex items-center justify-between"><div><p className="text-sm text-gray-600">Total Users</p><p className="text-3xl font-bold mt-2">10,234</p></div><Users className="h-8 w-8 text-blue-600" /></div></CardContent></Card>
          <Card><CardContent className="p-6"><div className="flex items-center justify-between"><div><p className="text-sm text-gray-600">Posts Scheduled</p><p className="text-3xl font-bold mt-2">45.2K</p></div><Linkedin className="h-8 w-8 text-cyan-600" /></div></CardContent></Card>
          <Card><CardContent className="p-6"><div className="flex items-center justify-between"><div><p className="text-sm text-gray-600">Avg Engagement</p><p className="text-3xl font-bold mt-2">+64%</p></div><TrendingUp className="h-8 w-8 text-green-600" /></div></CardContent></Card>
          <Card><CardContent className="p-6"><div className="flex items-center justify-between"><div><p className="text-sm text-gray-600">MRR</p><p className="text-3xl font-bold mt-2">$28.4K</p></div><DollarSign className="h-8 w-8 text-purple-600" /></div></CardContent></Card>
        </div>
      </div>
    </div>
  );
}
