
// const express = require("express");
// const router = express.Router();
// const bcrypt = require("bcryptjs");
// const jwt = require("jsonwebtoken");
// const { User } = require("../models");

// router.post("/register", async (req, res) => {
//   try {
//     const { name, email, password, role, subject } = req.body;
//     console.log("Register request:", { name, email, role, subject });

//     // Validate inputs
//     if (!name || !email || !password || !role) {
//       console.log("Missing required fields");
//       return res
//         .status(400)
//         .json({ error: "Name, email, password, and role are required" });
//     }
//     if ((role === "student" || role === "teacher") && !subject) {
//       console.log("Subject missing for student or teacher");
//       return res
//         .status(400)
//         .json({ error: "Subject is required for students and teachers" });
//     }
//     if (!["student", "teacher", "admin"].includes(role)) {
//       console.log("Invalid role:", role);
//       return res
//         .status(400)
//         .json({ error: "Role must be student, teacher, or admin" });
//     }

//     // Check if user exists
//     const existingUser = await User.findOne({ where: { email } });
//     if (existingUser) {
//       console.log("User already exists:", email);
//       return res.status(400).json({ error: "Email already registered" });
//     }

//     // Hash password
//     const hashedPassword = await bcrypt.hash(password, 10);

//     // Create user
//     const user = await User.create({
//       name,
//       email,
//       password: hashedPassword,
//       role,
//       subject: role !== "admin" ? subject : null,
//       approvalStatus:
//         role === "student"
//           ? "pending"
//           : role === "teacher"
//           ? "pending"
//           : "approved",
//     });
//     console.log("User created:", {
//       id: user.id,
//       email,
//       role,
//       approvalStatus: user.approvalStatus,
//     });

//     // Generate JWT
//     const token = jwt.sign(
//       { id: user.id, email: user.email, role: user.role },
//       process.env.JWT_SECRET,
//       { expiresIn: process.env.JWT_EXPIRATION_TIME }
//     );

//     res.status(201).json({
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
//     console.error("Register error:", {
//       message: err.message,
//       stack: err.stack,
//     });
//     res.status(500).json({ error: "Registration failed. Please try again." });
//   }
// });

// module.exports = router;


const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { User } = require("../models");

router.post("/register", async (req, res) => {
  try {
    const { name, email, password, role, subject } = req.body;
    console.log("Register request:", { name, email, role, subject });

    // Validate inputs
    if (!name || !email || !password || !role) {
      console.log("Missing required fields");
      return res
        .status(400)
        .json({ error: "Name, email, password, and role are required" });
    }
    if ((role === "student" || role === "teacher") && !subject) {
      console.log("Subject missing for student or teacher");
      return res
        .status(400)
        .json({ error: "Subject is required for students and teachers" });
    }
    if (!["student", "teacher", "admin"].includes(role)) {
      console.log("Invalid role:", role);
      return res
        .status(400)
        .json({ error: "Role must be student, teacher, or admin" });
    }

    // Check if user exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      console.log("User already exists:", email);
      return res.status(400).json({ error: "Email already registered" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user (✅ FIXED approvalStatus logic here)
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
      subject: role !== "admin" ? subject : null,
      approvalStatus: role === "student" ? "pending" : "approved",
    });

    console.log("User created:", {
      id: user.id,
      email,
      role,
      approvalStatus: user.approvalStatus,
    });

    // Generate JWT
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRATION_TIME }
    );

    res.status(201).json({
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
    console.error("Register error:", {
      message: err.message,
      stack: err.stack,
    });
    res.status(500).json({ error: "Registration failed. Please try again." });
  }
});

module.exports = router;
