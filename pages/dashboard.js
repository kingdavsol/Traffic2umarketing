import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

export default function Dashboard() {
  const [balance, setBalance] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    fetchBalance(token);
    fetchTransactions(token);
  }, []);

  const fetchBalance = async (token) => {
    try {
      const res = await fetch('/api/balance/get', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setBalance(await res.json());
      }
    } catch (err) {
      console.error('Error fetching balance:', err);
    }
  };

  const fetchTransactions = async (token) => {
    try {
      const res = await fetch('/api/transactions/list', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setTransactions(await res.json());
      }
    } catch (err) {
      console.error('Error fetching transactions:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navigation */}
      <nav className="bg-white shadow">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-blue-600">💊 MediSave</h1>
          <div className="space-x-4">
            <Link href="/providers">
              <button className="px-4 py-2 text-gray-700 hover:text-blue-600">Find Providers</button>
            </Link>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 py-10">
        {/* Balance Card */}
        {balance && (
          <div className="grid md:grid-cols-3 gap-6 mb-10">
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="text-gray-600 font-semibold">Available Balance</div>
              <div className="text-4xl font-bold text-green-600 mt-2">
                ${balance.available_balance?.toFixed(2)}
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="text-gray-600 font-semibold">Total Earned</div>
              <div className="text-4xl font-bold text-blue-600 mt-2">
                ${balance.total_earned?.toFixed(2)}
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="text-gray-600 font-semibold">Total Redeemed</div>
              <div className="text-4xl font-bold text-purple-600 mt-2">
                ${balance.total_redeemed?.toFixed(2)}
              </div>
            </div>
          </div>
        )}

        {/* Recent Transactions */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold mb-6">Recent Transactions</h2>
          {loading ? (
            <p className="text-gray-600">Loading transactions...</p>
          ) : transactions.length === 0 ? (
            <p className="text-gray-600">No transactions yet. Visit a provider to earn cashback!</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-gray-700 font-semibold">Date</th>
                    <th className="px-6 py-3 text-left text-gray-700 font-semibold">Provider</th>
                    <th className="px-6 py-3 text-left text-gray-700 font-semibold">Amount</th>
                    <th className="px-6 py-3 text-left text-gray-700 font-semibold">Cashback</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((t) => (
                    <tr key={t.id} className="border-b hover:bg-gray-50">
                      <td className="px-6 py-4">{new Date(t.created_at).toLocaleDateString()}</td>
                      <td className="px-6 py-4">{t.provider_name || 'Provider'}</td>
                      <td className="px-6 py-4">${t.amount?.toFixed(2)}</td>
                      <td className="px-6 py-4 text-green-600 font-semibold">
                        +${t.cashback_earned?.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
