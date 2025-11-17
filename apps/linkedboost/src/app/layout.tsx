import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from 'react-hot-toast';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'LinkedBoost - LinkedIn Scheduler with AI Optimization',
  description: 'Schedule and optimize LinkedIn posts with AI. Boost engagement, grow your network, and build authority. 60% cheaper than Buffer and Hootsuite.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (<html lang="en"><body className={inter.className}>{children}<Toaster /></body></html>);
}
