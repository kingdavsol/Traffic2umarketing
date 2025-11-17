import Link from 'next/link';
export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
      <nav className="bg-white shadow"><div className="max-w-6xl mx-auto px-4 py-4 flex justify-between"><h1 className="text-2xl font-bold text-green-600">🏪 NeighborCash</h1><div className="space-x-4"><Link href="/login"><button className="text-gray-700">Login</button></Link><Link href="/signup"><button className="px-4 py-2 bg-green-600 text-white rounded">Sign Up</button></Link></div></div></nav>
      <section className="max-w-6xl mx-auto px-4 py-20 text-center">
        <h2 className="text-5xl font-bold text-gray-900 mb-6">Support Local Businesses</h2>
        <p className="text-xl text-gray-700 mb-8">Shop local and earn cashback while supporting your community</p>
        <Link href="/signup"><button className="px-8 py-3 bg-green-600 text-white text-lg rounded">Get Started</button></Link>
      </section>
      <section className="max-w-6xl mx-auto px-4 py-16 grid md:grid-cols-3 gap-8">
        <div className="bg-white p-8 rounded shadow text-center">
          <div className="text-4xl mb-4">🏬</div><h3 className="text-xl font-bold mb-2">Local Merchants</h3><p className="text-gray-600">Browse nearby small businesses</p>
        </div>
        <div className="bg-white p-8 rounded shadow text-center">
          <div className="text-4xl mb-4">💰</div><h3 className="text-xl font-bold mb-2">Earn Cashback</h3><p className="text-gray-600">Support your community & save</p>
        </div>
        <div className="bg-white p-8 rounded shadow text-center">
          <div className="text-4xl mb-4">🤝</div><h3 className="text-xl font-bold mb-2">Community Impact</h3><p className="text-gray-600">Real local economic benefit</p>
        </div>
      </section>
    </div>
  );
}
