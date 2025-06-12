const express = require('express');
const router = express.Router();
const Order = require("../models/Order");
router.get("/", async (req, res) => {
  try {
    const totalOrders = await Order.countDocuments();
    const recentOrders = await Order.find({})
      .sort({ createdAt: -1 })
      .limit(10)
      .select('billing.fullName paymentStatus emailSent guestEmail createdAt');
    res.json({ totalOrders, recentOrders });
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    res.status(500).json({ error: "Server error while fetching dashboard data." });
  }
});
module.exports = router;