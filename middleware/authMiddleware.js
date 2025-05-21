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

const authMiddleware = (req, res, next) => {
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
    req.user = decoded;
    if (!decoded.email) {
      console.warn("Auth Middleware - No email in token");
    }
    next();
  } catch (err) {
    console.error("Token verification failed:", err.message);
    res
      .status(401)
      .json({ success: false, error: "Unauthorized: Invalid token" });
  }
};

module.exports = authMiddleware;