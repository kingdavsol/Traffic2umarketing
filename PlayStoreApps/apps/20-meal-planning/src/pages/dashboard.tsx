'use client';
import { useRouter } from 'next/router';
import { useUser } from '@/shared/hooks/useUser';
import { AdBanner } from '@/shared/components/ads/AdBanner';
import { Flame, ShoppingCart } from 'lucide-react';
import { useState } from 'react';

const DIETS = ['Vegetarian', 'Vegan', 'Keto', 'Paleo', 'Mediterranean'];
const RECIPES = [
  { id: 1, name: 'Grilled Salmon', time: '30 min', servings: 4, diet: 'Paleo' },
  { id: 2, name: 'Buddha Bowl', time: '20 min', servings: 2, diet: 'Vegan' },
  { id: 3, name: 'Keto Pasta', time: '25 min', servings: 3, diet: 'Keto' }
];

export default function Dashboard() {
  const router = useRouter();
  const { user, loading, isAuthenticated } = useUser();
  const [selectedDiet, setSelectedDiet] = useState('Paleo');
  const [mealsPlan] = useState(7);
  const [groceryItems] = useState(34);
  const [savedRecipes] = useState(15);

  if (loading) return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  if (!isAuthenticated) { router.push('/login'); return null; }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white">
      {!user?.isPremium && <AdBanner placement="top" appId="meal-planning" />}
      <div className="bg-gradient-to-r from-lime-600 to-lime-400 text-white px-4 py-6">
        <h1 className="text-3xl font-bold">Plan Meals, Save Time</h1>
        <div className="flex gap-2 text-2xl font-bold mt-4"><Flame className="w-6 h-6" />{user?.gamification?.streak || 0} Day Streak</div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-400">
            <p className="text-sm text-gray-600">Meals Planned</p>
            <h3 className="text-3xl font-bold text-blue-600">{mealsPlan}</h3>
            <p className="text-xs text-gray-500 mt-1">This week</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-400">
            <p className="text-sm text-gray-600">Recipes Saved</p>
            <h3 className="text-3xl font-bold text-green-600">{savedRecipes}</h3>
          </div>
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-purple-400">
            <p className="text-sm text-gray-600">Grocery Items</p>
            <h3 className="text-3xl font-bold text-purple-600">{groceryItems}</h3>
          </div>
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-yellow-400">
            <p className="text-sm text-gray-600">Badges</p>
            <h3 className="text-3xl font-bold text-yellow-600">{user?.gamification?.badges?.length || 0}</h3>
          </div>
        </div>

        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-3">Select Diet Plan</h2>
          <div className="flex flex-wrap gap-2">
            {DIETS.map(diet => (
              <button
                key={diet}
                onClick={() => setSelectedDiet(diet)}
                className={`px-4 py-2 rounded font-bold ${selectedDiet === diet ? 'bg-lime-600 text-white' : 'bg-white text-gray-800 border-2 border-gray-200'}`}
              >
                {diet}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Recipes for {selectedDiet}</h2>
          {RECIPES.filter(r => r.diet === selectedDiet).map(recipe => (
            <div key={recipe.id} className="bg-white rounded-lg shadow p-6 border-2 border-gray-200">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-lg">{recipe.name}</h3>
                  <div className="flex gap-4 mt-2 text-sm text-gray-600">
                    <span>⏱️ {recipe.time}</span>
                    <span>🍽️ {recipe.servings} servings</span>
                  </div>
                </div>
                <button className="bg-lime-600 text-white px-6 py-2 rounded font-bold hover:bg-lime-700 flex items-center gap-2">
                  <ShoppingCart className="w-4 h-4" /> Add to List
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
