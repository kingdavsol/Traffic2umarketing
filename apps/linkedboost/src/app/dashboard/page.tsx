'use client';
import { Button, Card, CardHeader, CardTitle, CardContent, Badge } from '@traffic2u/ui';
import { Linkedin, Plus, Calendar, TrendingUp } from 'lucide-react';

export default function DashboardPage() {
  const posts = [
    { id: '1', content: 'Just launched our new product...', status: 'scheduled', date: '2024-03-20 10:00', engagement: 0 },
    { id: '2', content: '5 tips for growing on LinkedIn...', status: 'published', date: '2024-03-15 14:00', engagement: 234 },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Linkedin className="h-6 w-6 text-blue-600" />
            <span className="text-xl font-bold">LinkedBoost</span>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm">Dashboard</Button>
            <Button variant="ghost" size="sm">Calendar</Button>
            <Button variant="ghost" size="sm">Analytics</Button>
            <Button variant="ghost" size="sm">Sign Out</Button>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Scheduled Posts</h1>
          <Button><Plus className="mr-2 h-4 w-4" />New Post</Button>
        </div>

        <div className="grid gap-6">
          {posts.map(post => (
            <Card key={post.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">{post.content}</CardTitle>
                    <p className="text-sm text-gray-600 mt-1">{post.date}</p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Badge variant={post.status === 'published' ? 'success' : 'default'}>{post.status}</Badge>
                    {post.status === 'published' && <span className="text-sm text-gray-600">{post.engagement} engagements</span>}
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
