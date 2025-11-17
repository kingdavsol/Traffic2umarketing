'use client';
import { Button, Card, CardHeader, CardTitle, CardContent, Badge } from '@traffic2u/ui';
import { QrCode, Plus, Eye } from 'lucide-react';

export default function DashboardPage() {
  const menus = [
    { id: '1', name: 'Main Menu', items: 42, views: 1234, lastUpdated: '2024-03-15' },
    { id: '2', name: 'Drinks Menu', items: 28, views: 892, lastUpdated: '2024-03-10' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <QrCode className="h-6 w-6 text-red-600" />
            <span className="text-xl font-bold">MenuQR</span>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm">Menus</Button>
            <Button variant="ghost" size="sm">Settings</Button>
            <Button variant="ghost" size="sm">Sign Out</Button>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Your Menus</h1>
          <Button><Plus className="mr-2 h-4 w-4" />New Menu</Button>
        </div>

        <div className="grid gap-6">
          {menus.map(menu => (
            <Card key={menu.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>{menu.name}</CardTitle>
                    <p className="text-sm text-gray-600 mt-1">{menu.items} items • Updated {menu.lastUpdated}</p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Badge variant="success"><Eye className="h-3 w-3 mr-1" />{menu.views} views</Badge>
                    <Button variant="outline" size="sm">Edit</Button>
                    <Button variant="outline" size="sm">QR Code</Button>
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
