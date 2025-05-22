// const { Sequelize, DataTypes } = require("sequelize");
// const sequelize = require("../config/db");

// // Importing models with correct filenames (case-sensitive)
// const User = require("./User")(sequelize, DataTypes);
// const Lesson = require("./Lesson")(sequelize, DataTypes);
// const Course = require("./Course")(sequelize, DataTypes);
// const UserCourseAccess = require("./UserCourseAccess")(sequelize, DataTypes);

// // Define associations
// User.belongsToMany(Course, {
//   through: UserCourseAccess,
//   foreignKey: "userId",
//   otherKey: "courseId",
// });

// Course.belongsToMany(User, {
//   through: UserCourseAccess,
//   foreignKey: "courseId",
//   otherKey: "userId",
// });

// UserCourseAccess.belongsTo(User, { foreignKey: "userId", as: "user" });
// UserCourseAccess.belongsTo(Course, { foreignKey: "courseId", as: "course" });

// Lesson.belongsTo(Course, { foreignKey: "courseId" });
// Lesson.belongsTo(User, { foreignKey: "userId" });


// module.exports = { sequelize, User, Lesson, Course, UserCourseAccess };



const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const { sequelize } = require("./models");

dotenv.config();

const app = express();

// ✅ Trusted proxy (important for hosted environments like Render)
app.set("trust proxy", 1);

// ✅ CORS whitelist (for localhost + Netlify frontend)
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
        console.log("❌ CORS blocked origin:", origin);
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// ✅ Handle preflight requests for all routes
app.options("*", cors());

// ✅ Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Serve static files
app.use(express.static("public"));

// ✅ Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});
app.use("/api/v1/auth", limiter);
app.use("/api/v1/payments", limiter);

// ✅ Routes
app.use("/api/v1/auth", require("./routes/auth"));
app.use("/api/v1/users", require("./routes/users"));
app.use("/api/v1/courses", require("./routes/courses"));
app.use("/api/v1/payments", require("./routes/payments"));
app.use("/api/v1/email", require("./routes/email"));
app.use("/api/v1/admin", require("./routes/admin"));
app.use("/api/v1/progress", require("./routes/progress"));

// ✅ Health check route
app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK" });
});

// ✅ Global error handler
app.use(require("./middleware/errorHandler"));

// ✅ Start the server
const PORT = process.env.PORT || 5000;
(async () => {
  try {
    console.log("Connecting to DB:", process.env.DATABASE_URL);
    await sequelize.authenticate();
    console.log("✅ PostgreSQL connection established");
    console.log("✅ Database synced");
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`✅ Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
})();
