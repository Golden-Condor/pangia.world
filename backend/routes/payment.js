const express = require("express");
const Stripe = require("stripe");
const Order = require("../models/Order");
const Booking = require("../models/Booking");
const sendTextToAVL = require("../utils/sendTextToAVL");
const STRIPE_PRICE_MAP = require("../utils/stripePriceMap");

const DELIVERY_FEE = 4.50;
const ASSESSMENT_FEE = Number(process.env.BOOKING_ASSESSMENT_FEE || 250);

const router = express.Router();

/** 📌 Checkout Session - Creates a payment link */
router.post("/checkout", async (req, res) => {
    try {
        const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
        const { orderId, bookingId } = req.body;

        if (!orderId && !bookingId) {
            return res.status(400).json({ message: "orderId or bookingId is required" });
        }

        let sessionPayload = {
            payment_method_types: ["card"],
            mode: "payment",
            success_url: `${process.env.CLIENT_URL}/pages/order-success.html`,
        };

        if (bookingId) {
            const booking = await Booking.findById(bookingId);
            if (!booking) {
                return res.status(404).json({ message: "Booking not found" });
            }

            const assessmentAmount = Number(req.body.amount || ASSESSMENT_FEE);
            sessionPayload = {
                ...sessionPayload,
                customer_email: booking.email || req.body.email,
                cancel_url: `${process.env.CLIENT_URL}/pages/book.html`,
                line_items: [
                    {
                        price_data: {
                            currency: "usd",
                            product_data: {
                                name: req.body.description || "Pangia Water Quality Assessment",
                            },
                            unit_amount: Math.round(assessmentAmount * 100),
                        },
                        quantity: 1,
                    },
                ],
                metadata: {
                    bookingId: booking._id.toString(),
                    type: "booking",
                },
            };
        } else if (orderId) {
            const order = await Order.findById(orderId);
            if (!order) {
                return res.status(404).json({ message: "Order not found" });
            }

            const billing = req.body.billing || {};
            order.fullName = billing.fullName || "";
            order.phoneNumber = billing.phoneNumber || "";
            order.address = billing.address || "";
            order.city = billing.city || "";
            order.postalCode = billing.postalCode || "";
            order.country = billing.country || "";
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
                    quantity: item.quantity,
                });
            }

            const serviceFeeRate = 0.05;
            const serviceFee = subtotal * serviceFeeRate;
            lineItems.push({
                price_data: {
                    currency: "usd",
                    product_data: { name: "Pangia Service Fee" },
                    unit_amount: Math.round(serviceFee * 100),
                },
                quantity: 1,
            });

            lineItems.push({
                price_data: {
                    currency: "usd",
                    product_data: { name: "Delivery Fee" },
                    unit_amount: Math.round(DELIVERY_FEE * 100),
                },
                quantity: 1,
            });

            sessionPayload = {
                ...sessionPayload,
                customer_email: billing.email,
                cancel_url: `${process.env.CLIENT_URL}/pages/checkout.html`,
                line_items: lineItems,
                metadata: {
                    orderId: order._id.toString(),
                    type: "order",
                },
                automatic_tax: { enabled: true },
                shipping_address_collection: { allowed_countries: ["US"] },
            };
        }

        const session = await stripe.checkout.sessions.create(sessionPayload);
        console.log("✅ Stripe checkout session:", session.url);

        res.json({ id: session.id, url: session.url });
    } catch (error) {
        console.error("❌ Stripe checkout error:", error);
        res.status(500).json({
            message: "Stripe checkout failed",
            error: error.message,
            raw: error.raw ? error.raw.message : undefined,
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
            const bookingId = session.metadata?.bookingId;

            if (bookingId) {
                const booking = await Booking.findById(bookingId);
                if (!booking) {
                    console.warn("⚠️ No booking found with ID:", bookingId);
                } else {
                    booking.paymentStatus = "paid";
                    booking.status = booking.status === "pending" ? "scheduled" : booking.status;
                    booking.stripeSessionId = session.id;
                    await booking.save();
                    console.log(`✅ Booking ${bookingId} marked as paid`);
                }
            } else if (orderId) {
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
            } else {
                console.warn("⚠️ Session missing orderId/bookingId metadata");
            }
        }

        res.json({ received: true });
    } catch (error) {
        console.error("❌ Webhook Error:", error);
        res.status(400).json({ message: "Webhook error", error });
    }
});

module.exports = router;
