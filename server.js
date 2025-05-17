const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const { sequelize } = require("./models");
// const morgan = require("morgan"); // Uncomment if morgan is installed

dotenv.config();
const app = express();

// Middleware
app.use(
  cors({
    origin: [process.env.FRONTEND_URL, "https://your-app.netlify.app"],
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public")); // Serve static files
// app.use(morgan("combined")); // Uncomment for request logging

// Rate Limiting for sensitive routes
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
});
app.use("/api/v1/auth", limiter);
app.use("/api/v1/payments", limiter);

// Routes
app.use("/api/v1/auth", require("./routes/auth"));
app.use("/api/v1/users", require("./routes/users"));
app.use("/api/v1/courses", require("./routes/courses"));
app.use("/api/v1/payments", require("./routes/payments"));
app.use("/api/v1/email", require("./routes/email"));
app.use("/api/v1/admin", require("./routes/admin"));
app.use("/api/v1/progress", require("./routes/progress"));

// Error Handling
app.use(require("./middleware/errorHandler"));

// Health Check
app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK" });
});

// Start Server
const PORT = process.env.PORT || 5000;
sequelize
  .authenticate()
  .then(() => {
    console.log("✅ Database connected");
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`✅ Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ Database connection failed:", err);
    process.exit(1);
  });