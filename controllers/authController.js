// const bcrypt = require("bcryptjs");
// const jwt = require("jsonwebtoken");
// const { User } = require("../models");
// const sendEmail = require("../utils/sendEmail");

// // Load email templates
// const welcomeStudentEmail = require("../utils/emails/welcomeStudent");
// const notifyAdminOfNewStudent = require("../utils/emails/notifyAdminOfNewStudent");

// // ✅ Register User
// exports.register = async (req, res) => {
//   try {
//     const { name, email, password, role, subject } = req.body;

//     if (!name || !email || !password || !role) {
//       return res.status(400).json({ error: "All fields are required" });
//     }

//     const existingUser = await User.findOne({ where: { email } });
//     if (existingUser) {
//       return res.status(409).json({ error: "Email already in use" });
//     }

//     const hashedPassword = await bcrypt.hash(password, 10);
//     const approvalStatus =
//       role === "student" || role === "teacher" ? "pending" : "approved";

//     const user = await User.create({
//       name,
//       email,
//       password: hashedPassword,
//       role,
//       approvalStatus,
//       subject: role === "teacher" || role === "student" ? subject : null,
//     });

//     if (role === "student") {
//       const { subject: subjectText, html } = welcomeStudentEmail(user.name);
//       await sendEmail(user.email, subjectText, html);

//       const admins = await User.findAll({ where: { role: "admin" } });
//       for (const admin of admins) {
//         const emailToAdmin = notifyAdminOfNewStudent(user.name, user.email);
//         await sendEmail(admin.email, emailToAdmin.subject, emailToAdmin.html);
//       }
//     }

//     return res.status(201).json({
//       success: true,
//       message:
//         role === "admin"
//           ? "Registration successful! You can now login"
//           : "Registration successful! Pending admin approval",
//     });
//   } catch (error) {
//     console.error("Registration error:", error);
//     res
//       .status(500)
//       .json({ error: "Registration failed", details: error.message });
//   }
// };

// // ✅ Login
// exports.login = async (req, res) => {
//   try {
//     const { email, password } = req.body;
//     const user = await User.findOne({ where: { email } });

//     if (!user) {
//       return res.status(401).json({ error: "Invalid email or password" });
//     }

//     const match = await bcrypt.compare(password, user.password);
//     if (!match) {
//       return res.status(401).json({ error: "Invalid email or password" });
//     }

//     if (user.approvalStatus !== "approved") {
//       return res
//         .status(403)
//         .json({ error: "Your account is pending approval" });
//     }

//     const token = jwt.sign(
//       { id: user.id, role: user.role },
//       process.env.JWT_SECRET,
//       {
//         expiresIn: "7d",
//       }
//     );

//     res.json({
//       success: true,
//       message: "Login successful",
//       token,
//       user: {
//         id: user.id,
//         name: user.name,
//         email: user.email,
//         role: user.role,
//       },
//     });
//   } catch (error) {
//     console.error("Login error:", error);
//     res.status(500).json({ error: "Login failed", details: error.message });
//   }
// };

// // ✅ Forgot Password (Stub)
// exports.forgotPassword = async (req, res) => {
//   res.status(501).json({
//     success: false,
//     message: "Forgot password functionality not implemented yet",
//   });
// };




// controllers/authController.js

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { User } = require("../models");

const register = async (req, res) => {
  try {
    const { name, email, password, role, subject } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: "All required fields must be provided." });
    }

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ message: "User already exists with this email." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
      subject: role === "teacher" ? subject : null,
      approvalStatus: role === "student" ? "approved" : "pending",
    });

    const token = jwt.sign({ id: newUser.id, role: newUser.role }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    res.status(201).json({
      message: "Registration successful",
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
      },
      token,
    });
  } catch (error) {
    console.error("Register Error:", error);

    if (error.name === "SequelizeValidationError") {
      return res.status(400).json({
        message: "Validation Error",
        details: error.errors.map((e) => e.message),
      });
    }

    res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = { register };
