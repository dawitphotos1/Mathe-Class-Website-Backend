
// const express = require("express");
// const { UserCourseAccess } = require("../models");
// const router = express.Router();
// const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
// const bodyParser = require("body-parser");

// // Must use raw body parser for Stripe signature verification
// router.post(
//   "/webhook",
//   bodyParser.raw({ type: "application/json" }),
//   async (req, res) => {
//     const sig = req.headers["stripe-signature"];
//     let event;

//     try {
//       event = stripe.webhooks.constructEvent(
//         req.body,
//         sig,
//         process.env.STRIPE_WEBHOOK_SECRET
//       );
//     } catch (err) {
//       console.error(
//         "❌ Stripe webhook signature verification failed:",
//         err.message
//       );
//       return res.status(400).send(`Webhook Error: ${err.message}`);
//     }

//     // Handle checkout.session.completed
//     if (event.type === "checkout.session.completed") {
//       const session = event.data.object;
//       const userId = parseInt(session.metadata.userId);
//       const courseId = parseInt(session.metadata.courseId);

//       if (!userId || !courseId) {
//         console.error("❌ Missing userId or courseId in metadata");
//         return res.status(400).send("Invalid metadata");
//       }

//       try {
//         const [access, created] = await UserCourseAccess.findOrCreate({
//           where: { userId, courseId },
//           defaults: {
//             approved: false, // ✅ mark as pending
//             paid: true,
//             accessGrantedAt: new Date(),
//           },
//         });

//         if (!created) {
//           access.paid = true;
//           access.approved = false; // ✅ override if already existed
//           access.accessGrantedAt = new Date();
//           await access.save();
//         }

//         console.log(
//           `✅ Enrollment pending for approval: user ${userId}, course ${courseId}`
//         );
//       } catch (err) {
//         console.error("❌ Failed to save UserCourseAccess:", err);
//         return res.status(500).send("Error recording enrollment");
//       }
//     }

//     res.json({ received: true });
//   }
// );

// module.exports = router;



const express = require("express");
const router = express.Router();
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const { UserCourseAccess, User, Course } = require("../models");
const sendEmail = require("../utils/sendEmail");
const courseEnrollmentApproved = require("../utils/emails/courseEnrollmentApproved");

// Webhook endpoint
router.post(
  "/webhook",
  express.raw({ type: "application/json" }), // Raw body for Stripe signature
  async (req, res) => {
    const sig = req.headers["stripe-signature"];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event;

    try {
      event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    } catch (err) {
      console.error("❌ Webhook signature verification failed:", err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle checkout.session.completed event
    if (event.type === "checkout.session.completed") {
      const session = event.data.object;

      if (session.payment_status === "paid") {
        const { userId, courseId } = session.metadata;

        try {
          let enrollment = await UserCourseAccess.findOne({
            where: { userId, courseId },
            include: [
              { model: User, as: "user" },
              { model: Course, as: "course" },
            ],
          });

          if (!enrollment) {
            enrollment = await UserCourseAccess.create({
              userId,
              courseId,
              approved: false,
              accessGrantedAt: new Date(),
            });
            enrollment = await UserCourseAccess.findOne({
              where: { userId, courseId },
              include: [
                { model: User, as: "user" },
                { model: Course, as: "course" },
              ],
            });
          }

          // Log enrollment
          const fs = require("fs");
          const path = require("path");
          const logMsg = `[WEBHOOK-PENDING] ${new Date().toISOString()} - ${
            enrollment.user.email
          } for "${enrollment.course.title}"\n`;
          fs.appendFileSync(
            path.join(__dirname, "../logs/enrollments.log"),
            logMsg
          );

          // Send email
          const { subject, html } = courseEnrollmentApproved(
            enrollment.user,
            enrollment.course
          );
          await sendEmail(enrollment.user.email, subject, html);
        } catch (err) {
          console.error("❌ Error processing webhook:", err);
        }
      }
    }

    res.json({ received: true });
  }
);

module.exports = router;