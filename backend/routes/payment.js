const express = require("express");
const Stripe = require("stripe");
const Order = require("../models/Order");
const sendTextToAVL = require("../utils/sendTextToAVL");
const STRIPE_PRICE_MAP = require("../utils/stripePriceMap");

const DELIVERY_FEE = 4.50;

const router = express.Router();

/** 📌 Checkout Session - Creates a payment link */
router.post("/checkout", async (req, res) => {
    try {
        const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
        const { orderId } = req.body;
        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        const billing = req.body.billing || {};
        order.fullName = billing.fullName || '';
        order.phoneNumber = billing.phoneNumber || '';
        order.address = billing.address || '';
        order.city = billing.city || '';
        order.postalCode = billing.postalCode || '';
        order.country = billing.country || '';
        await order.save();

        const subtotal = order.items.reduce((sum, item) => sum + item.price * item.quantity, 0);

        const lineItems = [];

        for (const item of order.items) {
            const priceId = STRIPE_PRICE_MAP[item.productId];
            if (!priceId) {
                throw new Error(`Missing Stripe price for product: ${item.productId}`);
            }
            lineItems.push({
                price: priceId,
                quantity: item.quantity
            });
        }

        // Dynamically calculated service fee
        const serviceFeeRate = 0.05;
        const serviceFee = subtotal * serviceFeeRate;
        lineItems.push({
            price_data: {
                currency: "usd",
                product_data: { name: "Pangia Service Fee" },
                unit_amount: Math.round(serviceFee * 100)
            },
            quantity: 1
        });

        // Fixed delivery fee
        lineItems.push({
            price_data: {
                currency: "usd",
                product_data: { name: "Delivery Fee" },
                unit_amount: Math.round(DELIVERY_FEE * 100)
            },
            quantity: 1
        });

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            customer_email: billing.email,
            line_items: lineItems,
            mode: "payment",
            success_url: `${process.env.CLIENT_URL}/pages/order-success.html`, 
            cancel_url: `${process.env.CLIENT_URL}/pages/checkout.html`,
            metadata: {
                orderId: order._id.toString()
            },
            automatic_tax: { enabled: true },
            shipping_address_collection: { allowed_countries: ['US'] },
        });

        console.log("✅ Stripe checkout session:", session.url);

        res.json({ id: session.id, url: session.url });
    } catch (error) {
        console.error("❌ Stripe checkout error:", error);
        res.status(500).json({
            message: "Stripe checkout failed",
            error: error.message,
            raw: error.raw ? error.raw.message : undefined
        });
    }
});

/** 📌 Handle Stripe Webhook (For Payment Confirmation) */
router.post("/webhook", express.raw({ type: "application/json" }), async (req, res) => {
    const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
    const sig = req.headers["stripe-signature"];

    try {
        const event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);

        if (event.type === "checkout.session.completed") {
            const session = event.data.object;
            console.log("🔎 Received session with metadata:", session.metadata);

            const orderId = session.metadata?.orderId;
            console.log("🧩 Looking up order with ID:", orderId);

            const order = await Order.findById(orderId);

            if (!order) {
                console.warn("⚠️ No order found with ID:", orderId);
                return res.status(404).json({ message: "Order not found" });
            }

            console.log("✅ Order found:", order._id);

            let productSubtotal = 0;

            order.items = order.items.map(item => {
                const itemTotal = item.price * item.quantity;
                const platformCut = Number((itemTotal * 0.03).toFixed(2));
                productSubtotal += itemTotal;

                return {
                    ...item.toObject(),
                    platformCut
                };
            });

            order.platformCut = Number((productSubtotal * 0.03).toFixed(2));
            order.paymentStatus = "Paid";
            await order.save();
            await sendTextToAVL(order);
            console.log(`✅ Order ${orderId} marked as Paid`);
        }

        res.json({ received: true });
    } catch (error) {
        console.error("❌ Webhook Error:", error);
        res.status(400).json({ message: "Webhook error", error });
    }
});

module.exports = router;