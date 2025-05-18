const express = require('express');
const router = express.Router();
const Stripe = require('stripe');
const Order = require('../models/Order'); // Adjust path if needed

// Webhook route
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
    const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
    console.log("🟠 Webhook received!");
    res.status(200).send('Webhook received');
    const sig = req.headers['stripe-signature'];
    let event;

    try {
        event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
        console.error('Webhook Error:', err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the checkout session completion event
    if (event.type === 'checkout.session.completed') {
        const session = event.data.object;

        // Extract the orderId from session metadata
        const orderId = session.metadata.orderId;

        if (!orderId) {
            console.error('Missing orderId in session metadata');
            return res.status(400).send('Order ID missing in session metadata');
        }

        // Update order in database
        try {
            await Order.findByIdAndUpdate(orderId, { paymentStatus: 'Paid' });
            console.log(`✅ Order ${orderId} marked as Paid`);
        } catch (err) {
            console.error('Failed to update order:', err.message);
        }
    }

    res.status(200).json({ received: true });
});

module.exports = router;