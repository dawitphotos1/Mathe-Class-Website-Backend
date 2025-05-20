
// const express = require("express");
// const router = express.Router();
// const Stripe = require("stripe");
// const { User, UserCourseAccess } = require("../models"); // Your Sequelize models

// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
// const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

// router.post(
//   "/webhook",
//   express.raw({ type: "application/json" }),
//   async (req, res) => {
//     try {
//       const sig = req.headers["stripe-signature"];
//       if (!sig) {
//         console.error("Missing Stripe signature header");
//         return res.status(400).send("Missing Stripe signature");
//       }

//       // Verify webhook signature and construct event
//       const event = stripe.webhooks.constructEvent(
//         req.body,
//         sig,
//         endpointSecret
//       );

//       // Handle the checkout.session.completed event
//       if (event.type === "checkout.session.completed") {
//         const session = event.data.object;
//         const { courseId, userEmail } = session.metadata || {};

//         // Skip registration_fee or invalid metadata
//         if (courseId && courseId !== "registration_fee" && userEmail) {
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
//               `✅ Approved enrollment for user ${userEmail}, course ${courseId}`
//             );
//           } else {
//             console.warn(`User not found for email: ${userEmail}`);
//           }
//         }
//       }

//       // Respond to Stripe to acknowledge receipt of the event
//       res.json({ received: true });
//     } catch (err) {
//       console.error("Webhook handler error:", err.message);
//       res.status(400).send(`Webhook handler error: ${err.message}`);
//     }
//   }
// );

// module.exports = router;



const express = require("express");
const router = express.Router();
const Stripe = require("stripe");
const { User, Course, UserCourseAccess } = require("../models");
const authMiddleware = require("../middleware/authMiddleware");

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

// ✅ Create Stripe checkout session
router.post("/create-checkout-session", authMiddleware, async (req, res) => {
  try {
    const { courseId } = req.body;
    const user = req.user;

    if (!courseId || !user?.email) {
      return res
        .status(400)
        .json({ error: "Missing required course ID or user info" });
    }

    // 🔍 Load course from DB
    const course = await Course.findByPk(courseId);
    if (!course) {
      return res.status(404).json({ error: "Course not found" });
    }

    // 💾 Store unapproved access
    await UserCourseAccess.findOrCreate({
      where: { userId: user.id, courseId },
      defaults: {
        approved: false,
        accessGrantedAt: new Date(),
      },
    });

    // 🧾 Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: course.title,
            },
            unit_amount: parseInt(course.price * 100), // Convert to cents
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${process.env.FRONTEND_URL}/payment-success?courseId=${courseId}`,
      cancel_url: `${process.env.FRONTEND_URL}/courses`,
      customer_email: user.email,
      metadata: {
        userEmail: user.email,
        courseId: courseId.toString(),
      },
    });

    res.status(200).json({ url: session.url });
  } catch (err) {
    console.error("❌ Stripe checkout session error:", err);
    res.status(500).json({ error: "Failed to create checkout session" });
  }
});

// ✅ Stripe Webhook Handler
router.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    try {
      const sig = req.headers["stripe-signature"];
      if (!sig) {
        console.error("⚠️ Missing Stripe signature header");
        return res.status(400).send("Missing Stripe signature");
      }

      const event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        endpointSecret
      );

      if (event.type === "checkout.session.completed") {
        const session = event.data.object;
        const { courseId, userEmail } = session.metadata || {};

        if (courseId && userEmail) {
          const user = await User.findOne({ where: { email: userEmail } });
          if (user) {
            await UserCourseAccess.update(
              { approved: true },
              {
                where: {
                  userId: user.id,
                  courseId: parseInt(courseId, 10),
                },
              }
            );
            console.log(
              `✅ Enrollment approved: ${userEmail} → Course ${courseId}`
            );
          }
        }
      }

      res.json({ received: true });
    } catch (err) {
      console.error("❌ Webhook handler error:", err.message);
      res.status(400).send(`Webhook error: ${err.message}`);
    }
  }
);

module.exports = router;
