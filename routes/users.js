
// const express = require("express");
// const router = express.Router();

// const bcrypt = require("bcrypt");
// const jwt = require("jsonwebtoken");
// const { User } = require("../models"); // Adjust path if needed

// // Login route
// router.post("/login", async (req, res) => {
//   try {
//     let { email, password } = req.body;
//     if (!email || !password) {
//       return res.status(400).json({ error: "Email and password are required" });
//     }

//     email = email.toLowerCase().trim();
//     console.log("Login attempt for email:", email);

//     const user = await User.findOne({ where: { email } });
//     if (!user) {
//       console.log("Login failed: No user found for email:", email);
//       return res.status(401).json({ error: "No user found with this email" });
//     }

//     // Log password comparison details
//     console.log("User found:", user.email, "Comparing passwords...");
//     const isPasswordValid = await bcrypt.compare(password, user.password);
//     if (!isPasswordValid) {
//       console.log("Login failed: Incorrect password for user:", user.email);
//       return res.status(401).json({ error: "Incorrect password" });
//     }

//     // Approval checks
//     if (user.approvalStatus === "pending") {
//       console.log("User pending approval:", user.email, user.approvalStatus);
//       return res
//         .status(403)
//         .json({ error: "Your account is pending approval" });
//     }
//     if (user.approvalStatus === "rejected") {
//       console.log("User rejected:", user.email, user.approvalStatus);
//       return res.status(403).json({ error: "Your account has been rejected" });
//     }

//     if (!process.env.JWT_SECRET) {
//       return res
//         .status(500)
//         .json({ error: "Server error: missing JWT secret" });
//     }

//     const token = jwt.sign(
//       { id: user.id, role: user.role },
//       process.env.JWT_SECRET,
//       { expiresIn: process.env.JWT_EXPIRATION_TIME || "1h" }
//     );

//     console.log("Login successful for user ID:", user.id);
//     res.json({
//       token,
//       user: {
//         id: user.id,
//         name: user.name,
//         email: user.email,
//         role: user.role,
//         subject: user.subject,
//         approvalStatus: user.approvalStatus,
//       },
//     });
//   } catch (err) {
//     console.error("Login error:", err);
//     res.status(500).json({ error: "Failed to log in", details: err.message });
//   }
// });

// module.exports = router;



const express = require("express");
const router = express.Router();

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { User } = require("../models"); // Adjust path if needed
const authMiddleware = require("../middleware/authMiddleware"); // ✅ Import middleware

// ✅ GET /api/v1/users/me - Return the current authenticated user's profile
router.get("/me", authMiddleware, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: ["id", "name", "email", "role", "subject", "approvalStatus"],
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(user);
  } catch (err) {
    console.error("Failed to fetch user profile:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ✅ POST /api/v1/users/login
router.post("/login", async (req, res) => {
  try {
    let { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    email = email.toLowerCase().trim();
    console.log("Login attempt for email:", email);

    const user = await User.findOne({ where: { email } });
    if (!user) {
      console.log("Login failed: No user found for email:", email);
      return res.status(401).json({ error: "No user found with this email" });
    }

    console.log("User found:", user.email, "Comparing passwords...");
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      console.log("Login failed: Incorrect password for user:", user.email);
      return res.status(401).json({ error: "Incorrect password" });
    }

    if (user.approvalStatus === "pending") {
      console.log("User pending approval:", user.email, user.approvalStatus);
      return res
        .status(403)
        .json({ error: "Your account is pending approval" });
    }
    if (user.approvalStatus === "rejected") {
      console.log("User rejected:", user.email, user.approvalStatus);
      return res.status(403).json({ error: "Your account has been rejected" });
    }

    if (!process.env.JWT_SECRET) {
      return res
        .status(500)
        .json({ error: "Server error: missing JWT secret" });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRATION_TIME || "1h" }
    );

    console.log("Login successful for user ID:", user.id);
    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        subject: user.subject,
        approvalStatus: user.approvalStatus,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Failed to log in", details: err.message });
  }
});

module.exports = router;

