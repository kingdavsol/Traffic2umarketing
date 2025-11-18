import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { useAuth } from '@/store/auth';
import { vehiclesAPI } from '@/lib/api';
import Link from 'next/link';

interface Vehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  mileage: number;
  trim?: string;
}

export default function Dashboard() {
  const router = useRouter();
  const { user, token } = useAuth();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) {
      router.push('/login');
      return;
    }

    const fetchVehicles = async () => {
      try {
        const response = await vehiclesAPI.getAll();
        setVehicles(response.data.data);
      } catch (err: any) {
        setError(err.response?.data?.error || 'Failed to load vehicles');
      } finally {
        setIsLoading(false);
      }
    };

    fetchVehicles();
  }, [token, router]);

  const handleLogout = () => {
    const auth = useAuth.getState();
    auth.logout();
    router.push('/');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin text-4xl mb-4">🚗</div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Dashboard - Car Maintenance Hub</title>
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-2xl">🚗</span>
              <span className="text-xl font-bold text-gray-900">Car Hub</span>
            </div>
            <div className="flex items-center space-x-6">
              <span className="text-sm text-gray-600">{user?.name}</span>
              <button
                onClick={handleLogout}
                className="text-gray-600 hover:text-gray-900 text-sm font-medium"
              >
                Logout
              </button>
            </div>
          </div>
        </header>

        {/* Navigation */}
        <nav className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex space-x-8">
              <Link href="/dashboard" className="border-b-2 border-blue-600 text-blue-600 py-4 px-1 text-sm font-medium">
                Dashboard
              </Link>
              <Link href="/vehicles" className="border-b-2 border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300 py-4 px-1 text-sm font-medium">
                My Vehicles
              </Link>
              <Link href="/maintenance" className="border-b-2 border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300 py-4 px-1 text-sm font-medium">
                Maintenance
              </Link>
              <Link href="/deals" className="border-b-2 border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300 py-4 px-1 text-sm font-medium">
                Deals
              </Link>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded">
              {error}
            </div>
          )}

          {/* Welcome Section */}
          <div className="mb-12">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome back, {user?.name}!</h1>
            <p className="text-gray-600">Manage your vehicles and track maintenance all in one place</p>
          </div>

          {/* Vehicles Section */}
          <div className="mb-12">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">My Vehicles</h2>
              <Link
                href="/vehicles/add"
                className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
              >
                + Add Vehicle
              </Link>
            </div>

            {vehicles.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-8 text-center">
                <div className="text-5xl mb-4">🚗</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No vehicles yet</h3>
                <p className="text-gray-600 mb-6">Add your first vehicle to get started with tracking maintenance and finding great deals</p>
                <Link
                  href="/vehicles/add"
                  className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                >
                  Add Your First Vehicle
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {vehicles.map((vehicle) => (
                  <Link
                    key={vehicle.id}
                    href={`/vehicle/${vehicle.id}`}
                    className="block bg-white rounded-lg shadow hover:shadow-lg transition p-6"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {vehicle.year} {vehicle.make} {vehicle.model}
                        </h3>
                        {vehicle.trim && <p className="text-sm text-gray-600">{vehicle.trim}</p>}
                      </div>
                      <span className="text-2xl">🚗</span>
                    </div>
                    <div className="space-y-2 text-sm text-gray-600">
                      <p>📍 {vehicle.mileage.toLocaleString()} miles</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Link
                href="/deals"
                className="p-6 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition text-center"
              >
                <div className="text-3xl mb-2">💰</div>
                <h3 className="font-semibold text-gray-900">Find Deals</h3>
                <p className="text-sm text-gray-600 mt-1">Shop for parts and maintenance</p>
              </Link>
              <Link
                href="/maintenance"
                className="p-6 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition text-center"
              >
                <div className="text-3xl mb-2">🔧</div>
                <h3 className="font-semibold text-gray-900">Maintenance</h3>
                <p className="text-sm text-gray-600 mt-1">Track and schedule maintenance</p>
              </Link>
              <Link
                href="/problems"
                className="p-6 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition text-center"
              >
                <div className="text-3xl mb-2">⚠️</div>
                <h3 className="font-semibold text-gray-900">Common Problems</h3>
                <p className="text-sm text-gray-600 mt-1">Learn what might go wrong</p>
              </Link>
              <Link
                href="/valuation"
                className="p-6 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition text-center"
              >
                <div className="text-3xl mb-2">💎</div>
                <h3 className="font-semibold text-gray-900">Car Value</h3>
                <p className="text-sm text-gray-600 mt-1">Check your vehicle's worth</p>
              </Link>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
