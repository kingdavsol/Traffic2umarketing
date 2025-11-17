import Link from 'next/link';
export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100">
      <nav className="bg-white shadow"><div className="max-w-6xl mx-auto px-4 py-4 flex justify-between"><h1 className="text-2xl font-bold text-purple-600">📚 EarnHub</h1><div><Link href="/login"><button className="text-gray-700">Login</button></Link> <Link href="/signup"><button className="px-4 py-2 bg-purple-600 text-white rounded">Sign Up</button></Link></div></div></nav>
      <section className="max-w-6xl mx-auto px-4 py-20 text-center">
        <h2 className="text-5xl font-bold mb-6">Earn Money as a Student</h2>
        <p className="text-xl text-gray-700 mb-8">Tutoring, note-taking, research, and more - flexible work for students</p>
        <Link href="/signup"><button className="px-8 py-3 bg-purple-600 text-white rounded">Get Started</button></Link>
      </section>
      <section className="max-w-6xl mx-auto px-4 grid md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded shadow text-center"><div className="text-4xl mb-4">📖</div><h3 className="font-bold">Flexible Gigs</h3><p className="text-gray-600">Tutoring, help with homework, research</p></div>
        <div className="bg-white p-6 rounded shadow text-center"><div className="text-4xl mb-4">💵</div><h3 className="font-bold">Quick Pay</h3><p className="text-gray-600">Get paid weekly via direct deposit</p></div>
        <div className="bg-white p-6 rounded shadow text-center"><div className="text-4xl mb-4">⏰</div><h3 className="font-bold">Flexible Hours</h3><p className="text-gray-600">Work around your school schedule</p></div>
      </section>
    </div>
  );
}
