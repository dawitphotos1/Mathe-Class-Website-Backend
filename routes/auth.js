
// const express = require("express");
// const bcrypt = require("bcryptjs");
// const jwt = require("jsonwebtoken");
// const { User } = require("../models");

// const router = express.Router();

// // ✅ Register a new user
// router.post("/register", async (req, res) => {
//   try {
//     let { name, email, password, role } = req.body;

//     if (!name || !email || !password) {
//       return res.status(400).json({ success: false, error: "All fields are required" });
//     }

//     // Normalize email
//     email = email.toLowerCase().trim();

//     // Check if user already exists
//     const existingUser = await User.findOne({ where: { email } });
//     if (existingUser) {
//       return res.status(409).json({ success: false, error: "Email already in use" });
//     }

//     // Create new user — password is hashed via model hook
//     const user = await User.create({
//       name,
//       email,
//       password,
//       role,
//     });

//     return res.status(201).json({
//       success: true,
//       message: "User registered successfully",
//       user: {
//         id: user.id,
//         name: user.name,
//         email: user.email,
//         role: user.role,
//         approvalStatus: user.approvalStatus,
//       },
//     });
//   } catch (err) {
//     console.error("Registration error:", err);
//     return res.status(500).json({ success: false, error: "Registration failed", details: err.message });
//   }
// });

// // ✅ Login user
// router.post("/login", async (req, res) => {
//   try {
//     let { email, password } = req.body;

//     if (!email || !password) {
//       return res.status(400).json({ success: false, error: "Email and password are required" });
//     }

//     email = email.toLowerCase().trim();

//     const user = await User.findOne({ where: { email } });

//     if (!user) {
//       return res.status(401).json({
//         success: false,
//         error: "Invalid email or password. Please try again",
//       });
//     }

//     const isMatch = await bcrypt.compare(password, user.password);
//     if (!isMatch) {
//       return res.status(401).json({
//         success: false,
//         error: "Invalid email or password. Please try again",
//       });
//     }

//     if (user.approvalStatus === "pending") {
//       return res.status(403).json({
//         success: false,
//         error: "Your account is awaiting approval",
//       });
//     }

//     if (user.approvalStatus === "rejected") {
//       return res.status(403).json({
//         success: false,
//         error: "Your account has been rejected",
//       });
//     }

//     const token = jwt.sign(
//       { userId: user.id, role: user.role, name: user.name },
//       process.env.JWT_SECRET,
//       { expiresIn: "7d" }
//     );

//     await user.update({ lastLogin: new Date() });

//     return res.json({
//       success: true,
//       message: "Login successful",
//       token,
//       user: {
//         id: user.id,
//         name: user.name,
//         email: user.email,
//         role: user.role,
//         approvalStatus: user.approvalStatus,
//       },
//     });
//   } catch (err) {
//     console.error("Login error:", err);
//     return res.status(500).json({
//       success: false,
//       error: "Login failed",
//       details: err.message,
//     });
//   }
// });

// module.exports = router;



const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { User } = require("../models");

const router = express.Router();

// ✅ Register a new user
router.post("/register", async (req, res) => {
  try {
    let { name, email, password, role, subject } = req.body;

    if (!name || !email || !password || !role) {
      return res
        .status(400)
        .json({ success: false, error: "All fields are required" });
    }

    email = email.toLowerCase().trim();

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res
        .status(409)
        .json({ success: false, error: "Email already in use" });
    }

    // Default subject to null if role is admin
    if (role === "admin") {
      subject = null;
    }

    // Create user (approvalStatus: 'pending' is explicitly set)
    const newUser = await User.create({
      name,
      email,
      password, // bcrypt handled by model hook
      role,
      subject,
      approvalStatus: "pending", // ✅ required so it appears in admin dashboard
    });

    return res.status(201).json({
      success: true,
      message: "User registered successfully. Awaiting approval.",
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        subject: newUser.subject,
        approvalStatus: newUser.approvalStatus,
      },
    });
  } catch (err) {
    console.error("Registration error:", err);
    return res
      .status(500)
      .json({
        success: false,
        error: "Registration failed",
        details: err.message,
      });
  }
});

// ✅ Login user
router.post("/login", async (req, res) => {
  try {
    let { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ success: false, error: "Email and password are required" });
    }

    email = email.toLowerCase().trim();

    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(401).json({
        success: false,
        error: "Invalid email or password. Please try again",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: "Invalid email or password. Please try again",
      });
    }

    if (user.approvalStatus === "pending") {
      return res.status(403).json({
        success: false,
        error: "Your account is awaiting approval",
      });
    }

    if (user.approvalStatus === "rejected") {
      return res.status(403).json({
        success: false,
        error: "Your account has been rejected",
      });
    }

    // ✅ Track last login
    await user.update({ lastLogin: new Date() });

    const token = jwt.sign(
      { userId: user.id, role: user.role, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.json({
      success: true,
      message: "Login successful",
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
    return res.status(500).json({
      success: false,
      error: "Login failed",
      details: err.message,
    });
  }
});

module.exports = router;

