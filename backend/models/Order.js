const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: false }, // Registered User (if applicable)
    guestEmail: { type: String, required: false }, // Guest checkout users
    items: [
        {
            productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
            productName: { type: String }, 
            quantity: { type: Number, required: true },
            price: { type: Number, required: true }
        }
    ],
    billing: {
        fullName: { type: String },
        phoneNumber: { type: String },
        address: { type: String },
        city: { type: String },
        postalCode: { type: String },
        country: { type: String },
        email: { type: String }
    },
    totalPrice: { type: Number, required: true },
    orderStatus: { type: String, enum: ["Pending", "Processing", "Shipped", "Delivered"], default: "Pending" },
    paymentStatus: { type: String, enum: ["Pending", "Paid", "Failed"], default: "Pending" },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Order", orderSchema);