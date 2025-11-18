import React from 'react';
import { StarIcon, EyeIcon, ThumbsUpIcon } from '@heroicons/react/24/solid';

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

interface GuideCardProps {
  guide: Guide;
  onSelect: (guideId: string) => void;
}

export const GuideCard: React.FC<GuideCardProps> = ({ guide, onSelect }) => {
  const difficultyColors = {
    easy: 'bg-green-100 text-green-800',
    medium: 'bg-yellow-100 text-yellow-800',
    hard: 'bg-red-100 text-red-800',
  };

  const categoryEmojis: Record<string, string> = {
    maintenance: '🔧',
    repair: '🛠️',
    modification: '🎨',
  };

  return (
    <div
      onClick={() => onSelect(guide.id)}
      className="bg-white rounded-lg border border-gray-200 hover:border-blue-500 hover:shadow-lg transition-all cursor-pointer overflow-hidden"
    >
      {/* Featured Badge */}
      {guide.featured && (
        <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-white px-4 py-2 text-xs font-bold">
          ⭐ FEATURED
        </div>
      )}

      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="text-lg font-bold text-gray-900 line-clamp-2">
              {guide.title}
            </h3>
            <p className="text-gray-600 text-sm mt-1">
              {guide.vehicleYear} {guide.vehicleMake} {guide.vehicleModel}
            </p>
          </div>
          <span className="text-2xl ml-2">{categoryEmojis[guide.category] || '📖'}</span>
        </div>

        {/* Description */}
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {guide.description}
        </p>

        {/* Tags */}
        <div className="flex gap-2 mb-4 flex-wrap">
          <span className={`px-2 py-1 rounded text-xs font-semibold ${difficultyColors[guide.difficulty as keyof typeof difficultyColors]}`}>
            {guide.difficulty.charAt(0).toUpperCase() + guide.difficulty.slice(1)}
          </span>
          {guide.estimatedTime && (
            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-semibold">
              ⏱️ {guide.estimatedTime} min
            </span>
          )}
        </div>

        {/* Author Info */}
        <div className="bg-gray-50 p-3 rounded mb-4">
          <p className="text-sm text-gray-600">
            By <span className="font-semibold text-gray-900">{guide.author.name}</span>
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Reputation: {guide.author.reputation} points
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 pt-4 border-t border-gray-200">
          <div className="text-center">
            <div className="flex items-center justify-center text-yellow-500 mb-1">
              <StarIcon className="w-4 h-4" />
            </div>
            <p className="font-bold text-gray-900">{guide.ratings.average.toFixed(1)}</p>
            <p className="text-xs text-gray-600">{guide.ratings.count} ratings</p>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center text-blue-500 mb-1">
              <EyeIcon className="w-4 h-4" />
            </div>
            <p className="font-bold text-gray-900">{guide.views}</p>
            <p className="text-xs text-gray-600">views</p>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center text-green-500 mb-1">
              <ThumbsUpIcon className="w-4 h-4" />
            </div>
            <p className="font-bold text-gray-900">{guide.helpfulCount}</p>
            <p className="text-xs text-gray-600">helpful</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GuideCard;
