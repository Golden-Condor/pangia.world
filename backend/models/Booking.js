const mongoose = require("mongoose");

const AddressSchema = new mongoose.Schema(
  {
    street: String,
    city: String,
    state: String,
    postalCode: String,
  },
  { _id: false }
);

const BookingSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    address: AddressSchema,
    serviceArea: String,
    waterSource: String,
    propertyType: String,
    concerns: String,
    preferredDate: String,
    preferredTime: String,
    contactMethod: { type: String, default: "email" },
    notes: String,
    status: {
      type: String,
      enum: ["pending", "scheduled", "in_progress", "completed", "cancelled"],
      default: "pending",
    },
    paymentStatus: {
      type: String,
      enum: ["unpaid", "paid"],
      default: "unpaid",
    },
    utm: {
      source: String,
      medium: String,
      campaign: String,
      referrer: String,
    },
    metadata: {
      userAgent: String,
    },
    stripeSessionId: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Booking", BookingSchema);
