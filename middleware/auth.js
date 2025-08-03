// Example /middleware/auth.js

const jwt = require("jsonwebtoken");

// Auth middleware
const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "No token" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: "Invalid token" });
  }
};

// Role-based check
const checkTeacherOrAdmin = (req, res, next) => {
  if (["teacher", "admin"].includes(req.user?.role)) {
    next();
  } else {
    res.status(403).json({ error: "Access denied" });
  }
};

module.exports = {
  authMiddleware,
  checkTeacherOrAdmin,
};
