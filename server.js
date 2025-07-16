require("dotenv").config();
const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const rateLimit = require("express-rate-limit");
const { sequelize, Sequelize, User } = require("./models");
const authMiddleware = require("./middleware/authMiddleware");

const app = express();

// ✅ CORS: Safe & official way
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
        callback(new Error("CORS not allowed for this origin: " + origin));
      }
    },
    credentials: true,
  })
);

// ✅ Trust proxy for Render/Heroku
app.set("trust proxy", 1);

// ✅ Create folders if they don't exist
const uploadsPath = path.join(__dirname, "Uploads");
if (!fs.existsSync(uploadsPath)) fs.mkdirSync(uploadsPath, { recursive: true });

const imagesPath = path.join(__dirname, "images");
if (!fs.existsSync(imagesPath)) fs.mkdirSync(imagesPath, { recursive: true });

// ✅ Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static("Uploads"));
app.use("/images", express.static("images"));
app.use(express.static("public"));

// ✅ Request Logger
app.use((req, res, next) => {
  console.log(
    `[${req.method}] ${req.originalUrl} from ${req.get("origin") || "N/A"}`
  );
  next();
});

// ✅ Rate limiting for API endpoints
app.use(
  "/api/v1/",
  rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 500, // limit each IP
    message: { error: "Too many requests, try again later." },
  })
);

// ✅ Load routes dynamically
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
    console.error(`❌ Failed to load ${name}:`, err.message);
    process.exit(1);
  }
}
if (process.env.NODE_ENV !== "production") {
  try {
    routes.emailPreview = require("./routes/emailPreview");
  } catch {}
}

// ✅ Mount routes
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

// ✅ Authenticated user info endpoint
app.get("/api/v1/users/me", authMiddleware, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: ["id", "name", "email", "role"],
    });
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch user" });
  }
});

// ✅ Health check
app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK", timestamp: new Date().toISOString() });
});

// ✅ 404 fallback
app.use((req, res) => {
  res.status(404).json({ error: "Not Found" });
});

// ✅ Global error handler
app.use((err, req, res, next) => {
  console.error("💥 Global Error:", err);
  res
    .status(500)
    .json({ error: "Internal server error", details: err.message });
});

// ✅ Start server
const PORT = process.env.PORT || 5000;
const { QueryTypes } = Sequelize;

(async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ PostgreSQL connected");

    // ✅ Ensure `attachmentUrls` exists
    const colCheck = await sequelize.query(
      `SELECT column_name FROM information_schema.columns WHERE table_name = 'Courses' AND column_name = 'attachmentUrls';`,
      { type: QueryTypes.SELECT }
    );

    if (colCheck.length === 0) {
      await sequelize.query(
        `ALTER TABLE "Courses" ADD COLUMN "attachmentUrls" TEXT[] DEFAULT ARRAY[]::TEXT[];`
      );
      console.log("✅ 'attachmentUrls' column added.");
    } else {
      console.log("✅ 'attachmentUrls' column exists.");
    }

    await sequelize.sync({ force: false });
    console.log("✅ DB synced");

    app.listen(PORT, "0.0.0.0", () =>
      console.log(`🚀 Server running at http://localhost:${PORT}`)
    );
  } catch (err) {
    console.error("❌ Server startup error:", err);
    process.exit(1);
  }
})();
