import { notFound } from 'next/navigation';
import { prisma } from '@traffic2u/database';
import { Bell, Calendar, Tag } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, Badge, Button, Input } from '@traffic2u/ui';

interface PageProps {
  params: {
    slug: string;
  };
  searchParams: {
    category?: string;
  };
}

async function getChangelog(slug: string, category?: string) {
  const changelog = await prisma.changelog.findUnique({
    where: { slug },
  });

  if (!changelog) {
    return null;
  }

  // Build where clause for filtering
  const whereClause: any = {
    changelogId: changelog.id,
    isPublished: true,
  };

  if (category && category !== 'all') {
    whereClause.category = category.toUpperCase();
  }

  // Get published updates
  const updates = await prisma.update.findMany({
    where: whereClause,
    orderBy: { publishedAt: 'desc' },
  });

  return {
    changelog,
    updates,
  };
}

export default async function PublicChangelogPage({ params, searchParams }: PageProps) {
  const data = await getChangelog(params.slug, searchParams.category);

  if (!data) {
    notFound();
  }

  const { changelog, updates } = data;

  const categories = [
    { value: 'all', label: 'All Updates', color: 'bg-gray-500' },
    { value: 'FEATURE', label: 'Features', color: 'bg-blue-500' },
    { value: 'IMPROVEMENT', label: 'Improvements', color: 'bg-green-500' },
    { value: 'FIX', label: 'Bug Fixes', color: 'bg-red-500' },
    { value: 'ANNOUNCEMENT', label: 'Announcements', color: 'bg-purple-500' },
  ];

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
        return 'bg-blue-500';
      case 'IMPROVEMENT':
        return 'bg-green-500';
      case 'FIX':
        return 'bg-red-500';
      case 'ANNOUNCEMENT':
        return 'bg-purple-500';
      default:
        return 'bg-gray-500';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const selectedCategory = searchParams.category || 'all';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-16 px-4">
        <div className="container mx-auto max-w-5xl">
          <div className="flex items-center space-x-3 mb-4">
            <Bell className="h-10 w-10" />
            <h1 className="text-4xl md:text-5xl font-bold">{changelog.name}</h1>
          </div>
          {changelog.description && (
            <p className="text-xl opacity-90 max-w-2xl">{changelog.description}</p>
          )}
        </div>
      </div>

      {/* Subscribe Section */}
      <div className="bg-white border-b py-8 px-4">
        <div className="container mx-auto max-w-5xl">
          <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
            <div>
              <h2 className="text-xl font-semibold mb-1">Stay up to date</h2>
              <p className="text-gray-600">Get notified when we ship new features and improvements</p>
            </div>
            <form className="flex space-x-2 w-full md:w-auto">
              <Input
                type="email"
                placeholder="you@example.com"
                className="w-full md:w-64"
                required
              />
              <Button type="submit">Subscribe</Button>
            </form>
          </div>
        </div>
      </div>

      {/* Category Filter */}
      <div className="bg-white border-b py-4 px-4 sticky top-0 z-10">
        <div className="container mx-auto max-w-5xl">
          <div className="flex items-center space-x-3 overflow-x-auto">
            {categories.map((cat) => (
              <a
                key={cat.value}
                href={`/changelog/${params.slug}${cat.value !== 'all' ? `?category=${cat.value}` : ''}`}
                className={`flex items-center space-x-2 px-4 py-2 rounded-full whitespace-nowrap transition-all ${
                  selectedCategory === cat.value
                    ? `${cat.color} text-white`
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <div className={`w-2 h-2 rounded-full ${selectedCategory === cat.value ? 'bg-white' : cat.color}`}></div>
                <span className="font-medium">{cat.label}</span>
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Updates */}
      <div className="container mx-auto max-w-5xl px-4 py-12">
        {updates.length === 0 ? (
          <div className="text-center py-12">
            <Bell className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No updates yet</h3>
            <p className="text-gray-600">
              {selectedCategory !== 'all'
                ? 'No updates in this category. Try selecting a different filter.'
                : 'Check back soon for updates!'}
            </p>
          </div>
        ) : (
          <div className="space-y-12">
            {updates.map((update) => (
              <Card key={update.id} className="overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-gray-50 to-white">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <div className={`w-3 h-3 rounded-full ${getCategoryColor(update.category)}`}></div>
                        <span className="text-sm font-medium text-gray-600">
                          {getCategoryLabel(update.category)}
                        </span>
                        <span className="text-gray-400">•</span>
                        <div className="flex items-center space-x-1 text-sm text-gray-600">
                          <Calendar className="h-4 w-4" />
                          <span>{formatDate(update.publishedAt || update.createdAt)}</span>
                        </div>
                      </div>
                      <CardTitle className="text-2xl">{update.title}</CardTitle>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="prose max-w-none">
                    <p className="text-gray-700 whitespace-pre-wrap">{update.content}</p>
                  </div>

                  {update.tags && (update.tags as string[]).length > 0 && (
                    <div className="flex items-center space-x-2 mt-6 pt-6 border-t">
                      <Tag className="h-4 w-4 text-gray-400" />
                      <div className="flex flex-wrap gap-2">
                        {(update.tags as string[]).map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="bg-white border-t py-8 px-4 mt-12">
        <div className="container mx-auto max-w-5xl text-center">
          <p className="text-sm text-gray-600">
            Powered by <span className="font-semibold text-purple-600">UpdateLog</span>
          </p>
          <p className="text-xs text-gray-500 mt-2">
            Keep your users informed with beautiful changelogs
          </p>
        </div>
      </div>
    </div>
  );
}

// Generate metadata for SEO
export async function generateMetadata({ params }: PageProps) {
  const data = await getChangelog(params.slug);

  if (!data) {
    return {
      title: 'Changelog Not Found',
    };
  }

  return {
    title: `${data.changelog.name} - Changelog`,
    description: data.changelog.description || `View the latest updates and changes for ${data.changelog.name}`,
  };
}
