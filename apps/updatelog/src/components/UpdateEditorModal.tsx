'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  Button,
  Input,
  Badge,
} from '@traffic2u/ui';
import { Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface Update {
  id?: string;
  title: string;
  content: string;
  category: 'FEATURE' | 'IMPROVEMENT' | 'FIX' | 'ANNOUNCEMENT';
  tags: string[];
  isPublished: boolean;
  publishedAt?: string;
}

interface UpdateEditorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  update?: Update | null;
  onSuccess: () => void;
}

const categories = [
  { value: 'FEATURE', label: 'New Feature', color: 'bg-blue-500' },
  { value: 'IMPROVEMENT', label: 'Improvement', color: 'bg-green-500' },
  { value: 'FIX', label: 'Bug Fix', color: 'bg-red-500' },
  { value: 'ANNOUNCEMENT', label: 'Announcement', color: 'bg-purple-500' },
];

export default function UpdateEditorModal({
  open,
  onOpenChange,
  update,
  onSuccess,
}: UpdateEditorModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Update>({
    title: '',
    content: '',
    category: 'FEATURE',
    tags: [],
    isPublished: false,
  });
  const [tagInput, setTagInput] = useState('');

  // Reset form when modal opens/closes or update changes
  useEffect(() => {
    if (update) {
      setFormData({
        id: update.id,
        title: update.title,
        content: update.content,
        category: update.category,
        tags: update.tags || [],
        isPublished: update.isPublished,
        publishedAt: update.publishedAt,
      });
    } else {
      setFormData({
        title: '',
        content: '',
        category: 'FEATURE',
        tags: [],
        isPublished: false,
      });
    }
  }, [update, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      toast.error('Title is required');
      return;
    }

    if (!formData.content.trim()) {
      toast.error('Content is required');
      return;
    }

    setLoading(true);

    try {
      const url = formData.id ? `/api/updates/${formData.id}` : '/api/updates';
      const method = formData.id ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title,
          content: formData.content,
          category: formData.category,
          tags: formData.tags,
          isPublished: formData.isPublished,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to save update');
      }

      toast.success(formData.id ? 'Update saved successfully!' : 'Update created successfully!');
      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      console.error('Save error:', error);
      toast.error(error.message || 'Failed to save update');
    } finally {
      setLoading(false);
    }
  };

  const handleAddTag = () => {
    const tag = tagInput.trim();
    if (tag && !formData.tags.includes(tag)) {
      setFormData({ ...formData, tags: [...formData.tags, tag] });
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter((tag) => tag !== tagToRemove),
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{formData.id ? 'Edit Update' : 'Create New Update'}</DialogTitle>
          <DialogDescription>
            {formData.id
              ? 'Make changes to your update and save when ready.'
              : 'Create a new changelog update for your product.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title <span className="text-red-500">*</span>
            </label>
            <Input
              type="text"
              placeholder="e.g., New Dashboard Released"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
              disabled={loading}
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              {categories.map((cat) => (
                <button
                  key={cat.value}
                  type="button"
                  onClick={() => setFormData({ ...formData, category: cat.value as any })}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    formData.category === cat.value
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  disabled={loading}
                >
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${cat.color}`}></div>
                    <span className="font-medium">{cat.label}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Content <span className="text-red-500">*</span>
            </label>
            <textarea
              className="w-full min-h-[200px] px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Describe your update in detail. You can use Markdown formatting."
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              required
              disabled={loading}
            />
            <p className="text-xs text-gray-500 mt-1">
              Supports Markdown formatting (bold, italic, lists, etc.)
            </p>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
            <div className="flex space-x-2">
              <Input
                type="text"
                placeholder="Add a tag (e.g., mobile, api)"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
                disabled={loading}
              />
              <Button type="button" onClick={handleAddTag} variant="outline" disabled={loading}>
                Add
              </Button>
            </div>
            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {formData.tags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="cursor-pointer"
                    onClick={() => handleRemoveTag(tag)}
                  >
                    {tag} ×
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Publishing */}
          <div className="border-t pt-4">
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isPublished}
                onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                disabled={loading}
              />
              <div>
                <p className="font-medium">Publish immediately</p>
                <p className="text-sm text-gray-600">
                  Make this update visible on your public changelog
                </p>
              </div>
            </label>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : formData.id ? (
                'Save Changes'
              ) : (
                'Create Update'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
