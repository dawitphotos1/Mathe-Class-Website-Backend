
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
const { User, UserCourseAccess } = require("../models");
const authMiddleware = require("../middleware/authMiddleware");

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

// ✅ Create Stripe checkout session
router.post("/create-checkout-session", authMiddleware, async (req, res) => {
  try {
    const { courseId, courseTitle, coursePrice } = req.body;
    const user = req.user;

    if (!courseId || !courseTitle || !coursePrice) {
      return res.status(400).json({ error: "Missing required course details" });
    }

    // Save user-course entry with unapproved access (can be later updated by webhook)
    await UserCourseAccess.findOrCreate({
      where: {
        userId: user.id,
        courseId,
      },
      defaults: {
        approved: false,
        accessGrantedAt: new Date(),
      },
    });

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: courseTitle,
            },
            unit_amount: coursePrice * 100, // Stripe expects cents
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${process.env.FRONTEND_URL}/payment-success?courseId=${courseId}`,
      cancel_url: `${process.env.FRONTEND_URL}/courses`,
      customer_email: user.email, // ✅ ensures email is passed to metadata
      metadata: {
        userEmail: user.email,
        courseId: courseId.toString(),
      },
    });

    return res.status(200).json({ url: session.url });
  } catch (err) {
    console.error("❌ Stripe checkout session error:", err);
    return res.status(500).json({ error: "Failed to create checkout session" });
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
        console.error("Missing Stripe signature header");
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

        if (courseId && courseId !== "registration_fee" && userEmail) {
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
          } else {
            console.warn(`⚠️ Webhook: No user found for email ${userEmail}`);
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

