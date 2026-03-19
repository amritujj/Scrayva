import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
// Use the service role key so backend operations bypass RLS
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req, res) {
  const workerUrl = process.env.WORKER_URL || 'http://localhost:8000';
  
  try {
    if (req.method === 'POST') {
      const authHeader = req.headers.authorization;
      if (!authHeader) return res.status(401).json({ error: 'Unauthorized: Missing token' });
      const token = authHeader.split(' ')[1];
      
      const { data: { user }, error: userError } = await supabase.auth.getUser(token);
      if (userError || !user) return res.status(401).json({ error: 'Unauthorized: Invalid token' });

      const tier = user.user_metadata?.tier || 'Free';
      const credits = user.user_metadata?.credits ?? (tier === 'Pro' ? 50 : 5);
      
      if (credits <= 0) {
        return res.status(403).json({ error: `You have zero credits left. Upgrade to run more ${tier} tier operations.` });
      }

      const { prompt } = req.body;
      
      // 1. Deduct credit
      const { error: updateError } = await supabase.auth.admin.updateUserById(user.id, {
        user_metadata: { ...user.user_metadata, credits: credits - 1 }
      });
      if (updateError) throw updateError;
      
      // 1. Create task in Supabase first
      const { data: task, error: insertError } = await supabase
        .from('tasks')
        .insert([{ prompt, status: 'queued', user_id: user.id }])
        .select()
        .single();
        
      if (insertError) throw insertError;

      // 2. Trigger worker (non-blocking)
      // We don't await the full agent run here since it can take minutes.
      // The worker will update the Supabase record when finished.
      fetch(`${workerUrl}/run-agent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: task.prompt,
          task_id: task.id
        })
      }).catch(err => {
        // We catch here so a worker fetch failure DOES NOT crash the API response.
        // The task is already in Supabase as 'queued' and a 201 will be returned.
        console.warn(`[API] Worker trigger failed, but task ${task.id} is queued in DB:`, err.message);
      });

      return res.status(201).json(task);
    } else {
      // GET: Fetch from Supabase directly
      const authHeader = req.headers.authorization;
      if (!authHeader) return res.status(401).json({ error: 'Unauthorized: Missing token' });
      const token = authHeader.split(' ')[1];
      
      const { data: { user }, error: userError } = await supabase.auth.getUser(token);
      if (userError || !user) return res.status(401).json({ error: 'Unauthorized: Invalid token' });

      const { data: tasks, error: fetchError } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
        
      if (fetchError) throw fetchError;
      res.status(200).json(tasks);
    }
  } catch (error) {
    console.error("Tasks API Error:", error);
    res.status(500).json({ error: error.message || 'Server error' });
  }
}
