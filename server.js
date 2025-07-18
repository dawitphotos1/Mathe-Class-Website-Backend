// require("dotenv").config();
// const express = require("express");
// const cors = require("cors");
// const fs = require("fs");
// const path = require("path");
// const rateLimit = require("express-rate-limit");
// const { sequelize, Sequelize, User } = require("./models");
// const authMiddleware = require("./middleware/authMiddleware");

// const app = express();

// // CORS configuration
// const allowedOrigins = [
//   "http://localhost:3000",
//   "https://math-class-platform.netlify.app",
// ];

// app.use(
//   cors({
//     origin: function (origin, callback) {
//       console.log(`CORS check for origin: ${origin}`);
//       if (!origin || allowedOrigins.includes(origin)) {
//         callback(null, origin || "*");
//       } else {
//         callback(new Error(`CORS not allowed for origin: ${origin}`));
//       }
//     },
//     methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
//     allowedHeaders: ["Content-Type", "Authorization", "Accept"],
//     credentials: true,
//     optionsSuccessStatus: 204,
//   })
// );

// // Explicitly handle preflight requests
// app.options("*", (req, res) => {
//   const origin = req.get("origin") || "*";
//   console.log(`Handling OPTIONS request for origin: ${origin}`);
//   res.set({
//     "Access-Control-Allow-Origin": allowedOrigins.includes(origin)
//       ? origin
//       : "*",
//     "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,PATCH,OPTIONS",
//     "Access-Control-Allow-Headers": "Content-Type,Authorization,Accept",
//     "Access-Control-Allow-Credentials": "true",
//   });
//   res.status(204).send();
// });

// // Trust proxy for Render
// app.set("trust proxy", 1);

// // Create folders if they don't exist
// const uploadsPath = path.join(__dirname, "Uploads");
// if (!fs.existsSync(uploadsPath)) fs.mkdirSync(uploadsPath, { recursive: true });

// const imagesPath = path.join(__dirname, "images");
// if (!fs.existsSync(imagesPath)) fs.mkdirSync(imagesPath, { recursive: true });

// // Middleware
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));
// app.use("/Uploads", express.static("Uploads"));
// app.use("/images", express.static("images"));
// app.use(express.static("public"));

// // Request Logger
// app.use((req, res, next) => {
//   console.log(
//     `[${req.method}] ${req.originalUrl} from ${req.get("origin") || "N/A"}`
//   );
//   next();
// });

// // Rate limiting for API endpoints
// app.use(
//   "/api/v1/",
//   rateLimit({
//     windowMs: 15 * 60 * 1000, // 15 minutes
//     max: 500,
//     message: { error: "Too many requests, try again later." },
//   })
// );

// // Load routes dynamically
// const routeModules = [
//   "lessonRoutes",
//   "stripeWebhook",
//   "auth",
//   "users",
//   "courses",
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
//     console.error(`❌ Failed to load ${name}:`, err.message);
//     process.exit(1);
//   }
// }
// if (process.env.NODE_ENV !== "production") {
//   try {
//     routes.emailPreview = require("./routes/emailPreview");
//   } catch {}
// }

// // Mount routes
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
// if (routes.emailPreview) app.use("/dev", routes.emailPreview);

// // Authenticated user info endpoint
// app.get("/api/v1/users/me", authMiddleware, async (req, res) => {
//   try {
//     if (!req.user || !req.user.id) {
//       console.error("No user ID in request");
//       return res.status(401).json({ error: "Invalid token" });
//     }
//     const user = await User.findByPk(req.user.id, {
//       attributes: ["id", "name", "email", "role"],
//     });
//     if (!user) {
//       console.error(`User not found for ID: ${req.user.id}`);
//       return res.status(404).json({ error: "User not found" });
//     }
//     res.json({ success: true, user });
//   } catch (error) {
//     console.error("Failed to fetch user:", error.message);
//     res
//       .status(500)
//       .json({ error: "Failed to fetch user", details: error.message });
//   }
// });

// // Health check
// app.get("/health", (req, res) => {
//   res.status(200).json({ status: "OK", timestamp: new Date().toISOString() });
// });

// // Test uploads directory
// app.get("/test-uploads", (req, res) => {
//   const uploadPath = path.join(__dirname, "Uploads", "test.txt");
//   try {
//     fs.writeFileSync(uploadPath, "Test file");
//     res.json({ success: true, message: "File written to Uploads" });
//   } catch (err) {
//     console.error("Test uploads error:", err);
//     res
//       .status(500)
//       .json({ error: "Failed to write to Uploads", details: err.message });
//   }
// });

// // 404 fallback
// app.use((req, res) => {
//   res.status(404).json({ error: "Not Found" });
// });

// // Global error handler
// app.use((err, req, res, next) => {
//   console.error("💥 Global Error:", err);
//   res
//     .status(500)
//     .json({ error: "Internal server error", details: err.message });
// });

// // Start server
// const PORT = process.env.PORT || 5000;
// const { QueryTypes } = Sequelize;

