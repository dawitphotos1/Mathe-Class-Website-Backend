const express = require("express");
const { UserCourseAccess } = require("../models");
const router = express.Router();
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const bodyParser = require("body-parser");

// Must use raw body parser for Stripe signature verification
router.post(
  "/webhook",
  bodyParser.raw({ type: "application/json" }),
  async (req, res) => {
    const sig = req.headers["stripe-signature"];
    let event;

    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      console.error("❌ Webhook signature verification failed:", err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle checkout.session.completed
    if (event.type === "checkout.session.completed") {
      const session = event.data.object;

      const userId = parseInt(session.metadata.userId);
      const courseId = parseInt(session.metadata.courseId);

      try {
        const [access, created] = await UserCourseAccess.findOrCreate({
          where: { userId, courseId },
          defaults: {
            approved: false, // wait for teacher approval
            paid: true,
            accessGrantedAt: new Date(),
          },
        });

        if (!created) {
          access.paid = true;
          access.approved = false; // re-flag for approval
          access.accessGrantedAt = new Date();
          await access.save();
        }

        console.log(`✅ Enrollment recorded: user ${userId}, course ${courseId}`);
      } catch (err) {
        console.error("❌ Error saving course access after payment:", err);
        return res.status(500).send("Failed to record access");
      }
    }

    res.json({ received: true });
  }
);

module.exports = router;
