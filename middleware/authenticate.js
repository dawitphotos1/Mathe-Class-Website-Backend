// // middleware/authenticate.js
// const jwt = require("jsonwebtoken");
// const { User } = require("../models");

// module.exports = async function authenticate(req, res, next) {
//   try {
//     let token;

//     // Check Authorization header
//     if (
//       req.headers.authorization &&
//       req.headers.authorization.startsWith("Bearer ")
//     ) {
//       token = req.headers.authorization.split(" ")[1];
//     }
//     // Or check cookies
//     else if (req.cookies && req.cookies.token) {
//       token = req.cookies.token;
//     }

//     if (!token) {
//       return res.status(401).json({ error: "Not authorized, token missing" });
//     }

//     // Verify token
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);

//     // Load the user from DB (exclude password)
//     const user = await User.findByPk(decoded.id, {
//       attributes: { exclude: ["password"] },
//     });

//     if (!user) {
//       return res.status(401).json({ error: "Not authorized, user not found" });
//     }

//     // Attach to request
//     req.user = {
//       id: user.id,
//       name: user.name,
//       email: user.email,
//       role: user.role,
//       approvalStatus: user.approvalStatus,
//     };

//     next();
//   } catch (err) {
//     console.error("Auth middleware error:", err);
//     return res.status(401).json({ error: "Not authorized" });
//   }
// };



// middleware/authenticate.js
const jwt = require("jsonwebtoken");
const { User } = require("../models");

module.exports = async function authenticate(req, res, next) {
  try {
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer ")
    ) {
      token = req.headers.authorization.split(" ")[1];
    } else if (req.cookies?.token) {
      token = req.cookies.token;
    }

    if (!token) {
      return res.status(401).json({ error: "Not authorized, token missing" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findByPk(decoded.id, {
      attributes: { exclude: ["password"] },
    });

    if (!user) {
      return res.status(401).json({ error: "Not authorized, user not found" });
    }

    req.user = user; // important: set the full user object

    console.log("✅ Authenticated:", user.email, "| Role:", user.role);

    next();
  } catch (err) {
    console.error("❌ Auth error:", err);
    return res.status(401).json({ error: "Not authorized" });
  }
};
