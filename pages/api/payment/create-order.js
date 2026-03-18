import Razorpay from 'razorpay';
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

    const { tier, cycle } = req.body;
    if (!['Pro', 'Ultimate'].includes(tier)) {
      return res.status(400).json({ error: 'Invalid plan selected' });
    }

    let amount = 0;
    if (tier === 'Pro') {
      amount = cycle === 'yearly' ? 399900 : 39900;
    } else if (tier === 'Ultimate') {
      amount = cycle === 'yearly' ? 999900 : 99900;
    }

    const razorpay = new Razorpay({
      key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    const options = {
      amount,
      currency: 'INR',
      // Razorpay receipt length MUST be <= 40 chars. Supabase UUID is 36, causing crashes.
      receipt: `rcpt_${user.id.substring(0,8)}_${Date.now()}`.substring(0, 40),
    };

    const order = await razorpay.orders.create(options);
    
    res.status(200).json({ order, user: { id: user.id, email: user.email } });
  } catch (error) {
    console.error("Razorpay Create Order Error:", error);
    res.status(500).json({ error: `Raw Error: ${error.message || JSON.stringify(error)}` });
  }
}
