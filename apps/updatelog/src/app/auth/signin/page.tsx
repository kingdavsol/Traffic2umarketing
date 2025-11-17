'use client';
import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { Button, Input, Card, CardHeader, CardTitle, CardDescription, CardContent } from '@traffic2u/ui';
import { Bell } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

export default function SignInPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ email: '', password: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await signIn('credentials', { email: form.email, password: form.password, redirect: false });
      if (result?.error) toast.error('Invalid credentials');
      else { toast.success('Welcome back!'); router.push('/dashboard'); }
    } catch { toast.error('Something went wrong'); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-purple-50 to-white p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center space-x-2">
            <Bell className="h-8 w-8 text-purple-600" />
            <span className="text-2xl font-bold">UpdateLog</span>
          </Link>
        </div>
        <Card>
          <CardHeader><CardTitle>Welcome back</CardTitle><CardDescription>Sign in to UpdateLog</CardDescription></CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div><label className="block text-sm font-medium mb-2">Email</label><Input type="email" required value={form.email} onChange={e => setForm({...form, email: e.target.value})} /></div>
              <div><label className="block text-sm font-medium mb-2">Password</label><Input type="password" required value={form.password} onChange={e => setForm({...form, password: e.target.value})} /></div>
              <Button type="submit" className="w-full" size="lg" disabled={loading}>{loading ? 'Signing in...' : 'Sign In'}</Button>
            </form>
            <div className="mt-6 text-center"><p className="text-sm">Don't have an account? <Link href="/auth/signup" className="text-purple-600 hover:underline font-medium">Sign up</Link></p></div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
