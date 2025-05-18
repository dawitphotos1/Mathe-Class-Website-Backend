// const express = require("express");
// const router = express.Router();
// const Stripe = require("stripe");
// const { User, UserCourseAccess } = require("../models"); // ✅ Include your models
// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
// const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

// router.post(
//   "/webhook",
//   express.raw({ type: "application/json" }),
//   async (req, res) => {
//     const sig = req.headers["stripe-signature"];
//     let event;

//     try {
//       event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
//     } catch (err) {
//       console.error("Webhook signature verification failed:", err.message);
//       return res.status(400).send(`Webhook Error: ${err.message}`);
//     }

//     if (event.type === "checkout.session.completed") {
//       const session = event.data.object;
//       const { courseId, userEmail } = session.metadata;

//       if (courseId !== "registration_fee") {
//         try {
//           const user = await User.findOne({ where: { email: userEmail } });
//           if (user) {
//             await UserCourseAccess.update(
//               { approved: true },
//               {
//                 where: {
//                   userId: user.id,
//                   courseId: parseInt(courseId),
//                 },
//               }
//             );
//             console.log(
//               `✅ Approved enrollment for user ${userEmail}, course ${courseId}`
//             );
//           }
//         } catch (dbError) {
//           console.error("❌ Error updating course access:", dbError);
//         }
//       }
//     }

//     res.json({ received: true });
//   }
// );

// // ✅ Make sure you export the router!
// module.exports = router;



const express = require("express");
const router = express.Router();
const Stripe = require("stripe");
const { User, UserCourseAccess } = require("../models"); // Your Sequelize models

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

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

      // Verify webhook signature and construct event
      const event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        endpointSecret
      );

      // Handle the checkout.session.completed event
      if (event.type === "checkout.session.completed") {
        const session = event.data.object;
        const { courseId, userEmail } = session.metadata || {};

        // Skip registration_fee or invalid metadata
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
              `✅ Approved enrollment for user ${userEmail}, course ${courseId}`
            );
          } else {
            console.warn(`User not found for email: ${userEmail}`);
          }
        }
      }

      // Respond to Stripe to acknowledge receipt of the event
      res.json({ received: true });
    } catch (err) {
      console.error("Webhook handler error:", err.message);
      res.status(400).send(`Webhook handler error: ${err.message}`);
    }
  }
);

module.exports = router;
