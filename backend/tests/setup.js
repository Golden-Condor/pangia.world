const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(express.json());
app.use(cors());

// ✅ Import routes
const authRoutes = require("../routes/auth");
app.use("/api/auth", authRoutes); // ✅ Ensure this line exists

const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== "test") {
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
}

module.exports = app; // ✅ Make sure to export the app for testing