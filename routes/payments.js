const express = require("express");
const router = express.Router();
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const { Course, UserCourseAccess } = require("../models");
const authMiddleware = require("../middleware/authMiddleware");

router.post("/create-checkout-session", authMiddleware, async (req, res) => {
  try {
    const { courseId } = req.body;
    const user = req.user;

    if (!courseId) {
      return res.status(400).json({ error: "Course ID is required" });
    }

    const course = await Course.findByPk(courseId);
    if (!course) {
      return res.status(404).json({ error: "Course not found" });
    }

    const existingAccess = await UserCourseAccess.findOne({
      where: { userId: user.id, courseId },
    });
    if (existingAccess) {
      return res.status(400).json({ error: "Already enrolled in this course" });
    }

    if (!course.price || course.price <= 0) {
      return res.status(400).json({ error: "Invalid course price" });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: course.title,
              description:
                course.description || "Learn mathematics with expert guidance",
            },
            unit_amount: Math.round(course.price * 100),
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${process.env.FRONTEND_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/payment-cancel`,
      metadata: {
        userId: String(user.id),
        courseId: String(course.id),
      },
    });

    res.json({ sessionId: session.id });
  } catch (err) {
    console.error("Error creating checkout session:", {
      message: err.message,
      stack: err.stack,
      type: err.type,
      code: err.code,
    });
    res
      .status(500)
      .json({ error: `Failed to create checkout session: ${err.message}` });
  }
});

// ❌ DELETE THIS — not needed anymore
// router.get("/success", async (req, res) => { ... });

router.get("/cancel", (req, res) => {
  res.redirect(`${process.env.FRONTEND_URL}/payment-cancel`);
});

module.exports = router;
