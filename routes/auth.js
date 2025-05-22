
// const express = require("express");
// const router = express.Router();
// const bcrypt = require("bcryptjs");
// const jwt = require("jsonwebtoken");
// const { User } = require("../models");

// router.post("/login", async (req, res) => {
//   try {
//     const { email, password } = req.body;
//     if (!email || !password) {
//       return res.status(400).json({ error: "Email and password are required" });
//     }

//     const user = await User.findOne({ where: { email: email.toLowerCase() } });
//     if (!user) {
//       return res.status(401).json({ error: "Invalid credentials" });
//     }

//     const isMatch = await bcrypt.compare(password, user.password);
//     if (!isMatch) {
//       return res.status(401).json({ error: "Invalid credentials" });
//     }

//     if (user.approvalStatus !== "approved") {
//       return res.status(403).json({ error: "Account not approved" });
//     }

//     const payload = {
//       userId: user.id,
//       email: user.email,
//       role: user.role,
//       name: user.name,
//     };
//     console.log("Login - JWT Payload:", payload);
//     const token = jwt.sign(payload, process.env.JWT_SECRET, {
//       expiresIn: "1d",
//     });

//     res.json({
//       token,
//       user: {
//         id: user.id,
//         name: user.name,
//         email: user.email,
//         role: user.role,
//       },
//     });
//   } catch (err) {
//     console.error("Login error:", err);
//     res.status(500).json({ error: "Server error" });
//   }
// });

// router.post("/register", async (req, res) => {
//   try {
//     const { name, email, password, role, subject } = req.body;
//     if (!name || !email || !password || !role) {
//       return res.status(400).json({ error: "All fields are required" });
//     }

//     const existingUser = await User.findOne({
//       where: { email: email.toLowerCase() },
//     });
//     if (existingUser) {
//       return res.status(400).json({ error: "Email already registered" });
//     }

//     const hashedPassword = await bcrypt.hash(password, 10);
//     const user = await User.create({
//       name,
//       email: email.toLowerCase(),
//       password: hashedPassword,
//       role,
//       subject: role === "teacher" ? subject : null,
//       approvalStatus: role === "student" ? "pending" : "approved",
//     });

//     res
//       .status(201)
//       .json({ message: "User registered successfully", userId: user.id });
//   } catch (err) {
//     console.error("Register error:", err);
//     res.status(500).json({ error: "Server error" });
//   }
// });

// module.exports = router;




const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { User } = require("../models");

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const user = await User.findOne({ where: { email: email.toLowerCase() } });
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    if (user.approvalStatus !== "approved") {
      return res.status(403).json({ error: "Account not approved" });
    }

    const payload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    };
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

router.post("/register", async (req, res) => {
  try {
    const { name, email, password, role, subject } = req.body;
    console.log("Register request body:", req.body);

    if (!name || !email || !password || !role) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const existingUser = await User.findOne({
      where: { email: email.toLowerCase() },
    });
    if (existingUser) {
      return res.status(400).json({ error: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role,
      subject: role === "teacher" ? subject : null,
      approvalStatus: role === "student" ? "pending" : "approved",
    });

    res
      .status(201)
      .json({ message: "User registered successfully", userId: user.id });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ error: "Server error", details: err.message });
  }
});

module.exports = router;

