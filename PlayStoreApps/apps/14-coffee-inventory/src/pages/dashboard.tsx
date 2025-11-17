'use client';
import { useRouter } from 'next/router';
import { useUser } from '@/shared/hooks/useUser';
import { AdBanner } from '@/shared/components/ads/AdBanner';
import { Flame } from 'lucide-react';
import { useState } from 'react';

const RECIPES = [
  { id: 1, name: 'Espresso', cost: 0.45, price: 2.50, margin: '82%' },
  { id: 2, name: 'Americano', cost: 0.60, price: 3.00, margin: '80%' },
  { id: 3, name: 'Cappuccino', cost: 1.20, price: 4.50, margin: '73%' },
  { id: 4, name: 'Latte', cost: 1.35, price: 4.95, margin: '73%' }
];

export default function Dashboard() {
  const router = useRouter();
  const { user, loading, isAuthenticated } = useUser();
  const [inventoryValue] = useState(2450);
  const [wasteValue] = useState(145);
  const [dailyRevenue] = useState(650);

  if (loading) return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  if (!isAuthenticated) { router.push('/login'); return null; }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white">
      {!user?.isPremium && <AdBanner placement="top" appId="coffee-inventory" />}
      <div className="bg-gradient-to-r from-amber-600 to-amber-400 text-white px-4 py-6">
        <h1 className="text-3xl font-bold">Brew Success, Maximize Profits</h1>
        <div className="flex gap-2 text-2xl font-bold mt-4"><Flame className="w-6 h-6" />{user?.gamification?.streak || 0} Day Streak</div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-400">
            <p className="text-sm text-gray-600">Inventory Value</p>
            <h3 className="text-3xl font-bold text-blue-600">${inventoryValue}</h3>
          </div>
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-400">
            <p className="text-sm text-gray-600">Daily Revenue</p>
            <h3 className="text-3xl font-bold text-green-600">${dailyRevenue}</h3>
          </div>
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-purple-400">
            <p className="text-sm text-gray-600">Avg. Margin</p>
            <h3 className="text-3xl font-bold text-purple-600">76%</h3>
          </div>
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-red-400">
            <p className="text-sm text-gray-600">Waste (Weekly)</p>
            <h3 className="text-3xl font-bold text-red-600">${wasteValue}</h3>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-8">
          <h2 className="text-2xl font-bold mb-6">Recipe Costing</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="text-left p-3">Recipe</th>
                  <th className="text-left p-3">Cost</th>
                  <th className="text-left p-3">Price</th>
                  <th className="text-left p-3">Margin</th>
                </tr>
              </thead>
              <tbody>
                {RECIPES.map(recipe => (
                  <tr key={recipe.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="p-3 font-bold">{recipe.name}</td>
                    <td className="p-3">${recipe.cost}</td>
                    <td className="p-3">${recipe.price}</td>
                    <td className="p-3 font-bold text-green-600">{recipe.margin}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
