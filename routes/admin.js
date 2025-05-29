
const express = require("express");
const router = express.Router(); // ✅ This was missing
const authMiddleware = require("../middleware/authMiddleware");

// Middleware to restrict to admin
function isAdmin(req, res, next) {
  if (req.user && req.user.role === "admin") {
    return next();
  }
  return res.status(403).json({ error: "Forbidden" });
}

// Example admin-only route
router.get("/health", authMiddleware, isAdmin, (req, res) => {
  res.json({ status: "Admin API is healthy" });
});

module.exports = router;

