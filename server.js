
const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const { sequelize } = require("./models");

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

// ✅ Setup CORS
const allowedOrigins = [
  "http://localhost:3000",
  "https://math-class-platform.netlify.app",
  "https://mathe-class-website-backend-1.onrender.com", // Added for Render backend
];

app.use(
  cors({
    origin: (origin, callback) => {
      console.log("🔍 CORS request origin:", origin);
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      console.warn("❌ CORS BLOCKED:", origin);
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.options("*", cors()); // Handle preflight requests

// ✅ Stripe webhook route — MUST come before body parsing middleware
app.use("/api/v1/stripe", require("./routes/stripeWebhook"));

// ✅ Trust proxy for cookies/auth
app.set("trust proxy", 1);

// ✅ Body parsers — placed after Stripe webhook
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

// ✅ Development email preview route
if (process.env.NODE_ENV !== "production") {
  const emailPreview = require("./routes/emailPreview");
  app.use("/dev", emailPreview);
}

// ✅ Mount all API routes
app.use("/api/v1/auth", require("./routes/auth"));
app.use("/api/v1/users", require("./routes/users"));
app.use("/api/v1/courses", require("./routes/courses"));
app.use("/api/v1/payments", require("./routes/payments"));
app.use("/api/v1/email", require("./routes/email"));
app.use("/api/v1/enrollments", require("./routes/enrollments"));
app.use("/api/v1/admin", require("./routes/admin"));
app.use("/api/v1/progress", require("./routes/progress"));

// ✅ Health check route
app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK", timestamp: new Date().toISOString() });
});

// ✅ Catch-all for unknown routes
app.use((req, res) => {
  res.status(404).json({ error: "Not Found" });
});

// ✅ Global error handler
app.use(require("./middleware/errorHandler"));

// ✅ Start the server
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
