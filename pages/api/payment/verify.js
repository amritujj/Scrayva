import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, tier } = req.body;
    
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ error: 'Missing payment details' });
    }

    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: 'Unauthorized' });
    const token = authHeader.split(' ')[1];
    
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    if (userError || !user) return res.status(401).json({ error: 'Unauthorized: Invalid token' });

    // Verify signature
    const hmac = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET);
    hmac.update(`${razorpay_order_id}|${razorpay_payment_id}`);
    const generatedSignature = hmac.digest('hex');

    if (generatedSignature !== razorpay_signature) {
      return res.status(400).json({ error: 'Payment verification failed: Invalid signature' });
    }

    // Determine new credits
    const credits = tier === 'Pro' ? 50 : tier === 'Ultimate' ? 250 : 5;

    // Update user metadata using admin client
    const { error: updateError } = await supabase.auth.admin.updateUserById(user.id, {
      user_metadata: { ...user.user_metadata, tier, credits }
    });

    if (updateError) throw updateError;

    res.status(200).json({ success: true, tier, credits });
  } catch (error) {
    console.error("Razorpay Verify Error:", error);
    res.status(500).json({ error: error.message || 'Server error' });
  }
}
