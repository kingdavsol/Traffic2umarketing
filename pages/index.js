import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-100">
      <nav className="bg-white shadow">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between">
          <h1 className="text-2xl font-bold text-orange-600">🔧 SkillTrade</h1>
          <div className="space-x-4">
            <Link href="/login"><button className="px-4 py-2 text-gray-700">Login</button></Link>
            <Link href="/signup"><button className="px-4 py-2 bg-orange-600 text-white rounded">Sign Up</button></Link>
          </div>
        </div>
      </nav>

      <section className="max-w-6xl mx-auto px-4 py-20 text-center">
        <h2 className="text-5xl font-bold text-gray-900 mb-6">Connect Trades with Opportunities</h2>
        <p className="text-xl text-gray-700 mb-8">For plumbers, electricians, HVAC pros, and homeowners seeking quality work</p>
        <div className="space-x-4">
          <Link href="/signup"><button className="px-8 py-3 bg-orange-600 text-white text-lg rounded">Get Started</button></Link>
          <Link href="/jobs"><button className="px-8 py-3 bg-white text-orange-600 text-lg rounded border-2 border-orange-600">Browse Jobs</button></Link>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 py-16">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white p-8 rounded shadow text-center">
            <div className="text-4xl mb-4">🤝</div>
            <h3 className="text-xl font-bold mb-2">Find Work</h3>
            <p className="text-gray-600">Browse thousands of local jobs</p>
          </div>
          <div className="bg-white p-8 rounded shadow text-center">
            <div className="text-4xl mb-4">💰</div>
            <h3 className="text-xl font-bold mb-2">Earn More</h3>
            <p className="text-gray-600">Keep 85% of every job you complete</p>
          </div>
          <div className="bg-white p-8 rounded shadow text-center">
            <div className="text-4xl mb-4">⭐</div>
            <h3 className="text-xl font-bold mb-2">Build Reputation</h3>
            <p className="text-gray-600">Earn ratings and grow your business</p>
          </div>
        </div>
      </section>
    </div>
  );
}
