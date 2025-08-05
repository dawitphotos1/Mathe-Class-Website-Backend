// require("dotenv").config();
// const express = require("express");
// const cors = require("cors");
// const cookieParser = require("cookie-parser");
// const helmet = require("helmet");
// const rateLimit = require("express-rate-limit");
// const { sequelize } = require("./models");

// const app = express();
// app.set("trust proxy", 1);

// // Security middleware
// app.use(helmet());
// app.use(cookieParser());
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

// // CORS config
// const allowedOrigins = [
//   "http://localhost:3000",
//   "https://math-class-platform.netlify.app",
// ];
// app.use(
//   cors({
//     origin: (origin, callback) => {
//       if (!origin || allowedOrigins.includes(origin)) {
//         callback(null, true);
//       } else {
//         callback(new Error("CORS not allowed for this origin"));
//       }
//     },
//     methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
//     allowedHeaders: ["Content-Type", "Authorization"],
//     credentials: true,
//   })
// );
// app.options("*", cors());

// // Rate limiting
// const apiLimiter = rateLimit({
//   windowMs: 15 * 60 * 1000,
//   max: 500,
//   message: { error: "Too many requests. Try again later." },
// });
// app.use("/api", apiLimiter);

// // Debug log
// app.use((req, res, next) => {
//   console.log(`[${req.method}] ${req.originalUrl}`);
//   next();
// });

// // Routes
// app.use("/api/v1/auth", require("./routes/authRoutes")); // ✅ CORRECT
// app.use("/api/v1/users", require("./routes/users"));
// app.use("/api/v1/courses", require("./routes/courseRoutes"));
// app.use("/api/v1/payments", require("./routes/payments"));
// app.use("/api/v1/admin", require("./routes/admin"));
// app.use("/api/v1/enrollments", require("./routes/enrollmentRoutes"));

// // Health check
// app.get("/health", (req, res) => {
//   res.json({ status: "OK", time: new Date().toISOString() });
// });

// // 404 handler
// app.use((req, res) => {
//   res.status(404).json({ error: "Not Found" });
// });

// // Error handler
// const errorHandler = require("./middleware/errorHandler");
// app.use(errorHandler);

// // Server start
// const PORT = process.env.PORT || 5000;
// (async () => {
//   try {
//     await sequelize.authenticate();
//     console.log("✅ Connected to PostgreSQL");

//     await sequelize.sync({ force: false });
//     console.log("✅ Models synced with DB");

//     app.listen(PORT, "0.0.0.0", () => {
//       console.log(`🚀 Server running on http://localhost:${PORT}`);
//     });
//   } catch (err) {
//     console.error("❌ Server startup error:", err.message);
//     process.exit(1);
//   }
// })();




require("dotenv").config();
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const { sequelize } = require("./models");
const errorHandler = require("./middleware/errorHandler");

const app = express();
app.set("trust proxy", 1);

// Security middleware
app.use(helmet());
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS setup
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
        callback(new Error("CORS not allowed for this origin"));
      }
    },
    credentials: true, // important for cookies/auth headers
  })
);

app.options("*", cors());

// Rate limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  message: { error: "Too many requests. Try again later." },
});
app.use("/api", apiLimiter);

// Debug log
app.use((req, res, next) => {
  console.log(`[${req.method}] ${req.originalUrl}`);
  next();
});

// Routes
app.use("/api/v1/auth", require("./routes/authRoutes"));
app.use("/api/v1/users", require("./routes/users"));
app.use("/api/v1/courses", require("./routes/courseRoutes"));
app.use("/api/v1/payments", require("./routes/payments"));
app.use("/api/v1/admin", require("./routes/admin"));
app.use("/api/v1/enrollments", require("./routes/enrollmentRoutes"));

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "OK", time: new Date().toISOString() });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Not Found" });
});

// Global error handler
app.use(errorHandler);

// Server start
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
