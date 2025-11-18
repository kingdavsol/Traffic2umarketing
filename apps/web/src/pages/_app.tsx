import type { AppProps } from 'next/app';
import { useEffect } from 'react';
import '../styles/globals.css';

export default function App({ Component, pageProps }: AppProps) {
  useEffect(() => {
    // Initialize app
    console.log('Car Maintenance Hub loaded');
  }, []);

  return <Component {...pageProps} />;
}
