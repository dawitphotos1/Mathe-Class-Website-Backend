require("dotenv").config();
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const { sequelize } = require("./models");

// === Initialize App ===
const app = express();

// === 1. Security Middlewares ===
app.use(helmet());
app.use(cookieParser());

// === 2. CORS Configuration ===
const allowedOrigins = [
  "http://localhost:3000",
  "https://math-class-platform.netlify.app", // ✅ Replace with your Netlify URL
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("CORS not allowed for this origin"));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);
app.options("*", cors()); // ✅ Handle preflight requests

// === 3. Rate Limiting ===
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500,
  message: { error: "Too many requests. Try again later." },
});
app.use("/api", apiLimiter);

// === 4. Body Parsers ===
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// === 5. Debug Logging Middleware ===
app.use((req, res, next) => {
  console.log(`[${req.method}] ${req.originalUrl}`);
  next();
});

// === 6. Import Routes ===
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/users");
const courseRoutes = require("./routes/courseRoutes");
const paymentRoutes = require("./routes/payments");
const enrollmentRoutes = require("./routes/enrollments");
const adminRoutes = require("./routes/admin");

// === 7. Mount Routes ===
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/courses", courseRoutes);
app.use("/api/v1/payments", paymentRoutes);
app.use("/api/v1/enrollments", enrollmentRoutes);
app.use("/api/v1/admin", adminRoutes);

// === 8. Health Check ===
app.get("/health", (req, res) => {
  res.json({ status: "OK", time: new Date().toISOString() });
});

// === 9. 404 Handler ===
app.use((req, res) => {
  res.status(404).json({ error: "Not Found" });
});

// === 10. Global Error Handler ===
app.use((err, req, res, next) => {
  console.error("💥 Global Error:", err.message);
  res
    .status(500)
    .json({ error: "Internal Server Error", details: err.message });
});

// === 11. Start Server ===
const PORT = process.env.PORT || 5000;
(async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ Connected to PostgreSQL");

    await sequelize.sync({ force: false });
    console.log("✅ Models synced with DB");

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("❌ Server startup error:", err.message);
    process.exit(1);
  }
})();
