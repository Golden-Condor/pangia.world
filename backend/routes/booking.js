const express = require("express");
const Booking = require("../models/Booking");
const fetch = require("node-fetch");

const router = express.Router();

const REQUIRED_FIELDS = ["fullName", "email", "phone"];
const SLACK_WEBHOOK_URL = process.env.SLACK_WEBHOOK_URL;

const extractPreferredPlan = (body = {}) => {
  if (body.preferredPlan || body["preferred-plan"]) {
    return body.preferredPlan || body["preferred-plan"];
  }
  const noteSource = body.notes || "";
  const match = noteSource.match(/Preferred Plan:\s*(.+)/i);
  return match ? match[1].trim() : null;
};

async function sendSlackNotification(booking, preferredPlan) {
  if (!SLACK_WEBHOOK_URL) return;

  const heading =
    booking.originType === "quote"
      ? "*📝 New Pangia quote request*"
      : "*✅ New Pangia booking*";

  const lines = [
    heading,
    `• Name: ${booking.fullName || "N/A"}`,
    `• Email: ${booking.email || "N/A"}`,
    `• Phone: ${booking.phone || "N/A"}`,
    `• ZIP: ${booking.address?.postalCode || booking.serviceArea || "N/A"}`,
    `• Water source: ${booking.waterSource || "N/A"}`,
  ];

  if (preferredPlan) {
    lines.push(`• Preferred plan: ${preferredPlan}`);
  }

  const notesPreview = booking.notes
    ? booking.notes.substring(0, 280)
    : booking.concerns || "";

  if (notesPreview) {
    lines.push(`• Notes: ${notesPreview}`);
  }

  const payload = { text: lines.join("\n") };

  await fetch(SLACK_WEBHOOK_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

router.post("/create", async (req, res) => {
  try {
    if (req.body["contact-code"] || req.body.honeypot) {
      return res.status(204).send();
    }

    const errors = [];
    REQUIRED_FIELDS.forEach((field) => {
      if (!req.body[field]) {
        errors.push(`${field} is required`);
      }
    });

    const address =
      req.body.address && typeof req.body.address === "object"
        ? req.body.address
        : {
            street: req.body.address || "",
            city: req.body.city || "",
            state: req.body.state || "",
            postalCode: req.body.postalCode || req.body["postal-code"] || "",
          };

    if (!address.postalCode) {
      errors.push("postalCode is required");
    }

    if (errors.length) {
      return res.status(400).json({ message: "Validation failed", errors });
    }

    const preferredPlan = extractPreferredPlan(req.body);
    const originType = req.body.originType || "unknown";

    const booking = new Booking({
      fullName: req.body.fullName,
      email: req.body.email,
      phone: req.body.phone,
      address,
      serviceArea: req.body.serviceArea || address.postalCode,
      waterSource: req.body.waterSource || req.body["water-source"],
      propertyType: req.body.propertyType || req.body["property-type"],
      concerns: req.body.concerns || "",
      preferredDate: req.body.preferredDate || req.body["preferred-date"] || "",
      preferredTime: req.body.preferredTime || req.body["preferred-time"] || "",
      contactMethod: req.body.contactMethod || req.body["contact-method"] || "email",
      notes: req.body.notes || "",
      utm: {
        source: req.body.utm_source || null,
        medium: req.body.utm_medium || null,
        campaign: req.body.utm_campaign || null,
        referrer: req.body.referrer || req.get("referer") || null,
      },
      metadata: {
        userAgent: req.headers["user-agent"] || "",
      },
      originType,
    });

    await booking.save();

    sendSlackNotification(booking, preferredPlan).catch((err) =>
      console.error("❌ Slack notification failed:", err.message)
    );

    res.status(201).json({
      message: "Booking created",
      bookingId: booking._id,
      booking,
    });
  } catch (error) {
    console.error("❌ Booking creation error:", error);
    res.status(500).json({ message: "Unable to create booking", error: error.message });
  }
});

module.exports = router;
