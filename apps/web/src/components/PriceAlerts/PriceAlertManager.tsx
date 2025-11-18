import React, { useState, useEffect } from 'react';
import { BellIcon, TrashIcon, PlusIcon } from '@heroicons/react/24/outline';

interface PriceAlert {
  id: string;
  part: {
    name: string;
    id: string;
  };
  targetPrice: number;
  currentPrice: number;
  savings: number;
  notifiedAt: string | null;
  emailAlert: boolean;
  smsAlert: boolean;
  createdAt: string;
}

export const PriceAlertManager: React.FC = () => {
  const [alerts, setAlerts] = useState<PriceAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    partId: '',
    targetPrice: '',
    emailAlert: true,
    smsAlert: false,
  });

  useEffect(() => {
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    try {
      const response = await fetch('/api/price-alerts', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) throw new Error('Failed to fetch alerts');

      const data = await response.json();
      setAlerts(data);
    } catch (error) {
      console.error('Error fetching alerts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAlert = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch('/api/price-alerts/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          partId: formData.partId,
          targetPrice: Math.floor(parseFloat(formData.targetPrice) * 100),
          emailAlert: formData.emailAlert,
          smsAlert: formData.smsAlert,
        }),
      });

      if (!response.ok) throw new Error('Failed to create alert');

      setFormData({ partId: '', targetPrice: '', emailAlert: true, smsAlert: false });
      setShowForm(false);
      fetchAlerts();
    } catch (error) {
      console.error('Error creating alert:', error);
    }
  };

  const handleDeleteAlert = async (alertId: string) => {
    if (!window.confirm('Are you sure you want to delete this alert?')) return;

    try {
      const response = await fetch(`/api/price-alerts/${alertId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) throw new Error('Failed to delete alert');

      setAlerts(alerts.filter(a => a.id !== alertId));
    } catch (error) {
      console.error('Error deleting alert:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-gray-900 flex items-center">
          <BellIcon className="w-8 h-8 mr-2 text-blue-500" />
          Price Alerts
        </h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-600 transition-colors flex items-center"
        >
          <PlusIcon className="w-5 h-5 mr-2" />
          New Alert
        </button>
      </div>

      {/* Create Alert Form */}
      {showForm && (
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            Create Price Alert
          </h3>
          <form onSubmit={handleCreateAlert} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Part Name
              </label>
              <input
                type="text"
                value={formData.partId}
                onChange={(e) => setFormData({ ...formData, partId: e.target.value })}
                placeholder="e.g., Oil Filter, Air Filter"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Target Price
              </label>
              <div className="relative">
                <span className="absolute left-4 top-2 text-gray-500">$</span>
                <input
                  type="number"
                  step="0.01"
                  value={formData.targetPrice}
                  onChange={(e) => setFormData({ ...formData, targetPrice: e.target.value })}
                  placeholder="0.00"
                  className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
            </div>

            <div className="space-y-3">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.emailAlert}
                  onChange={(e) => setFormData({ ...formData, emailAlert: e.target.checked })}
                  className="w-4 h-4 text-blue-500 rounded"
                />
                <span className="ml-3 text-gray-700">Notify via email</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.smsAlert}
                  onChange={(e) => setFormData({ ...formData, smsAlert: e.target.checked })}
                  className="w-4 h-4 text-blue-500 rounded"
                />
                <span className="ml-3 text-gray-700">Notify via SMS</span>
              </label>
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                className="flex-1 bg-blue-500 text-white py-2 rounded-lg font-semibold hover:bg-blue-600 transition-colors"
              >
                Create Alert
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="flex-1 bg-gray-200 text-gray-900 py-2 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Alerts List */}
      {alerts.length === 0 ? (
        <div className="bg-white p-12 rounded-lg border border-gray-200 text-center">
          <BellIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600">No price alerts yet</p>
          <p className="text-gray-500 text-sm mt-1">
            Create an alert to get notified when prices drop
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className="bg-white p-6 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {alert.part.name}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Created: {new Date(alert.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <button
                  onClick={() => handleDeleteAlert(alert.id)}
                  className="text-red-500 hover:text-red-700 transition-colors"
                >
                  <TrashIcon className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="bg-blue-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-600 uppercase font-semibold mb-1">
                    Target Price
                  </p>
                  <p className="text-2xl font-bold text-blue-600">
                    ${(alert.targetPrice / 100).toFixed(2)}
                  </p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-600 uppercase font-semibold mb-1">
                    Current Price
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    ${(alert.currentPrice / 100).toFixed(2)}
                  </p>
                </div>
                <div className="bg-green-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-600 uppercase font-semibold mb-1">
                    Your Savings
                  </p>
                  <p className="text-2xl font-bold text-green-600">
                    ${(alert.savings / 100).toFixed(2)}
                  </p>
                </div>
              </div>

              <div className="flex gap-2 text-sm">
                {alert.emailAlert && (
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                    Email Alert
                  </span>
                )}
                {alert.smsAlert && (
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded">
                    SMS Alert
                  </span>
                )}
                {alert.notifiedAt && (
                  <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                    Notified: {new Date(alert.notifiedAt).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PriceAlertManager;
