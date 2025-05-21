

// const express = require("express");
// const dotenv = require("dotenv");
// const cors = require("cors");
// const rateLimit = require("express-rate-limit");
// const { sequelize } = require("./models");

// dotenv.config();

// const app = express();

// // Determine environment
// const isProduction = process.env.NODE_ENV === "production";

// // CORS Middleware
// // app.use(
// //   cors({
// //     origin: isProduction
// //       ? [process.env.FRONTEND_URL, "https://math-class-platform.netlify.app"]
// //       : true, // Allow all origins in development
// //     credentials: true,
// //   })
// // );

// const allowedOrigins = [
//   process.env.FRONTEND_URL,
//   "https://math-class-platform.netlify.app",
//   "http://localhost:3000",
// ];

// app.use(
//   cors({
//     origin: (origin, callback) => {
//       if (!origin || allowedOrigins.includes(origin)) {
//         callback(null, true);
//       } else {
//         callback(new Error("Not allowed by CORS"));
//       }
//     },
//     credentials: true,
//   })
// );


// // Basic Middleware
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));
// app.use(express.static("public"));

// // Rate Limiting (for auth/payment routes)
// const limiter = rateLimit({
//   windowMs: 15 * 60 * 1000,
//   max: 100,
// });
// app.use("/api/v1/auth", limiter);
// app.use("/api/v1/payments", limiter);

// // API Routes
// app.use("/api/v1/auth", require("./routes/auth"));
// app.use("/api/v1/users", require("./routes/users"));
// app.use("/api/v1/courses", require("./routes/courses"));
// app.use("/api/v1/payments", require("./routes/payments"));
// app.use("/api/v1/email", require("./routes/email"));
// app.use("/api/v1/admin", require("./routes/admin"));
// app.use("/api/v1/progress", require("./routes/progress"));

// // Health Check
// app.get("/health", (req, res) => {
//   res.status(200).json({ status: "OK" });
// });

// // Error Handling Middleware
// app.use(require("./middleware/errorHandler"));

// // Server & DB Setup
// const PORT = process.env.PORT || 5000;

// (async () => {
//   try {
//     await sequelize.authenticate();
//     console.log("✅ PostgreSQL connection established");

//     // Sync database schema with existing tables
//     // await sequelize.sync({ alter: true }); // Updates tables to match models without dropping
//     console.log("✅ Database synced");

//     app.listen(PORT, "0.0.0.0", () => {
//       console.log(`✅ Server running on port ${PORT}`);
//     });
//   } catch (error) {
//     console.error("❌ Failed to start server:", error);
//     process.exit(1);
//   }
// })();





const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const { sequelize } = require("./models");

dotenv.config();

const app = express();

// Determine environment
const isProduction = process.env.NODE_ENV === "production";

// CORS Middleware
const allowedOrigins = [
  process.env.FRONTEND_URL,
  "https://math-class-platform.netlify.app",
  "http://localhost:3000",
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

// Basic Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

// Rate Limiting (for auth/payment routes)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});
app.use("/api/v1/auth", limiter);
app.use("/api/v1/payments", limiter);

// API Routes
app.use("/api/v1/auth", require("./routes/auth"));
app.use("/api/v1/users", require("./routes/users"));
app.use("/api/v1/courses", require("./routes/courses"));
app.use("/api/v1/payments", require("./routes/payments"));
app.use("/api/v1/email", require("./routes/email"));
app.use("/api/v1/admin", require("./routes/admin"));
app.use("/api/v1/progress", require("./routes/progress"));

// Health Check
app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK" });
});

// Error Handling Middleware
app.use(require("./middleware/errorHandler"));

// Server & DB Setup
const PORT = process.env.PORT || 5000;

(async () => {
  try {
    // ✅ Log the DB connection string before connecting
    console.log("Connecting to DB:", process.env.DATABASE_URL);

    await sequelize.authenticate();
    console.log("✅ PostgreSQL connection established");

    // Sync database schema with existing tables
    // await sequelize.sync({ alter: true });
    console.log("✅ Database synced");

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`✅ Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
})();
