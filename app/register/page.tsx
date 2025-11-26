'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/components/ui/use-toast'
import { Sparkles, Check } from 'lucide-react'

export default function RegisterPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (formData.password !== formData.confirmPassword) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Passwords do not match',
      })
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: data.error || 'Something went wrong',
        })
        return
      }

      toast({
        title: 'Success!',
        description: 'Please check your email to verify your account.',
      })

      router.push('/verify-email-sent')
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Something went wrong. Please try again.',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen">
      {/* Left side - Form */}
      <div className="flex flex-1 flex-col items-center justify-center bg-gradient-to-br from-primary/10 via-background to-purple-600/10 p-4">
        <Link href="/" className="mb-8 flex items-center space-x-2">
          <Sparkles className="h-8 w-8 text-primary" />
          <span className="text-2xl font-bold">CaptionGenius</span>
        </Link>

        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold">Create an account</CardTitle>
            <CardDescription>
              Start generating AI-powered captions in seconds
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  required
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Minimum 8 characters"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  required
                  minLength={8}
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) =>
                    setFormData({ ...formData, confirmPassword: e.target.value })
                  }
                  required
                  disabled={isLoading}
                />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Creating account...' : 'Create Account'}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <div className="text-sm text-muted-foreground">
              Already have an account?{' '}
              <Link href="/login" className="text-primary hover:underline">
                Sign in
              </Link>
            </div>
          </CardFooter>
        </Card>

        <p className="mt-8 text-center text-xs text-muted-foreground">
          By signing up, you agree to our{' '}
          <Link href="/terms" className="underline">
            Terms
          </Link>{' '}
          and{' '}
          <Link href="/privacy" className="underline">
            Privacy Policy
          </Link>
        </p>
      </div>

      {/* Right side - Benefits */}
      <div className="hidden lg:flex lg:flex-1 lg:flex-col lg:justify-center lg:bg-gradient-to-br lg:from-primary lg:to-purple-600 lg:p-12 lg:text-white">
        <div className="max-w-md">
          <h2 className="mb-6 text-3xl font-bold">
            Start Creating Amazing Captions Today
          </h2>
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="mt-1 rounded-full bg-white/20 p-1">
                <Check className="h-4 w-4" />
              </div>
              <div>
                <h3 className="font-semibold">AI-Powered Generation</h3>
                <p className="text-sm opacity-90">
                  Generate unique captions optimized for each platform
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="mt-1 rounded-full bg-white/20 p-1">
                <Check className="h-4 w-4" />
              </div>
              <div>
                <h3 className="font-semibold">Save Hours Every Week</h3>
                <p className="text-sm opacity-90">
                  Stop staring at blank screens. Get perfect captions in seconds
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="mt-1 rounded-full bg-white/20 p-1">
                <Check className="h-4 w-4" />
              </div>
              <div>
                <h3 className="font-semibold">Trending Content</h3>
                <p className="text-sm opacity-90">
                  Access trending memes and hashtags to boost engagement
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="mt-1 rounded-full bg-white/20 p-1">
                <Check className="h-4 w-4" />
              </div>
              <div>
                <h3 className="font-semibold">Start Free</h3>
                <p className="text-sm opacity-90">
                  10 free captions to try. No credit card required
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
