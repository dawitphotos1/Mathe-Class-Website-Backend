
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

// Utility to filter log lines by action
const filterLogLines = (content, action) => {
  if (!action) return content;
  const lines = content.split("\n");
  return lines.filter((line) => line.includes(`] ${action}`)).join("\n");
};

// ✅ View lesson logs (plain text, optional ?action=DELETE)
router.get("/lesson-logs", authenticate, async (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ error: "Access denied" });
  }

  const action = req.query.action; // e.g., ?action=DELETE
  const logPath = path.join(__dirname, "../logs/lesson-actions.log");

  try {
    const content = fs.readFileSync(logPath, "utf8");
    const filtered = filterLogLines(content, action);
    res.setHeader("Content-Type", "text/plain");
    res.send(filtered || "📄 No matching logs.");
  } catch (err) {
    res
      .status(500)
      .json({ error: "Failed to read log file", details: err.message });
  }
});

// ✅ Download raw log file
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

// ✅ Download filtered log as CSV
router.get("/lesson-logs/download.csv", authenticate, (req, res) => {
  if (req.user.role !== "admin")
    return res.status(403).json({ error: "Access denied" });

  const action = req.query.action;
  const logPath = path.join(__dirname, "../logs/lesson-actions.log");

  if (!fs.existsSync(logPath))
    return res.status(404).json({ error: "Log not found" });

  const raw = fs.readFileSync(logPath, "utf8");
  const lines = raw.split("\n").filter((line) => line.trim().length > 0);
  const filtered = action
    ? lines.filter((l) => l.includes(`] ${action}`))
    : lines;

  const csv = ["timestamp,action,email,title,lessonId"];
  for (const line of filtered) {
    const match = line.match(
      /\[(.*?)\] (\w+) by (.*?) on "(.*?)" \(ID: (\d+)\)/
    );
    if (match) {
      csv.push(`${match[1]},${match[2]},${match[3]},${match[4]},${match[5]}`);
    }
  }

  res.setHeader("Content-Type", "text/csv");
  res.setHeader(
    "Content-Disposition",
    "attachment; filename=lesson-actions.csv"
  );
  res.send(csv.join("\n"));
});

module.exports = router;
