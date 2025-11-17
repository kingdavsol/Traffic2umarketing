'use client';
import { useRouter } from 'next/router';
import { useUser } from '@/shared/hooks/useUser';
import { AdBanner } from '@/shared/components/ads/AdBanner';
import { Flame, Plus } from 'lucide-react';
import { useState } from 'react';

const WARDROBE_ITEMS = [
  { id: 1, name: 'Blue Jeans', category: 'Pants', color: 'blue', times: 12 },
  { id: 2, name: 'White T-Shirt', category: 'Tops', color: 'white', times: 18 },
  { id: 3, name: 'Black Blazer', category: 'Jackets', color: 'black', times: 5 },
  { id: 4, name: 'Red Dress', category: 'Dresses', color: 'red', times: 3 }
];

export default function Dashboard() {
  const router = useRouter();
  const { user, loading, isAuthenticated } = useUser();
  const [items, setItems] = useState(WARDROBE_ITEMS);
  const [outfits, setOutfits] = useState([]);
  const [selectedTab, setSelectedTab] = useState('wardrobe');

  if (loading) return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  if (!isAuthenticated) { router.push('/login'); return null; }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white">
      {!user?.isPremium && <AdBanner placement="top" appId="ai-stylist" />}
      <div className="bg-gradient-to-r from-pink-600 to-pink-400 text-white px-4 py-6">
        <h1 className="text-3xl font-bold">Look Your Best, Any Budget</h1>
        <div className="flex gap-2 text-2xl font-bold mt-4"><Flame className="w-6 h-6" />{user?.gamification?.streak || 0} Day Streak</div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-400">
            <p className="text-sm text-gray-600">Items Catalogued</p>
            <h3 className="text-3xl font-bold text-blue-600">{items.length}</h3>
          </div>
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-400">
            <p className="text-sm text-gray-600">Outfits Created</p>
            <h3 className="text-3xl font-bold text-green-600">{outfits.length}</h3>
          </div>
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-purple-400">
            <p className="text-sm text-gray-600">Wardrobe Value</p>
            <h3 className="text-3xl font-bold text-purple-600">${items.length * 75}</h3>
          </div>
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-yellow-400">
            <p className="text-sm text-gray-600">Badges</p>
            <h3 className="text-3xl font-bold text-yellow-600">{user?.gamification?.badges?.length || 0}</h3>
          </div>
        </div>

        <div className="flex gap-2 mb-6 border-b border-gray-200">
          <button
            onClick={() => setSelectedTab('wardrobe')}
            className={`px-6 py-3 font-bold ${selectedTab === 'wardrobe' ? 'border-b-4 border-pink-600 text-pink-600' : 'text-gray-600'}`}
          >
            👔 Wardrobe
          </button>
          <button
            onClick={() => setSelectedTab('outfits')}
            className={`px-6 py-3 font-bold ${selectedTab === 'outfits' ? 'border-b-4 border-pink-600 text-pink-600' : 'text-gray-600'}`}
          >
            ✨ Outfits
          </button>
        </div>

        {selectedTab === 'wardrobe' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {items.map(item => (
                <div key={item.id} className="bg-white rounded-lg shadow p-4 border-2 border-gray-200">
                  <div className={`w-full h-32 rounded bg-${item.color}-100 flex items-center justify-center text-4xl mb-3`}>
                    👕
                  </div>
                  <p className="font-bold">{item.name}</p>
                  <p className="text-sm text-gray-600">{item.category}</p>
                  <p className="text-sm text-gray-500 mt-2">Worn {item.times} times</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {selectedTab === 'outfits' && (
          <div className="bg-white rounded-lg shadow p-8">
            <h2 className="text-2xl font-bold mb-4">AI-Generated Outfits</h2>
            {outfits.length === 0 ? (
              <div className="text-center p-8">
                <p className="text-gray-500">No outfits created yet. Click button to generate!</p>
                <button className="mt-4 bg-pink-600 text-white px-6 py-2 rounded font-bold">Generate Outfit</button>
              </div>
            ) : (
              <div className="space-y-4">{/* Outfit list */}</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
