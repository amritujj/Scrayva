import { supabase } from './supabase';

export const handleRazorpayCheckout = async (tier, cycle, onComplete, onError) => {
  // Check auth
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    window.location.href = '/signup';
    return;
  }

  // Ensure razorpay loaded
  if (!window.Razorpay) {
    if (onError) onError('Razorpay SDK failed to load. Are you connected to the internet?');
    return;
  }

  try {
    // 1. Create Order
    const res = await fetch('/api/payment/create-order', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`
      },
      body: JSON.stringify({ tier, cycle })
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error);

    const { order, user } = data;

    // 2. Init Razorpay
    const options = {
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID, // Enter the Key ID generated from the Dashboard
      amount: order.amount, // Amount is in currency subunits. 
      currency: order.currency,
      name: "Scrayva Automation",
      description: `Upgrade to ${tier} Plan`,
      image: "https://scrayva.space/favicon.ico", 
      order_id: order.id, 
      handler: async function (response) {
        // 3. Verify Payment
        try {
          const verifyRes = await fetch('/api/payment/verify', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${session.access_token}`
            },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              tier
            })
          });

          const verifyData = await verifyRes.json();
          if (!verifyRes.ok) throw new Error(verifyData.error);
          
          if (onComplete) onComplete(verifyData);
        } catch (err) {
          if (onError) onError(err.message || 'Verification failed');
        }
      },
      prefill: {
        email: user.email,
      },
      theme: {
        color: "#9333ea" // purple-600
      }
    };

    const rzp = new window.Razorpay(options);
    rzp.on('payment.failed', function (response){
      if (onError) onError(response.error.description);
    });
    rzp.open();
  } catch (err) {
    if (onError) onError(err.message || 'Payment initialization failed');
  }
};
