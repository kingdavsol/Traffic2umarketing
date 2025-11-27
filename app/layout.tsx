import './globals.css'
import { Inter } from 'next/font/google'
import { Toaster } from '@/components/ui/toaster'
import dynamic from 'next/dynamic'

export const dynamic = 'force-dynamic'

const inter = Inter({ subsets: ['latin'] })

const Providers = dynamic(() => import('./providers'), {
  ssr: false,
  loading: () => null,
})

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
