import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      const data = await res.json();
      if (!res.ok) { setError(data.error); return; }
      localStorage.setItem('token', data.token);
      router.push('/dashboard');
    } catch (err) {
      setError('Error during login');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-100 flex items-center">
      <div className="w-full max-w-md mx-auto bg-white rounded shadow-lg p-8">
        <h1 className="text-3xl font-bold text-center mb-6 text-orange-600">Login</h1>
        {error && <div className="bg-red-100 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div><label className="block font-semibold mb-2">Email</label><input type="email" value={form.email} onChange={(e) => setForm({...form, email: e.target.value})} required /></div>
          <div><label className="block font-semibold mb-2">Password</label><input type="password" value={form.password} onChange={(e) => setForm({...form, password: e.target.value})} required /></div>
          <button type="submit" className="w-full bg-orange-600 text-white font-semibold py-2 rounded">Login</button>
        </form>
        <p className="text-center text-gray-600 mt-4">No account? <Link href="/signup"><span className="text-orange-600 font-semibold cursor-pointer">Sign Up</span></Link></p>
      </div>
    </div>
  );
}
