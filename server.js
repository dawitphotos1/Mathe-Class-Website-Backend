require("dotenv").config();
const express = require("express");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const { sequelize } = require("./models");
const fs = require("fs");
const path = require("path");

const app = express();

// Crash/error handling
process.on("unhandledRejection", (err) => {
  console.error("UNHANDLED REJECTION:", err.stack || err.message);
  process.exit(1);
});

process.on("uncaughtException", (err) => {
  console.error("UNCAUGHT EXCEPTION:", err.stack || err.message);
  process.exit(1);
});

// CORS configuration (temporary: allow all origins for debugging)
app.use(
  cors({
    origin: (origin, callback) => {
      console.log(`[CORS] Origin: ${origin || "No origin"}`);
      callback(null, true); // Allow all origins
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Handle preflight requests
app.options("*", cors());

// Middleware
app.set("trust proxy", 1);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

// Request logger
app.use((req, res, next) => {
  console.log(
    `📥 [${req.method}] ${req.originalUrl} from ${
      req.get("origin") || "No origin"
    }`
  );
  next();
});

// API rate limiter
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});
app.use("/api/v1/", limiter);

// Route imports
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

// Route mounting
app.use("/api/v1/lessons", lessonRoutes);
app.use("/api/v1/stripe", stripeWebhook);
app.use("/api/v1/auth", auth);
app.use("/api/v1/users", users);
app.use("/api/v1/courses", courses);
app.use("/api/v1/payments", payments);
app.use("/api/v1/email", email);
app.use("/api/v1/enrollments", enrollments);
app.use("/api/v1/admin", admin);
app.use("/api/v1/progress", progress);

if (process.env.NODE_ENV !== "production") {
  app.use("/dev", emailPreview);
}

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK", timestamp: new Date().toISOString() });
});

// 404 handler
app.use((req, res) => {
  console.log(`[404] ${req.method} ${req.originalUrl}`);
  res.status(404).json({ error: "Not Found" });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("[ERROR] Global:", err.stack || err.message);
  res
    .status(500)
    .json({ error: "Internal server error", details: err.message });
});

// Start server
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
