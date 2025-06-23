const express = require('express');
const router = express.Router();
const Order = require("../models/Order");
const dotenv = require('dotenv');
dotenv.config();

router.use((req, res, next) => {
  const auth = req.headers.authorization || '';
  const [type, credentials] = auth.split(' ');
  if (type !== 'Basic' || !credentials) {
    res.setHeader('WWW-Authenticate', 'Basic');
    return res.status(401).send('Authentication required');
  }

  const decoded = Buffer.from(credentials, 'base64').toString();
  const [user, pass] = decoded.split(':');

  const validUser = user === 'connor';
  const validPass = pass === process.env.DASHBOARD_PASSWORD;

  if (!validUser || !validPass) {
    return res.status(403).send('Access denied');
  }

  next();
});

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
