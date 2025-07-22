// middleware/authMiddleware.js
const jwt = require("jsonwebtoken");
const { User } = require("../models");

const authMiddleware = async (req, res, next) => {
  const authHeader = req.header("Authorization");
  res.header("Access-Control-Allow-Origin", req.headers.origin || "*");
  res.header("Access-Control-Allow-Credentials", "true");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res
      .status(401)
      .json({ success: false, error: "Unauthorized: No valid token provided" });
  }

  const token = authHeader.replace("Bearer ", "");

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findByPk(decoded.id);

    if (!user) {
      return res.status(401).json({ success: false, error: "User not found" });
    }

    req.user = user; // ✅ Attach full user object (with id, role, etc.)
    next();
  } catch (err) {
    res.status(401).json({
      success: false,
      error: `Unauthorized: Invalid token (${err.message})`,
    });
  }
};

module.exports = authMiddleware;

