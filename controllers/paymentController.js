const Stripe = require("stripe");
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
const logPaymentAction = require("../utils/logPaymentAction");

// ✅ Student initiates Stripe payment
const createCheckoutSession = async (req, res) => {
  try {
    const { courseId, courseName, coursePrice } = req.body;

    // ✅ Validate input
    if (!courseId || !courseName || !coursePrice || coursePrice < 1) {
      return res.status(400).json({ error: "Invalid course price or name" });
    }

    // ✅ Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: { name: courseName },
            unit_amount: Math.round(coursePrice * 100), // 💲 Convert dollars → cents
          },
          quantity: 1,
        },
      ],
      success_url: `${process.env.CLIENT_BASE_URL}/enrollment-success`,
      cancel_url: `${process.env.CLIENT_BASE_URL}/courses`,
    });

    // ✅ Log payment initiation
    logPaymentAction("CHECKOUT_SESSION", { courseId, coursePrice }, req.user);

    return res.status(200).json({ sessionId: session.id });
  } catch (error) {
    console.error("Stripe error:", error);
    return res.status(500).json({ error: "Failed to create checkout session" });
  }
};

module.exports = { createCheckoutSession };
