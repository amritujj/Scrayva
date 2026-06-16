import Head from 'next/head';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../../lib/supabase';
import Toast, { useToast } from '../../components/Toast';

const STEPS = ['Queued', 'Navigating', 'Extracting', 'Finished'];

export default function TaskDetail() {
  const router = useRouter();
  const { id } = router.query;
  
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('table');
  const [notes, setNotes] = useState('');
  const [paused, setPaused] = useState(false);
  const { toast, showToast } = useToast();

  const fetchTask = async () => {
    if (!id) return;
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const headers = session?.access_token ? { 'Authorization': `Bearer ${session.access_token}` } : {};
      
      const res = await fetch(`/api/tasks/${id}`, { headers });
      if (res.ok) {
        const data = await res.json();
        setTask(data);
      } else if (res.status === 401 || res.status === 403 || res.status === 404) {
        setTask(null);
      }
    } catch (err) {
      console.error("Failed to fetch task:", err);
    } finally {
      setLoading(false);
    }
  };

  // Poll while running
  useEffect(() => {
    if (!id) return;
    fetchTask();
    
    // Only poll if it's currently running or queued
    const interval = setInterval(() => {
      setTask((currentTask) => {
        if (!currentTask || ['completed', 'failed'].includes(currentTask.status?.toLowerCase())) {
          return currentTask;
        }
        fetchTask();
        return currentTask;
      });
    }, 3000);
    
    return () => clearInterval(interval);
  }, [id]);

  const handleCancel = async () => {
    if (!window.confirm('Cancel this task? All progress will be lost.')) return;
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const headers = session?.access_token
        ? { 'Authorization': `Bearer ${session.access_token}` }
        : {};
      
      const res = await fetch(`/api/tasks/${id}`, { method: 'DELETE', headers });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        showToast(body.error || 'Failed to cancel task. Please try again.', 'error');
        return;
      }
    } catch (err) {
      showToast('Network error while cancelling. Please try again.', 'error');
      return;
    }

    showToast('Task cancelled.', 'error');
    setTimeout(() => router.push('/dashboard'), 1000);
  };

  const handlePause = () => {
    setPaused(!paused);
    showToast(paused ? 'Task resumed.' : 'Task paused.', 'info');
  };

  const handleApprove = () => {
    showToast('Results approved! Sending to export...', 'success');
    setTimeout(() => router.push('/dashboard'), 1500);
  };

  const handleReject = () => {
    if (!window.confirm('Reject and discard these results?')) return;
    showToast('Results rejected.', 'error');
    setTimeout(() => router.push('/dashboard'), 1000);
  };

  const handleRerun = () => {
    showToast('Task re-queued for a fresh run!', 'info');
    setTimeout(() => router.push(`/dashboard?prompt=${encodeURIComponent(task.prompt)}`), 500);
  };

  const handleExport = (format) => {
    if (!task || !task.result) {
      showToast('No data to export yet.', 'error');
      return;
    }
    
    if (format === 'Google Sheets') {
      showToast('Google Sheets export coming soon!', 'info');
      return;
    }

    const { result } = task;
    // Handle specific extraction arrays vs plain strings
    let exportData = '';
    let mime = '';
    let ext = '';

    if (format === 'JSON') {
      exportData = JSON.stringify(result, null, 2);
      mime = 'application/json';
      ext = 'json';
    } else {
      // CSV Export
      mime = 'text/csv';
      ext = 'csv';
      
      // If result has an 'extracted_data' array (like many templates do)
      if (result.extracted_data && Array.isArray(result.extracted_data) && result.extracted_data.length > 0) {
        const keys = Object.keys(result.extracted_data[0]);
        exportData = keys.join(',') + '\n' + result.extracted_data.map(row => 
          keys.map(k => `"${String(row[k] || '').replace(/"/g, '""')}"`).join(',')
        ).join('\n');
      } 
      // If result is just a flat object or string
      else {
        exportData = '"Key","Value"\n' + Object.keys(result).map(k => `"${k}","${String(result[k]).replace(/"/g, '""')}"`).join('\n');
      }
    }

    const blob = new Blob([exportData], { type: mime });
    const url  = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `scrayva-task-${task.id.split('-')[0]}.${ext}`; a.click();
    URL.revokeObjectURL(url);
    showToast(`${format} file downloaded!`, 'success');
  };

  if (loading) {
    return (
      <div className="bg-scrayva-dark text-slate-200 min-h-screen flex items-center justify-center font-sans">
        <div className="flex flex-col items-center gap-4">
          <svg className="w-8 h-8 animate-spin text-sky-400" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
          <p className="text-slate-400 text-sm animate-pulse">Loading task details...</p>
        </div>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="bg-scrayva-dark text-slate-200 min-h-screen flex items-center justify-center font-sans flex-col gap-4">
        <p className="text-red-400">Task not found or unavailable.</p>
        <Link href="/dashboard" className="px-4 py-2 bg-slate-800 rounded-lg text-sm hover:bg-slate-700">Go back to Dashboard</Link>
      </div>
    );
  }

  const statusLower = task.status?.toLowerCase() || 'queued';
  const isCompleted = statusLower === 'completed';
  const isFailed = statusLower === 'failed';
  const isCancelled = statusLower === 'cancelled';
  const isStalemate = (statusLower === 'queued' || statusLower === 'running') && 
    task.created_at && (Date.now() - new Date(task.created_at).getTime() > 5 * 60 * 1000);
  
  // Map our DB status string to a numeric step
  let CURRENT_STEP = 0;
  if (statusLower === 'running') CURRENT_STEP = 1;
  if (statusLower === 'running' && task.result) CURRENT_STEP = 2;
  if (isCompleted || isFailed || isCancelled) CURRENT_STEP = 3;

  // Safely extract table data if it exists
  let tableRows = [];
  let tableHeaders = [];
  if (task.result) {
    if (task.result.extracted_data && Array.isArray(task.result.extracted_data)) {
      tableRows = task.result.extracted_data;
      if (tableRows.length > 0) tableHeaders = Object.keys(tableRows[0]);
    } else if (Array.isArray(task.result)) {
      tableRows = task.result;
      if (tableRows.length > 0 && typeof tableRows[0] === 'object') tableHeaders = Object.keys(tableRows[0]);
    } else if (typeof task.result === 'object' && task.result !== null) {
      tableRows = [task.result];
      tableHeaders = Object.keys(task.result);
    } else if (typeof task.result === 'string') {
      try {
        const parsed = JSON.parse(task.result);
        if (Array.isArray(parsed)) {
            tableRows = parsed;
            if (tableRows.length > 0 && typeof tableRows[0] === 'object') tableHeaders = Object.keys(tableRows[0]);
        } else if (typeof parsed === 'object' && parsed !== null) {
            tableRows = [parsed];
            tableHeaders = Object.keys(parsed);
        } else {
            tableRows = [{ output: task.result }];
            tableHeaders = ['output'];
        }
      } catch (e) {
        tableRows = [{ output: task.result }];
        tableHeaders = ['output'];
      }
    }
  }

  return (
    <div className="bg-scrayva-dark text-slate-200 min-h-screen flex flex-col font-sans">
      <Head><title>Task #{task.id.split('-')[0]} | Scrayva</title></Head>

      {/* Header */}
      <header className="border-b border-scrayva-dark-border bg-scrayva-dark/80 backdrop-blur-md px-6 py-4 flex items-center justify-between z-10 flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="p-2 hover:bg-slate-800 rounded-lg transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M10 19l-7-7m0 0l7-7m-7 7h18" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
            </svg>
          </Link>
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight truncate max-w-sm">
              {task.prompt}
            </h1>
            <p className="text-xs text-slate-400 mt-0.5 whitespace-nowrap">ID: #{task.id.split('-')[0]} • Started {task.created_at ? new Date(task.created_at).toLocaleTimeString() : 'Unknown'}</p>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="hidden lg:flex items-center gap-1">
          {STEPS.map((step, i) => {
            let stateClass = 'bg-slate-800 border border-slate-700';
            if (i < CURRENT_STEP) stateClass = 'bg-green-500';
            else if (i === CURRENT_STEP && !isFailed && !isCompleted) stateClass = 'bg-sky-400 ring-4 ring-sky-400/20 animate-pulse-slow';
            else if (i === CURRENT_STEP && isFailed) stateClass = 'bg-red-500';
            else if (i === CURRENT_STEP && isCompleted) stateClass = 'bg-green-500';
            
            return (
              <div key={step} className="flex items-center">
                <div className="flex flex-col items-center relative">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white ${stateClass}`}>
                    {i < CURRENT_STEP || (i === 3 && isCompleted)
                      ? <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" /></svg>
                      : (i === 3 && isFailed ? <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12"/></svg>
                      : <span className="text-xs text-slate-400">{i + 1}</span>)
                    }
                  </div>
                  <span className={`text-[10px] mt-1 font-medium whitespace-nowrap absolute top-8 ${(i === CURRENT_STEP && !isCompleted && !isFailed) ? 'text-sky-400 font-bold' : (isFailed && i === 3 ? 'text-red-400 font-bold' : 'text-slate-500')}`}>{step}</span>
                </div>
                {i < STEPS.length - 1 && <div className={`w-10 h-1 mx-1 ${i < CURRENT_STEP ? 'bg-green-500' : 'bg-slate-700'}`} />}
              </div>
            );
          })}
        </div>

        <div className="flex items-center gap-3">
          <button onClick={handleCancel} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-sm font-medium rounded-lg transition-all border border-slate-700">Cancel Task</button>
          <button onClick={handlePause} disabled={isCompleted || isFailed} className={`px-4 py-2 text-sm font-bold rounded-lg transition-all ${paused ? 'bg-green-500 hover:bg-green-400 text-white' : 'bg-sky-400 hover:bg-sky-300 text-slate-900'} disabled:opacity-50 disabled:cursor-not-allowed`}>
            {paused ? 'Resume' : 'Pause'}
          </button>
        </div>
      </header>

      <main className="flex-1 flex flex-col lg:flex-row overflow-hidden pb-24 md:pb-0" style={{ minHeight: 0 }}>
        {/* Left Panel - Information */}
        <aside className="w-full lg:w-1/4 border-b lg:border-b-0 lg:border-r border-scrayva-dark-border bg-slate-900/50 overflow-y-auto p-4 lg:p-6 space-y-6 lg:space-y-8">
          <section>
            <h3 className="text-[10px] lg:text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2 lg:mb-3">Input Prompt</h3>
            <div className="bg-scrayva-card border border-scrayva-dark-border rounded-xl p-3 lg:p-4">
              <p className="text-xs lg:text-sm leading-relaxed text-slate-300 italic">&ldquo;{task.prompt}&rdquo;</p>
            </div>
          </section>

          {isCancelled && (
            <div className="mx-3 mb-2 px-3 py-2 bg-orange-500/10 border border-orange-500/20 rounded-lg text-xs text-orange-400 font-medium">
              ⚠ Task was cancelled by user.
            </div>
          )}
          {isStalemate && !isFailed && !isCompleted && !isCancelled && (
            <div className="mx-3 mb-2 px-3 py-2 bg-amber-500/10 border border-amber-500/20 rounded-lg text-xs text-amber-400 font-medium">
              ⚠ The task seems to be stuck. The core worker process might be heavily queued or restarting. You can cancel and re-run or wait.
            </div>
          )}
          {isFailed && (task.error || task.result?.error) && (
            <section>
              <h3 className="text-[10px] lg:text-xs font-semibold text-red-400 uppercase tracking-widest mb-2 lg:mb-3 flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                Execution Error
              </h3>
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 lg:p-4">
                <p className="text-xs lg:text-sm font-mono text-red-400 break-words whitespace-pre-wrap">{task.error || task.result?.error}</p>
              </div>
            </section>
          )}

          <section className="hidden lg:block">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">Internal Notes</h3>
            <textarea className="w-full bg-scrayva-dark border border-scrayva-dark-border rounded-xl p-4 text-sm text-slate-300 focus:ring-1 focus:ring-sky-400 min-h-[120px] resize-none" placeholder="Add notes about this run..." value={notes} onChange={(e) => setNotes(e.target.value)} />
            {notes && (
              <button onClick={() => { showToast('Notes saved!', 'success'); }} className="mt-2 text-xs text-sky-400 hover:underline">
                Save Notes
              </button>
            )}
          </section>
        </aside>

        {/* Right Panel */}
        <section className="flex-1 flex flex-col bg-scrayva-dark overflow-hidden">
          <div className="p-4 border-b border-scrayva-dark-border bg-scrayva-card/30 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h2 className="text-sm font-bold text-white">Extracted Data Preview</h2>
              {task.result && (
                <span className="px-2 py-0.5 rounded bg-slate-800 text-[10px] text-slate-400 font-mono">
                  {tableRows.length > 0 ? `${tableRows.length} ROWS` : 'JSON PAYLOAD'}
                </span>
              )}
            </div>
            <div className="flex bg-slate-800 rounded-lg p-1 border border-slate-700">
              <button onClick={() => setView('table')} className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${view === 'table' ? 'bg-sky-400 text-slate-900 shadow-sm' : 'text-slate-400 hover:text-white'}`}>Table View</button>
              <button onClick={() => setView('json')}  className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${view === 'json'  ? 'bg-sky-400 text-slate-900 shadow-sm' : 'text-slate-400 hover:text-white'}`}>JSON</button>
            </div>
          </div>

          <div className="flex-1 overflow-auto relative">
            {(!task.result && !isFailed) && (
              <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
                {task.screenshot ? (
                  <div className="w-full max-w-4xl border border-scrayva-dark-border rounded-xl overflow-hidden shadow-2xl relative bg-black">
                    <div className="absolute top-3 left-3 bg-slate-900/90 backdrop-blur border border-slate-700/50 px-2.5 py-1 text-[10px] text-green-400 font-mono rounded flex items-center gap-2 z-10">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                      </span>
                      LIVE VIEW
                    </div>
                    <img src={task.screenshot} alt="Agent View" className="w-full h-auto object-contain max-h-[65vh] opacity-90 transition-opacity duration-300" />
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center text-slate-600 gap-4">
                    <svg className="w-12 h-12 animate-spin text-sky-400/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                    </svg>
                    <div className="text-center">
                      <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">{statusLower}...</p>
                      <p className="text-xs text-slate-500 mt-2 max-w-sm">The agent is navigating the web and extracting information. This can take a few minutes.</p>
                      {isStalemate && (
                        <p className="text-xs text-amber-400 font-medium mt-4 border border-amber-400/20 bg-amber-400/10 p-2.5 rounded-lg">
                          Worker seems unresponsive. You can click 'Re-run Task' below to try again.
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {(task.result && view === 'table') && (
              tableRows.length > 0 ? (
                <table className="w-full text-left border-collapse min-w-[600px]">
                  <thead className="sticky top-0 bg-scrayva-dark z-10 border-b border-scrayva-dark-border">
                    <tr>
                      {tableHeaders.map((h) => (
                        <th key={h} className="p-4 text-xs font-bold text-slate-400 uppercase tracking-tight">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-scrayva-dark-border/50">
                    {tableRows.map((row, i) => (
                      <tr key={i} className="hover:bg-scrayva-card/50 transition-colors">
                        {tableHeaders.map(h => (
                          <td key={h} className="p-4 text-sm font-medium text-white max-w-xs truncate">
                            {typeof row[h] === 'object' ? JSON.stringify(row[h]) : String(row[h])}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="p-6 flex flex-col items-center justify-center text-slate-500 h-64 border border-dashed border-scrayva-dark-border rounded-xl mx-6 mt-6">
                  <svg className="w-8 h-8 mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                  <p className="text-sm font-medium">Result is not tabular structure</p>
                  <p className="text-xs mt-1">Switch to JSON view to see the output.</p>
                </div>
              )
            )}

            {(task.result && view === 'json') && (
              <pre className="p-6 text-sm text-green-400 font-mono overflow-auto h-full">
                {JSON.stringify(task.result, null, 2)}
              </pre>
            )}

            {isFailed && !task.result && (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-600">
                <svg className="w-16 h-16 text-red-500/20 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <p className="text-slate-400 font-semibold mb-2">Execution Failed</p>
                <p className="text-sm text-slate-500 max-w-md text-center">The agent encountered an error and could not complete the extraction. Check the error log in the sidebar.</p>
              </div>
            )}
          </div>

          {/* Action Bar */}
          <div className="p-6 bg-scrayva-card border-t border-scrayva-dark-border flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <button onClick={handleApprove} disabled={!isCompleted} className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-400 disabled:opacity-50 text-white rounded-lg transition-all font-bold text-sm">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" /></svg>
                Approve Results
              </button>
              <button onClick={handleReject} disabled={!isCompleted && !isFailed} className="flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 disabled:opacity-50 text-red-400 rounded-lg transition-all border border-red-500/20 font-bold text-sm">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" /></svg>
                Reject
              </button>
              <button onClick={handleRerun} className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-all border border-slate-700 font-medium text-sm">
                Re-run Task
              </button>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 mr-2">Export as:</span>
              {['CSV', 'JSON', 'Google Sheets'].map((fmt) => (
                <button key={fmt} disabled={!task.result} onClick={() => handleExport(fmt)} className="px-3 py-1.5 bg-slate-800 hover:bg-sky-400 hover:text-slate-900 disabled:opacity-50 disabled:hover:bg-slate-800 disabled:hover:text-slate-400 rounded-md text-xs font-bold transition-all border border-slate-700">{fmt}</button>
              ))}
            </div>
          </div>
        </section>
      </main>
      {/* Mobile Nav */}
      <div className="md:hidden fixed bottom-0 left-0 w-full bg-scrayva-dark border-t border-scrayva-dark-border flex justify-around p-3 z-50 pb-safe">
        <Link href="/dashboard" className="flex flex-col items-center gap-1 text-slate-400 hover:text-white transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" /></svg>
          <span className="text-[10px] font-medium">Dash</span>
        </Link>
        <Link href="/workflows" className="flex flex-col items-center gap-1 text-slate-400 hover:text-white transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" /></svg>
          <span className="text-[10px] font-medium">Flows</span>
        </Link>
        <Link href="/settings" className="flex flex-col items-center gap-1 text-slate-400 hover:text-white transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" /></svg>
          <span className="text-[10px] font-medium">Auto</span>
        </Link>
      </div>

      {toast && <Toast {...toast} onClose={() => showToast(null)} />}
    </div>
  );
}