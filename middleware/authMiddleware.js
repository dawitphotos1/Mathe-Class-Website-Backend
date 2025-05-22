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
  const authHeader = req.header("Authorization");
  console.log("AuthMiddleware: Authorization header:", authHeader || "None");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    console.log("AuthMiddleware: Missing or invalid Authorization header");
    return res
      .status(401)
      .json({ success: false, error: "Unauthorized: No valid token provided" });
  }

  const token = authHeader.replace("Bearer ", "");
  console.log(
    "AuthMiddleware: Received token:",
    token ? `${token.substring(0, 20)}...` : "None"
  );

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("AuthMiddleware: Decoded token:", decoded);
    req.user = decoded; // Expect { id, role, email }
    next();
  } catch (err) {
    console.error("AuthMiddleware: Token verification failed:", {
      message: err.message,
      name: err.name,
      tokenPrefix: token ? token.substring(0, 20) + "..." : "None",
    });
    res
      .status(401)
      .json({
        success: false,
        error: `Unauthorized: Invalid token (${err.message})`,
      });
  }
};

module.exports = authMiddleware;