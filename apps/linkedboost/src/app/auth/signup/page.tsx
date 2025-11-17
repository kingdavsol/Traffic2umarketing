'use client';
import { useState } from 'react';
import { Button, Input, Card, CardHeader, CardTitle, CardDescription, CardContent } from '@traffic2u/ui';
import { Linkedin } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

export default function SignUpPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) return toast.error('Passwords do not match');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: form.name, email: form.email, password: form.password }),
      });
      if (!res.ok) throw new Error((await res.json()).message);
      toast.success('Account created!');
      router.push('/dashboard');
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-white p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center space-x-2">
            <Linkedin className="h-8 w-8 text-blue-600" />
            <span className="text-2xl font-bold">LinkedBoost</span>
          </Link>
        </div>
        <Card>
          <CardHeader><CardTitle>Create account</CardTitle><CardDescription>Start growing on LinkedIn</CardDescription></CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div><Input type="text" placeholder="Name" required value={form.name} onChange={e => setForm({...form, name: e.target.value})} /></div>
              <div><Input type="email" placeholder="Email" required value={form.email} onChange={e => setForm({...form, email: e.target.value})} /></div>
              <div><Input type="password" placeholder="Password" required minLength={8} value={form.password} onChange={e => setForm({...form, password: e.target.value})} /></div>
              <div><Input type="password" placeholder="Confirm Password" required value={form.confirmPassword} onChange={e => setForm({...form, confirmPassword: e.target.value})} /></div>
              <Button type="submit" className="w-full" size="lg" disabled={loading}>{loading ? 'Creating...' : 'Create Account'}</Button>
            </form>
            <div className="mt-6 text-center"><p className="text-sm">Have an account? <Link href="/auth/signin" className="text-blue-600 hover:underline">Sign in</Link></p></div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
