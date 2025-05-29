const express = require("express");
const router = express.Router();
const Stripe = require("stripe");
const authMiddleware = require("../middleware/authMiddleware");
const { Course } = require("../models");

const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

router.post("/create-checkout-session", authMiddleware, async (req, res) => {
  try {
    const { courseId, courseName, coursePrice } = req.body;
    const parsedCourseId = parseInt(courseId, 10);
    const parsedPrice = parseFloat(coursePrice);

    console.log("Create checkout session:", {
      courseId,
      parsedCourseId,
      courseName,
      coursePrice,
      parsedPrice,
      userId: req.user?.id,
    });

    // Validate inputs
    if (
      !parsedCourseId ||
      isNaN(parsedCourseId) ||
      !courseName?.trim() ||
      isNaN(parsedPrice) ||
      parsedPrice <= 0
    ) {
      console.log("Invalid data received:", {
        courseId,
        parsedCourseId,
        courseName,
        coursePrice,
      });
      return res
        .status(400)
        .json({ error: "Valid course ID, name, and price are required" });
    }

    // Verify course exists
    const course = await Course.findByPk(parsedCourseId);
    if (!course) {
      console.log(`Course not found for ID: ${parsedCourseId}`);
      return res
        .status(404)
        .json({ error: `Course not found for ID ${parsedCourseId}` });
    }

    // Validate course details
    if (
      course.title !== courseName ||
      parseFloat(course.price) !== parsedPrice
    ) {
      console.log("Course details mismatch:", {
        provided: { courseName, coursePrice: parsedPrice },
        expected: { title: course.title, price: parseFloat(course.price) },
      });
      return res.status(400).json({ error: "Course details do not match" });
    }

    if (!process.env.STRIPE_SECRET_KEY || !process.env.FRONTEND_URL) {
      console.error("Missing environment variables");
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
              description: `Enrollment for course ID: ${parsedCourseId}`,
            },
            unit_amount: Math.round(parsedPrice * 100),
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${process.env.FRONTEND_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/courses`,
      metadata: {
        userId: req.user.id.toString(),
        courseId: parsedCourseId.toString(),
      },
    });

    console.log("Checkout session created:", {
      sessionId: session.id,
      metadata: session.metadata,
    });
    res.json({ sessionId: session.id });
  } catch (err) {
    console.error("Error creating checkout session:", {
      message: err.message,
      stack: err.stack,
    });
    res.status(500).json({ error: "Failed to create checkout session" });
  }
});

module.exports = router;