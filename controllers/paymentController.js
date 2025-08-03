
const Stripe = require("stripe");
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

// ✅ Confirm Stripe payment
const confirmPayment = async (req, res) => {
  try {
    const { session_id } = req.body;
    if (!session_id) {
      return res
        .status(400)
        .json({ success: false, error: "Missing session_id" });
    }

    // ✅ Retrieve session from Stripe
    const session = await stripe.checkout.sessions.retrieve(session_id);

    if (!session) {
      return res
        .status(404)
        .json({ success: false, error: "Session not found" });
    }

    if (session.payment_status !== "paid") {
      return res
        .status(400)
        .json({ success: false, error: "Payment not completed" });
    }

    // ✅ Log or return session details
    res.json({
      success: true,
      message: "Payment confirmed",
      data: {
        id: session.id,
        amount_total: session.amount_total,
        currency: session.currency,
        payment_status: session.payment_status,
        customer_email: session.customer_details?.email,
      },
    });
  } catch (error) {
    console.error("Error confirming payment:", error);
    res
      .status(500)
      .json({ success: false, error: "Failed to confirm payment" });
  }
};

module.exports = { confirmPayment };
