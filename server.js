
// require("dotenv").config();
// const express = require("express");
// const cors = require("cors");
// const helmet = require("helmet");
// const cookieParser = require("cookie-parser");
// const rateLimit = require("express-rate-limit");
// const { sequelize } = require("./models");

// const app = express();
// app.set("trust proxy", 1);

// // =========================
// // 🔐 Middleware Setup
// // =========================
// app.use(helmet());
// app.use(cookieParser());
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

// // ✅ TEMPORARY: Wide-open CORS (for debugging)
// app.use(
//   cors({
//     origin: true, // reflect the request origin
//     credentials: true,
//     methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
//     allowedHeaders: ["Content-Type", "Authorization"],
//   })
// );

// // 🌍 Debug log: show incoming Origin
// app.use((req, res, next) => {
//   console.log("🌍 Incoming Origin:", req.headers.origin);
//   next();
// });

// // 🔑 Debug log: show response headers
// app.use((req, res, next) => {
//   res.on("finish", () => {
//     console.log("🔑 Response headers:", res.getHeaders());
//   });
//   next();
// });

// // ✅ Rate Limiting
// const apiLimiter = rateLimit({
//   windowMs: 15 * 60 * 1000, // 15 minutes
//   max: 500,
//   message: { error: "Too many requests. Try again later." },
// });
// app.use("/api", apiLimiter);

// // ✅ Logger
// app.use((req, res, next) => {
//   console.log(`📥 [${req.method}] ${req.originalUrl}`);
//   next();
// });

// // =========================
// // 🛣 Routes
// // =========================
// app.use("/api/v1/auth", require("./routes/authRoutes"));
// app.use("/api/v1/users", require("./routes/userRoutes"));
// app.use("/api/v1/courses", require("./routes/courseRoutes"));
// app.use("/api/v1/payments", require("./routes/payments"));
// app.use("/api/v1/enrollments", require("./routes/enrollments"));
// app.use("/api/v1/admin", require("./routes/adminRoutes"));

// // ✅ Health Check
// app.get("/health", (req, res) => {
//   res.json({ status: "OK", time: new Date().toISOString() });
// });

// // ✅ 404 Handler
// app.use((req, res) => {
//   res.status(404).json({ error: "Not Found" });
// });

// // ✅ Global Error Handler
// app.use((err, req, res, next) => {
//   console.error("❌ Global Error:", err.message, err.stack);
//   res.status(err.status || 500).json({
//     error: err.message || "Internal Server Error",
//   });
// });

// // =========================
// // 🚀 Server + DB Start
// // =========================
// const PORT = process.env.PORT || 5000;

// (async () => {
//   try {
//     if (
//       !process.env.JWT_SECRET ||
//       !process.env.DATABASE_URL ||
//       !process.env.STRIPE_SECRET_KEY
//     ) {
//       throw new Error(
//         "Missing critical environment variables (JWT_SECRET, DATABASE_URL, STRIPE_SECRET_KEY)."
//       );
//     }

//     await sequelize.authenticate();
//     console.log("✅ Connected to PostgreSQL");

//     await sequelize.sync({ force: false });
//     console.log("✅ Models synced with DB");

//     app.listen(PORT, "0.0.0.0", () => {
//       console.log(`🚀 Server running on http://localhost:${PORT}`);
//     });
//   } catch (err) {
//     console.error("❌ Server startup error:", err.message, err.stack);
//     process.exit(1);
//   }
// })();


require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
const rateLimit = require("express-rate-limit");
const { sequelize } = require("./models");

const app = express();
app.set("trust proxy", 1); // For Render.com proxy

// =========================
// 🔐 Middleware Setup
// =========================
app.use(helmet()); // Security headers
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// =========================
// 🌍 CORS Setup
// =========================
const allowedOrigins = process.env.FRONTEND_URL
  ? process.env.FRONTEND_URL.split(",") // Parse comma-separated origins
  : ["http://localhost:3000", "https://math-class-platform.netlify.app"]; // Fallback

app.use(
  cors({
    origin: function (origin, callback) {
      console.log(`📥 CORS check for origin: ${origin}`); // Debug log
      // Allow requests with no origin (e.g., Postman, curl) or from allowed origins
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(
        new Error(`CORS not allowed for origin: ${origin}`),
        false
      );
    },
    credentials: true, // Allow cookies/auth headers
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Handle CORS preflight explicitly
app.options("*", cors()); // Respond to all OPTIONS requests

// =========================
// 🛡️ Rate Limiting
// =========================
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500, // Max 500 requests per window
  message: { error: "Too many requests. Try again later." },
});
app.use("/api", apiLimiter);

// =========================
// 📝 Request Logger
// =========================
app.use((req, res, next) => {
  console.log(
    `📥 [${req.method}] ${req.originalUrl} from ${
      req.get("origin") || "no-origin"
    }`
  );
  next();
});

// =========================
// 🛣 Routes
// =========================
app.use("/api/v1/auth", require("./routes/auth"));
app.use("/api/v1/users", require("./routes/users"));
app.use("/api/v1/courses", require("./routes/courses"));
app.use("/api/v1/payments", require("./routes/payments"));
app.use("/api/v1/enrollments", require("./routes/enrollments"));
app.use("/api/v1/admin", require("./routes/admin"));

// =========================
// 🩺 Health Check
// =========================
app.get("/health", (req, res) => {
  res.json({ status: "OK", time: new Date().toISOString() });
});

// =========================
// 🚫 404 Handler
// =========================
app.use((req, res) => {
  console.log(`❌ 404: [${req.method}] ${req.originalUrl} not found`);
  res.status(404).json({ error: "Not Found" });
});

// =========================
// 🛑 Global Error Handler
// =========================
app.use((err, req, res, next) => {
  console.error(`❌ Global Error: ${err.message}`, err.stack);
  res.status(err.status || 500).json({
    error: err.message || "Internal Server Error",
  });
});

// =========================
// 🚀 Server + DB Start
// =========================
const PORT = process.env.PORT || 5000;

(async () => {
  try {
    // Validate critical env variables
    if (
      !process.env.JWT_SECRET ||
      !process.env.DATABASE_URL ||
      !process.env.STRIPE_SECRET_KEY
    ) {
      throw new Error(
        "Missing critical environment variables (JWT_SECRET, DATABASE_URL, STRIPE_SECRET_KEY)."
      );
    }

    // Test DB connection
    await sequelize.authenticate();
    console.log("✅ Connected to PostgreSQL");

    // Sync models (no force to avoid dropping tables)
    await sequelize.sync({ force: false });
    console.log("✅ Models synced with DB");

    // Start server
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("❌ Server startup error:", err.message, err.stack);
    process.exit(1);
  }
})();