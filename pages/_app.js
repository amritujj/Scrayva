import '@/styles/globals.css';
import { Inter } from 'next/font/google';

// Configured for optimal FCP (preload, latin subset)
const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  preload: true
});

export default function App({ Component, pageProps }) {
  return (
    <div className={inter.className}>
      <Component {...pageProps} />
    </div>
  );
}
