const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { User } = require("../models");

const register = async (req, res) => {
  try {
    const { name, email, password, role, subject } = req.body;

    // ✅ Validate required fields
    if (!name || !email || !password || !role) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // ✅ Validate role value
    const allowedRoles = ["student", "teacher", "admin"];
    if (!allowedRoles.includes(role)) {
      return res.status(400).json({ error: "Invalid role" });
    }

    // ✅ Validate subject for teacher
    if (role === "teacher" && !subject) {
      return res
        .status(400)
        .json({ error: "Subject is required for teachers" });
    }

    // ✅ Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ error: "Email already registered" });
    }

    // ✅ Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // ✅ Determine approval status
    const approvalStatus = role === "student" ? "pending" : "approved";

    // ✅ Create user without legacy 'approved' field
    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
      subject: role === "teacher" ? subject : null,
      approvalStatus, // ENUM: pending, approved, rejected
    });

    // ✅ Generate JWT token
    const token = jwt.sign(
      { id: newUser.id, role: newUser.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // ✅ Prepare safe user response
    const userResponse = {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      subject: newUser.subject,
      approvalStatus: newUser.approvalStatus,
    };

    res.status(201).json({
      message: "Registration successful",
      token,
      user: userResponse,
    });
  } catch (error) {
    console.error("🔴 Registration error:", {
      message: error.message,
      stack: error.stack,
      body: req.body,
    });
    res.status(500).json({ error: "Registration failed. Please try again." });
  }
};

module.exports = { register };
