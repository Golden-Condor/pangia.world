const express = require('express');
const router = express.Router();
const Order = require("../models/order");
router.get("/dashboard", async (req, res) => {
  const orders = await Order.find({ paymentStatus: "Paid" }).sort({ createdAt: -1 }).limit(20);
  const totalPlatformCut = orders.reduce((sum, order) => sum + (order.platformCut || 0), 0);

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const recentOrders = orders.filter(order => order.createdAt >= sevenDaysAgo);
  const last7DaysCut = recentOrders.reduce((sum, order) => sum + (order.platformCut || 0), 0);

  res.render("dashboard", { orders, totalPlatformCut, last7DaysCut });
});
module.exports = router;