'use client';
import { Button, Card, CardHeader, CardTitle, CardContent, Badge } from '@traffic2u/ui';
import { FlaskConical, Plus, TrendingUp, Users, Eye } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const mockData = [
  { variant: 'Control', conversions: 45, visitors: 1000 },
  { variant: 'Variant A', conversions: 62, visitors: 1000 },
  { variant: 'Variant B', conversions: 58, visitors: 1000 },
];

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <FlaskConical className="h-6 w-6 text-orange-600" />
            <span className="text-xl font-bold">TestLift</span>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm">Dashboard</Button>
            <Button variant="ghost" size="sm">Tests</Button>
            <Button variant="ghost" size="sm">Analytics</Button>
            <Button variant="ghost" size="sm">Settings</Button>
            <Button variant="ghost" size="sm">Sign Out</Button>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">A/B Tests</h1>
            <p className="text-gray-600 mt-2">Manage and monitor your experiments</p>
          </div>
          <Button><Plus className="mr-2 h-4 w-4" />New Test</Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card><CardContent className="p-6"><div className="flex items-center justify-between"><div><p className="text-sm text-gray-600">Active Tests</p><p className="text-3xl font-bold mt-2">3</p></div><FlaskConical className="h-8 w-8 text-orange-600" /></div></CardContent></Card>
          <Card><CardContent className="p-6"><div className="flex items-center justify-between"><div><p className="text-sm text-gray-600">Total Visitors</p><p className="text-3xl font-bold mt-2">12.4K</p></div><Users className="h-8 w-8 text-blue-600" /></div></CardContent></Card>
          <Card><CardContent className="p-6"><div className="flex items-center justify-between"><div><p className="text-sm text-gray-600">Avg Conversion Lift</p><p className="text-3xl font-bold mt-2">+38%</p></div><TrendingUp className="h-8 w-8 text-green-600" /></div></CardContent></Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Homepage Hero Test</CardTitle>
                <p className="text-sm text-gray-600 mt-1">Testing 3 headline variations</p>
              </div>
              <div className="flex items-center space-x-3">
                <Badge variant="success">Running</Badge>
                <Button variant="outline" size="sm"><Eye className="h-4 w-4 mr-2" />View</Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={mockData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="variant" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="conversions" fill="#F97316" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-3 gap-4 pt-4 border-t">
              {mockData.map((d, i) => (
                <div key={i} className="text-center">
                  <p className="text-sm text-gray-600">{d.variant}</p>
                  <p className="text-2xl font-bold mt-1">{((d.conversions/d.visitors)*100).toFixed(1)}%</p>
                  <p className="text-xs text-gray-500 mt-1">{d.conversions} / {d.visitors}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
