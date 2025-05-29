
// 📁 server.js (Backend)
const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const { sequelize } = require("./models");

dotenv.config();
const app = express();

// ✅ Setup CORS
const allowedOrigins = [
  "http://localhost:3000",
  "https://math-class-platform.netlify.app",
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.log("❌ CORS blocked:", origin);
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

// Stripe webhook BEFORE express.json()
app.use("/api/v1/stripe", require("./routes/stripeWebhook"));

app.set("trust proxy", 1);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

// ✅ Rate limiting
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100 });
app.use("/api/v1/", limiter);

// ✅ Routes
app.use("/api/v1/auth", require("./routes/auth"));
app.use("/api/v1/users", require("./routes/users"));
app.use("/api/v1/courses", require("./routes/courses"));
app.use("/api/v1/payments", require("./routes/payments"));
app.use("/api/v1/email", require("./routes/email"));
app.use("/api/v1/enrollments", require("./routes/enrollments"));
app.use("/api/v1/admin", require("./routes/admin"));
app.use("/api/v1/progress", require("./routes/progress"));

app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK", timestamp: new Date().toISOString() });
});

app.use((req, res) => {
  res.status(404).json({ error: "Not Found" });
});

app.use(require("./middleware/errorHandler"));

const PORT = process.env.PORT || 5000;
(async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ PostgreSQL connected");
    await sequelize.sync({ force: false });
    console.log("✅ Database synced");
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`✅ Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("❌ Failed to start:", error);
    process.exit(1);
  }
})();

// 📁 routes/payments.js
const express = require("express");
const router = express.Router();
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const { UserCourseAccess, Course } = require("../models");
const authMiddleware = require("../middleware/authMiddleware");

router.post("/create-checkout-session", authMiddleware, async (req, res) => {
  try {
    const { courseId, courseName, coursePrice } = req.body;
    const userId = req.user.id;

    if (!courseId || !courseName || !coursePrice) {
      return res.status(400).json({ error: "Missing course data" });
    }

    const course = await Course.findByPk(courseId);
    if (!course) {
      return res.status(404).json({ error: "Course not found" });
    }

    await UserCourseAccess.create({
      userId,
      courseId,
      approved: false,
      accessGrantedAt: new Date(),
    });

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: { name: courseName },
            unit_amount: Math.round(coursePrice * 100),
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${process.env.FRONTEND_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/payment-cancel`,
      metadata: {
        userId: String(userId),
        courseId: String(courseId),
      },
    });

    res.json({ sessionId: session.id });
  } catch (error) {
    console.error("❌ Stripe session error:", error);
    res.status(500).json({ error: "Failed to create checkout session" });
  }
});

module.exports = router;

// 📁 CourseDetail.jsx (Frontend)
const handleEnrollClick = async () => {
  if (!user || !isStudent) {
    toast.error("Only students can enroll. Please log in as a student.");
    return navigate("/login");
  }

  if (!course?.id || !course.title || !course.price) {
    console.error("Invalid course data:", course);
    toast.error("Missing course details.");
    return;
  }

  const token = localStorage.getItem("token");
  if (!token) {
    toast.error("Please log in to enroll");
    return navigate("/login");
  }

  try {
    const payload = {
      courseId: String(course.id),
      courseName: course.title,
      coursePrice: parseFloat(course.price),
    };

    const { loadStripe } = await import("@stripe/stripe-js");
    const stripe = await loadStripe(process.env.REACT_APP_STRIPE_PUBLIC_KEY);
    if (!stripe) throw new Error("Stripe not loaded. Check API key.");

    const response = await axios.post(
      `${API_BASE_URL}/api/v1/payments/create-checkout-session`,
      payload,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    await stripe.redirectToCheckout({ sessionId: response.data.sessionId });
  } catch (err) {
    console.error("Enroll error:", err.response?.data || err);
    toast.error(err.response?.data?.error || "Failed to enroll");
  }
};
