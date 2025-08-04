// // controllers/authController.js
// const bcrypt = require("bcryptjs");
// const jwt = require("jsonwebtoken");
// const { User } = require("../models");
// const sendEmail = require("../utils/sendEmail");
// const passwordResetEmail = require("../utils/emails/passwordReset");

// // Helper: generate JWT token
// const generateToken = (user) => {
//   if (!process.env.JWT_SECRET) {
//     throw new Error("JWT_SECRET is not defined");
//   }
//   return jwt.sign(
//     { id: user.id, role: user.role },
//     process.env.JWT_SECRET,
//     {
//       expiresIn: process.env.JWT_EXPIRATION_TIME || "7d",
//     }
//   );
// };

// // Register
// exports.register = async (req, res) => {
//   try {
//     const { name, email, password, role, subject } = req.body;

//     if (!name || !email || !password || !role) {
//       return res
//         .status(400)
//         .json({ error: "Name, email, password, and role are required" });
//     }

//     const normalizedRole = role.toLowerCase();
//     if (!["student", "teacher", "admin"].includes(normalizedRole)) {
//       return res.status(400).json({ error: "Invalid role specified" });
//     }

//     if (normalizedRole === "teacher" && !subject) {
//       return res
//         .status(400)
//         .json({ error: "Subject is required for teachers" });
//     }

//     const existingUser = await User.findOne({ where: { email } });
//     if (existingUser) {
//       return res.status(409).json({ error: "Email already registered" });
//     }

//     const hashedPassword = await bcrypt.hash(password, 10);
//     const approvalStatus = normalizedRole === "admin" ? "approved" : "pending";

//     const user = await User.create({
//       name: name.trim(),
//       email: email.toLowerCase().trim(),
//       password: hashedPassword,
//       role: normalizedRole,
//       subject: normalizedRole === "teacher" ? subject : null,
//       approvalStatus,
//     });

//     const token = generateToken(user);

//     try {
//       await sendEmail(
//         user.email,
//         "Welcome to MathClass!",
//         `<p>Hello ${user.name}, your account has been created successfully. ${
//           normalizedRole === "teacher"
//             ? "Your account is pending approval by admin."
//             : "You can now log in and start learning."
//         }</p>`
//       );
//     } catch (emailError) {
//       console.warn("Email sending failed:", emailError.message);
//     }

//     return res.status(201).json({
//       message: "Registration successful",
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
//     console.error("🔥 Register error:", {
//       message: err.message,
//       stack: err.stack,
//       body: req.body,
//     });

//     return res.status(500).json({
//       error: "Registration failed",
//       details: err.message,
//       ...(process.env.NODE_ENV === "development" ? { stack: err.stack } : {}),
//     });
//   }
// };

// // Login
// exports.login = async (req, res) => {
//   try {
//     const { email, password } = req.body;
//     if (!email || !password) {
//       return res.status(400).json({ error: "Email and password are required" });
//     }

//     const user = await User.findOne({ where: { email } });
//     if (!user) {
//       return res.status(404).json({ error: "Invalid credentials" });
//     }

//     const isMatch = await bcrypt.compare(password, user.password);
//     if (!isMatch) {
//       return res.status(401).json({ error: "Invalid credentials" });
//     }

//    if (
//      (user.role === "student" && user.approvalStatus !== "approved") ||
//      (user.role === "teacher" && user.approvalStatus !== "approved")
//    ) {
//      return res
//        .status(403)
//        .json({ error: "Your account is pending admin approval" });
//    }


//     const token = generateToken(user);

//     return res.json({
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
//     console.error("🔥 Login error:", {
//       message: err.message,
//       stack: err.stack,
//       body: req.body,
//     });
//     return res.status(500).json({ error: "Login failed", details: err.message });
//   }
// };

// // Forgot Password
// exports.forgotPassword = async (req, res) => {
//   const { email } = req.body;
//   if (!email)
//     return res.status(400).json({ error: "Email is required" });

//   try {
//     const user = await User.findOne({ where: { email } });
//     if (!user)
//       return res.status(404).json({ error: "User not found" });

//     if (!process.env.JWT_SECRET) {
//       throw new Error("JWT_SECRET not defined");
//     }

//     const resetToken = jwt.sign(
//       { id: user.id, email: user.email },
//       process.env.JWT_SECRET,
//       { expiresIn: "1h" }
//     );

//     const { subject, html } = passwordResetEmail(user, resetToken);
//     await sendEmail(user.email, subject, html);

//     return res.json({ message: "Password reset email sent" });
//   } catch (err) {
//     console.error("🔥 Forgot password error:", {
//       message: err.message,
//       stack: err.stack,
//       body: req.body,
//     });
//     return res
//       .status(500)
//       .json({ error: "Failed to send reset email", details: err.message });
//   }
// };





const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { User } = require("../models");
const sendEmail = require("../utils/sendEmail");

// Load email templates
const welcomeStudentEmail = require("../utils/emails/welcomeStudent");
const notifyAdminOfNewStudent = require("../utils/emails/notifyAdminOfNewStudent");

// ✅ Register User
exports.register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ error: "Email already in use" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // ✅ Students require approval, others don't
    const approvalStatus = role === "student" ? "pending" : "approved";

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
      approvalStatus,
    });

    if (role === "student") {
      // ✅ Send welcome email to student
      const { subject, html } = welcomeStudentEmail(user.name);
      await sendEmail(user.email, subject, html);

      // ✅ Notify admins of new pending student
      const admins = await User.findAll({ where: { role: "admin" } });
      for (const admin of admins) {
        const { subject: adminSubject, html: adminHtml } =
          notifyAdminOfNewStudent(user.name, user.email);
        await sendEmail(admin.email, adminSubject, adminHtml);
      }

      return res.status(201).json({
        success: true,
        message: "Registration successful! Pending for approval",
      });
    } else {
      return res.status(201).json({
        success: true,
        message: "Registration successful! You can now login",
      });
    }
  } catch (error) {
    console.error("Registration error:", error);
    res
      .status(500)
      .json({ error: "Registration failed", details: error.message });
  }
};

// ✅ Login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    if (user.role === "student" && user.approvalStatus !== "approved") {
      return res
        .status(403)
        .json({ error: "Your account is pending approval" });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    res.json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Login failed", details: error.message });
  }
};

// ✅ Forgot Password (Stub)
exports.forgotPassword = async (req, res) => {
  res.status(501).json({
    success: false,
    message: "Forgot password functionality not implemented yet",
  });
};
