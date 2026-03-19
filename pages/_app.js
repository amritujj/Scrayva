import '@/styles/globals.css';
import { Inter, Manrope } from 'next/font/google';

// Configured for optimal FCP (preload, latin subset)
const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

const manrope = Manrope({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-manrope',
});

export default function App({ Component, pageProps }) {
  return (
    <div className={`${inter.variable} ${manrope.variable} font-sans`}>
      <Component {...pageProps} />
    </div>
  );
}
