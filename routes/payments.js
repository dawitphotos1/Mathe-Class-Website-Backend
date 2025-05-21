
// const express = require("express");
// const router = express.Router();
// const Stripe = require("stripe");
// const { User, Course, UserCourseAccess } = require("../models");
// const authMiddleware = require("../middleware/authMiddleware");

// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
// const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

// // ✅ Create Stripe checkout session
// router.post("/create-checkout-session", authMiddleware, async (req, res) => {
//   try {
//     const { courseId } = req.body;
//     const user = req.user;
//     console.log("USER IN CHECKOUT:", user); // ✅ Add this line
//     if (!courseId || !user?.email) {
//       return res
//         .status(400)
//         .json({ error: "Missing required course ID or user info" });
//     }

//     // 🔍 Load course from DB
//     const course = await Course.findByPk(courseId);
//     if (!course) {
//       return res.status(404).json({ error: "Course not found" });
//     }

//     // 💾 Store unapproved access
//     await UserCourseAccess.findOrCreate({
//       where: { userId: user.id, courseId },
//       defaults: {
//         approved: false,
//         accessGrantedAt: new Date(),
//       },
//     });

//     // 🧾 Create Stripe Checkout Session
//     const session = await stripe.checkout.sessions.create({
//       payment_method_types: ["card"],
//       line_items: [
//         {
//           price_data: {
//             currency: "usd",
//             product_data: {
//               name: course.title,
//             },
//             unit_amount: parseInt(course.price * 100), // Convert to cents
//           },
//           quantity: 1,
//         },
//       ],
//       mode: "payment",
//       success_url: `${process.env.FRONTEND_URL}/payment-success?courseId=${courseId}`,
//       cancel_url: `${process.env.FRONTEND_URL}/courses`,
//       customer_email: user.email,
//       metadata: {
//         userEmail: user.email,
//         courseId: courseId.toString(),
//       },
//     });

//     res.status(200).json({ url: session.url });
//   } catch (err) {
//     console.error("❌ Stripe checkout session error:", err);
//     res.status(500).json({ error: "Failed to create checkout session" });
//   }
// });

// // ✅ Stripe Webhook Handler
// router.post(
//   "/webhook",
//   express.raw({ type: "application/json" }),
//   async (req, res) => {
//     try {
//       const sig = req.headers["stripe-signature"];
//       if (!sig) {
//         console.error("⚠️ Missing Stripe signature header");
//         return res.status(400).send("Missing Stripe signature");
//       }

//       const event = stripe.webhooks.constructEvent(
//         req.body,
//         sig,
//         endpointSecret
//       );

//       if (event.type === "checkout.session.completed") {
//         const session = event.data.object;
//         const { courseId, userEmail } = session.metadata || {};

//         if (courseId && userEmail) {
//           const user = await User.findOne({ where: { email: userEmail } });
//           if (user) {
//             await UserCourseAccess.update(
//               { approved: true },
//               {
//                 where: {
//                   userId: user.id,
//                   courseId: parseInt(courseId, 10),
//                 },
//               }
//             );
//             console.log(
//               `✅ Enrollment approved: ${userEmail} → Course ${courseId}`
//             );
//           }
//         }
//       }

//       res.json({ received: true });
//     } catch (err) {
//       console.error("❌ Webhook handler error:", err.message);
//       res.status(400).send(`Webhook error: ${err.message}`);
//     }
//   }
// );

// module.exports = router;


const express = require("express");
const router = express.Router();
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const authMiddleware = require("../middleware/authMiddleware"); // Fixed: Removed destructuring
const { Course, UserCourseAccess } = require("../models");
const { sendEmail } = require("../utils/sendEmail");

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

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: course.title,
            },
            unit_amount: course.price * 100,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${process.env.FRONTEND_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/cancel`,
      customer_email: user.email,
      metadata: {
        courseId: courseId.toString(),
        userId: user.userId.toString(),
      },
    });

    res.json({ url: session.url });
  } catch (err) {
    console.error("❌ Stripe checkout session error:", err);
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
    console.error(err);
    res.status(500).json({ error: "Failed to retrieve session status" });
  }
});

module.exports = router;