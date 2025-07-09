
// const express = require("express");
// const router = express.Router(); // ✅ This was missing
// const authMiddleware = require("../middleware/authMiddleware");

// // Middleware to restrict to admin
// function isAdmin(req, res, next) {
//   if (req.user && req.user.role === "admin") {
//     return next();
//   }
//   return res.status(403).json({ error: "Forbidden" });
// }

// // Example admin-only route
// router.get("/health", authMiddleware, isAdmin, (req, res) => {
//   res.json({ status: "Admin API is healthy" });
// });

// module.exports = router;



const express = require("express");
const fs = require("fs");
const path = require("path");
const router = express.Router();
const authenticate = require("../middleware/authenticate");

// ✅ View lesson audit logs (admin only)
router.get("/lesson-logs", authenticate, async (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ error: "Access denied" });
  }

  const logPath = path.join(__dirname, "../logs/lesson-actions.log");

  try {
    const content = fs.readFileSync(logPath, "utf8");
    res.setHeader("Content-Type", "text/plain");
    res.send(content || "📄 No logs available.");
  } catch (err) {
    res
      .status(500)
      .json({ error: "Failed to read log file", details: err.message });
  }
});

// ✅ Download lesson log as file
router.get("/lesson-logs/download", authenticate, (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ error: "Access denied" });
  }

  const filePath = path.join(__dirname, "../logs/lesson-actions.log");

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: "Log file not found" });
  }

  res.download(filePath, "lesson-actions.log");
});

module.exports = router;
