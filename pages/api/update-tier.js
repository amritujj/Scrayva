import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: 'Unauthorized: Missing token' });
    const token = authHeader.split(' ')[1];
    
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    if (userError || !user) return res.status(401).json({ error: 'Unauthorized: Invalid token' });

    const { tier } = req.body;
    if (tier !== 'Free') {
      return res.status(400).json({ error: 'This endpoint is only for the Free tier.' });
    }

    // Update user metadata to Free and give 5 initial credits
    const { error: updateError } = await supabase.auth.admin.updateUserById(user.id, {
      user_metadata: { 
        ...user.user_metadata, 
        tier: 'Free',
        credits: 5 
      }
    });

    if (updateError) throw updateError;

    res.status(200).json({ success: true, message: 'Tier updated to Free with 5 credits.' });
  } catch (error) {
    console.error("Update Tier Error:", error);
    res.status(500).json({ error: error.message || 'Server error' });
  }
}
