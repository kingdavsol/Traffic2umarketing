'use client';
import { Card, CardContent, Badge } from '@traffic2u/ui';
import { Users, FileText, Eye, Bell } from 'lucide-react';

export default function AdminPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Bell className="h-6 w-6 text-purple-600" />
            <span className="text-xl font-bold">UpdateLog Admin</span>
          </div>
          <Badge variant="destructive">Admin</Badge>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card><CardContent className="p-6"><div className="flex items-center justify-between"><div><p className="text-sm text-gray-600">Total Users</p><p className="text-3xl font-bold mt-2">2,341</p></div><Users className="h-8 w-8 text-purple-600" /></div></CardContent></Card>
          <Card><CardContent className="p-6"><div className="flex items-center justify-between"><div><p className="text-sm text-gray-600">Total Updates</p><p className="text-3xl font-bold mt-2">4,892</p></div><FileText className="h-8 w-8 text-blue-600" /></div></CardContent></Card>
          <Card><CardContent className="p-6"><div className="flex items-center justify-between"><div><p className="text-sm text-gray-600">Page Views</p><p className="text-3xl font-bold mt-2">127K</p></div><Eye className="h-8 w-8 text-green-600" /></div></CardContent></Card>
          <Card><CardContent className="p-6"><div className="flex items-center justify-between"><div><p className="text-sm text-gray-600">Revenue</p><p className="text-3xl font-bold mt-2">$18.2K</p></div><Bell className="h-8 w-8 text-orange-600" /></div></CardContent></Card>
        </div>
      </div>
    </div>
  );
}
