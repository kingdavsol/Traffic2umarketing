'use client';
import { useRouter } from 'next/router';
import { useUser } from '@/shared/hooks/useUser';
import { AdBanner } from '@/shared/components/ads/AdBanner';
import { Flame, MapPin, Star } from 'lucide-react';
import { useState } from 'react';

const AVAILABLE_LISTINGS = [
  {
    id: 1,
    seller: 'Fresh Bakery Co',
    items: 'Day-old Pastries (12 items)',
    quantity: 12,
    price: '$3.50',
    discount: '60% off',
    originalPrice: '$8.99',
    location: '2.3 km away',
    expiresIn: '6 hours',
    rating: 4.8,
    reviews: 47,
    co2Saved: 2.4,
    image: '🥐'
  },
  {
    id: 2,
    seller: 'Local Grocery Mart',
    items: 'Fresh Vegetables Bundle',
    quantity: 8,
    price: '$4.99',
    discount: '50% off',
    originalPrice: '$9.99',
    location: '1.8 km away',
    expiresIn: '4 hours',
    rating: 4.5,
    reviews: 32,
    co2Saved: 1.8,
    image: '🥗'
  },
  {
    id: 3,
    seller: 'Downtown Cafe',
    items: 'Prepared Meals (5 servings)',
    quantity: 5,
    price: '$6.99',
    discount: '55% off',
    originalPrice: '$15.99',
    location: '0.9 km away',
    expiresIn: '3 hours',
    rating: 4.9,
    reviews: 89,
    co2Saved: 3.2,
    image: '🍜'
  }
];

const CO2_PER_ITEM = 2.5; // kg

