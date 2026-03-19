import Link from 'next/link';

export default function Logo({ className = '', iconSize = 'w-5 h-5', containerSize = 'w-9 h-9', textSize = 'text-2xl' }) {
  return (
    <Link href="/" className={`flex items-center gap-3 hover:opacity-80 transition-opacity ${className}`}>
      <div className={`${containerSize} rounded-[0.6rem] bg-brand-primary flex items-center justify-center shrink-0`}>
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="white" 
          strokeWidth="2.5" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          className={iconSize}
        >
          <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
        </svg>
      </div>
      <span className={`${textSize} font-black tracking-tighter text-white font-headline`}>Scrayva</span>
    </Link>
  );
}
