import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Mail, Sparkles } from 'lucide-react'

export default function VerifyEmailSentPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-primary/10 via-background to-purple-600/10 p-4">
      <Link href="/" className="mb-8 flex items-center space-x-2">
        <Sparkles className="h-8 w-8 text-primary" />
        <span className="text-2xl font-bold">CaptionGenius</span>
      </Link>

      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <Mail className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold">Check your email</CardTitle>
          <CardDescription className="text-base">
            We've sent you a verification link to confirm your email address.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg bg-muted p-4 text-sm">
            <p className="mb-2 font-medium">Next steps:</p>
            <ol className="ml-4 list-decimal space-y-1 text-muted-foreground">
              <li>Check your email inbox</li>
              <li>Click the verification link</li>
              <li>Start generating amazing captions!</li>
            </ol>
          </div>
          <p className="text-center text-sm text-muted-foreground">
            Didn't receive the email? Check your spam folder or{' '}
            <button className="text-primary hover:underline">
              resend verification email
            </button>
          </p>
          <Link href="/login">
            <Button className="w-full">Back to Login</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}
