import { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from 'react-hot-toast';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'MenuQR - QR Code Menu Builder for Restaurants',
  description: 'Digital menu builder with QR codes. Perfect for restaurants. Mobile-responsive menus in minutes.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (<html lang="en"><body className={inter.className}>{children}<Toaster /></body></html>);
}
