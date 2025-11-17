'use client';
import { useState, useEffect } from 'react';
import { Button, Card, CardHeader, CardTitle, CardContent, Badge } from '@traffic2u/ui';
import { Bell, Plus, Edit, Trash2, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import UpdateEditorModal from '@/components/UpdateEditorModal';

interface Update {
  id: string;
  title: string;
  content: string;
  category: 'FEATURE' | 'IMPROVEMENT' | 'FIX' | 'ANNOUNCEMENT';
  tags: string[];
  isPublished: boolean;
  publishedAt: string | null;
  createdAt: string;
}

export default function DashboardPage() {
  const [updates, setUpdates] = useState<Update[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedUpdate, setSelectedUpdate] = useState<Update | null>(null);

  useEffect(() => {
    fetchUpdates();
  }, []);

  const fetchUpdates = async () => {
    try {
      const response = await fetch('/api/updates');
      if (!response.ok) {
        throw new Error('Failed to fetch updates');
      }
      const data = await response.json();
      setUpdates(data.updates || []);
    } catch (error) {
      console.error('Fetch error:', error);
      toast.error('Failed to load updates');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNew = () => {
    setSelectedUpdate(null);
    setModalOpen(true);
  };

  const handleEdit = (update: Update) => {
    setSelectedUpdate(update);
    setModalOpen(true);
  };

  const handleDelete = async (updateId: string) => {
    if (!confirm('Are you sure you want to delete this update? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/updates/${updateId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete update');
      }

      toast.success('Update deleted successfully');
      fetchUpdates();
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete update');
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'FEATURE':
        return 'New Feature';
      case 'IMPROVEMENT':
        return 'Improvement';
      case 'FIX':
        return 'Bug Fix';
      case 'ANNOUNCEMENT':
        return 'Announcement';
      default:
        return category;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'FEATURE':
        return 'bg-blue-100 text-blue-800';
      case 'IMPROVEMENT':
        return 'bg-green-100 text-green-800';
      case 'FIX':
        return 'bg-red-100 text-red-800';
      case 'ANNOUNCEMENT':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

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
          <Button onClick={handleCreateNew}>
            <Plus className="mr-2 h-4 w-4" />
            New Update
          </Button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
          </div>
        ) : updates.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No updates yet</h3>
              <p className="text-gray-600 mb-4">
                Create your first update to start building your changelog
              </p>
              <Button onClick={handleCreateNew}>
                <Plus className="mr-2 h-4 w-4" />
                Create First Update
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {updates.map((update) => (
              <Card key={update.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <CardTitle>{update.title}</CardTitle>
                      <p className="text-sm text-gray-600 mt-1">
                        {update.publishedAt
                          ? new Date(update.publishedAt).toLocaleDateString()
                          : new Date(update.createdAt).toLocaleDateString()}
                      </p>
                      {update.content && (
                        <p className="text-sm text-gray-700 mt-2 line-clamp-2">
                          {update.content}
                        </p>
                      )}
                      {update.tags && update.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {(update.tags as string[]).map((tag) => (
                            <Badge key={tag} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center space-x-3 ml-4">
                      <Badge
                        variant={update.isPublished ? 'success' : 'secondary'}
                      >
                        {update.isPublished ? 'Published' : 'Draft'}
                      </Badge>
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${getCategoryColor(
                          update.category
                        )}`}
                      >
                        {getCategoryLabel(update.category)}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(update)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(update.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Update Editor Modal */}
      <UpdateEditorModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        update={selectedUpdate}
        onSuccess={fetchUpdates}
      />
    </div>
  );
}
