
const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { User } = require("../models");
const sendEmail = require("../utils/sendEmail");
const passwordResetEmail = require("../utils/emails/passwordReset");

// POST /api/v1/auth/register
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, role, subject } = req.body;
    console.log("Register request:", { name, email, role, subject });

    if (!name || !email || !password || !role) {
      return res
        .status(400)
        .json({ error: "Name, email, password, and role are required" });
    }
    if ((role === "student" || role === "teacher") && !subject) {
      return res
        .status(400)
        .json({ error: "Subject is required for students and teachers" });
    }
    if (!["student", "teacher", "admin"].includes(role)) {
      return res
        .status(400)
        .json({ error: "Role must be student, teacher, or admin" });
    }

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

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

// POST /api/v1/auth/forgot-password
router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: "Email is required" });

  try {
    const user = await User.findOne({ where: { email } });
    if (!user)
      return res.status(404).json({ error: "No user found with that email" });

    const resetToken = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    const { subject, html } = passwordResetEmail(user, resetToken);
    await sendEmail(user.email, subject, html);

    res.json({ message: "Password reset email sent" });
  } catch (err) {
    console.error("Forgot password error:", err);
    res.status(500).json({ error: "Could not send reset email" });
  }
});

module.exports = router;

