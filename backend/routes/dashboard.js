const express = require('express');
const router = express.Router();
// const Order = require("../models/order");
router.get("/dashboard", async (req, res) => {
  res.send("Dashboard route reached.");
});
module.exports = router;