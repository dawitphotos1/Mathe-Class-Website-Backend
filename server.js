// require("dotenv").config();
// const express = require("express");
// const fs = require("fs");
// const path = require("path");
// const rateLimit = require("express-rate-limit");
// const { sequelize, User } = require("./models");
// const authMiddleware = require("./middleware/authMiddleware");

// const app = express();
// app.set("trust proxy", 1); // Required for reverse proxies like Render

// // === 1. Strong CORS Setup ===
// const allowedOrigins = [
//   "http://localhost:3000",
//   "https://math-class-platform.netlify.app",
// ];

// app.use((req, res, next) => {
//   const origin = req.headers.origin;
//   if (allowedOrigins.includes(origin)) {
//     res.header("Access-Control-Allow-Origin", origin);
//   }
//   res.header("Access-Control-Allow-Credentials", "true");
//   res.header(
//     "Access-Control-Allow-Methods",
//     "GET,POST,PUT,DELETE,PATCH,OPTIONS"
//   );
//   res.header(
//     "Access-Control-Allow-Headers",
//     "Content-Type, Authorization, Accept"
//   );
//   res.header("Access-Control-Expose-Headers", "Authorization"); // Optional
//   if (req.method === "OPTIONS") {
//     return res.sendStatus(200);
//   }
//   next();
// });

// // === 2. Ensure Upload Directories Exist ===
// const uploadsDir = path.join(__dirname, "Uploads");
// const imagesDir = path.join(__dirname, "images");

// [uploadsDir, imagesDir].forEach((dir) => {
//   if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
// });

// // === 3. Static File Serving ===
// app.use("/Uploads", express.static(uploadsDir));
// app.use("/images", express.static(imagesDir));
// app.use(express.static("public"));

// // === 4. JSON Body Parsing ===
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

// // === 5. Request Logger ===
// app.use((req, res, next) => {
//   console.log(
//     `[${req.method}] ${req.originalUrl} from ${req.get("origin") || "N/A"}`
//   );
//   next();
// });

// // === 6. Rate Limiting ===
// app.use(
//   "/api/v1/",
//   rateLimit({
//     windowMs: 15 * 60 * 1000,
//     max: 5000,
//     message: { error: "Too many requests, try again later." },
//   })
// );

// // === 7. Load Routes Dynamically ===
// const routeModules = [
//   "lessonRoutes",
//   "stripeWebhook",
//   "auth",
//   "users",
//   "courseRoutes", // ✅ Must exist
//   "payments",
//   "email",
//   "enrollments",
//   "admin",
//   "progress",
//   "upload",
//   "files",
// ];

// const routes = {};
// for (const name of routeModules) {
//   try {
//     routes[name] = require(`./routes/${name}`);
//   } catch (err) {
//     console.error(`❌ Failed to load route: ${name}`, err.message);
//     process.exit(1);
//   }
// }

// if (process.env.NODE_ENV !== "production") {
//   try {
//     routes.emailPreview = require("./routes/emailPreview");
//   } catch {}
// }

// // === 8. Mount Routes ===
// app.use("/api/v1/courses", routes.lessonRoutes); 
// app.use("/api/v1/stripe", routes.stripeWebhook);
// app.use("/api/v1/auth", routes.auth);
// app.use("/api/v1/users", routes.users);
// app.use("/api/v1/courses", routes.courseRoutes);
// app.use("/api/v1/payments", routes.payments);
// app.use("/api/v1/email", routes.email);
// app.use("/api/v1/enrollments", routes.enrollments);
// app.use("/api/v1/admin", routes.admin);
// app.use("/api/v1/progress", routes.progress);
// app.use("/api/v1/upload", routes.upload);
// app.use("/api/v1/files", routes.files);
// if (routes.emailPreview) app.use("/dev", routes.emailPreview);

// // === 9. Authenticated Profile Route ===
// app.get("/api/v1/users/me", authMiddleware, async (req, res) => {
//   try {
//     if (!req.user?.id) return res.status(401).json({ error: "Invalid token" });

//     const user = await User.findByPk(req.user.id, {
//       attributes: ["id", "name", "email", "role"],
//     });

//     if (!user) return res.status(404).json({ error: "User not found" });

//     res.json({ success: true, user });
//   } catch (error) {
//     res
//       .status(500)
//       .json({ error: "Failed to fetch user", details: error.message });
//   }
// });

// // === 10. Health Check & Debug ===
// app.get("/health", (req, res) => {
//   res.status(200).json({ status: "OK", timestamp: new Date().toISOString() });
// });

// app.get("/debug/uploads", (req, res) => {
//   try {
//     const files = fs.readdirSync(uploadsDir);
//     res.json({ success: true, files });
//   } catch (err) {
//     res
//       .status(500)
//       .json({ error: "Unable to list files", details: err.message });
//   }
// });

// // === 11. 404 Fallback ===
// app.use((req, res) => {
//   res.status(404).json({ error: "Not Found" });
// });

