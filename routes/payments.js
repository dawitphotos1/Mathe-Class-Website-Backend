// // payments.js
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
//       return res.status(400).json({ error: "Course ID is required" });
//     }

//     const course = await Course.findByPk(courseId);
//     if (!course) {
//       return res.status(404).json({ error: "Course not found" });
//     }

//     const existingAccess = await UserCourseAccess.findOne({
//       where: { userId: user.id, courseId },
//     });
//     if (existingAccess) {
//       return res.status(400).json({ error: "Already enrolled in this course" });
//     }

//     const price = parseFloat(course.price);
//     if (isNaN(price) || price <= 0) {
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
//               description: course.description || "Learn mathematics with expert guidance",
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

//     res.status(200).json({ sessionId: session.id });
//   } catch (err) {
//     console.error("❌ Error creating checkout session:", err);
//     res.status(500).json({ error: `Failed to create checkout session: ${err.message}` });
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

//     const existingAccess = await UserCourseAccess.findOne({ where: { userId, courseId } });
//     if (existingAccess) {
//       return res.status(200).json({ success: true, message: "Already enrolled" });
//     }

//     await UserCourseAccess.create({
//       userId,
//       courseId,
//       accessGrantedAt: new Date(),
//     });

//     res.status(200).json({ success: true, message: "Enrollment confirmed" });
//   } catch (err) {
//     console.error("❌ Error confirming payment:", {
//       message: err.message,
//       stack: err.stack,
//       metadata: err?.session?.metadata,
//     });
//     res.status(500).json({ error: "Failed to confirm enrollment" });
//   }
// });

// module.exports = router;




const express = require("express");
const router = express.Router();
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const { Course, UserCourseAccess, User } = require("../models");
const authMiddleware = require("../middleware/authMiddleware");
const sendEmail = require("../utils/sendEmail");
const courseEnrollmentPending = require("../utils/emails/courseEnrollmentPending");
const enrollmentPendingAdmin = require("../utils/emails/enrollmentPendingAdmin");

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
              description:
                course.description || "Learn mathematics with expert guidance",
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
    res
      .status(500)
      .json({ error: `Failed to create checkout session: ${err.message}` });
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
    const metadataUserId = parseInt(metadata?.userId);
    const authenticatedUserId = parseInt(user.id);

    if (
      !courseId ||
      !metadataUserId ||
      metadataUserId !== authenticatedUserId
    ) {
      console.warn("❌ Invalid metadata or mismatched user.");
      console.log("Metadata:", metadata);
      console.log("Authenticated user ID:", authenticatedUserId);
      return res.status(400).json({ error: "Invalid or mismatched metadata" });
    }

    const existingAccess = await UserCourseAccess.findOne({
      where: { userId: authenticatedUserId, courseId },
    });

    if (existingAccess) {
      return res
        .status(200)
        .json({ success: true, message: "Already enrolled" });
    }

    await UserCourseAccess.create({
      userId: authenticatedUserId,
      courseId,
      accessGrantedAt: new Date(),
      approved: false, // Requires admin approval
    });

    // ✅ Send emails
    const student = await User.findByPk(authenticatedUserId);
    const course = await Course.findByPk(courseId);

    if (student && course) {
      // Email to student
      const { subject, html } = courseEnrollmentPending(student, course);
      await sendEmail(student.email, subject, html);

      // ✅ Dynamically send to all admins
      const adminUsers = await User.findAll({ where: { role: "admin" } });
      for (const admin of adminUsers) {
        const adminEmailContent = enrollmentPendingAdmin(student, course);
        await sendEmail(
          admin.email,
          adminEmailContent.subject,
          adminEmailContent.html
        );
      }
    }

    res.status(200).json({
      success: true,
      message: "Enrollment confirmed and pending approval",
    });
  } catch (err) {
    console.error("❌ Error confirming payment:", {
      message: err.message,
      stack: err.stack,
    });
    res.status(500).json({ error: "Failed to confirm enrollment" });
  }
});

module.exports = router;
