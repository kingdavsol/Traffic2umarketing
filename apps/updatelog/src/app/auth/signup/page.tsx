'use client';
import { useState } from 'react';
import { Button, Input, Card, CardHeader, CardTitle, CardDescription, CardContent } from '@traffic2u/ui';
import { Bell } from 'lucide-react';
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
    if (form.password.length < 8) return toast.error('Password must be 8+ characters');

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
      toast.error(error.message || 'Failed to create account');
    } finally {
      setLoading(false);
    }
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
          <CardHeader>
            <CardTitle>Create account</CardTitle>
            <CardDescription>Start publishing product updates</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div><label className="block text-sm font-medium mb-2">Name</label><Input type="text" required value={form.name} onChange={e => setForm({...form, name: e.target.value})} /></div>
              <div><label className="block text-sm font-medium mb-2">Email</label><Input type="email" required value={form.email} onChange={e => setForm({...form, email: e.target.value})} /></div>
              <div><label className="block text-sm font-medium mb-2">Password</label><Input type="password" required minLength={8} value={form.password} onChange={e => setForm({...form, password: e.target.value})} /></div>
              <div><label className="block text-sm font-medium mb-2">Confirm Password</label><Input type="password" required value={form.confirmPassword} onChange={e => setForm({...form, confirmPassword: e.target.value})} /></div>
              <Button type="submit" className="w-full" size="lg" disabled={loading}>{loading ? 'Creating...' : 'Create Account'}</Button>
              <p className="text-xs text-center text-gray-500">By signing up, you agree to our <Link href="/terms" className="text-purple-600 hover:underline">Terms</Link> and <Link href="/privacy" className="text-purple-600 hover:underline">Privacy Policy</Link></p>
            </form>
            <div className="mt-6 text-center"><p className="text-sm">Already have an account? <Link href="/auth/signin" className="text-purple-600 hover:underline font-medium">Sign in</Link></p></div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
