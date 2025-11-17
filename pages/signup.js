import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

export default function Signup() {
  const [form, setForm] = useState({ name: '', email: '', password: '', type: 'contractor' });
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/auth/signup', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      const data = await res.json();
      if (!res.ok) { setError(data.error); return; }
      localStorage.setItem('token', data.token);
      router.push('/dashboard');
    } catch (err) {
      setError('Error during signup');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-100 flex items-center">
      <div className="w-full max-w-md mx-auto bg-white rounded shadow-lg p-8">
        <h1 className="text-3xl font-bold text-center mb-6 text-orange-600">Create Account</h1>
        {error && <div className="bg-red-100 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div><label className="block font-semibold mb-2">Name</label><input type="text" value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} required /></div>
          <div><label className="block font-semibold mb-2">Email</label><input type="email" value={form.email} onChange={(e) => setForm({...form, email: e.target.value})} required /></div>
          <div><label className="block font-semibold mb-2">Type</label><select value={form.type} onChange={(e) => setForm({...form, type: e.target.value})} className="w-full border rounded p-2"><option value="contractor">Contractor</option><option value="customer">Customer</option></select></div>
          <div><label className="block font-semibold mb-2">Password</label><input type="password" value={form.password} onChange={(e) => setForm({...form, password: e.target.value})} required /></div>
          <button type="submit" className="w-full bg-orange-600 text-white font-semibold py-2 rounded">Sign Up</button>
        </form>
        <p className="text-center text-gray-600 mt-4">Already have an account? <Link href="/login"><span className="text-orange-600 font-semibold cursor-pointer">Login</span></Link></p>
      </div>
    </div>
  );
}
