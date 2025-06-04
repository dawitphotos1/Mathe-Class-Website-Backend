// controllers/paymentController.js
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const createCheckoutSession = async (req, res) => {
  try {
    const { courseId, courseTitle, coursePrice } = req.body;

    if (!courseId || !courseTitle || !coursePrice) {
      return res.status(400).json({ error: "Missing course information" });
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
        courseId: courseId,
      },
      success_url: `${process.env.FRONTEND_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/payment-cancelled`,
    });

    res.status(200).json({ url: session.url });
  } catch (error) {
    console.error("❌ Stripe checkout error:", error);
    res.status(500).json({ error: "Failed to create checkout session" });
  }
};

module.exports = { createCheckoutSession };
