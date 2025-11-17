import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from 'react-hot-toast';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'WarmInbox - Email Warm-up & Deliverability Platform',
  description: 'Improve your email deliverability with automated inbox warm-up. Build domain reputation, avoid spam folders, and maximize cold email success rates.',
  keywords: 'email warmup, email deliverability, domain reputation, cold email, spam prevention, inbox placement',
  openGraph: {
    title: 'WarmInbox - Email Warm-up & Deliverability Platform',
    description: 'Improve your email deliverability with automated inbox warm-up.',
    url: 'https://warminbox.com',
    siteName: 'WarmInbox',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'WarmInbox - Email Warm-up & Deliverability Platform',
    description: 'Improve your email deliverability with automated inbox warm-up.',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
        <Toaster position="top-right" />
      </body>
    </html>
  );
}
