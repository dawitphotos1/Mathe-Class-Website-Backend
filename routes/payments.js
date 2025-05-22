
const express = require("express");
const router = express.Router();
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const authMiddleware = require("../middleware/authMiddleware");
const { Course, UserCourseAccess } = require("../models");
const sendEmail  = require("../utils/sendEmail");

// Verify dependencies
console.log("Payments Route - authMiddleware:", typeof authMiddleware);
console.log("Payments Route - stripe:", typeof stripe);
console.log("Payments Route - Course:", typeof Course);
console.log("Payments Route - UserCourseAccess:", typeof UserCourseAccess);
console.log("Payments Route - sendEmail:", typeof sendEmail);

router.post("/create-checkout-session", authMiddleware, async (req, res) => {
  try {
    const { courseId } = req.body;
    const user = req.user;
    console.log("Checkout Request - Body:", req.body);
    console.log("Checkout Request - User:", user);
    if (!courseId || !user?.email) {
      return res
        .status(400)
        .json({ error: "Missing required course ID or user info" });
    }

    const course = await Course.findByPk(courseId);
    if (!course) {
      return res.status(404).json({ error: "Course not found" });
    }
    console.log("Checkout - Course:", course.toJSON());

    if (!course.price || isNaN(course.price) || course.price <= 0) {
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
            },
            unit_amount: Math.round(course.price * 100), // Ensure integer
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${process.env.FRONTEND_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/cancel`,
      customer_email: user.email,
      metadata: { courseId: courseId.toString(), userId: user.id.toString() },
    });

    res.json({ url: session.url });
  } catch (err) {
    console.error("❌ Stripe checkout session error:", err.message, err.stack);
    if (err.type === "StripeInvalidRequestError") {
      return res.status(400).json({ error: `Stripe error: ${err.message}` });
    }
    if (err.type === "StripeAuthenticationError") {
      return res.status(500).json({ error: "Stripe authentication failed" });
    }
    res.status(500).json({ error: "Failed to create checkout session" });
  }
});

router.get("/session-status", authMiddleware, async (req, res) => {
  const sessionId = req.query.session_id;
  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (session.payment_status === "paid") {
      const { courseId, userId } = session.metadata;
      await UserCourseAccess.create({
        userId,
        courseId,
        approved: true,
      });
      const course = await Course.findByPk(courseId);
      await sendEmail({
        to: session.customer_email,
        subject: "Course Enrollment Confirmation",
        html: `<p>Thank you for enrolling in ${course.title}!</p>`,
      });
    }
    res.json({ status: session.payment_status });
  } catch (err) {
    console.error("❌ Session status error:", err);
    res.status(500).json({ error: "Failed to retrieve session status" });
  }
});

module.exports = router;