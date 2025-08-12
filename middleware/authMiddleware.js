// const jwt = require("jsonwebtoken");

// module.exports = (req, res, next) => {
//   const token = req.headers.authorization?.split(" ")[1];
//   if (!token) return res.status(401).json({ error: "No token provided" });

//   try {
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     req.user = decoded;
//     next();
//   } catch (err) {
//     return res.status(401).json({ error: "Invalid token" });
//   }
// };





const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized: No token provided" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // ✅ Attach user
    console.log("✅ Authenticated user:", decoded); // ✅ Debug line
    next();
  } catch (err) {
    console.error("❌ Token verification failed:", err.message); // ✅ Debug line
    return res.status(401).json({ error: "Unauthorized: Invalid token" });
  }
};
