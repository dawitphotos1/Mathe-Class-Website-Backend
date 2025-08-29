
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
const rateLimit = require("express-rate-limit");
const { sequelize } = require("./models");

const app = express();
app.set("trust proxy", 1);

// =========================
// 🔐 Middleware Setup
// =========================
app.use(helmet());
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ TEMPORARY: Wide-open CORS (for debugging)
app.use(
  cors({
    origin: true, // reflect the request origin
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// 🌍 Debug log: show incoming Origin
app.use((req, res, next) => {
  console.log("🌍 Incoming Origin:", req.headers.origin);
  next();
});

// 🔑 Debug log: show response headers
app.use((req, res, next) => {
  res.on("finish", () => {
    console.log("🔑 Response headers:", res.getHeaders());
  });
  next();
});

// ✅ Rate Limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500,
  message: { error: "Too many requests. Try again later." },
});
app.use("/api", apiLimiter);

// ✅ Logger
app.use((req, res, next) => {
  console.log(`📥 [${req.method}] ${req.originalUrl}`);
  next();
});

// =========================
// 🛣 Routes
// =========================
app.use("/api/v1/auth", require("./routes/authRoutes"));
app.use("/api/v1/users", require("./routes/userRoutes"));
app.use("/api/v1/courses", require("./routes/courseRoutes"));
app.use("/api/v1/payments", require("./routes/payments"));
app.use("/api/v1/enrollments", require("./routes/enrollments"));
app.use("/api/v1/admin", require("./routes/adminRoutes"));

// ✅ Health Check
app.get("/health", (req, res) => {
  res.json({ status: "OK", time: new Date().toISOString() });
});

// ✅ 404 Handler
app.use((req, res) => {
  res.status(404).json({ error: "Not Found" });
});

// ✅ Global Error Handler
app.use((err, req, res, next) => {
  console.error("❌ Global Error:", err.message, err.stack);
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
    if (
      !process.env.JWT_SECRET ||
      !process.env.DATABASE_URL ||
      !process.env.STRIPE_SECRET_KEY
    ) {
      throw new Error(
        "Missing critical environment variables (JWT_SECRET, DATABASE_URL, STRIPE_SECRET_KEY)."
      );
    }

    await sequelize.authenticate();
    console.log("✅ Connected to PostgreSQL");

    await sequelize.sync({ force: false });
    console.log("✅ Models synced with DB");

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("❌ Server startup error:", err.message, err.stack);
    process.exit(1);
  }
})();



// // server.js
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

// // ✅ CORS Setup
// const allowedOrigins = [
//   "http://localhost:3000",
//   process.env.FRONTEND_URL,
// ].filter(Boolean);

// app.use(
//   cors({
//     origin: function (origin, callback) {
//       if (!origin || allowedOrigins.includes(origin)) {
//         callback(null, true);
//       } else {
//         console.warn("❌ Blocked by CORS:", origin);
//         callback(new Error("Not allowed by CORS"));
//       }
//     },
//     credentials: true,
//     methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
//     allowedHeaders: ["Content-Type", "Authorization"],
//   })
// );

// // ✅ Rate Limiting
// const apiLimiter = rateLimit({
//   windowMs: 15 * 60 * 1000,
//   max: 500,
//   message: { error: "Too many requests. Try again later." },
// });
// app.use("/api", apiLimiter);

// // ✅ Request Logger
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
//   console.error("❌ Global Error:", err.message);
//   res.status(err.status || 500).json({
//     error: err.message || "Internal Server Error",
//   });
// });

// // =========================
// // 🚀 Server + DB Start
// // =========================
// const PORT = process.env.PORT || 5000;

// // Main startup function
// (async () => {
//   try {
//     // Validate environment variables
//     const requiredEnvVars = [
//       "JWT_SECRET",
//       "DATABASE_URL", 
//       "STRIPE_SECRET_KEY",
//       "FRONTEND_URL"
//     ];

//     const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
//     if (missingVars.length > 0) {
//       throw new Error(`Missing environment variables: ${missingVars.join(', ')}`);
//     }

//     // Database connection
//     await sequelize.authenticate();
//     console.log("✅ Connected to PostgreSQL");

//     // Database sync strategy
//     if (process.env.NODE_ENV === 'production') {
//       // Production: safe sync only (migrations should handle schema changes)
//       await sequelize.sync({ alter: false });
//       console.log("✅ Models synced with DB (production safe mode)");
//     } else {
//       // Development: use alter for schema updates with fallback
//       try {
//         await sequelize.sync({ alter: true });
//         console.log("✅ Models synced with DB (development alter mode)");
//       } catch (syncError) {
//         if (syncError.message.includes('cannot cast type') || 
//             syncError.message.includes('cannot drop type') ||
//             syncError.message.includes('relation') ) {
//           console.warn("⚠️  Schema conflict detected. Using force sync...");
//           await sequelize.sync({ force: true });
//           console.log("✅ Database recreated with fresh schema");
//         } else {
//           throw syncError;
//         }
//       }
//     }

//     // Start server
//     app.listen(PORT, "0.0.0.0", () => {
//       console.log(`🚀 Server running on http://localhost:${PORT}`);
//       console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
//       console.log(`🔗 Allowed origins: ${allowedOrigins.join(', ')}`);
//     });

//   } catch (err) {
//     console.error("❌ Server startup error:", err.message);
//     process.exit(1);
//   }
// })();

// // Graceful shutdown
// process.on('SIGINT', async () => {
//   console.log('\n🛑 Shutting down gracefully...');
//   try {
//     await sequelize.close();
//     console.log('✅ Database connection closed');
//     process.exit(0);
//   } catch (error) {
//     console.error('❌ Error during shutdown:', error);
//     process.exit(1);
//   }
// });

// module.exports = app;