// (async () => {
//   try {
//     await sequelize.authenticate();
//     console.log("✅ PostgreSQL connected");

//     // Ensure Users table exists
//     await sequelize.query(`
//       CREATE TABLE IF NOT EXISTS "Users" (
//         id SERIAL PRIMARY KEY,
//         name TEXT NOT NULL,
//         email TEXT NOT NULL UNIQUE,
//         password TEXT NOT NULL,
//         role TEXT NOT NULL,
//         "createdAt" TIMESTAMP NOT NULL,
//         "updatedAt" TIMESTAMP NOT NULL
//       );
//     `);

//     // Ensure Courses table exists
//     await sequelize.query(`
//       CREATE TABLE IF NOT EXISTS "Courses" (
//         id INTEGER PRIMARY KEY,
//         title TEXT NOT NULL,
//         description TEXT,
//         category TEXT,
//         slug TEXT NOT NULL,
//         price INTEGER NOT NULL,
//         "teacherId" INTEGER NOT NULL,
//         "createdAt" TIMESTAMP NOT NULL,
//         "updatedAt" TIMESTAMP NOT NULL,
//         "attachmentUrls" TEXT[] DEFAULT ARRAY[]::TEXT[]
//       );
//     `);

//     // Ensure Lessons table exists
//     await sequelize.query(`
//       CREATE TABLE IF NOT EXISTS "Lessons" (
//         id SERIAL PRIMARY KEY,
//         "courseId" INTEGER NOT NULL REFERENCES "Courses"(id),
//         title TEXT NOT NULL,
//         content TEXT,
//         "contentType" TEXT DEFAULT 'text',
//         "contentUrl" TEXT,
//         "videoUrl" TEXT,
//         "orderIndex" INTEGER DEFAULT 0,
//         "isUnitHeader" BOOLEAN DEFAULT false,
//         "isPreview" BOOLEAN DEFAULT false,
//         unitId INTEGER,
//         "userId" INTEGER NOT NULL,
//         "createdAt" TIMESTAMP NOT NULL,
//         "updatedAt" TIMESTAMP NOT NULL
//       );
//     `);

//     // Ensure UserCourseAccess table exists
//     await sequelize.query(`
//       CREATE TABLE IF NOT EXISTS "UserCourseAccess" (
//         id SERIAL PRIMARY KEY,
//         userId INTEGER NOT NULL,
//         courseId INTEGER NOT NULL REFERENCES "Courses"(id),
//         approved BOOLEAN DEFAULT false,
//         "createdAt" TIMESTAMP NOT NULL,
//         "updatedAt" TIMESTAMP NOT NULL
//       );
//     `);

//     await sequelize.sync({ force: false });
//     console.log("✅ DB synced");

//     // Insert test user if not exists
//     const [user] = await sequelize.query(
//       `SELECT id FROM "Users" WHERE id = 1 AND role = 'teacher'`,
//       { type: QueryTypes.SELECT }
//     );
//     if (!user) {
//       await sequelize.query(
//         `INSERT INTO "Users" (id, name, email, role, password, "createdAt", "updatedAt")
//          VALUES (1, 'Test Teacher', 'teacher@example.com', 'teacher', 'hashed_password', NOW(), NOW())`,
//         { type: QueryTypes.INSERT }
//       );
//       console.log("✅ Test teacher inserted");
//     }

//     // Insert test course if not exists
//     const [course] = await sequelize.query(
//       `SELECT id FROM "Courses" WHERE id = 21`,
//       { type: QueryTypes.SELECT }
//     );
//     if (!course) {
//       await sequelize.query(
//         `INSERT INTO "Courses" (id, title, description, category, slug, price, "teacherId", "createdAt", "updatedAt")
//          VALUES (21, 'Test Course', 'Description', 'Math', 'test-course', 0, 1, NOW(), NOW())`,
//         { type: QueryTypes.INSERT }
//       );
//       console.log("✅ Test course inserted");
//     }

//     app.listen(PORT, "0.0.0.0", () =>
//       console.log(`🚀 Server running at http://localhost:${PORT}`)
//     );
//   } catch (err) {
//     console.error("❌ Server startup error:", err);
//     process.exit(1);
//   }
// })();



require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const { sequelize, Sequelize, User, Course, Lesson } = require("./models");
const authMiddleware = require("./middleware/authMiddleware");

const app = express();

// CORS configuration
const allowedOrigins = [
  "http://localhost:3000",
  "https://math-class-platform.netlify.app",
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, origin || "*");
      } else {
        console.error(`CORS not allowed for origin: ${origin}`);
        callback(new Error(`CORS not allowed for origin: ${origin}`));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
    optionsSuccessStatus: 204,
  })
);

// Handle preflight requests
app.options("*", cors());

// Trust proxy for Render
app.set("trust proxy", 1);

