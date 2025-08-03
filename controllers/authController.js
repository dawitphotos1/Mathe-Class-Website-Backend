// const bcrypt = require("bcryptjs");
// const { User } = require("../models");
// const sendEmail = require("../utils/sendEmail"); // If you have email logic
// const approvalEmailTemplate = require("../utils/emails/approvalEmailTemplate"); // Optional

// exports.register = async (req, res) => {
//   try {
//     const { name, email, password, role, subject } = req.body;

//     // ✅ Validate required fields
//     if (!name || !email || !password || !role) {
//       return res
//         .status(400)
//         .json({ error: "Name, email, password, and role are required" });
//     }

//     // ✅ Role-specific validation
//     if (role === "teacher" && !subject) {
//       return res
//         .status(400)
//         .json({ error: "Subject is required for teachers" });
//     }

//     // ✅ Check if user already exists
//     const existingUser = await User.findOne({ where: { email } });
//     if (existingUser) {
//       return res.status(409).json({ error: "Email already in use" });
//     }

//     // ✅ Hash password
//     const hashedPassword = await bcrypt.hash(password, 10);

//     // ✅ Set approvalStatus logic
//     let approvalStatus = "approved"; // default
//     if (role === "teacher") {
//       approvalStatus = "pending"; // Teachers need admin approval
//     }

//     // ✅ Create user
//     const newUser = await User.create({
//       name,
//       email,
//       password: hashedPassword,
//       role,
//       subject: role === "teacher" ? subject : null,
//       approvalStatus,
//     });

//     // ✅ Optional: send email (wrap in try/catch to avoid breaking registration)
//     if (role === "teacher") {
//       try {
//         const { subject: mailSubject, html } = approvalEmailTemplate(newUser);
//         await sendEmail(newUser.email, mailSubject, html);
//       } catch (emailError) {
//         console.warn("Email sending failed:", emailError.message);
//       }
//     }

//     return res.status(201).json({
//       message: "Registration successful",
//       user: {
//         id: newUser.id,
//         name: newUser.name,
//         email: newUser.email,
//         role: newUser.role,
//         approvalStatus: newUser.approvalStatus,
//       },
//     });
//   } catch (error) {
//     console.error("Registration error:", error);
//     return res
//       .status(500)
//       .json({ error: "Registration failed. Please try again." });
//   }
// };



const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { User } = require("../models");
const sendEmail = require("../utils/sendEmail");
const passwordResetEmail = require("../utils/emails/passwordReset");

// ✅ Generate JWT
const generateToken = (user) => {
  return jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRATION_TIME || "7d",
  });
};

// ✅ Register
exports.register = async (req, res) => {
  try {
    const { name, email, password, role, subject } = req.body;

    // Validate input
    if (!name || !email || !password || !role) {
      return res
        .status(400)
        .json({ error: "Name, email, password, and role are required" });
    }

    if (!["student", "teacher", "admin"].includes(role)) {
      return res
        .status(400)
        .json({ error: "Role must be student, teacher, or admin" });
    }

    // Only require subject for student/teacher
    if ((role === "student" || role === "teacher") && !subject) {
      return res
        .status(400)
        .json({ error: "Subject is required for student/teacher" });
    }

    // Check for existing user
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ error: "Email already registered" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Set approval status
    const approvalStatus = role === "teacher" ? "pending" : "approved";

    // Create user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
      subject: role !== "admin" ? subject : null,
      approvalStatus,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Generate token
    const token = generateToken(user);

    // Send welcome email
    try {
      await sendEmail(
        user.email,
        "Welcome to MathClass!",
        `<p>Hello ${
          user.name
        },<br>Your account has been created successfully. ${
          role === "teacher"
            ? "Your account is pending approval."
            : "You can now log in and start exploring."
        }</p>`
      );
    } catch (emailError) {
      console.warn("Failed to send welcome email:", emailError.message);
    }

    return res.status(201).json({
      message: "Registration successful",
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
    console.error("🔥 Register error:", {
      message: err.message,
      stack: err.stack,
      requestBody: req.body,
      requestPath: req.path,
    });
    if (err.name === "SequelizeUniqueConstraintError") {
      return res.status(409).json({ error: "Email already registered" });
    }
    if (err.name === "SequelizeValidationError") {
      return res.status(400).json({
        error: "Validation error",
        details: err.errors.map((e) => e.message),
      });
    }
    return res.status(500).json({
      error: "Registration failed",
      details: err.message,
    });
  }
};

// ✅ Login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ error: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    if (user.role === "teacher" && user.approvalStatus !== "approved") {
      return res
        .status(403)
        .json({ error: "Your account is pending approval" });
    }

    const token = generateToken(user);

    return res.json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        approvalStatus: user.approvalStatus,
      },
    });
  } catch (err) {
    console.error("🔥 Login error:", {
      message: err.message,
      stack: err.stack,
      requestBody: req.body,
    });
    return res.status(500).json({ error: "Login failed. Please try again." });
  }
};

// ✅ Forgot Password
exports.forgotPassword = async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: "Email is required" });
  }

  try {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const resetToken = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    const { subject, html } = passwordResetEmail(user, resetToken);
    await sendEmail(user.email, subject, html);

    return res.json({ message: "Password reset email sent" });
  } catch (err) {
    console.error("🔥 Forgot password error:", {
      message: err.message,
      stack: err.stack,
      requestBody: req.body,
    });
    return res.status(500).json({ error: "Failed to send reset email" });
  }
};