// const express = require("express");
// const dotenv = require("dotenv");
// const cors = require("cors");
// const rateLimit = require("express-rate-limit");
// const { sequelize } = require("./models");
// // const morgan = require("morgan"); // Uncomment if morgan is installed

// // Load environment variables
// dotenv.config();

// const app = express();

// // CORS Middleware
// app.use(
//   cors({
//     origin: [process.env.FRONTEND_URL, "https://your-app.netlify.app"],
//     credentials: true,
//   })
// );

// // Basic Middlewares
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));
// app.use(express.static("public")); // Serve static files from /public
// // app.use(morgan("combined")); // Enable if you want request logging

// // Rate Limiting Middleware (optional, useful for auth/payment routes)
// const limiter = rateLimit({
//   windowMs: 15 * 60 * 1000, // 15 minutes
//   max: 100, // Limit each IP to 100 requests per window
// });
// app.use("/api/v1/auth", limiter);
// app.use("/api/v1/payments", limiter);

// // Routes - ✅ Make sure each of these exports a router correctly
// app.use("/api/v1/auth", require("./routes/auth"));
// app.use("/api/v1/users", require("./routes/users"));
// app.use("/api/v1/courses", require("./routes/courses"));
// app.use("/api/v1/payments", require("./routes/payments")); // 🔁 This one likely caused your deployment error
// app.use("/api/v1/email", require("./routes/email"));
// app.use("/api/v1/admin", require("./routes/admin"));
// app.use("/api/v1/progress", require("./routes/progress"));

// // Error Handler Middleware (should be at the end)
// app.use(require("./middleware/errorHandler"));

// // Health Check Endpoint
// app.get("/health", (req, res) => {
//   res.status(200).json({ status: "OK" });
// });

// // Start Server
// const PORT = process.env.PORT || 5000;

// sequelize
//   .authenticate()
//   .then(() => {
//     console.log("✅ Database connected");
//     app.listen(PORT, "0.0.0.0", () => {
//       console.log(`✅ Server running on port ${PORT}`);
//     });
//   })
//   .catch((err) => {
//     console.error("❌ Database connection failed:", err);
//     process.exit(1);
//   });

const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const { sequelize } = require("./models");

dotenv.config();

const app = express();

// CORS Middleware
app.use(
  cors({
    origin: [
      process.env.FRONTEND_URL,
      "https://math-class-platform.netlify.app",
    ],
    credentials: true,
  })
);

// Basic Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

// Rate Limiting (for auth/payment routes)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});
app.use("/api/v1/auth", limiter);
app.use("/api/v1/payments", limiter);

// API Routes
app.use("/api/v1/auth", require("./routes/auth"));
app.use("/api/v1/users", require("./routes/users"));
app.use("/api/v1/courses", require("./routes/courses"));
app.use("/api/v1/payments", require("./routes/payments"));
app.use("/api/v1/email", require("./routes/email"));
app.use("/api/v1/admin", require("./routes/admin"));
app.use("/api/v1/progress", require("./routes/progress"));

// Health Check
app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK" });
});

// Error Handling Middleware
app.use(require("./middleware/errorHandler"));

// Server & DB Setup
const PORT = process.env.PORT || 5000;

(async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ PostgreSQL connection established");

    // Sync database schema with existing tables
    await sequelize.sync({ alter: true }); // Avoid use in production w/o migrations
    console.log("✅ Database synced");

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`✅ Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
})();
