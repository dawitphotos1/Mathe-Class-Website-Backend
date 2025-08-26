// // middleware/authorize.js

// const jwt = require("jsonwebtoken");

// // Middleware to check JWT and user role
// const authorize = (requiredRole) => {
//   return (req, res, next) => {
//     try {
//       const authHeader = req.headers.authorization;

//       if (!authHeader || !authHeader.startsWith("Bearer ")) {
//         return res.status(401).json({ error: "Authorization token missing" });
//       }

//       const token = authHeader.split(" ")[1];
//       const decoded = jwt.verify(token, process.env.JWT_SECRET);

//       // Optional: attach user info to request
//       req.user = decoded;

//       if (requiredRole && decoded.role !== requiredRole) {
//         return res.status(403).json({ error: "Access denied" });
//       }

//       next();
//     } catch (err) {
//       console.error("Authorization Error:", err);
//       res.status(401).json({ error: "Invalid or expired token" });
//     }
//   };
// };

// module.exports = authorize;




// middleware/authorize.js
const jwt = require("jsonwebtoken");

const authorize = (requiredRole) => {
  return (req, res, next) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ error: "Unauthorized: No token provided" });
      }

      const token = authHeader.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;

      if (requiredRole && decoded.role !== requiredRole) {
        return res.status(403).json({ error: "Forbidden: Insufficient permissions" });
      }

      next();
    } catch (err) {
      console.error("Authorization Error:", err.message);
      res.status(403).json({ error: "Session expired or invalid token" });
    }
  };
};

module.exports = authorize;
