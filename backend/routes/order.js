const express = require("express");
const Order = require("../models/Order");
const { protect } = require("../middlewares/authMiddleware"); // Middleware for user authentication
const mongoose = require("mongoose");
const Product = require("../models/Product");

const router = express.Router();

/** 📌 Create a new order */
router.post("/create", async (req, res) => {
    try {
        console.log("🟡 Raw Request Headers:", req.headers); // Debug Headers
        console.log("🟡 Raw Request Body:", req.body); // Debug Body
        console.log("🟡 Debugging Order Request Body:", JSON.stringify(req.body, null, 2)); // Debug full request body


        const { userId = null, guestEmail, items } = req.body;

        // Normalize incoming UTM/referrer fields into a trackingInfo object
        const trackingInfo = {
          utmSource: req.body.utm_source || req.query.utm_source || null,
          utmMedium: req.body.utm_medium || req.query.utm_medium || null,
          utmCampaign: req.body.utm_campaign || req.query.utm_campaign || null,
          referrer: req.body.referrer || req.get('referer') || null,
          userAgent: req.headers['user-agent'] || null
        };

        if (!req.body.items || req.body.items.length === 0) {
            return res.status(400).json({ message: "Order items are required" });
        }

        console.log("🟢 Order Data Before Insert:", { userId, guestEmail, items });
        console.log("🧪 Looking for:", items[0].productId);

        const translatedItems = await Promise.all(items.map(async (item) => {
          const product = await Product.findOne({ slug: item.productId });
          if (!product) {
            throw new Error(`❌ Product not found in MongoDB for slug: ${item.productId}`);
          }

          const productName = product.name || item.productName || "Unnamed Product";
          const price = product.price;
          const quantity = item.quantity;

          return {
            productId: product._id,
            productName,
            quantity,
            price,
          };
        }));

        const DELIVERY_FEE = 4.50;
        const totalPrice = translatedItems.reduce((sum, item) => sum + item.price * item.quantity, 0) + DELIVERY_FEE;

        const {
            fullName,
            phoneNumber,
            address,
            city,
            postalCode,
            country,
            email = guestEmail
        } = req.body;

        const order = new Order({
            user: userId || null,
            guestEmail: guestEmail || null,
            fullName,
            phoneNumber,
            address,
            city,
            postalCode,
            country,
            items: translatedItems,
            totalPrice,
            deliveryFee: DELIVERY_FEE,
            billing: {
                fullName: req.body.fullName,
                phoneNumber: req.body.phoneNumber,
                address: req.body.address,
                city: req.body.city,
                postalCode: req.body.postalCode,
                country: req.body.country,
                email: req.body.email || req.body.guestEmail
            },
            trackingInfo,
        });
        await order.save();

        res.status(201).json({ message: "Order placed successfully", order });
    } catch (error) {
        console.error("❌ Order Placement Error:", error);
        res.status(500).json({ message: "Error placing order", error: error.message });
    }
});

/** 📌 Get order details */
router.get("/:orderId", protect, async (req, res) => {
    try {
        const order = await Order.findById(req.params.orderId);
        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }
        res.json(order);
    } catch (error) {
        res.status(500).json({ message: "Error fetching order", error });
    }
});

/** 📌 Get all orders for a user */
router.get("/user/:userId", protect, async (req, res) => {
    try {
        const orders = await Order.find({ user: req.params.userId });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: "Error fetching orders", error });
    }
});

module.exports = router;