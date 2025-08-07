
// const bcrypt = require("bcrypt");
// const jwt = require("jsonwebtoken");
// const { User } = require("../models");

// const register = async (req, res) => {
//   try {
//     const { name, email, password, role, subject } = req.body;

//     if (!name || !email || !password || !role) {
//       return res.status(400).json({ error: "Missing required fields" });
//     }

//     const allowedRoles = ["student", "teacher", "admin"];
//     if (!allowedRoles.includes(role)) {
//       return res.status(400).json({ error: "Invalid role" });
//     }

//     if (role === "teacher" && !subject) {
//       return res
//         .status(400)
//         .json({ error: "Subject is required for teachers" });
//     }

//     const existingUser = await User.findOne({ where: { email } });
//     if (existingUser) {
//       return res.status(409).json({ error: "Email already registered" });
//     }

//     const hashedPassword = await bcrypt.hash(password, 10);
//     const approvalStatus = role === "student" ? "pending" : "approved";

//     const newUser = await User.create({
//       name,
//       email,
//       password: hashedPassword,
//       role,
//       subject: role === "teacher" ? subject : null,
//       approvalStatus,
//     });

//     const token = jwt.sign(
//       { id: newUser.id, role: newUser.role },
//       process.env.JWT_SECRET,
//       { expiresIn: "7d" }
//     );

//     res.status(201).json({
//       message: "Registration successful",
//       token,
//       user: {
//         id: newUser.id,
//         name: newUser.name,
//         email: newUser.email,
//         role: newUser.role,
//         subject: newUser.subject,
//         approvalStatus: newUser.approvalStatus,
//       },
//     });
//   } catch (error) {
//     console.error("🔴 Registration error:", error);
//     res.status(500).json({ error: "Registration failed. Please try again." });
//   }
// };

// module.exports = { register };




const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { User } = require("../models");

// 🔐 Login
const login = async (req, res) => {
  try {
    let { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    email = email.toLowerCase().trim();
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(401).json({ error: "No user found with this email" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: "Incorrect password" });
    }

    if (user.approvalStatus === "pending") {
      return res
        .status(403)
        .json({ error: "Your account is pending approval" });
    }

    if (user.approvalStatus === "rejected") {
      return res.status(403).json({ error: "Your account has been rejected" });
    }

    user.lastLogin = new Date();
    await user.save();

    const token = jwt.sign(
      { id: user.id, role: user.role, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRATION_TIME || "1h" }
    );

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        subject: user.subject,
        approvalStatus: user.approvalStatus,
        createdAt: user.createdAt,
        lastLogin: user.lastLogin,
      },
    });
  } catch (err) {
    console.error("❌ Login error:", err);
    res.status(500).json({ error: "Failed to log in", details: err.message });
  }
};

// 📝 Register (placeholder)
const register = async (req, res) => {
  try {
    // Add your registration logic here
    res.status(201).json({ message: "Registration endpoint hit" });
  } catch (err) {
    console.error("❌ Register error:", err);
    res.status(500).json({ error: "Failed to register", details: err.message });
  }
};

module.exports = { login, register };
