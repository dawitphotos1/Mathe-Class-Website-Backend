
// require("dotenv").config();
// const express = require("express");
// const cors = require("cors");
// const rateLimit = require("express-rate-limit");
// const { sequelize } = require("./models");
// const progressRoutes = require("./routes/progress");

// const app = express();

// // 🔒 Handle unhandled errors
// process.on("unhandledRejection", (err) => {
//   console.error("UNHANDLED REJECTION:", err.stack || err.message);
//   process.exit(1);
// });
// process.on("uncaughtException", (err) => {
//   console.error("UNCAUGHT EXCEPTION:", err.stack || err.message);
//   process.exit(1);
// });

// // ✅ CORS Configuration
// const allowedOrigins = [
//   "http://localhost:3000",
//   "https://mathe-class-website-frontend.onrender.com",
// ];

// // ✅ MUST BE FIRST Middleware
// app.use((req, res, next) => {
//   const origin = req.headers.origin;

//   if (allowedOrigins.includes(origin)) {
//     res.header("Access-Control-Allow-Origin", origin);
//     res.header("Access-Control-Allow-Credentials", "true");
//     res.header(
//       "Access-Control-Allow-Methods",
//       "GET,POST,PUT,PATCH,DELETE,OPTIONS"
//     );
//     res.header(
//       "Access-Control-Allow-Headers",
//       "Origin, X-Requested-With, Content-Type, Accept, Authorization"
//     );
//   }

//   if (req.method === "OPTIONS") {
//     return res.sendStatus(204); // No Content
//   }

//   next();
// });

// // ---------- Middleware ----------
// app.set("trust proxy", 1);
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));
// app.use(express.static("public"));
// app.use("/uploads", express.static("uploads"));
// app.use("/api/v1/progress", progressRoutes);
// // 🔍 Log incoming requests
// app.use((req, res, next) => {
//   console.log(
//     `📥 [${req.method}] ${req.originalUrl} from ${req.get("origin") || "N/A"}`
//   );
//   next();
// });

// // ⏱️ Rate limiter
// app.use(
//   "/api/v1/",
//   rateLimit({
//     windowMs: 15 * 60 * 1000,
//     max: 100,
//   })
// );

// // ---------- Load Routes ----------
// let routes = {};
// try {
//   console.log("📦 Loading routes...");

//   routes = {
//     lessonRoutes: require("./routes/lessonRoutes"),
//     stripeWebhook: require("./routes/stripeWebhook"),
//     auth: require("./routes/auth"),
//     users: require("./routes/users"),
//     courses: require("./routes/courses"),
//     payments: require("./routes/payments"),
//     email: require("./routes/email"),
//     enrollments: require("./routes/enrollments"),
//     admin: require("./routes/admin"),
//     progress: require("./routes/progress"),
//     upload: require("./routes/upload"),
//     files: require("./routes/files"),
//   };

//   if (process.env.NODE_ENV !== "production") {
//     routes.emailPreview = require("./routes/emailPreview");
//   }

//   for (const [name, route] of Object.entries(routes)) {
//     if (
//       !(
//         typeof route === "function" ||
//         (typeof route === "object" && typeof route.use === "function")
//       )
//     ) {
//       throw new Error(
//         `Route '${name}' does not export an Express router instance`
//       );
//     }
//   }

//   console.log("✅ Routes loaded");
// } catch (err) {
//   console.error("❌ Failed to load routes:", err.stack || err.message);
//   process.exit(1);
// }

// // ---------- Mount Routes ----------
// app.use("/api/v1/lessons", routes.lessonRoutes);
// app.use("/api/v1/stripe", routes.stripeWebhook);
// app.use("/api/v1/auth", routes.auth);
// app.use("/api/v1/users", routes.users);
// app.use("/api/v1/courses", routes.courses);
// app.use("/api/v1/payments", routes.payments);
// app.use("/api/v1/email", routes.email);
// app.use("/api/v1/enrollments", routes.enrollments);
// app.use("/api/v1/admin", routes.admin);
// app.use("/api/v1/progress", routes.progress);
// app.use("/api/v1/upload", routes.upload);
// app.use("/api/v1/files", routes.files);

// if (routes.emailPreview) {
//   app.use("/dev", routes.emailPreview);
// }

// // ✅ /me mock for test
// app.get("/api/v1/users/me", (req, res) => {
//   try {
//     res.json({
//       success: true,
//       user: {
//         id: 2,
//         role: "student",
//         name: "Test Student",
//         email: "student@example.com",
//       },
//     });
//   } catch (err) {
//     console.error("[ERROR] /users/me:", err);
//     res.status(500).json({ success: false, error: "Failed to fetch user" });
//   }
// });

// // ✅ Health check
// app.get("/health", (req, res) => {
//   res.status(200).json({ status: "OK", timestamp: new Date().toISOString() });
// });

// // ✅ 404 handler
// app.use((req, res) => {
//   console.log(`[404] ${req.method} ${req.originalUrl}`);
//   res.status(404).json({ error: "Not Found" });
// });

// // ✅ Global error handler
// app.use((err, req, res, next) => {
//   console.error("[ERROR] Global:", err.stack || err.message);
//   res
//     .status(500)
//     .json({ error: "Internal server error", details: err.message });
// });

