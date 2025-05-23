
const express = require("express");
const router = express.Router();
const Stripe = require("stripe");
const authMiddleware = require("../middleware/authMiddleware");

const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

router.post("/create-checkout-session", authMiddleware, async (req, res) => {
  try {
    const { courseId, courseName, coursePrice } = req.body;
    console.log("Create checkout session request:", {
      courseId,
      courseName,
      coursePrice,
      userId: req.user.id,
    });

    if (
      !courseId ||
      !courseName ||
      !coursePrice ||
      isNaN(coursePrice) ||
      coursePrice <= 0
    ) {
      console.log("Invalid or missing fields");
      return res
        .status(400)
        .json({ error: "Valid course ID, name, and price are required" });
    }

    if (!process.env.STRIPE_SECRET_KEY || !process.env.FRONTEND_URL) {
      console.log("Missing environment variables");
      return res.status(500).json({ error: "Server configuration error" });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: courseName,
              description: `Enrollment for course ID: ${courseId}`,
            },
            unit_amount: Math.round(coursePrice * 100),
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${process.env.FRONTEND_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/courses`,
      metadata: {
        userId: req.user.id.toString(),
        courseId: courseId.toString(),
      },
    });

    console.log("Checkout session created:", { sessionId: session.id });
    res.json({ sessionId: session.id });
  } catch (err) {
    console.error("Failed to create checkout session:", {
      message: err.message,
      type: err.type,
      code: err.code,
      raw: err.raw,
    });
    res
      .status(500)
      .json({ error: `Failed to create checkout session: ${err.message}` });
  }
});

module.exports = router;