require("dotenv").config();
const express = require("express");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const fs = require("fs");
const path = require("path");
const { sequelize, Sequelize } = require("./models"); // ensure Sequelize is imported too

const app = express();

// 📁 Ensure 'uploads' directory exists
const uploadsPath = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsPath)) {
  fs.mkdirSync(uploadsPath, { recursive: true });
  console.log("📁 Created uploads directory");
}

// 🔒 Handle unhandled promise rejections and uncaught exceptions
process.on("unhandledRejection", (err) => {
  console.error("💥 UNHANDLED REJECTION:", err.stack || err.message);
  process.exit(1);
});
process.on("uncaughtException", (err) => {
  console.error("💥 UNCAUGHT EXCEPTION:", err.stack || err.message);
  process.exit(1);
});

// ✅ CORS Configuration
const allowedOrigins = [
  "http://localhost:3000",
  "https://math-class-platform.netlify.app",
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.log("❌ Blocked by CORS:", origin);
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

// Preflight support
const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
};

app.use(cors(corsOptions));        // main CORS
app.options("*", cors(corsOptions)); // preflight support


// 🔍 Request logging for debugging
app.use((req, res, next) => {
  console.log(
    `[${req.method}] ${req.originalUrl} from ${req.get("origin") || "N/A"}`
  );
  next();
});

// ---------- Middleware ----------
app.set("trust proxy", 1);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use("/uploads", express.static("uploads")); // Serve uploaded files

// Rate limiting
app.use(
  "/api/v1/",
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: { error: "Too many requests, try again later." },
  })
);

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

  // Validate all route exports
  for (const [name, route] of Object.entries(routes)) {
    if (
      !route ||
      (typeof route !== "function" && typeof route.use !== "function")
    ) {
      throw new Error(`❌ Invalid route '${name}'`);
    }
  }

  console.log("✅ All routes loaded");
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

// ✅ Mock user route for frontend testing (remove in production)
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

// ✅ Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK", timestamp: new Date().toISOString() });
});

// ✅ 404 handler
app.use((req, res) => {
  console.warn(`[404] ${req.method} ${req.originalUrl}`);
  res.status(404).json({ error: "Not Found" });
});

// ✅ Global error handler
app.use((err, req, res, next) => {
  console.error("💥 Global Error:", err.stack || err.message);
  res.status(500).json({
    error: "Internal server error",
    details: err.message,
  });
});

// ---------- Start Server ----------
const PORT = process.env.PORT || 5000;

const { QueryTypes } = Sequelize;

(async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ PostgreSQL connected");

    // Check if 'attachmentUrls' column exists in 'Courses' table, if not add it
    const columnCheck = await sequelize.query(
      `
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'Courses' AND column_name = 'attachmentUrls';
      `,
      { type: QueryTypes.SELECT }
    );

    if (columnCheck.length === 0) {
      console.log(
        "🛠️ Adding missing 'attachmentUrls' column to Courses table..."
      );
      await sequelize.query(
        `ALTER TABLE "Courses" ADD COLUMN "attachmentUrls" TEXT[] DEFAULT ARRAY[]::TEXT[];`
      );
      console.log("✅ 'attachmentUrls' column added.");
    } else {
      console.log("✅ 'attachmentUrls' column already exists.");
    }

    await sequelize.sync({ force: false });
    console.log("✅ DB synced");

    app.listen(PORT, "0.0.0.0", () =>
      console.log(`🚀 Server running at http://localhost:${PORT}`)
    );
  } catch (err) {
    console.error("❌ Server startup error:", err.stack || err.message);
    process.exit(1);
  }
})();