// // ---------- Start Server ----------
// const PORT = process.env.PORT || 5000;

// (async () => {
//   try {
//     await sequelize.authenticate();
//     console.log("✅ PostgreSQL connected");

//     await sequelize.sync({ force: false });
//     console.log("✅ Database synced");

//     app.listen(PORT, "0.0.0.0", () => {
//       console.log(`🚀 Server running on port ${PORT}`);
//     });
//   } catch (err) {
//     console.error("❌ Failed to start server:", err.stack || err.message);
//     process.exit(1);
//   }
// })();



require("dotenv").config();
const express = require("express");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const fs = require("fs");
const path = require("path");
const { sequelize } = require("./models");

const app = express();

// 📁 Ensure 'uploads' directory exists
const uploadsPath = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsPath)) {
  fs.mkdirSync(uploadsPath, { recursive: true });
  console.log("📁 Created uploads directory");
}

// 🔒 Handle unhandled errors
process.on("unhandledRejection", (err) => {
  console.error("UNHANDLED REJECTION:", err.stack || err.message);
  process.exit(1);
});
process.on("uncaughtException", (err) => {
  console.error("UNCAUGHT EXCEPTION:", err.stack || err.message);
  process.exit(1);
});

// ✅ CORS Configuration
const allowedOrigins = [
  "https://math-class-platform.netlify.app",
  "http://localhost:3000",
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, origin);
      } else {
        console.warn(`Blocked CORS origin: ${origin}`);
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

// ✅ Preflight request support
app.options("*", cors());

// 🔍 CORS Debugging
app.use((req, res, next) => {
  console.log(`[CORS] Origin: ${req.get("origin")}`);
  next();
});

// ---------- Middleware ----------
app.set("trust proxy", 1);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use("/uploads", express.static("uploads"));

// ⏱️ Rate limiter
app.use(
  "/api/v1/",
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: { error: "Too many requests, try again later" },
  })
);

// 🔍 Request logging
app.use((req, res, next) => {
  console.log(
    `[${req.method}] ${req.originalUrl} from ${req.get("origin") || "N/A"}`
  );
  next();
});

// ---------- Load Routes ----------
let routes = {};
try {
  console.log("📦 Loading routes...");
  routes = {
    lessonRoutes: require("./routes/lessonRoutes"),
    stripeWebhook: require("./routes/stripeWebhook"),
    auth: require("./routes/auth"),
    users: require("./routes/users"),
    courses: require("./routes/courses"),
    payments: require("./routes/payments"),
    email: require("./routes/email"),
    enrollments: require("./routes/enrollments"),
    admin: require("./routes/admin"),
    progress: require("./routes/progress"),
    upload: require("./routes/upload"),
    files: require("./routes/files"),
  };

  if (process.env.NODE_ENV !== "production") {
    routes.emailPreview = require("./routes/emailPreview");
  }

  for (const [name, route] of Object.entries(routes)) {
    if (
      !route ||
      (typeof route !== "function" && typeof route.use !== "function")
    ) {
      throw new Error(`❌ Route '${name}' is invalid`);
    }
  }

  console.log("✅ Routes loaded");
} catch (err) {
  console.error("❌ Failed to load routes:", err.stack || err.message);
  process.exit(1);
}

// ---------- Mount Routes ----------
app.use("/api/v1/lessons", routes.lessonRoutes);
app.use("/api/v1/stripe", routes.stripeWebhook);
app.use("/api/v1/auth", routes.auth);
app.use("/api/v1/users", routes.users);
app.use("/api/v1/courses", routes.courses);
app.use("/api/v1/payments", routes.payments);
app.use("/api/v1/email", routes.email);
app.use("/api/v1/enrollments", routes.enrollments);
app.use("/api/v1/admin", routes.admin);
app.use("/api/v1/progress", routes.progress);
app.use("/api/v1/upload", routes.upload);
app.use("/api/v1/files", routes.files);

if (routes.emailPreview) {
  app.use("/dev", routes.emailPreview);
}

// ✅ Mock test route
app.get("/api/v1/users/me", (req, res) => {
  res.json({
    success: true,
    user: {
      id: 2,
      role: "student",
      name: "Test Student",
      email: "student@example.com",
    },
  });
});

// ✅ Health check
app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK", timestamp: new Date().toISOString() });
});

// ✅ 404 fallback
app.use((req, res) => {
  console.warn(`[404] ${req.method} ${req.originalUrl}`);
  res.status(404).json({ error: "Not Found" });
});

// ✅ Global error handler
app.use((err, req, res, next) => {
  console.error("[GLOBAL ERROR]", err.stack || err.message);
  res.status(500).json({
    error: "Internal server error",
    details: err.message,
  });
});

// ---------- Start Server ----------
const PORT = process.env.PORT || 5000;

(async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ Connected to PostgreSQL");
    await sequelize.sync({ force: false });
    console.log("✅ DB Synced");
    app.listen(PORT, "0.0.0.0", () =>
      console.log(`🚀 Server running on http://localhost:${PORT}`)
    );
  } catch (err) {
    console.error("❌ Server start error:", err.stack || err.message);
    process.exit(1);
  }
})();
