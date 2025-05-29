
// const express = require("express");
// const dotenv = require("dotenv");
// const cors = require("cors");
// const rateLimit = require("express-rate-limit");
// const { sequelize } = require("./models");

// dotenv.config();
// const app = express();

// // ✅ Set up CORS
// const allowedOrigins = [
//   "http://localhost:3000",
//   "https://math-class-platform.netlify.app",
// ];
// app.use(
//   cors({
//     origin: function (origin, callback) {
//       if (!origin || allowedOrigins.includes(origin)) {
//         callback(null, true);
//       } else {
//         console.log("❌ CORS blocked:", origin);
//         callback(new Error("Not allowed by CORS"));
//       }
//     },
//     credentials: true,
//   })
// );

// // ✅ Stripe webhook must be BEFORE express.json()
// app.use("/api/v1/stripe", require("./routes/stripeWebhook"));

// app.set("trust proxy", 1);
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));
// app.use(express.static("public"));

// const limiter = rateLimit({
//   windowMs: 15 * 60 * 1000,
//   max: 100,
// });
// app.use("/api/v1/", limiter);

// // ✅ Routes
// app.use("/api/v1/auth", require("./routes/auth"));
// app.use("/api/v1/users", require("./routes/users"));
// app.use("/api/v1/courses", require("./routes/courses"));
// app.use("/api/v1/payments", require("./routes/payments"));
// app.use("/api/v1/email", require("./routes/email"));
// app.use("/api/v1/enrollments", require("./routes/enrollments")); // This handles teacher/admin enrollment routes
// app.use("/api/v1/admin", require("./routes/admin")); // Optional if you keep admin-only under /admin
// app.use("/api/v1/progress", require("./routes/progress"));

// // Health check
// app.get("/health", (req, res) => {
//   res.status(200).json({ status: "OK" });
// });

// // Error handler
// app.use(require("./middleware/errorHandler"));

// // Start server
// const PORT = process.env.PORT || 5000;
// (async () => {
//   try {
//     await sequelize.authenticate();
//     console.log("✅ PostgreSQL connected");
//     app.listen(PORT, "0.0.0.0", () => {
//       console.log(`✅ Server running on port ${PORT}`);
//     });
//   } catch (error) {
//     console.error("❌ Failed to start:", error);
//     process.exit(1);
//   }
// })();



const express = require("express");
const cors = require("cors");
const app = express();
require("dotenv").config();
const db = require("./db");
const { sequelize } = require("./config/database");
const authRoutes = require("./routes/auth");
const enrollmentRoutes = require("./routes/enrollments");
const paymentRoutes = require("./routes/payments");
const adminRoutes = require("./routes/admin");

app.use(cors());
app.use(express.json());

app.use("/api/v1/auth", "/api/v1/authRoutes);
app.use("/api/v1/enrollments", "/api/v1/enrollmentRoutes);
app.use("/api/v1/payments", "/api/v1/paymentRoutes);
app.use("/api/v1/admin", "/api/v1/adminRoutes);

// Health check
app.get("/health", "/", (req, res) => {
  res.json({ status: "Server is healthy" });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Not found" });
});

// Error handler
app.use((err, req, res, next) => {
  console.error("Server error:", err);
  res.status(500).json({ error: "Internal server error" });
});

const PORT = process.env.PORT || 3000;

sequelize.sync({ force: false }).then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}).catch((err) => {
  console.error("Failed to sync database:", err);
});
}).catch((error) => console.error("Failed to start server", err));

module.exports = app;
