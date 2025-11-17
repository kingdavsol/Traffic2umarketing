'use client';
import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { Button, Input, Card, CardHeader, CardTitle, CardContent } from '@traffic2u/ui';
import { Linkedin } from 'lucide-react';
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
    const result = await signIn('credentials', { email: form.email, password: form.password, redirect: false });
    if (result?.error) toast.error('Invalid');
    else { toast.success('Welcome!'); router.push('/dashboard'); }
    setLoading(false);
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
          <CardHeader><CardTitle>Sign in</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input type="email" placeholder="Email" required value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
              <Input type="password" placeholder="Password" required value={form.password} onChange={e => setForm({...form, password: e.target.value})} />
              <Button type="submit" className="w-full" size="lg" disabled={loading}>{loading ? 'Signing in...' : 'Sign In'}</Button>
            </form>
            <div className="mt-6 text-center"><p className="text-sm">No account? <Link href="/auth/signup" className="text-blue-600 hover:underline">Sign up</Link></p></div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
