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

      // Priority: Ultimate=2 (highest), Pro=1, Free=0 (lowest = waits longest)
      const TIER_PRIORITY = { 'Ultimate': 2, 'Pro': 1, 'Free': 0, 'None': 0 };
      const priority = TIER_PRIORITY[tier] ?? 0;
      
      if (credits <= 0) {
        return res.status(403).json({ error: `You have zero credits left. Upgrade to run more ${tier} tier operations.` });
      }

      const { prompt } = req.body;
      
      // 1. Deduct credit (non-blocking — failure warns but never kills task creation)
      const { error: updateError } = await supabase.auth.admin.updateUserById(user.id, {
        user_metadata: { ...user.user_metadata, credits: credits - 1 }
      });
      if (updateError) {
        console.warn(`[tasks] Credit deduction failed for user ${user.id}:`, updateError.message);
        // Don't throw — task creation should still proceed
      }
      
      // 1. Create task in Supabase
      // workspace_id uses user.id as a stable stand-in (satisfies NOT NULL constraint)
      // title is derived from the prompt (satisfies NOT NULL constraint)
      const taskId = crypto.randomUUID();
      const title = prompt.length > 80 ? prompt.slice(0, 77) + '...' : prompt;
      const { data: task, error: insertError } = await supabase
        .from('tasks')
        .insert([{ id: taskId, title, prompt, status: 'queued', user_id: user.id, workspace_id: user.id }])
        .select()
        .single();
        
      if (insertError) throw insertError;

      // 2. Trigger worker which now immediately returns 202 via BackgroundTasks.
      // We await it so Vercel does not terminate the TCP connection prematurely.
      try {
        const workerRes = await fetch(`${workerUrl}/run-agent`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt: task.prompt,
            task_id: task.id,
            tier: tier,          // ← passed so worker applies correct queue delay
            priority: priority   // ← for logging/debugging
          })
        });
        if (!workerRes.ok) {
          const workerErr = await workerRes.text();
          console.warn(`[API] Worker returned HTTP ${workerRes.status} for task ${task.id}: ${workerErr}`);
        }
      } catch (err) {
        console.warn(`[API] Worker trigger failed (network), task ${task.id} stays queued:`, err.message);
      }

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
