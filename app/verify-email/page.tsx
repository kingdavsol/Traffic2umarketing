'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle2, XCircle, Loader2, Sparkles } from 'lucide-react'

export default function VerifyEmailPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get('token')
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (!token) {
      setStatus('error')
      setMessage('Invalid verification link')
      return
    }

    const verifyEmail = async () => {
      try {
        const response = await fetch('/api/auth/verify-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        })

        const data = await response.json()

        if (response.ok) {
          setStatus('success')
          setMessage('Your email has been verified successfully!')
          setTimeout(() => {
            router.push('/login')
          }, 3000)
        } else {
          setStatus('error')
          setMessage(data.error || 'Verification failed')
        }
      } catch (error) {
        setStatus('error')
        setMessage('Something went wrong. Please try again.')
      }
    }

    verifyEmail()
  }, [token, router])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-primary/10 via-background to-purple-600/10 p-4">
      <Link href="/" className="mb-8 flex items-center space-x-2">
        <Sparkles className="h-8 w-8 text-primary" />
        <span className="text-2xl font-bold">CaptionGenius</span>
      </Link>

      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            {status === 'loading' && (
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            )}
            {status === 'success' && (
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            )}
            {status === 'error' && <XCircle className="h-8 w-8 text-red-600" />}
          </div>
          <CardTitle className="text-2xl font-bold">
            {status === 'loading' && 'Verifying your email...'}
            {status === 'success' && 'Email Verified!'}
            {status === 'error' && 'Verification Failed'}
          </CardTitle>
          <CardDescription className="text-base">{message}</CardDescription>
        </CardHeader>
        <CardContent>
          {status === 'success' && (
            <div className="space-y-4">
              <p className="text-center text-sm text-muted-foreground">
                Redirecting you to login page...
              </p>
              <Link href="/login">
                <Button className="w-full">Continue to Login</Button>
              </Link>
            </div>
          )}
          {status === 'error' && (
            <div className="space-y-4">
              <Link href="/register">
                <Button className="w-full" variant="outline">
                  Back to Sign Up
                </Button>
              </Link>
              <Link href="/login">
                <Button className="w-full">Go to Login</Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