// // === 12. Global Error Handler ===
// app.use((err, req, res, next) => {
//   console.error("💥 Global Error:", err);
//   res
//     .status(500)
//     .json({ error: "Internal server error", details: err.message });
// });

// // === 13. Start Server ===
// const PORT = process.env.PORT || 5000;
// (async () => {
//   try {
//     await sequelize.authenticate();
//     console.log("✅ PostgreSQL connected");

//     await sequelize.sync({ force: false });
//     console.log("✅ DB Synced");

//     app.listen(PORT, "0.0.0.0", () => {
//       console.log(`🚀 Server running on http://localhost:${PORT}`);
//     });
//   } catch (err) {
//     console.error("❌ Startup error:", err.message);
//     process.exit(1);
//   }
// })();



require("dotenv").config();
const express = require("express");
const fs = require("fs");
const path = require("path");
const rateLimit = require("express-rate-limit");
const cors = require("cors");
const { sequelize, User } = require("./models");
const authMiddleware = require("./middleware/authMiddleware");

const app = express();
app.set("trust proxy", 1); // Required for Render

// === 1. Robust CORS Setup ===
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
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

// === 2. Ensure Upload Directories Exist ===
const uploadsDir = path.join(__dirname, "Uploads");
const imagesDir = path.join(__dirname, "images");

[uploadsDir, imagesDir].forEach((dir) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

// === 3. Static File Serving ===
app.use("/Uploads", express.static(uploadsDir));
app.use("/images", express.static(imagesDir));
app.use(express.static("public"));

// === 4. JSON & URL-encoded Body Parsing ===
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// === 5. Request Logger ===
app.use((req, res, next) => {
  console.log(
    `[${req.method}] ${req.originalUrl} from ${req.get("origin") || "N/A"}`
  );
  next();
});

// === 6. Rate Limiting ===
app.use(
  "/api/v1/",
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5000,
    message: { error: "Too many requests, try again later." },
  })
);

// === 7. Load Route Modules ===
const routeModules = [
  "lessonRoutes",
  "stripeWebhook",
  "auth",
  "users",
  "courseRoutes",
  "payments",
  "email",
  "enrollments",
  "admin",
  "progress",
  "upload",
  "files",
];

const routes = {};
for (const name of routeModules) {
  try {
    routes[name] = require(`./routes/${name}`);
  } catch (err) {
    console.error(`❌ Failed to load route: ${name}`, err.message);
    process.exit(1);
  }
}

if (process.env.NODE_ENV !== "production") {
  try {
    routes.emailPreview = require("./routes/emailPreview");
  } catch {}
}

// === 8. Mount Routes ===
app.use("/api/v1/lessons", routes.lessonRoutes); // ✅ lessonRoutes mounted properly
app.use("/api/v1/courses", routes.courseRoutes); // ✅ courseRoutes
app.use("/api/v1/stripe", routes.stripeWebhook);
app.use("/api/v1/auth", routes.auth);
app.use("/api/v1/users", routes.users);
app.use("/api/v1/payments", routes.payments);
app.use("/api/v1/email", routes.email);
app.use("/api/v1/enrollments", routes.enrollments);
app.use("/api/v1/admin", routes.admin);
app.use("/api/v1/progress", routes.progress);
app.use("/api/v1/upload", routes.upload);
app.use("/api/v1/files", routes.files);
if (routes.emailPreview) app.use("/dev", routes.emailPreview);

// === 9. Authenticated Profile Endpoint ===
app.get("/api/v1/users/me", authMiddleware, async (req, res) => {
  try {
    if (!req.user?.id) return res.status(401).json({ error: "Invalid token" });

    const user = await User.findByPk(req.user.id, {
      attributes: ["id", "name", "email", "role"],
    });

    if (!user) return res.status(404).json({ error: "User not found" });

    res.json({ success: true, user });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Failed to fetch user", details: error.message });
  }
});

// === 10. Health & Upload Debug Endpoints ===
app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK", timestamp: new Date().toISOString() });
});

app.get("/debug/uploads", (req, res) => {
  try {
    const files = fs.readdirSync(uploadsDir);
    res.json({ success: true, files });
  } catch (err) {
    res
      .status(500)
      .json({ error: "Unable to list files", details: err.message });
  }
});

// === 11. 404 Not Found ===
app.use((req, res) => {
  res.status(404).json({ error: "Not Found" });
});

// === 12. Global Error Handler ===
app.use((err, req, res, next) => {
  console.error("💥 Global Error:", err);
  res
    .status(500)
    .json({ error: "Internal server error", details: err.message });
});

// === 13. Start Server ===
const PORT = process.env.PORT || 5000;
(async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ PostgreSQL connected");

    await sequelize.sync({ force: false });
    console.log("✅ DB Synced");

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("❌ Startup error:", err.message);
    process.exit(1);
  }
})();
