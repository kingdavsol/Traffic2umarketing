'use client';
import { Button, Card, CardHeader, CardTitle, CardContent } from '@traffic2u/ui';
import { DollarSign, TrendingUp, Users, CreditCard } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const mockData = [
  { month: 'Jan', mrr: 12000 },
  { month: 'Feb', mrr: 15000 },
  { month: 'Mar', mrr: 18500 },
  { month: 'Apr', mrr: 22000 },
  { month: 'May', mrr: 26500 },
];

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <DollarSign className="h-6 w-6 text-green-600" />
            <span className="text-xl font-bold">RevenueView</span>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm">Dashboard</Button>
            <Button variant="ghost" size="sm">Customers</Button>
            <Button variant="ghost" size="sm">Settings</Button>
            <Button variant="ghost" size="sm">Sign Out</Button>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Revenue Dashboard</h1>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card><CardContent className="p-6"><div className="flex items-center justify-between"><div><p className="text-sm text-gray-600">MRR</p><p className="text-3xl font-bold mt-2">$26.5K</p></div><DollarSign className="h-8 w-8 text-green-600" /></div></CardContent></Card>
          <Card><CardContent className="p-6"><div className="flex items-center justify-between"><div><p className="text-sm text-gray-600">Active Customers</p><p className="text-3xl font-bold mt-2">142</p></div><Users className="h-8 w-8 text-blue-600" /></div></CardContent></Card>
          <Card><CardContent className="p-6"><div className="flex items-center justify-between"><div><p className="text-sm text-gray-600">Churn Rate</p><p className="text-3xl font-bold mt-2">2.3%</p></div><TrendingUp className="h-8 w-8 text-orange-600" /></div></CardContent></Card>
          <Card><CardContent className="p-6"><div className="flex items-center justify-between"><div><p className="text-sm text-gray-600">LTV</p><p className="text-3xl font-bold mt-2">$3,240</p></div><CreditCard className="h-8 w-8 text-purple-600" /></div></CardContent></Card>
        </div>

        <Card>
          <CardHeader><CardTitle>MRR Growth</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={mockData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="mrr" stroke="#10B981" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
