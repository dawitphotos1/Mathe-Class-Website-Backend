// const jwt = require("jsonwebtoken");

// const authMiddleware = (req, res, next) => {
//   const authHeader = req.header("Authorization");

//   // Log Authorization header for debugging
//   console.log("AuthMiddleware: Authorization header:", authHeader || "None");

//   // ✅ Always set CORS headers even on auth errors
//   res.header("Access-Control-Allow-Origin", req.headers.origin || "*");
//   res.header("Access-Control-Allow-Credentials", "true");

//   if (!authHeader || !authHeader.startsWith("Bearer ")) {
//     console.log("AuthMiddleware: Missing or invalid Authorization header");
//     return res
//       .status(401)
//       .json({ success: false, error: "Unauthorized: No valid token provided" });
//   }

//   const token = authHeader.replace("Bearer ", "");
//   console.log(
//     "AuthMiddleware: Received token:",
//     token ? `${token.substring(0, 20)}...` : "None"
//   );

//   try {
//     // Verify token with JWT_SECRET
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     console.log("AuthMiddleware: Decoded token:", decoded);

//     // Attach decoded user data to the request object
//     req.user = decoded; // { id, role, email }
//     next();
//   } catch (err) {
//     console.error("AuthMiddleware: Token verification failed:", {
//       message: err.message,
//       name: err.name,
//       tokenPrefix: token ? token.substring(0, 20) + "..." : "None",
//     });

//     // Send an unauthorized response if token verification fails
//     res.status(401).json({
//       success: false,
//       error: `Unauthorized: Invalid token (${err.message})`,
//     });
//   }
// };

// module.exports = authMiddleware;






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

