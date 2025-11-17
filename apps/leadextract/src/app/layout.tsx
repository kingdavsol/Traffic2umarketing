import { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from 'react-hot-toast';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'LeadExtract - LinkedIn Profile Scraper & Lead Generation',
  description: 'Chrome extension for extracting LinkedIn profiles. Export contact data for sales teams. 70% cheaper than ZoomInfo.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (<html lang="en"><body className={inter.className}>{children}<Toaster /></body></html>);
}
