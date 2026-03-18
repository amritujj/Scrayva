require('dotenv').config({ path: '.env.local' });
const Razorpay = require('razorpay');

async function test() {
  try {
    const razorpay = new Razorpay({
      key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    const options = {
      amount: 4900,
      currency: 'USD',
      receipt: `test_receipt_123`,
    };

    console.log("Creating order...");
    const order = await razorpay.orders.create(options);
    console.log("Success:", order);
  } catch (err) {
    console.error("Error:", err);
  }
}

test();
