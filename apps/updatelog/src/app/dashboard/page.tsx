'use client';
import { Button, Card, CardHeader, CardTitle, CardContent, Badge } from '@traffic2u/ui';
import { Bell, Plus, Edit, Trash2 } from 'lucide-react';

export default function DashboardPage() {
  const updates = [
    { id: '1', title: 'New Dashboard Released', date: '2024-03-15', category: 'Feature', published: true },
    { id: '2', title: 'Bug Fixes and Improvements', date: '2024-03-10', category: 'Fix', published: true },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Bell className="h-6 w-6 text-purple-600" />
            <span className="text-xl font-bold">UpdateLog</span>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm">Dashboard</Button>
            <Button variant="ghost" size="sm">Updates</Button>
            <Button variant="ghost" size="sm">Settings</Button>
            <Button variant="ghost" size="sm">Sign Out</Button>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Product Updates</h1>
            <p className="text-gray-600 mt-2">Manage and publish your changelog</p>
          </div>
          <Button><Plus className="mr-2 h-4 w-4" />New Update</Button>
        </div>

        <div className="grid gap-6">
          {updates.map(update => (
            <Card key={update.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>{update.title}</CardTitle>
                    <p className="text-sm text-gray-600 mt-1">{update.date}</p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Badge variant={update.published ? 'success' : 'secondary'}>{update.published ? 'Published' : 'Draft'}</Badge>
                    <Badge variant="default">{update.category}</Badge>
                    <Button variant="outline" size="sm"><Edit className="h-4 w-4" /></Button>
                    <Button variant="outline" size="sm"><Trash2 className="h-4 w-4" /></Button>
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
