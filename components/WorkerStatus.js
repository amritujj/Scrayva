import { Wifi, WifiOff, RefreshCw, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';

const WORKER_URL = process.env.NEXT_PUBLIC_WORKER_URL || 'http://localhost:8000';

export default function WorkerStatus() {
  const [workerStatus, setWorkerStatus] = useState('unknown'); // 'unknown' | 'ok' | 'error'
  const [testing, setTesting] = useState(false);

  const testConnection = async () => {
    setTesting(true);
    try {
      const res = await fetch(`${WORKER_URL}/health`);
      if (res.ok) setWorkerStatus('ok');
      else setWorkerStatus('error');
    } catch {
      setWorkerStatus('error');
    } finally {
      setTesting(false);
    }
  };

  useEffect(() => {
    testConnection();
    const interval = setInterval(testConnection, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <button
      onClick={testConnection}
      disabled={testing}
      title={`Worker URL: ${WORKER_URL}`}
      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors disabled:opacity-70 ${
        workerStatus === 'ok' 
          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20' 
          : workerStatus === 'error' 
          ? 'bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/20' 
          : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700'
      }`}
    >
      {testing ? (
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
      ) : workerStatus === 'ok' ? (
        <Wifi className="w-3.5 h-3.5" />
      ) : workerStatus === 'error' ? (
        <WifiOff className="w-3.5 h-3.5" />
      ) : (
        <RefreshCw className="w-3.5 h-3.5" />
      )}
      <span className="hidden sm:inline-block">
        {testing ? 'Testing...' : workerStatus === 'ok' ? 'Worker Online' : workerStatus === 'error' ? 'Worker Offline' : 'Test Worker'}
      </span>
    </button>
  );
}
