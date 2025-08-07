
// const jwt = require("jsonwebtoken");

// module.exports = (req, res, next) => {
//   const token = req.header("Authorization")?.replace("Bearer ", "");
//   if (!token) {
//     console.log("🔍 No token provided for path:", req.path);
//     req.user = null; // Allow public routes to proceed
//     return next();
//   }
//   try {
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     req.user = decoded;
//     console.log("🔍 Token decoded, user:", decoded.id);
//     next();
//   } catch (err) {
//     console.error("🔥 Auth middleware error:", {
//       message: err.message,
//       stack: err.stack,
//       path: req.path,
//     });
//     res.status(401).json({ error: "Invalid token" });
//   }
// };




const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");
  if (!token) {
    console.log("🔍 No token provided for path:", req.path);
    return res.status(401).json({ error: "No token provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    console.error("🔥 Auth middleware error:", err.message);
    return res.status(401).json({ error: "Invalid token" });
  }
};
