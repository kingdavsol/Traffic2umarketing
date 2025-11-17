import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

export default function Dashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) router.push('/login');
    else setLoading(false);
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow"><div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center"><Link href="/"><h1 className="text-2xl font-bold text-orange-600">🔧 SkillTrade</h1></Link><button onClick={() => { localStorage.removeItem('token'); router.push('/'); }} className="px-4 py-2 bg-red-600 text-white rounded">Logout</button></div></nav>
      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="grid md:grid-cols-3 gap-6 mb-10">
          <div className="bg-white p-6 rounded shadow"><div className="text-gray-600 font-semibold">Total Earned</div><div className="text-4xl font-bold text-green-600 mt-2">$0.00</div></div>
          <div className="bg-white p-6 rounded shadow"><div className="text-gray-600 font-semibold">Jobs Completed</div><div className="text-4xl font-bold text-blue-600 mt-2">0</div></div>
          <div className="bg-white p-6 rounded shadow"><div className="text-gray-600 font-semibold">Rating</div><div className="text-4xl font-bold text-yellow-600 mt-2">5.0</div></div>
        </div>
        <div className="bg-white rounded shadow p-6"><h2 className="text-2xl font-bold mb-4">Recent Jobs</h2><p className="text-gray-600">No jobs yet. <Link href="/jobs"><span className="text-orange-600 font-semibold cursor-pointer">Browse available jobs</span></Link></p></div>
      </div>
    </div>
  );
}
