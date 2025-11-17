'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Navbar, Footer } from '@traffic2u/ui';
import { Code2, CheckCircle, XCircle, Loader2 } from 'lucide-react';

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');

  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Invalid verification link. No token provided.');
      return;
    }

    // Verify the token
    fetch(`/api/auth/verify?token=${token}`)
      .then(async (res) => {
        const data = await res.json();

        if (res.ok) {
          setStatus('success');
          setMessage(data.message || 'Email verified successfully!');

          // Redirect to sign in after 3 seconds
          setTimeout(() => {
            router.push('/auth/signin?verified=true');
          }, 3000);
        } else {
          setStatus('error');
          setMessage(data.message || 'Verification failed. The link may have expired.');
        }
      })
      .catch((error) => {
        setStatus('error');
        setMessage('An error occurred during verification. Please try again.');
        console.error('Verification error:', error);
      });
  }, [token, router]);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar logo={<Code2 className="h-6 w-6 text-blue-600" />} appName="CodeSnap" />

      <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="text-center">
              {status === 'loading' && (
                <>
                  <Loader2 className="h-16 w-16 text-blue-600 mx-auto mb-4 animate-spin" />
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Verifying Your Email
                  </h2>
                  <p className="text-gray-600">
                    Please wait while we verify your email address...
                  </p>
                </>
              )}

              {status === 'success' && (
                <>
                  <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Email Verified!
                  </h2>
                  <p className="text-gray-600 mb-4">{message}</p>
                  <p className="text-sm text-gray-500">
                    Redirecting you to sign in...
                  </p>
                </>
              )}

              {status === 'error' && (
                <>
                  <XCircle className="h-16 w-16 text-red-600 mx-auto mb-4" />
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Verification Failed
                  </h2>
                  <p className="text-gray-600 mb-6">{message}</p>
                  <div className="space-y-3">
                    <button
                      onClick={() => router.push('/auth/signup')}
                      className="w-full bg-blue-600 text-white rounded-lg px-6 py-3 font-medium hover:bg-blue-700 transition-colors"
                    >
                      Try Signing Up Again
                    </button>
                    <button
                      onClick={() => router.push('/auth/signin')}
                      className="w-full bg-gray-100 text-gray-700 rounded-lg px-6 py-3 font-medium hover:bg-gray-200 transition-colors"
                    >
                      Go to Sign In
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

          {status === 'error' && (
            <p className="text-center text-sm text-gray-600 mt-6">
              Need help?{' '}
              <a href="mailto:support@codesnap.com" className="text-blue-600 hover:underline">
                Contact Support
              </a>
            </p>
          )}
        </div>
      </div>

      <Footer appName="CodeSnap" />
    </div>
  );
}
