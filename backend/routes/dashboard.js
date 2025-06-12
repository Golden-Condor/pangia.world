const express = require('express');
const router = express.Router();
const Order = require("../models/Order");
router.get("/", async (req, res) => {
  try {
    const totalOrders = await Order.countDocuments();
    const recentOrders = await Order.find({})
      .sort({ createdAt: -1 })
      .select('billing.fullName billing.email billing.phoneNumber billing.address billing.city billing.postalCode guestEmail items totalPrice paymentStatus emailSent createdAt');
    res.json({ totalOrders, recentOrders });
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    res.status(500).json({ error: "Server error while fetching dashboard data." });
  }
});
module.exports = router;
