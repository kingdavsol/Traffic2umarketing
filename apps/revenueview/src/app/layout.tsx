import { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from 'react-hot-toast';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'RevenueView - Stripe Analytics & Revenue Dashboard',
  description: 'Beautiful revenue analytics for Stripe. MRR, churn, LTV tracking. 80% cheaper than Baremetrics.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (<html lang="en"><body className={inter.className}>{children}<Toaster /></body></html>);
}
