const express = require('express');
const router = express.Router();
const Stripe = require('stripe');
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
const Order = require('../models/Order');
const sendEmail = require('../utils/sendEmail');
const sendOrderToAVL = require('../utils/sendToAVL');

router.post('/', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];

  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error("❌ Stripe Webhook Signature Error:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    console.log('✅ Payment received!');
    console.log('💳 Customer:', session.customer_email || session.customer);
    console.log('🧾 Amount Total:', session.amount_total);
    console.log('📦 Metadata:', session.metadata);
    const orderId = session.metadata?.orderId;

    if (!orderId) {
      console.error("❌ Webhook Error: Missing orderId in session metadata");
      return res.status(400).json({ error: "Missing orderId in metadata" });
    }

    try {
      const order = await Order.findByIdAndUpdate(orderId, {
        paymentStatus: "Paid",
        orderStatus: "Confirmed"
      }, { new: true });

      console.log(`✅ Webhook Success: Order ${orderId} updated to Confirmed + Paid`);

      if (session.customer_details?.email) {
        await sendEmail({
          to: session.customer_details.email,
          subject: 'Your Pangia Order is Confirmed',
          html: `
            <h2>Thank you for your order!</h2>
            <p>Your payment of $${(session.amount_total / 100).toFixed(2)} has been received.</p>
            <p>We’re preparing your delivery now.</p>
            <p>- The Pangia Team</p>
          `
        });
      }

      if (order) {
        const fullOrder = await Order.findById(orderId).lean(); // force plain JS object
        await sendOrderToAVL(fullOrder);
      }
    } catch (err) {
      console.error(`❌ Webhook DB Update Failed for order ${orderId}:`, err);
    }
  }

  res.json({ received: true });
});

module.exports = router;
