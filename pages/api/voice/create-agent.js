import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Missing token' });

  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: `Bearer ${token}` } }
  });

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return res.status(401).json({ error: 'Unauthorized' });

  const { business_name, phone_number, language, working_hours, services } = req.body;

  if (!business_name || !language) {
    return res.status(400).json({ error: 'Missing required configuration' });
  }

  // Check if agent already exists
  const { data: existing } = await supabase
    .from('voice_agents')
    .select('id')
    .eq('user_id', user.id)
    .single();

  if (existing) {
    // Update existing agent
    const { data, error } = await supabase
      .from('voice_agents')
      .update({ business_name, phone_number, language, working_hours, services, updated_at: new Date() })
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json(data);
  } else {
    // Create new agent
    const { data, error } = await supabase
      .from('voice_agents')
      .insert([{ user_id: user.id, business_name, phone_number, language, working_hours, services, status: 'active' }])
      .select()
      .single();

    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json(data);
  }
}
