import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
export default function Dashboard() {
  const router = useRouter();
  useEffect(() => {
    if (!localStorage.getItem('token')) router.push('/login');
  }, []);
  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow"><div className="max-w-6xl mx-auto px-4 py-4 flex justify-between"><h1 className="text-2xl font-bold text-green-600">🏪 NeighborCash</h1><button onClick={() => { localStorage.removeItem('token'); router.push('/'); }} className="px-4 py-2 bg-red-600 text-white rounded">Logout</button></div></nav>
      <div className="max-w-6xl mx-auto px-4 py-10 grid md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded shadow"><h2 className="font-bold mb-4">My Balance</h2><div className="text-3xl font-bold text-green-600">$0.00</div></div>
        <div className="bg-white p-6 rounded shadow"><h2 className="font-bold mb-4">Saved This Month</h2><div className="text-3xl font-bold text-blue-600">$0.00</div></div>
      </div>
    </div>
  );
}
