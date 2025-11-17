'use client';
import { Card, CardContent, Badge } from '@traffic2u/ui';
import { Users, QrCode, Eye, DollarSign } from 'lucide-react';

export default function AdminPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <QrCode className="h-6 w-6 text-red-600" />
            <span className="text-xl font-bold">MenuQR Admin</span>
          </div>
          <Badge variant="destructive">Admin</Badge>
        </div>
      </nav>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card><CardContent className="p-6"><div className="flex items-center justify-between"><div><p className="text-sm text-gray-600">Restaurants</p><p className="text-3xl font-bold mt-2">3,421</p></div><Users className="h-8 w-8 text-red-600" /></div></CardContent></Card>
          <Card><CardContent className="p-6"><div className="flex items-center justify-between"><div><p className="text-sm text-gray-600">Total Menus</p><p className="text-3xl font-bold mt-2">5,892</p></div><QrCode className="h-8 w-8 text-blue-600" /></div></CardContent></Card>
          <Card><CardContent className="p-6"><div className="flex items-center justify-between"><div><p className="text-sm text-gray-600">Total Views</p><p className="text-3xl font-bold mt-2">1.2M</p></div><Eye className="h-8 w-8 text-green-600" /></div></CardContent></Card>
          <Card><CardContent className="p-6"><div className="flex items-center justify-between"><div><p className="text-sm text-gray-600">MRR</p><p className="text-3xl font-bold mt-2">$14.2K</p></div><DollarSign className="h-8 w-8 text-purple-600" /></div></CardContent></Card>
        </div>
      </div>
    </div>
  );
}
