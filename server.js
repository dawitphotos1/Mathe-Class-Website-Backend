require("dotenv").config();
const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const rateLimit = require("express-rate-limit");
const { sequelize, User } = require("./models");
const authMiddleware = require("./middleware/authMiddleware");

const app = express();
app.set("trust proxy", 1); // For Render/reverse proxy trust

// === 1. Allowed Origins & CORS ===
const allowedOrigins = [
  "http://localhost:3000",
  "https://math-class-platform.netlify.app",
];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn("❌ Blocked by CORS:", origin);
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "Accept"],
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions)); // Preflight support

// === 2. Ensure Upload Folders Exist ===
const uploadsDir = path.join(__dirname, "uploads");
const imagesDir = path.join(__dirname, "images");
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
if (!fs.existsSync(imagesDir)) fs.mkdirSync(imagesDir, { recursive: true });

// === 3. Static File Serving (📁 serve uploads and images publicly) ===
app.use("/uploads", express.static(uploadsDir)); // For PDF, video, etc.
app.use("/images", express.static(imagesDir));
app.use(express.static("public")); // Optional fallback asset serving

// === 4. Core Middleware ===
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// === 5. Logger ===
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

// === 7. Routes Loading ===
const routeModules = [
  "lessonRoutes",
  "stripeWebhook",
  "auth",
  "users",
  "courses",
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

// === 8. Mount All Routes ===
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
if (routes.emailPreview) app.use("/dev", routes.emailPreview);

// === 9. Authenticated Profile Route ===
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

// === 10. Health & Upload Test Endpoints ===
app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK", timestamp: new Date().toISOString() });
});

app.get("/test-uploads", (req, res) => {
  const testPath = path.join(uploadsDir, "test.txt");
  try {
    fs.writeFileSync(testPath, "Test file created!");
    res.json({ success: true, message: "Upload folder works!" });
  } catch (err) {
    res.status(500).json({ error: "Upload test failed", details: err.message });
  }
});

// === 11. Catch 404 ===
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

    app.listen(PORT, "0.0.0.0", () =>
      console.log(`🚀 Server running on http://localhost:${PORT}`)
    );
  } catch (err) {
    console.error("❌ Startup error:", err.message);
    process.exit(1);
  }
})();
