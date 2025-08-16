
// const Stripe = require("stripe");
// const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

// // ✅ Confirm Stripe payment
// const confirmPayment = async (req, res) => {
//   try {
//     const { session_id } = req.body;
//     if (!session_id) {
//       return res
//         .status(400)
//         .json({ success: false, error: "Missing session_id" });
//     }

//     // ✅ Retrieve session from Stripe
//     const session = await stripe.checkout.sessions.retrieve(session_id);

//     if (!session) {
//       return res
//         .status(404)
//         .json({ success: false, error: "Session not found" });
//     }

//     if (session.payment_status !== "paid") {
//       return res
//         .status(400)
//         .json({ success: false, error: "Payment not completed" });
//     }

//     // ✅ Log or return session details
//     res.json({
//       success: true,
//       message: "Payment confirmed",
//       data: {
//         id: session.id,
//         amount_total: session.amount_total,
//         currency: session.currency,
//         payment_status: session.payment_status,
//         customer_email: session.customer_details?.email,
//       },
//     });
//   } catch (error) {
//     console.error("Error confirming payment:", error);
//     res
//       .status(500)
//       .json({ success: false, error: "Failed to confirm payment" });
//   }
// };

// module.exports = { confirmPayment };



// controllers/paymentController.js
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { UserCourseAccess, Course, User } = require('../models');

exports.createCheckoutSession = async (req, res) => {
  try {
    const { courseId } = req.body;
    const user = req.user; // From auth middleware
    console.log(`Creating checkout session for user ${user.id}, course ${courseId}`);

    // Validate course
    const course = await Course.findByPk(courseId);
    if (!course) {
      console.log(`Course with id ${courseId} not found`);
      return res.status(404).json({ error: 'Course not found' });
    }

    // Check for existing enrollment
    const existingEnrollment = await UserCourseAccess.findOne({
      where: {
        user_id: user.id, // Use snake_case
        course_id: courseId, // Use snake_case
      },
    });

    if (existingEnrollment) {
      console.log(`User ${user.id} already enrolled in course ${courseId}`);
      return res.status(400).json({ error: 'Already enrolled in this course' });
    }

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: course.title,
            },
            unit_amount: Math.round(course.price * 100), // Convert to cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.FRONTEND_URL}/courses/${course.slug}/success`,
      cancel_url: `${process.env.FRONTEND_URL}/courses/${course.slug}/cancel`,
      metadata: {
        user_id: user.id, // Use snake_case in metadata for consistency
        course_id: course.id,
      },
    });

    // Create pending enrollment
    await UserCourseAccess.create({
      user_id: user.id,
      course_id: courseId,
      payment_status: 'pending',
      approval_status: 'pending',
      created_at: new Date(),
      updated_at: new Date(),
    });

    res.json({ sessionId: session.id });
  } catch (error) {
    console.error('🔥 Create checkout session error:', error.message, error.stack);
    res.status(500).json({ error: 'Failed to create checkout session', details: error.message });
  }
};