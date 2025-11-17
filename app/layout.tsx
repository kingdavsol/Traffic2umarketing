import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Toaster } from '@/components/ui/toaster'
import { Providers } from './providers'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'CaptionGenius - AI-Powered Social Media Caption Generator',
  description:
    'Generate engaging captions for Instagram, Facebook, Twitter, LinkedIn, and TikTok in seconds with AI. Save time, increase engagement, and grow your social media presence.',
  keywords:
    'AI caption generator, social media captions, Instagram captions, Facebook posts, Twitter content, LinkedIn posts, TikTok captions',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  )
}
