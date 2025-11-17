import React, { useState, useEffect } from 'react';
import Link from 'next/link';

export default function Providers() {
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchProviders();
  }, []);

  const fetchProviders = async () => {
    try {
      const res = await fetch('/api/providers/list');
      if (res.ok) {
        const data = await res.json();
        setProviders(data.providers || []);
      }
    } catch (err) {
      console.error('Error fetching providers:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredProviders = providers.filter((p) =>
    p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.type?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navigation */}
      <nav className="bg-white shadow">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/">
            <h1 className="text-2xl font-bold text-blue-600 cursor-pointer">💊 MediSave</h1>
          </Link>
          <div className="space-x-4">
            <Link href="/login">
              <button className="px-4 py-2 text-gray-700 hover:text-blue-600">Login</button>
            </Link>
            <Link href="/signup">
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                Sign Up
              </button>
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 py-10">
        <h1 className="text-3xl font-bold mb-8">Find Healthcare Providers</h1>

        {/* Search */}
        <div className="mb-8">
          <input
            type="text"
            placeholder="Search providers by name or type..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600"
          />
        </div>

        {/* Providers Grid */}
        {loading ? (
          <p className="text-gray-600">Loading providers...</p>
        ) : filteredProviders.length === 0 ? (
          <p className="text-gray-600">No providers found matching your search.</p>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProviders.map((provider) => (
              <div key={provider.id} className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition">
                <h3 className="text-lg font-bold text-gray-900">{provider.name}</h3>
                <p className="text-gray-600 text-sm mt-2">
                  <span className="inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded">
                    {provider.type}
                  </span>
                </p>
                {provider.address && (
                  <p className="text-gray-600 text-sm mt-2">📍 {provider.address}</p>
                )}
                <div className="mt-4 pt-4 border-t">
                  <div className="text-2xl font-bold text-green-600">
                    {provider.cashback_percent}%
                  </div>
                  <p className="text-gray-600 text-sm">Cashback</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
