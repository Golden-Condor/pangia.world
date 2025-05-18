const mongoose = require("mongoose");

let isConnected = false; // Track connection status

const connectDB = async () => {
    if (isConnected) {
        console.log("⚡ Using existing MongoDB connection");
        return;
    }

    try {
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        isConnected = true;
        console.log("✅ Connected to MongoDB");
    } catch (err) {
        console.error("❌ MongoDB connection error:", err);
    }
};

const disconnectDB = async () => {
    if (!isConnected) return;
    await mongoose.connection.close();
    isConnected = false;
    console.log("🔌 Disconnected from MongoDB");
};

module.exports = { connectDB, disconnectDB };