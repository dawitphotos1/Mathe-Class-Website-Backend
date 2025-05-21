// const jwt = require("jsonwebtoken");

// const authMiddleware = (req, res, next) => {
//   const token = req.header("Authorization")?.replace("Bearer ", "");
//   if (!token) {
//     return res
//       .status(401)
//       .json({ success: false, error: "Unauthorized: No token provided" });
//   }
//   try {
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     req.user = decoded;
//     next();
//   } catch (err) {
//     console.error("Token verification failed:", err.message);
//     res
//       .status(401)
//       .json({ success: false, error: "Unauthorized: Invalid token" });
//   }
// };

// module.exports = authMiddleware;

const jwt = require("jsonwebtoken");
const { User } = require("../models");

const authMiddleware = async (req, res, next) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");
  console.log(
    "Auth Middleware - Token:",
    token ? token.substring(0, 20) + "..." : "No token"
  );
  if (!token) {
    return res
      .status(401)
      .json({ success: false, error: "Unauthorized: No token provided" });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Auth Middleware - Decoded User:", decoded);
    let user;
    try {
      user = await User.findByPk(decoded.userId);
    } catch (dbError) {
      console.error("Auth Middleware - Database error:", dbError.message);
      return res
        .status(500)
        .json({
          success: false,
          error: "Database error: Unable to fetch user",
        });
    }
    if (!user) {
      console.warn("Auth Middleware - User not found for ID:", decoded.userId);
      return res
        .status(401)
        .json({ success: false, error: "Unauthorized: Invalid token" });
    }
    if (!user.email) {
      console.warn("Auth Middleware - No email for user ID:", decoded.userId);
      return res
        .status(401)
        .json({ success: false, error: "Unauthorized: User email missing" });
    }
    req.user = user;
    next();
  } catch (err) {
    console.error("Auth Middleware - Token verification failed:", err.message);
    res
      .status(401)
      .json({ success: false, error: "Unauthorized: Invalid token" });
  }
};

module.exports = authMiddleware;