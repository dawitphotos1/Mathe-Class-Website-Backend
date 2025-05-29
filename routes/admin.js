
const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");

// Middleware to restrict to admin
function isAdmin(req, res, next) {
  if (req.user && req.user.role === "admin") {
    return next();
  }
  return res.status(403).json({ error: "Forbidden" });
}

// Placeholder for admin-specific routes (e.g., user management)
// Add routes as needed
router.get("/health", authMiddleware, isAdmin, (req, res) => {
  res.json({ status: "Admin API is healthy" });
});

module.exports = router;