// Middleware
app.use(helmet());
app.use(morgan("combined"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

// Request Logger
app.use((req, res, next) => {
  console.log(
    `[${req.method}] ${req.originalUrl} from ${req.get("origin") || "N/A"}`
  );
  next();
});

// Rate limiting for API endpoints
app.use(
  "/api/v1/",
  rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 500, // Reduced to prevent abuse
    message: { error: "Too many requests, please try again later." },
  })
);

// Load routes dynamically
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
  } catch (err) {
    console.warn("⚠️ emailPreview route not loaded in production");
  }
}

// Mount routes
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

// Authenticated user info endpoint
app.get("/api/v1/users/me", authMiddleware, async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      console.error("No user ID in request");
      return res.status(401).json({ error: "Invalid token" });
    }
    const user = await User.findByPk(req.user.id, {
      attributes: ["id", "name", "email", "role", "subject"],
    });
    if (!user) {
      console.error(`User not found for ID: ${req.user.id}`);
      return res.status(404).json({ error: "User not found" });
    }
    res.json(user);
  } catch (error) {
    console.error("Failed to fetch user:", error.message);
    res
      .status(500)
      .json({ error: "Failed to fetch user", details: error.message });
  }
});

// Health check
app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK", timestamp: new Date().toISOString() });
});

// 404 fallback
app.use((req, res) => {
  res.status(404).json({ error: "Not Found" });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("💥 Global Error:", err.stack || err.message);
  res
    .status(500)
    .json({ error: "Internal server error", details: err.message });
});

// Start server
const PORT = process.env.PORT || 5000;
const { QueryTypes } = Sequelize;

(async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ PostgreSQL connected");

    // Ensure Users table
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS "Users" (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        role TEXT NOT NULL,
        subject TEXT,
        "createdAt" TIMESTAMP NOT NULL,
        "updatedAt" TIMESTAMP NOT NULL
      );
    `);

    // Ensure Courses table
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS "Courses" (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        category TEXT,
        slug TEXT NOT NULL UNIQUE,
        price INTEGER NOT NULL,
        "teacherId" INTEGER NOT NULL REFERENCES "Users"(id),
        "createdAt" TIMESTAMP NOT NULL,
        "updatedAt" TIMESTAMP NOT NULL,
        "attachmentUrls" TEXT[] DEFAULT ARRAY[]::TEXT[]
      );
    `);

    // Ensure Lessons table
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS "Lessons" (
        id SERIAL PRIMARY KEY,
        "courseId" INTEGER NOT NULL REFERENCES "Courses"(id),
        title TEXT NOT NULL,
        content TEXT,
        "contentType" TEXT DEFAULT 'text',
        "contentUrl" TEXT,
        "videoUrl" TEXT,
        "orderIndex" INTEGER DEFAULT 0,
        "isUnitHeader" BOOLEAN DEFAULT false,
        "isPreview" BOOLEAN DEFAULT false,
        unitId INTEGER,
        "userId" INTEGER NOT NULL REFERENCES "Users"(id),
        "createdAt" TIMESTAMP NOT NULL,
        "updatedAt" TIMESTAMP NOT NULL
      );
    `);

    // Ensure UserCourseAccess table
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS "UserCourseAccess" (
        id SERIAL PRIMARY KEY,
        userId INTEGER NOT NULL REFERENCES "Users"(id),
        courseId INTEGER NOT NULL REFERENCES "Courses"(id),
        approved BOOLEAN DEFAULT false,
        "createdAt" TIMESTAMP NOT NULL,
        "updatedAt" TIMESTAMP NOT NULL
      );
    `);

    await sequelize.sync({ force: false });
    console.log("✅ DB synced");

    // Insert test user if not exists
    const [user] = await sequelize.query(
      `SELECT id FROM "Users" WHERE id = 1 AND role = 'teacher'`,
      { type: QueryTypes.SELECT }
    );
    if (!user) {
      const bcrypt = require("bcrypt");
      const hashedPassword = await bcrypt.hash("password123", 10);
      await sequelize.query(
        `INSERT INTO "Users" (id, name, email, role, password, subject, "createdAt", "updatedAt")
         VALUES (1, 'Test Teacher', 'teacher@example.com', 'teacher', :password, 'Algebra', NOW(), NOW())`,
        { replacements: { password: hashedPassword }, type: QueryTypes.INSERT }
      );
      console.log("✅ Test teacher inserted");
    }

    // Insert test course if not exists
    const [course] = await sequelize.query(
      `SELECT id FROM "Courses" WHERE id = 21`,
      { type: QueryTypes.SELECT }
    );
    if (!course) {
      await sequelize.query(
        `INSERT INTO "Courses" (id, title, description, category, slug, price, "teacherId", "createdAt", "updatedAt")
         VALUES (21, 'Test Course', 'A test course for algebra', 'Math', 'test-course', 0, 1, NOW(), NOW())`,
        { type: QueryTypes.INSERT }
      );
      console.log("✅ Test course inserted");
    }

    app.listen(PORT, "0.0.0.0", () =>
      console.log(`🚀 Server running at http://localhost:${PORT}`)
    );
  } catch (err) {
    console.error("❌ Server startup error:", err);
    process.exit(1);
  }
})();