export default function Dashboard() {
  const router = useRouter();
  const { user, loading, isAuthenticated } = useUser();
  const [userRole, setUserRole] = useState('buyer'); // buyer or seller
  const [activeTab, setActiveTab] = useState('matches'); // matches, history, stats
  const [listingItems, setListingItems] = useState([]);
  const [matchedItems, setMatchedItems] = useState([]);
  const [newListing, setNewListing] = useState({ items: '', quantity: '', price: '' });
  const [showListingForm, setShowListingForm] = useState(false);

  const totalCo2Saved = matchedItems.length * CO2_PER_ITEM;
  const moneySaved = matchedItems.length * 6; // avg saving

  const handleCreateListing = () => {
    if (newListing.items && newListing.quantity && newListing.price) {
      setListingItems([...listingItems, {id: Date.now(), ...newListing}]);
      setNewListing({ items: '', quantity: '', price: '' });
      setShowListingForm(false);
    }
  };

  const handleMatch = (listing) => {
    if (!matchedItems.find(m => m.id === listing.id)) {
      setMatchedItems([...matchedItems, listing]);
    }
  };

  if (loading) return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  if (!isAuthenticated) { router.push('/login'); return null; }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white">
      {!user?.isPremium && <AdBanner placement="top" appId="food-waste" />}
      <div className="bg-gradient-to-r from-amber-600 to-amber-400 text-white px-4 py-6">
        <h1 className="text-3xl font-bold">Save Food, Save Money, Save Planet</h1>
        <div className="flex gap-2 text-2xl font-bold mt-4"><Flame className="w-6 h-6" />{user?.gamification?.streak || 0} Day Streak</div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Role Selector */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setUserRole('buyer')}
            className={`px-6 py-3 rounded font-bold ${userRole === 'buyer' ? 'bg-amber-600 text-white' : 'bg-white text-gray-800 border-2 border-gray-200'}`}
          >
            🛒 Buyer Mode
          </button>
          <button
            onClick={() => setUserRole('seller')}
            className={`px-6 py-3 rounded font-bold ${userRole === 'seller' ? 'bg-amber-600 text-white' : 'bg-white text-gray-800 border-2 border-gray-200'}`}
          >
            🏪 Seller Mode
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-400">
            <p className="text-sm text-gray-600">Items Matched</p>
            <h3 className="text-3xl font-bold text-blue-600">{matchedItems.length}</h3>
            <p className="text-xs text-gray-500 mt-1">Total transactions</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-400">
            <p className="text-sm text-gray-600">CO₂ Saved</p>
            <h3 className="text-3xl font-bold text-green-600">{totalCo2Saved.toFixed(1)}kg</h3>
            <p className="text-xs text-gray-500 mt-1">Environment impact</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-purple-400">
            <p className="text-sm text-gray-600">Money Saved</p>
            <h3 className="text-3xl font-bold text-purple-600">${moneySaved}</h3>
            <p className="text-xs text-gray-500 mt-1">Average savings</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-yellow-400">
            <p className="text-sm text-gray-600">Badges</p>
            <h3 className="text-3xl font-bold text-yellow-600">{user?.gamification?.badges?.length || 0}</h3>
            <p className="text-xs text-gray-500 mt-1">Achievements</p>
          </div>
        </div>

        {userRole === 'buyer' && (
          <div className="space-y-6">
            <div className="flex gap-2 mb-6 border-b border-gray-200">
              <button
                onClick={() => setActiveTab('matches')}
                className={`px-6 py-3 font-bold ${activeTab === 'matches' ? 'border-b-4 border-amber-600 text-amber-600' : 'text-gray-600'}`}
              >
                Find Food
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className={`px-6 py-3 font-bold ${activeTab === 'history' ? 'border-b-4 border-amber-600 text-amber-600' : 'text-gray-600'}`}
              >
                My Purchases
              </button>
              <button
                onClick={() => setActiveTab('stats')}
                className={`px-6 py-3 font-bold ${activeTab === 'stats' ? 'border-b-4 border-amber-600 text-amber-600' : 'text-gray-600'}`}
              >
                Impact Stats
              </button>
            </div>

            {activeTab === 'matches' && (
              <div className="space-y-4">
                <div className="bg-amber-50 p-6 rounded-lg border-l-4 border-amber-400">
                  <h3 className="font-bold mb-2">🎯 Perfect Matches Near You</h3>
                  <p className="text-sm text-gray-700">Browse available food deals from local sellers. All items must be picked up within the expiration time.</p>
                </div>

                {AVAILABLE_LISTINGS.map((listing) => (
                  <div key={listing.id} className="bg-white rounded-lg shadow p-6 border-2 border-gray-200 hover:border-amber-400">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <div className="flex items-start gap-3">
                          <span className="text-4xl">{listing.image}</span>
                          <div>
                            <h3 className="font-bold text-lg">{listing.items}</h3>
                            <p className="text-sm text-gray-600">{listing.seller}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <div className="flex">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`w-4 h-4 ${i < Math.floor(listing.rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                                  />
                                ))}
                              </div>
                              <span className="text-sm text-gray-600">{listing.rating} ({listing.reviews})</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-2 justify-end mb-2">
                          <MapPin className="w-4 h-4 text-gray-500" />
                          <span className="text-sm text-gray-600">{listing.location}</span>
                        </div>
                        <p className="text-xs text-gray-500">Expires in {listing.expiresIn}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Price</p>
                        <div className="flex items-baseline gap-2">
                          <span className="text-2xl font-bold text-green-600">{listing.price}</span>
                          <span className="text-sm line-through text-gray-400">{listing.originalPrice}</span>
                        </div>
                        <span className="text-xs font-bold text-green-600">{listing.discount}</span>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Environmental Impact</p>
                        <p className="text-xl font-bold text-green-600">🌱 {listing.co2Saved}kg CO₂</p>
                        <p className="text-xs text-gray-500">Saved from landfill</p>
                      </div>
                    </div>

                    <button
                      onClick={() => handleMatch(listing)}
                      className={`w-full py-3 rounded font-bold ${matchedItems.find(m => m.id === listing.id) ? 'bg-green-600 text-white' : 'bg-amber-600 text-white hover:bg-amber-700'}`}
                    >
                      {matchedItems.find(m => m.id === listing.id) ? '✅ Added to Cart' : 'Get This Deal'}
                    </button>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'history' && (
              <div className="bg-white rounded-lg shadow p-8">
                <h2 className="text-2xl font-bold mb-6">Purchase History</h2>
                {matchedItems.length === 0 ? (
                  <div className="text-center p-8">
                    <p className="text-gray-500 text-lg">No purchases yet. Start matching with food deals!</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {matchedItems.map((item) => (
                      <div key={item.id} className="p-4 border-2 border-gray-200 rounded flex justify-between items-center">
                        <div>
                          <p className="font-bold">{item.items}</p>
                          <p className="text-sm text-gray-600">From {item.seller}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-green-600">{item.price}</p>
                          <p className="text-xs text-gray-500">CO₂ saved: {item.co2Saved}kg</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'stats' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="font-bold mb-4">🌍 Environmental Impact</h3>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Total CO₂ Saved</p>
                        <p className="text-3xl font-bold text-green-600">{totalCo2Saved.toFixed(1)}kg</p>
                      </div>
                      <div className="p-3 bg-green-50 rounded border-l-4 border-green-400">
                        <p className="text-xs text-gray-700">This is equivalent to a {totalCo2Saved * 7}km car drive</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="font-bold mb-4">💰 Money Saved</h3>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Total Savings</p>
                        <p className="text-3xl font-bold text-purple-600">${moneySaved}</p>
                      </div>
                      <div className="p-3 bg-purple-50 rounded border-l-4 border-purple-400">
                        <p className="text-xs text-gray-700">Average savings per item: $6.00</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="font-bold mb-4">📊 Achievements</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                      <span>🏆 Eco Warrior (5 saves)</span>
                      <span className={`text-sm font-bold ${matchedItems.length >= 5 ? 'text-green-600' : 'text-gray-400'}`}>
                        {matchedItems.length >= 5 ? '✅ Unlocked' : `${5 - matchedItems.length} left`}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                      <span>💚 Green Guardian (10 saves)</span>
                      <span className={`text-sm font-bold ${matchedItems.length >= 10 ? 'text-green-600' : 'text-gray-400'}`}>
                        {matchedItems.length >= 10 ? '✅ Unlocked' : `${Math.max(0, 10 - matchedItems.length)} left`}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {userRole === 'seller' && (
          <div className="space-y-6">
            <div className="bg-amber-50 p-6 rounded-lg border-l-4 border-amber-400">
              <h3 className="font-bold mb-2">🏪 Sell Excess Food</h3>
              <p className="text-sm text-gray-700">List your surplus food and reach buyers in your area. Help reduce food waste while earning money.</p>
            </div>

            {!showListingForm ? (
              <button
                onClick={() => setShowListingForm(true)}
                className="w-full bg-amber-600 text-white px-6 py-3 rounded font-bold text-lg hover:bg-amber-700"
              >
                + Create New Listing
              </button>
            ) : (
              <div className="bg-white rounded-lg shadow p-6 border-2 border-amber-400">
                <h3 className="font-bold mb-4">Create New Listing</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold mb-2">What are you selling?</label>
                    <input
                      type="text"
                      value={newListing.items}
                      onChange={(e) => setNewListing({...newListing, items: e.target.value})}
                      placeholder="e.g., Fresh Vegetables, Day-old Bread"
                      className="w-full border-2 border-gray-200 rounded px-3 py-2"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold mb-2">Quantity</label>
                      <input
                        type="number"
                        value={newListing.quantity}
                        onChange={(e) => setNewListing({...newListing, quantity: e.target.value})}
                        placeholder="e.g., 10"
                        className="w-full border-2 border-gray-200 rounded px-3 py-2"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold mb-2">Your Price ($)</label>
                      <input
                        type="text"
                        value={newListing.price}
                        onChange={(e) => setNewListing({...newListing, price: e.target.value})}
                        placeholder="e.g., 3.50"
                        className="w-full border-2 border-gray-200 rounded px-3 py-2"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handleCreateListing}
                      className="flex-1 bg-green-600 text-white px-4 py-2 rounded font-bold hover:bg-green-700"
                    >
                      Post Listing
                    </button>
                    <button
                      onClick={() => setShowListingForm(false)}
                      className="flex-1 bg-gray-300 text-gray-800 px-4 py-2 rounded font-bold"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="font-bold text-lg mb-4">My Listings ({listingItems.length})</h3>
              {listingItems.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No listings yet. Create one to start selling!</p>
              ) : (
                <div className="space-y-3">
                  {listingItems.map((item) => (
                    <div key={item.id} className="p-4 border-2 border-gray-200 rounded">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-bold">{item.items}</p>
                          <p className="text-sm text-gray-600">Qty: {item.quantity} | Price: ${item.price}</p>
                        </div>
                        <span className="px-3 py-1 bg-green-100 text-green-800 rounded text-sm font-bold">Active</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
