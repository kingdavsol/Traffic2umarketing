import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from 'react-hot-toast';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'CodeSnap - Transform Screenshots into Production-Ready Code',
  description: 'Convert any UI screenshot into clean, production-ready code using AI. Support for React, Vue, HTML/CSS, and more. Save hours of development time.',
  keywords: 'screenshot to code, AI code generator, UI to code, design to code, React code generator',
  openGraph: {
    title: 'CodeSnap - Transform Screenshots into Production-Ready Code',
    description: 'Convert any UI screenshot into clean, production-ready code using AI.',
    url: 'https://codesnap.com',
    siteName: 'CodeSnap',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CodeSnap - Transform Screenshots into Production-Ready Code',
    description: 'Convert any UI screenshot into clean, production-ready code using AI.',
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
