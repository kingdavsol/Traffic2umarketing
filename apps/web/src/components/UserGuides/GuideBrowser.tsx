import React, { useState, useEffect } from 'react';
import { MagnifyingGlassIcon, PlusIcon } from '@heroicons/react/24/outline';
import GuideCard from './GuideCard';

interface Guide {
  id: string;
  title: string;
  description: string;
  author: {
    name: string;
    reputation: number;
  };
  vehicleMake: string;
  vehicleModel: string;
  vehicleYear?: number;
  category: string;
  difficulty: string;
  estimatedTime?: number;
  views: number;
  ratings: {
    average: number;
    count: number;
  };
  helpfulCount: number;
  featured: boolean;
}

export const GuideBrowser: React.FC = () => {
  const [guides, setGuides] = useState<Guide[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    make: '',
    model: '',
    category: 'all',
    difficulty: 'all',
    searchQuery: '',
  });

  useEffect(() => {
    fetchGuides();
  }, [filters]);

  const fetchGuides = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.make) params.append('make', filters.make);
      if (filters.model) params.append('model', filters.model);
      if (filters.category !== 'all') params.append('category', filters.category);
      if (filters.difficulty !== 'all') params.append('difficulty', filters.difficulty);
      if (filters.searchQuery) params.append('search', filters.searchQuery);

      const response = await fetch(`/api/guides?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) throw new Error('Failed to fetch guides');

      const data = await response.json();
      setGuides(data);
    } catch (error) {
      console.error('Error fetching guides:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectGuide = (guideId: string) => {
    window.location.href = `/guides/${guideId}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Repair & Maintenance Guides</h1>
        <button className="bg-blue-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-600 transition-colors flex items-center">
          <PlusIcon className="w-5 h-5 mr-2" />
          Create Guide
        </button>
      </div>

      {/* Search & Filters */}
      <div className="bg-white p-6 rounded-lg border border-gray-200 space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search guides..."
            value={filters.searchQuery}
            onChange={(e) => setFilters({ ...filters, searchQuery: e.target.value })}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Filter Controls */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Make
            </label>
            <input
              type="text"
              placeholder="e.g., Honda"
              value={filters.make}
              onChange={(e) => setFilters({ ...filters, make: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Model
            </label>
            <input
              type="text"
              placeholder="e.g., Civic"
              value={filters.model}
              onChange={(e) => setFilters({ ...filters, model: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <select
              value={filters.category}
              onChange={(e) => setFilters({ ...filters, category: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Categories</option>
              <option value="maintenance">Maintenance</option>
              <option value="repair">Repair</option>
              <option value="modification">Modification</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Difficulty
            </label>
            <select
              value={filters.difficulty}
              onChange={(e) => setFilters({ ...filters, difficulty: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Levels</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>
        </div>
      </div>

      {/* Featured Guides Section */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Featured Guides</h2>
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-6">
            {guides
              .filter(g => g.featured)
              .slice(0, 3)
              .map(guide => (
                <GuideCard
                  key={guide.id}
                  guide={guide}
                  onSelect={handleSelectGuide}
                />
              ))}
          </div>
        )}
      </div>

      {/* All Guides */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          All Guides {guides.length > 0 && `(${guides.length})`}
        </h2>
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : guides.length === 0 ? (
          <div className="bg-white p-12 rounded-lg border border-gray-200 text-center">
            <p className="text-gray-600 text-lg mb-2">No guides found</p>
            <p className="text-gray-500">
              Try adjusting your filters or create the first guide for this vehicle
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {guides.map(guide => (
              <GuideCard
                key={guide.id}
                guide={guide}
                onSelect={handleSelectGuide}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default GuideBrowser;
