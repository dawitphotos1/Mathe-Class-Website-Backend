
// // const jwt = require("jsonwebtoken");

// // const authMiddleware = (req, res, next) => {
// //   const authHeader = req.header("Authorization");
// //   console.log("AuthMiddleware: Authorization header:", authHeader || "None");

// //   if (!authHeader || !authHeader.startsWith("Bearer ")) {
// //     console.log("AuthMiddleware: Missing or invalid Authorization header");
// //     return res
// //       .status(401)
// //       .json({ success: false, error: "Unauthorized: No valid token provided" });
// //   }

// //   const token = authHeader.replace("Bearer ", "");
// //   console.log(
// //     "AuthMiddleware: Received token:",
// //     token ? `${token.substring(0, 20)}...` : "None"
// //   );

// //   try {
// //     const decoded = jwt.verify(token, process.env.JWT_SECRET);
// //     console.log("AuthMiddleware: Decoded token:", decoded);
// //     req.user = decoded; // Expect { id, role, email }
// //     next();
// //   } catch (err) {
// //     console.error("AuthMiddleware: Token verification failed:", {
// //       message: err.message,
// //       name: err.name,
// //       tokenPrefix: token ? token.substring(0, 20) + "..." : "None",
// //     });
// //     res
// //       .status(401)
// //       .json({
// //         success: false,
// //         error: `Unauthorized: Invalid token (${err.message})`,
// //       });
// //   }
// // };

// // module.exports = authMiddleware;




// const jwt = require("jsonwebtoken");

// const authMiddleware = (req, res, next) => {
//   const authHeader = req.header("Authorization");
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
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     console.log("AuthMiddleware: Decoded token:", decoded);
//     req.user = decoded; // { id, role, email }
//     next();
//   } catch (err) {
//     console.error("AuthMiddleware: Token verification failed:", {
//       message: err.message,
//       name: err.name,
//       tokenPrefix: token ? token.substring(0, 20) + "..." : "None",
//     });
//     res.status(401).json({
//       success: false,
//       error: `Unauthorized: Invalid token (${err.message})`,
//     });
//   }
// };

// module.exports = authMiddleware;





const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      console.error("[authMiddleware] No token provided");
      return res.status(401).json({ error: "No token provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded.id) {
      console.error("[authMiddleware] Invalid token: No user ID");
      return res.status(401).json({ error: "Invalid token" });
    }

    req.user = { id: decoded.id, role: decoded.role };
    console.log(
      `[authMiddleware] User authenticated: ID=${req.user.id}, Role=${req.user.role}`
    );
    next();
  } catch (error) {
    console.error("[authMiddleware] Authentication error:", error.message);
    return res
      .status(401)
      .json({ error: "Authentication failed", details: error.message });
  }
};