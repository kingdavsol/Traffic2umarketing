import { useState } from 'react';
import { useRouter } from 'next/router';
export default function Login() {
  const [form, setForm] = useState({email: '', password: ''});
  const router = useRouter();
  const handle = async (e) => {
    e.preventDefault();
    const r = await fetch('/api/auth/login', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(form) });
    if (r.ok) { localStorage.setItem('token', (await r.json()).token); router.push('/dashboard'); }
  };
  return (
    <div className="min-h-screen bg-green-50 flex items-center">
      <div className="w-full max-w-md mx-auto bg-white rounded shadow-lg p-8">
        <h1 className="text-3xl font-bold text-center mb-6 text-green-600">Login</h1>
        <form onSubmit={handle} className="space-y-4">
          <input type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({...form, email: e.target.value})} required className="w-full" />
          <input type="password" placeholder="Password" value={form.password} onChange={(e) => setForm({...form, password: e.target.value})} required className="w-full" />
          <button type="submit" className="w-full bg-green-600 text-white font-semibold py-2 rounded">Login</button>
        </form>
      </div>
    </div>
  );
}
