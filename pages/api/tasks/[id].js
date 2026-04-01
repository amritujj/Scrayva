import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req, res) {
  const { id } = req.query;
  
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: 'Unauthorized' });
    const token = authHeader.split(' ')[1];
    const { data: { user } } = await supabase.auth.getUser(token);
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    if (req.method === 'DELETE') {
      const workerUrl = process.env.WORKER_URL || 'http://localhost:8000';
      // Ask the worker to cancel the running asyncio task (best-effort)
      try {
        const workerRes = await fetch(`${workerUrl}/cancel-agent/${id}`, { method: 'POST' });
        if (!workerRes.ok) console.warn(`Worker cancel returned ${workerRes.status} for ${id}`);
      } catch (err) {
        console.warn(`Worker cancel ping failed for ${id}:`, err.message);
      }
      // Always update the DB, scoped to the authenticated user so nobody can cancel someone else's task
      const { error: dbErr } = await supabase
        .from('tasks')
        .update({ status: 'cancelled', error: 'Cancelled by user.' })
        .eq('id', id)
        .eq('user_id', user.id);
      if (dbErr) {
        console.error(`DB cancel update failed for ${id}:`, dbErr.message);
        return res.status(500).json({ error: 'Failed to cancel task in database.' });
      }
      return res.status(200).json({ status: 'cancelled' });
    }

    if (req.method === 'GET') {
      const { data: task, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('id', id)
        .eq('user_id', user.id)
        .single();
        
      if (error) throw error;
      if (!task) return res.status(404).json({ error: 'Task not found' });
      
      return res.status(200).json(task);
    }
  } catch (error) {
    console.error(`Task Fetch Error [${id}]:`, error);
    res.status(500).json({ error: 'Failed to fetch task' });
  }
}

