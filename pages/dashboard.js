import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { supabase } from '@/lib/supabase';
import { LogOut, Play, Loader2, Bot, Download, CheckCircle2, XCircle, Clock } from 'lucide-react';

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [prompt, setPrompt] = useState('');
  const [running, setRunning] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login');
      } else {
        setUser(session.user);
        fetchTasks(session.user.id);
      }
      setLoading(false);
    };

    checkAuth();
    
    // Set up realtime subscription for updates
    const subscription = supabase
      .channel('tasks_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, (payload) => {
        if (user) fetchTasks(user.id);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [router, user]);

  const fetchTasks = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      if (data) setTasks(data);
    } catch (err) {
      console.error('Error fetching tasks:', err);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  const handleRunAgent = async () => {
    if (!prompt.trim() || !user) return;
    
    setRunning(true);
    setError(null);
    
    try {
      // 1. Insert into Supabase
      const { data, error: insertError } = await supabase
        .from('tasks')
        .insert([
          { 
            user_id: user.id, 
            prompt, 
            status: 'queued' 
          }
        ])
        .select()
        .single();
        
      if (insertError) throw insertError;
      
      const taskId = data.id;
      setPrompt('');
      fetchTasks(user.id); // Update UI immediately
      
      // 2. Call Worker via fetch without awaiting to avoid blocking the UI
      const workerUrl = process.env.NEXT_PUBLIC_WORKER_URL || 'http://localhost:8000';
      fetch(`${workerUrl}/run-agent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, task_id: taskId })
      }).catch(err => console.error("Worker call failed:", err));
      
    } catch (err) {
      setError(err.message || 'Failed to submit task');
    } finally {
      setRunning(false);
    }
  };

  const downloadCSV = (resultData) => {
    if (!resultData) return;
    
    // In a real app we'd parse the result JSON and convert to CSV format
    // For this simple demo, we'll just encode the JSON as a text file download
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(resultData, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href",     dataStr);
    downloadAnchorNode.setAttribute("download", "result.json");
    document.body.appendChild(downloadAnchorNode); // required for firefox
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0f1e] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#3b82f6] animate-spin" />
      </div>
    );
  }

  // Prevent flash of protected content before redirect
  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#0a0f1e] text-slate-200 font-sans">
      <Head>
        <title>Dashboard - Scrayva</title>
      </Head>

      {/* Header */}
      <header className="border-b border-white/10 bg-slate-900/50 backdrop-blur-md sticky top-0 z-10 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#3b82f6] flex items-center justify-center shadow-[0_0_10px_rgba(59,130,246,0.5)]">
              <span className="font-bold text-white text-lg leading-none">S</span>
            </div>
            <span className="text-xl font-bold tracking-tight text-white">Dashboard</span>
          </div>
          
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-400 hidden sm:inline-block">
              {user.email}
            </span>
            <button 
              onClick={handleLogout}
              className="text-sm flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-white/5 border border-transparent hover:border-white/10 transition-colors text-slate-300"
            >
              <LogOut className="w-4 h-4" />
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* Task Input Area */}
        <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl mb-8 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#3b82f6] to-cyan-400"></div>
          
          <h2 className="text-xl font-semibold text-white mb-2 flex items-center gap-2">
            <Bot className="w-5 h-5 text-blue-400" />
            New Automation Task
          </h2>
          <p className="text-sm text-slate-400 mb-6">
            Describe what you want the browser agent to do in plain English.
          </p>
          
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-sm text-red-200">
              {error}
            </div>
          )}
          
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            disabled={running}
            placeholder="e.g. Go to ycombinator.com, search for the top 5 AI startups, and extract their names and descriptions..."
            className="w-full h-32 p-4 bg-slate-950 border border-slate-700 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#3b82f6] focus:border-transparent transition-all lg:text-lg resize-none mb-4"
          />
          
          <div className="flex justify-end">
            <button
              onClick={handleRunAgent}
              disabled={running || !prompt.trim()}
              className="flex items-center gap-2 bg-[#3b82f6] hover:bg-blue-600 text-white px-6 py-2.5 rounded-xl font-medium shadow-[0_0_15px_rgba(59,130,246,0.3)] hover:shadow-[0_0_20px_rgba(59,130,246,0.5)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {running ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Queuing Task...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" />
                  Run Agent
                </>
              )}
            </button>
          </div>
        </section>

        {/* Task History */}
        <section>
          <h3 className="text-lg font-medium text-slate-200 mb-4 px-1">Task History</h3>
          
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            {tasks.length === 0 ? (
              <div className="p-8 text-center text-slate-500">
                <div className="w-16 h-16 rounded-full bg-slate-800/50 flex items-center justify-center mx-auto mb-4">
                  <Clock className="w-8 h-8 text-slate-600" />
                </div>
                <p>No tasks yet. Start an automation above!</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-300">
                  <thead className="bg-slate-950 border-b border-slate-800 text-slate-400">
                    <tr>
                      <th className="px-6 py-4 font-medium">Prompt</th>
                      <th className="px-6 py-4 font-medium w-32">Status</th>
                      <th className="px-6 py-4 font-medium w-40 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {tasks.map((task) => (
                      <tr key={task.id} className="hover:bg-slate-800/50 transition-colors">
                        <td className="px-6 py-4">
                          <p className="line-clamp-2" title={task.prompt}>
                            {task.prompt}
                          </p>
                          <span className="text-xs text-slate-500 mt-1 block">
                            {new Date(task.created_at).toLocaleString()}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
                            task.status === 'completed' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                            task.status === 'failed' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                            'bg-blue-500/10 text-blue-400 border-blue-500/20'
                          }`}>
                            {task.status === 'completed' && <CheckCircle2 className="w-3.5 h-3.5" />}
                            {task.status === 'failed' && <XCircle className="w-3.5 h-3.5" />}
                            {task.status === 'queued' && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                            {task.status.charAt(0).toUpperCase() + task.status.slice(1)}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          {task.status === 'completed' && task.result && (
                            <button
                              onClick={() => downloadCSV(task.result)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 text-slate-200 rounded-lg border border-white/10 transition-colors"
                            >
                              <Download className="w-3.5 h-3.5" />
                              Results
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
