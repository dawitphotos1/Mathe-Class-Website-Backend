require("dotenv").config();
const express = require("express");
const rateLimit = require("express-rate-limit");
const { sequelize } = require("./models");
const fs = require("fs");
const path = require("path");

const app = express();

// 🔒 Handle unhandled errors
process.on("unhandledRejection", (err) => {
  console.error("UNHANDLED REJECTION:", err.stack || err.message);
  process.exit(1);
});
process.on("uncaughtException", (err) => {
  console.error("UNCAUGHT EXCEPTION:", err.stack || err.message);
  process.exit(1);
});

// ✅ Universal CORS headers
app.use((req, res, next) => {
  const origin = req.headers.origin;
  res.setHeader("Access-Control-Allow-Origin", origin || "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Access-Control-Allow-Credentials", "true");

  if (req.method === "OPTIONS") return res.sendStatus(204);
  next();
});

// ---------- Middleware ----------
app.set("trust proxy", 1);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use("/uploads", express.static("uploads"));

app.use((req, res, next) => {
  console.log(
    `📥 [${req.method}] ${req.originalUrl} from ${req.get("origin")}`
  );
  next();
});

// ⏱️ Rate limiter
app.use("/api/v1/", rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }));

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

// ✅ /me mock with CORS headers
app.get("/api/v1/users/me", (req, res) => {
  const origin = req.headers.origin;
  res.setHeader("Access-Control-Allow-Origin", origin || "*");
  res.setHeader("Access-Control-Allow-Credentials", "true");

  try {
    res.json({
      success: true,
      user: {
        id: 2,
        role: "student",
        name: "Test Student",
        email: "student@example.com",
      },
    });
  } catch (err) {
    console.error("[ERROR] /users/me:", err);
    res.status(500).json({ success: false, error: "Failed to fetch user" });
  }
});

// ✅ Health check
app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK", timestamp: new Date().toISOString() });
});

// ✅ 404 handler
app.use((req, res) => {
  console.log(`[404] ${req.method} ${req.originalUrl}`);
  res.status(404).json({ error: "Not Found" });
});

// ✅ Global error handler
app.use((err, req, res, next) => {
  console.error("[ERROR] Global:", err.stack || err.message);
  res
    .status(500)
    .json({ error: "Internal server error", details: err.message });
});

// ---------- Start Server ----------
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
  } catch (err) {
    console.error("❌ Failed to start server:", err.stack || err.message);
    process.exit(1);
  }
})();








// require("dotenv").config();
// const express = require("express");
// const rateLimit = require("express-rate-limit");
// const { sequelize } = require("./models");

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

// // ✅ Universal CORS headers
// app.use((req, res, next) => {
//   const origin = req.headers.origin;
//   res.setHeader("Access-Control-Allow-Origin", origin || "*");
//   res.setHeader(
//     "Access-Control-Allow-Methods",
//     "GET, POST, PUT, DELETE, OPTIONS"
//   );
//   res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
//   res.setHeader("Access-Control-Allow-Credentials", "true");

//   if (req.method === "OPTIONS") return res.sendStatus(204);
//   next();
// });

// // ---------- Middleware ----------
// app.set("trust proxy", 1);
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));
// app.use(express.static("public"));
// app.use("/uploads", express.static("uploads"));

// app.use((req, res, next) => {
//   console.log(
//     `📥 [${req.method}] ${req.originalUrl} from ${req.get("origin")}`
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

//   // Debug: check all route exports are routers (functions or have .use method)
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

// // ✅ /me mock with CORS headers
// app.get("/api/v1/users/me", (req, res) => {
//   const origin = req.headers.origin;
//   res.setHeader("Access-Control-Allow-Origin", origin || "*");
//   res.setHeader("Access-Control-Allow-Credentials", "true");

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
