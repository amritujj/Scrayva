import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end();

  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Missing token' });

  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: `Bearer ${token}` } }
  });

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return res.status(401).json({ error: 'Unauthorized' });

  // First get the user's agent
  const { data: agent, error: agentError } = await supabase
    .from('voice_agents')
    .select('id')
    .eq('user_id', user.id)
    .single();

  if (agentError && agentError.code !== 'PGRST116') {
    return res.status(500).json({ error: agentError.message });
  }

  if (!agent) {
    return res.status(200).json([]); // No agent yet, no appointments
  }

  // Get appointments for this agent
  const { data: appointments, error } = await supabase
    .from('appointments')
    .select('*')
    .eq('agent_id', agent.id)
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) return res.status(500).json({ error: error.message });
  return res.status(200).json(appointments);
}
