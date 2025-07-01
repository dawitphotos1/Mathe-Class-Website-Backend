
const jwt = require("jsonwebtoken");
const { User } = require("../models");

module.exports = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized - No token provided" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findByPk(decoded.id);

    if (!user) {
      return res.status(401).json({ error: "Unauthorized - User not found" });
    }

    req.user = user; // ✅ Attach user to request
    next();
  } catch (err) {
    console.error("JWT verification failed:", err.message);
    return res.status(401).json({ error: "Unauthorized - Invalid token" });
  }
};
