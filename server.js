
const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const { sequelize } = require("./models");
const enrollmentRoutes = require("./routes/enrollmentRoutes");

dotenv.config();
const app = express();

// ✅ Global crash handling
process.on("unhandledRejection", (err) => {
  console.error("UNHANDLED REJECTION:", err.message);
  process.exit(1);
});

process.on("uncaughtException", (err) => {
  console.error("UNCAUGHT EXCEPTION:", err.message);
  process.exit(1);
});

// ✅ Setup CORS (must be before any routes or body parsing)
const allowedOrigins = [
  "http://localhost:3000",
  "https://math-class-platform.netlify.app",
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true); // Allow Postman and server-to-server requests
      if (allowedOrigins.includes(origin)) return callback(null, true);
      console.warn("❌ CORS blocked:", origin);
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

// ✅ Handle preflight OPTIONS requests globally
app.options("*", cors());

// ✅ Stripe webhook BEFORE body parsing
app.use("/api/v1/stripe", require("./routes/stripeWebhook"));

// ✅ Trust proxy (important for cookies/auth on Render/Netlify)
app.set("trust proxy", 1);

// ✅ Body parsers (after stripe webhook)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Serve static files
app.use(express.static("public"));

// ✅ Request logger
app.use((req, res, next) => {
  console.log(`📥 [${req.method}] ${req.originalUrl}`);
  next();
});

// ✅ Apply rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});
app.use("/api/v1/", limiter);

// ✅ Development-only preview email route
if (process.env.NODE_ENV !== "production") {
  const emailPreview = require("./routes/emailPreview");
  app.use("/dev", emailPreview);
}

// ✅ Mount API routes
app.use("/api/v1/auth", require("./routes/auth"));
app.use("/api/v1/users", require("./routes/users"));
app.use("/api/v1/courses", require("./routes/courses"));
app.use("/api/v1/payments", require("./routes/payments"));
app.use("/api/v1/email", require("./routes/email"));
app.use("/api/v1/enrollments", require("./routes/enrollments")); // <- includes my-courses, approve, reject
app.use("/api/v1/admin", require("./routes/admin"));
app.use("/api/v1/progress", require("./routes/progress"));

// ✅ Health check
app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK", timestamp: new Date().toISOString() });
});

// ✅ Fallback for unmatched routes
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
      console.log(`✅ Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("❌ Failed to start:", error);
    process.exit(1);
  }
})();
