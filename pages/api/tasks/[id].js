import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req, res) {
  const { id } = req.query;
  
  try {
    const { data: task, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('id', id)
      .single();
      
    if (error) throw error;
    if (!task) return res.status(404).json({ error: 'Task not found' });
    
    res.status(200).json(task);
  } catch (error) {
    console.error(`Task Fetch Error [${id}]:`, error);
    res.status(500).json({ error: 'Failed to fetch task' });
  }
}

