// const bcrypt = require("bcryptjs");
// const jwt = require("jsonwebtoken");
// const { User } = require("../models");

// // =======================
// // Register Controller
// // =======================
// const register = async (req, res) => {
//   try {
//     const { name, email, password, role, subject } = req.body;

//     // Validate required fields
//     if (!name || !email || !password || !role) {
//       return res
//         .status(400)
//         .json({ error: "Please fill in all required fields." });
//     }

//     // Check if user already exists
//     const existingUser = await User.findOne({ where: { email } });
//     if (existingUser) {
//       return res.status(409).json({ error: "Email already in use." });
//     }

//     // Hash the password
//     const hashedPassword = await bcrypt.hash(password, 10);

//     // Student accounts need approval
//     const approvalStatus = role === "student" ? "pending" : "approved";

//     // Create the user
//     const newUser = await User.create({
//       name,
//       email: email.toLowerCase(),
//       password: hashedPassword,
//       role: role.toLowerCase(),
//       subject: role === "teacher" ? subject : null,
//       approvalStatus,
//     });

//     // Create JWT token
//     const token = jwt.sign(
//       { id: newUser.id, role: newUser.role },
//       process.env.JWT_SECRET,
//       { expiresIn: "1d" }
//     );

//     return res.status(201).json({
//       message: "Registration successful",
//       user: {
//         id: newUser.id,
//         name: newUser.name,
//         email: newUser.email,
//         role: newUser.role,
//         approvalStatus: newUser.approvalStatus,
//       },
//       token,
//     });
//   } catch (error) {
//     console.error("Register Error:", error);
//     res.status(500).json({ error: "Server Error during registration." });
//   }
// };

// // =======================
// // Login Controller
// // =======================
// const login = async (req, res) => {
//   const { email, password } = req.body;

//   try {
//     // Validate inputs
//     if (!email || !password) {
//       return res
//         .status(400)
//         .json({ error: "Please provide email and password." });
//     }

//     // Find the user
//     const user = await User.findOne({ where: { email: email.toLowerCase() } });

//     if (!user) {
//       return res.status(401).json({ error: "Invalid email or password." });
//     }

//     // Compare password
//     const isMatch = await bcrypt.compare(password, user.password);
//     if (!isMatch) {
//       return res.status(401).json({ error: "Invalid email or password." });
//     }

//     // Optional: Check approval status for students
//     if (user.role === "student" && user.approvalStatus !== "approved") {
//       return res
//         .status(403)
//         .json({ error: "Your account is pending approval." });
//     }

//     // Create JWT token
//     const token = jwt.sign(
//       { id: user.id, role: user.role },
//       process.env.JWT_SECRET,
//       { expiresIn: "1d" }
//     );

//     return res.status(200).json({
//       message: "Login successful",
//       user: {
//         id: user.id,
//         name: user.name,
//         email: user.email,
//         role: user.role,
//         approvalStatus: user.approvalStatus,
//       },
//       token,
//     });
//   } catch (error) {
//     console.error("Login Error:", error);
//     res.status(500).json({ error: "Server error during login." });
//   }
// };

// // =======================
// // Exports
// // =======================
// module.exports = {
//   register,
//   login,
// };


// controllers/authController.js

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { User } = require("../models");

// Register user
exports.register = async (req, res) => {
  try {
    const { name, email, password, role, subject } = req.body;

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ error: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const approved = role === "student" ? false : true;

    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
      subject: role === "teacher" ? subject : null,
      approved,
    });

    const token = jwt.sign(
      { id: newUser.id, role: newUser.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    const userResponse = {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      subject: newUser.subject,
      approved: newUser.approved,
    };

    res.status(201).json({
      message: "Registration successful",
      token,
      user: userResponse,
    });
  } catch (error) {
    console.error("Registration Error:", error);
    res.status(500).json({ error: "Registration failed. Please try again." });
  }
};
