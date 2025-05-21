// const jwt = require("jsonwebtoken");
// const { User } = require("../models");

// module.exports = async (req, res, next) => {
//   try {
//     const token = req.headers.authorization?.split(" ")[1];
//     if (!token) {
//       return res.status(401).json({ error: "No token provided" });
//     }

//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     const user = await User.findByPk(decoded.id);
//     if (!user) {
//       return res.status(401).json({ error: "Invalid token" });
//     }

//     req.user = user;
//     next();
//   } catch (err) {
//     console.error("Auth error:", err);
//     res.status(401).json({ error: "Unauthorized" });
//   }
// };


const jwt = require("jsonwebtoken");
const { User } = require("../models");

const auth = async (req, res, next) => {
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
    const user = await User.findByPk(decoded.userId);
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

module.exports = auth;