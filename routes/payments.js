
// const express = require("express");
// const router = express.Router();
// const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
// const { Course, UserCourseAccess } = require("../models");
// const authMiddleware = require("../middleware/authMiddleware");

// // ✅ Create Stripe Checkout Session
// router.post("/create-checkout-session", authMiddleware, async (req, res) => {
//   try {
//     const { courseId } = req.body;
//     const user = req.user;

//     if (!courseId) {
//       console.error("❌ No courseId provided");
//       return res.status(400).json({ error: "Course ID is required" });
//     }

//     console.log("💡 Received courseId:", courseId, "from user:", user?.id);

//     const course = await Course.findByPk(courseId);

//     if (!course) {
//       console.error("❌ Course not found in DB:", courseId);
//       return res.status(404).json({ error: "Course not found" });
//     }

//     console.log("✅ Found course:", {
//       id: course.id,
//       title: course.title,
//       price: course.price,
//     });

//     const existingAccess = await UserCourseAccess.findOne({
//       where: { userId: user.id, courseId },
//     });

//     if (existingAccess) {
//       console.warn("⚠️ User already enrolled:", user.id);
//       return res.status(400).json({ error: "Already enrolled in this course" });
//     }

//     const price = parseFloat(course.price);
//     if (isNaN(price) || price <= 0) {
//       console.error("❌ Invalid course price:", course.price);
//       return res.status(400).json({ error: "Invalid course price" });
//     }

//     const session = await stripe.checkout.sessions.create({
//       payment_method_types: ["card"],
//       line_items: [
//         {
//           price_data: {
//             currency: "usd",
//             product_data: {
//               name: course.title,
//               description:
//                 course.description || "Learn mathematics with expert guidance",
//             },
//             unit_amount: Math.round(price * 100),
//           },
//           quantity: 1,
//         },
//       ],
//       mode: "payment",
//       success_url: `${process.env.FRONTEND_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
//       cancel_url: `${process.env.FRONTEND_URL}/payment-cancel`,
//       metadata: {
//         userId: String(user.id),
//         courseId: String(course.id),
//       },
//     });

//     console.log("✅ Stripe session created:", session.id);

//     res.status(200).json({ sessionId: session.id });
//   } catch (err) {
//     console.error("❌ Error creating checkout session:", {
//       message: err.message,
//       stack: err.stack,
//       type: err.type,
//       code: err.code,
//     });

//     res.status(500).json({
//       error: `Failed to create checkout session: ${err.message}`,
//     });
//   }
// });

// // ✅ Confirm payment and record enrollment
// router.post("/confirm", authMiddleware, async (req, res) => {
//   try {
//     const sessionId = req.body.session_id;
//     const user = req.user;

//     if (!sessionId) {
//       return res.status(400).json({ error: "Missing session ID" });
//     }

//     const session = await stripe.checkout.sessions.retrieve(sessionId);

//     if (!session || session.payment_status !== "paid") {
//       return res.status(400).json({ error: "Payment not completed" });
//     }

//     const metadata = session.metadata;
//     const courseId = parseInt(metadata?.courseId);
//     const userId = parseInt(metadata?.userId);

//     if (!courseId || !userId || user.id !== userId) {
//       return res.status(400).json({ error: "Invalid or mismatched metadata" });
//     }

//     const existingAccess = await UserCourseAccess.findOne({
//       where: { userId, courseId },
//     });

//     if (existingAccess) {
//       console.warn("⚠️ User already enrolled:", userId);
//       return res
//         .status(200)
//         .json({ success: true, message: "Already enrolled" });
//     }

//     await UserCourseAccess.create({
//       userId,
//       courseId,
//       status: "pending", // assuming approval system
//     });

//     console.log("✅ Enrollment recorded:", { userId, courseId });

//     res.status(200).json({ success: true, message: "Enrollment recorded" });
//   } catch (err) {
//     console.error("❌ Error confirming payment:", {
//       message: err.message,
//       stack: err.stack,
//     });

//     res.status(500).json({ error: "Failed to confirm enrollment" });
//   }
// });

// module.exports = router;




// payments.js
const express = require("express");
const router = express.Router();
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const { Course, UserCourseAccess } = require("../models");
const authMiddleware = require("../middleware/authMiddleware");

// ✅ Create Stripe Checkout Session
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

    const price = parseFloat(course.price);
    if (isNaN(price) || price <= 0) {
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
              description: course.description || "Learn mathematics with expert guidance",
            },
            unit_amount: Math.round(price * 100),
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

    res.status(200).json({ sessionId: session.id });
  } catch (err) {
    console.error("❌ Error creating checkout session:", err);
    res.status(500).json({ error: `Failed to create checkout session: ${err.message}` });
  }
});

// ✅ Confirm payment and record enrollment
router.post("/confirm", authMiddleware, async (req, res) => {
  try {
    const sessionId = req.body.session_id;
    const user = req.user;

    if (!sessionId) {
      return res.status(400).json({ error: "Missing session ID" });
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (!session || session.payment_status !== "paid") {
      return res.status(400).json({ error: "Payment not completed" });
    }

    const metadata = session.metadata;
    const courseId = parseInt(metadata?.courseId);
    const userId = parseInt(metadata?.userId);

    if (!courseId || !userId || user.id !== userId) {
      return res.status(400).json({ error: "Invalid or mismatched metadata" });
    }

    const existingAccess = await UserCourseAccess.findOne({ where: { userId, courseId } });
    if (existingAccess) {
      return res.status(200).json({ success: true, message: "Already enrolled" });
    }

    await UserCourseAccess.create({
      userId,
      courseId,
      accessGrantedAt: new Date(),
    });

    res.status(200).json({ success: true, message: "Enrollment confirmed" });
  } catch (err) {
    console.error("❌ Error confirming payment:", err);
    res.status(500).json({ error: "Failed to confirm enrollment" });
  }
});

module.exports = router;