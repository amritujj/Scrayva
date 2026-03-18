import { useEffect } from 'react';

const ICONS = {
  success: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
    </svg>
  ),
  error: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
    </svg>
  ),
  info: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
    </svg>
  ),
};

const STYLES = {
  success: 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300',
  error:   'bg-red-500/20   border-red-500/40   text-red-300',
  info:    'bg-purple-500/20 border-purple-500/40 text-purple-300',
};

/**
 * Toast component.
 * Props: message (string), type ('success'|'error'|'info'), onClose (fn), duration (ms, default 3000)
 */
export default function Toast({ message, type = 'info', onClose, duration = 3000 }) {
  useEffect(() => {
    const t = setTimeout(onClose, duration);
    return () => clearTimeout(t);
  }, [onClose, duration]);

  return (
    <div className={`fixed bottom-6 right-6 z-[9999] flex items-center gap-3 px-5 py-3.5 rounded-2xl border backdrop-blur-md shadow-2xl text-sm font-medium animate-float ${STYLES[type]}`}
      style={{ animation: 'none', opacity: 1 }}>
      {ICONS[type]}
      <span>{message}</span>
      <button onClick={onClose} className="ml-2 opacity-60 hover:opacity-100 transition-opacity">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
        </svg>
      </button>
    </div>
  );
}

/**
 * useToast hook — returns { toast, showToast }
 * Usage:
 *   const { toast, showToast } = useToast();
 *   showToast('Saved!', 'success');
 *   return <>{toast && <Toast {...toast} onClose={() => showToast(null)} />}</>
 */
import { useState, useCallback } from 'react';
export function useToast() {
  const [toast, setToast] = useState(null);
  const showToast = useCallback((message, type = 'info') => {
    if (!message) { setToast(null); return; }
    setToast({ message, type });
  }, []);
  return { toast, showToast };
}
