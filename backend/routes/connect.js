const express = require("express");
const router = express.Router();
const Stripe = require("stripe");
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

router.post("/create-onboarding-link", async (req, res) => {
  try {
    // 1. Create a Connected Account (Express)
    const account = await stripe.accounts.create({
      type: "express",
      email: "alistair@avlspring.com", // Or pull from req.body if dynamic
      capabilities: {
        transfers: { requested: true }
      }
    });

    // 2. Generate Onboarding Link
    const accountLink = await stripe.accountLinks.create({
      account: account.id,
      refresh_url: "https://pangia.world/onboarding-refresh",
      return_url: "https://pangia.world/onboarding-complete",
      type: "account_onboarding"
    });

    res.json({
      accountId: account.id,
      onboardingLink: accountLink.url
    });
  } catch (err) {
    console.error("❌ Stripe Connect Error:", err);
    res.status(500).json({ error: err.message });
  }
});

router.post("/generate-onboarding-link", async (req, res) => {
  const { accountId } = req.body;

  try {
    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: "https://pangia.world/onboarding-refresh",
      return_url: "https://pangia.world/onboarding-complete",
      type: "account_onboarding"
    });

    res.json({ onboardingLink: accountLink.url });
  } catch (err) {
    console.error("❌ Error generating onboarding link:", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;