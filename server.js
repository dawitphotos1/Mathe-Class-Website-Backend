
const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const { sequelize } = require("./models");

dotenv.config();
const app = express();

// Set up CORS
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

// Stripe webhook must be BEFORE express.json()
app.use("/api/v1/stripe", require("./routes/stripeWebhook"));

// Trust proxy for rate limiting behind Render
app.set("trust proxy", 1);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window
});
app.use("/api/v1/", limiter);

// Routes
app.use("/api/v1/auth", require("./routes/auth"));
app.use("/api/v1/users", require("./routes/users"));
app.use("/api/v1/courses", require("./routes/courses"));
app.use("/api/v1/payments", require("./routes/payments"));
app.use("/api/v1/email", require("./routes/email"));
app.use("/api/v1/enrollments", require("./routes/enrollments"));
app.use("/api/v1/admin", require("./routes/admin"));
app.use("/api/v1/progress", require("./routes/progress"));

// Health check
app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK", timestamp: new Date().toISOString() });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ error: "Not Found" });
});

// Error handler
app.use(require("./middleware/errorHandler"));

// Start server
const PORT = process.env.PORT || 5000;
(async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ PostgreSQL connected");
    // Sync database (non-destructive)
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
