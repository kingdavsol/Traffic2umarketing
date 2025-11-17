import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from 'react-hot-toast';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'TestLift - No-Code A/B Testing for Landing Pages',
  description: 'Simple A/B testing without expensive enterprise tools. Optimize conversion rates with visual editor and real-time analytics. 75% cheaper than Optimizely.',
  keywords: 'A/B testing, conversion optimization, landing page testing, split testing, CRO',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
