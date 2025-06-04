// // controllers/paymentController.js
// const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

// const createCheckoutSession = async (req, res) => {
//   try {
//     const { courseId, courseTitle, coursePrice } = req.body;

//     if (!courseId || !courseTitle || !coursePrice) {
//       return res.status(400).json({ error: "Missing course information" });
//     }

//     const session = await stripe.checkout.sessions.create({
//       payment_method_types: ["card"],
//       mode: "payment",
//       line_items: [
//         {
//           price_data: {
//             currency: "usd",
//             product_data: {
//               name: courseTitle,
//             },
//             unit_amount: Math.round(coursePrice * 100), // Stripe uses cents
//           },
//           quantity: 1,
//         },
//       ],
//       metadata: {
//         courseId: courseId,
//       },
//       success_url: `${process.env.FRONTEND_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
//       cancel_url: `${process.env.FRONTEND_URL}/payment-cancelled`,
//     });

//     res.status(200).json({ url: session.url });
//   } catch (error) {
//     console.error("❌ Stripe checkout error:", error);
//     res.status(500).json({ error: "Failed to create checkout session" });
//   }
// };


// // controllers/paymentController.js
// const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
// const { UserCourseAccess } = require("../models");

// const createCheckoutSession = async (req, res) => {
//   try {
//     const { courseId, courseTitle, coursePrice } = req.body;

//     if (!courseId || !courseTitle || !coursePrice) {
//       return res.status(400).json({ error: "Missing course information" });
//     }

//     const session = await stripe.checkout.sessions.create({
//       payment_method_types: ["card"],
//       mode: "payment",
//       line_items: [
//         {
//           price_data: {
//             currency: "usd",
//             product_data: { name: courseTitle },
//             unit_amount: Math.round(coursePrice * 100),
//           },
//           quantity: 1,
//         },
//       ],
//       metadata: {
//         userId: String(req.user.id),   // from authMiddleware
//         courseId: String(courseId),
//       },
//       success_url: `${process.env.FRONTEND_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
//       cancel_url: `${process.env.FRONTEND_URL}/payment-cancelled`,
//     });

//     res.status(200).json({ url: session.url });
//   } catch (error) {
//     console.error("❌ Stripe checkout error:", error);
//     res.status(500).json({ error: "Failed to create checkout session" });
//   }
// };

// const confirmPayment = async (req, res) => {
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

//     const { courseId, userId } = session.metadata;

//     if (parseInt(userId) !== user.id) {
//       return res.status(403).json({ error: "Unauthorized confirmation attempt" });
//     }

//     const existing = await UserCourseAccess.findOne({
//       where: { userId, courseId },
//     });

//     if (existing) {
//       return res.status(200).json({ success: true, message: "Already enrolled" });
//     }

//     await UserCourseAccess.create({
//       userId,
//       courseId,
//       status: "pending", // Wait for admin/teacher approval
//     });

//     res.status(200).json({ success: true, message: "Enrollment recorded" });
//   } catch (err) {
//     console.error("❌ Payment confirmation error:", err);
//     res.status(500).json({ error: "Failed to confirm enrollment" });
//   }
// };

// module.exports = {
//   createCheckoutSession,
//   confirmPayment,
// };








// module.exports = { createCheckoutSession };




const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const { UserCourseAccess } = require("../models");

// @desc    Create Stripe checkout session
// @route   POST /api/payment/create-checkout-session
// @access  Private
const createCheckoutSession = async (req, res) => {
  try {
    const { courseId, courseTitle, coursePrice } = req.body;

    // Validate required fields
    if (!courseId || !courseTitle || !coursePrice) {
      return res.status(400).json({ error: "Missing course information" });
    }

    // Ensure user is authenticated
    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: courseTitle,
            },
            unit_amount: Math.round(coursePrice * 100), // Stripe uses cents
          },
          quantity: 1,
        },
      ],
      metadata: {
        userId: String(req.user.id),
        courseId: String(courseId),
      },
      success_url: `${process.env.FRONTEND_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/payment-cancelled`,
    });

    // Optional: log session in development
    if (process.env.NODE_ENV === "development") {
      console.log("✅ Stripe Session:", session);
    }

    res.status(200).json({ url: session.url });
  } catch (error) {
    console.error("❌ Stripe checkout error:", error);
    res.status(500).json({ error: "Failed to create checkout session" });
  }
};

// @desc    Confirm payment after success
// @route   POST /api/payment/confirm
// @access  Private
const confirmPayment = async (req, res) => {
  try {
    const sessionId = req.body.session_id;

    if (!sessionId) {
      return res.status(400).json({ error: "Missing session ID" });
    }

    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (!session || session.payment_status !== "paid") {
      return res.status(400).json({ error: "Payment not completed" });
    }

    const { courseId, userId } = session.metadata;

    if (parseInt(userId) !== req.user.id) {
      return res
        .status(403)
        .json({ error: "Unauthorized confirmation attempt" });
    }

    const existing = await UserCourseAccess.findOne({
      where: { userId, courseId },
    });

    if (existing) {
      return res
        .status(200)
        .json({ success: true, message: "Already enrolled" });
    }

    await UserCourseAccess.create({
      userId,
      courseId,
      status: "pending", // Admin/teacher approval needed
    });

    res.status(200).json({ success: true, message: "Enrollment recorded" });
  } catch (err) {
    console.error("❌ Payment confirmation error:", err);
    res.status(500).json({ error: "Failed to confirm enrollment" });
  }
};

module.exports = {
  createCheckoutSession,
  confirmPayment,
};
