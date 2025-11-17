import { useState } from 'react';
import { useRouter } from 'next/router';
export default function Signup() {
  const [form, setForm] = useState({name: '', email: '', password: ''});
  const router = useRouter();
  const handle = async (e) => {
    e.preventDefault();
    const r = await fetch('/api/auth/signup', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(form) });
    if (r.ok) { localStorage.setItem('token', (await r.json()).token); router.push('/dashboard'); }
  };
  return (
    <div className="min-h-screen bg-green-50 flex items-center">
      <div className="w-full max-w-md mx-auto bg-white rounded shadow-lg p-8">
        <h1 className="text-3xl font-bold text-center mb-6 text-green-600">Create Account</h1>
        <form onSubmit={handle} className="space-y-4">
          <div><label className="block font-semibold mb-2">Name</label><input type="text" value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} required /></div>
          <div><label className="block font-semibold mb-2">Email</label><input type="email" value={form.email} onChange={(e) => setForm({...form, email: e.target.value})} required /></div>
          <div><label className="block font-semibold mb-2">Password</label><input type="password" value={form.password} onChange={(e) => setForm({...form, password: e.target.value})} required /></div>
          <button type="submit" className="w-full bg-green-600 text-white font-semibold py-2 rounded">Sign Up</button>
        </form>
      </div>
    </div>
  );
}
