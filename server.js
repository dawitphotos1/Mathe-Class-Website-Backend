
const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const { sequelize } = require("./models");

dotenv.config();
const app = express(); // ✅ App must be declared before any app.use()
const lessonRoutes = require("./routes/lessonRoutes");
// ✅ Crash handling
process.on("unhandledRejection", (err) => {
  console.error("UNHANDLED REJECTION:", err.stack || err.message);
  process.exit(1);
});

process.on("uncaughtException", (err) => {
  console.error("UNCAUGHT EXCEPTION:", err.stack || err.message);
  process.exit(1);
});

// ✅ CORS setup
const allowedOrigins = [
  "http://localhost:3000",
  "https://math-class-platform.netlify.app",
  "https://mathe-class-website-backend-1.onrender.com",
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) {
        console.log("🔓 CORS allowed: No origin (likely curl or server-side)");
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin) || origin.includes("localhost")) {
        console.log("✅ CORS allowed:", origin);
        return callback(null, true);
      }

      console.warn("❌ CORS BLOCKED:", origin);
      callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// ✅ Handle preflight OPTIONS requests
app.options("*", cors());

// ✅ Express setup
app.set("trust proxy", 1);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

// ✅ Logging middleware
app.use((req, res, next) => {
  console.log(`📥 [${req.method}] ${req.originalUrl}`);
  next();
});

// ✅ Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});
app.use("/api/v1/", limiter);

// ✅ Load routes
let lessonRoutes,
  stripeWebhook,
  auth,
  users,
  courses,
  payments,
  email,
  enrollments,
  admin,
  progress,
  emailPreview;

try {
  console.log("📦 Loading routes...");
  lessonRoutes = require("./routes/lessonRoutes");
  stripeWebhook = require("./routes/stripeWebhook");
  auth = require("./routes/auth");
  users = require("./routes/users");
  courses = require("./routes/courses");
  payments = require("./routes/payments");
  email = require("./routes/email");
  enrollments = require("./routes/enrollments");
  admin = require("./routes/admin");
  progress = require("./routes/progress");

  if (process.env.NODE_ENV !== "production") {
    emailPreview = require("./routes/emailPreview");
  }

  console.log("✅ Routes loaded");
} catch (err) {
  console.error("❌ Failed to load routes:", err.stack || err.message);
  process.exit(1);
}

// ✅ Mount routes
app.use("/api/v1/stripe", stripeWebhook);
app.use("/api/v1/lessons", lessonRoutes); // ✅ Correct route for lessons
app.use("/api/v1/auth", auth);
app.use("/api/v1/users", users);
app.use("/api/v1/courses", courses);
app.use("/api/v1/payments", payments);
app.use("/api/v1/email", email);
app.use("/api/v1/enrollments", enrollments);
app.use("/api/v1/admin", admin);
app.use("/api/v1/progress", progress);

// ✅ Dev-only email preview
if (process.env.NODE_ENV !== "production") {
  app.use("/dev", emailPreview);
}

// ✅ Health check
app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK", timestamp: new Date().toISOString() });
});

// ✅ 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Not Found" });
});

// ✅ Global error handler
app.use(require("./middleware/errorHandler"));

// ✅ Start server
const PORT = process.env.PORT || 5000;

(async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ PostgreSQL connected");

    await sequelize.sync({ force: false });
    console.log("✅ Database synced");

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("❌ Failed to start:", error.stack || error.message);
    process.exit(1);
  }
})();
