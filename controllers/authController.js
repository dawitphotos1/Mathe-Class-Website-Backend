
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

const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret";

// 🔐 REGISTER
exports.register = async (req, res) => {
  try {
    let { name, email, password, role, subject } = req.body;

    if (!name || !email || !password || !role) {
      return res
        .status(400)
        .json({ error: "All required fields must be filled." });
    }

    email = email.toLowerCase().trim();
    role = role.toLowerCase().trim();

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ error: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // 🔸 Approval logic
    const approval_status = role === "student" ? "pending" : "approved";

    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
      subject,
      approval_status, // ✅ fixed key
    });

    return res.status(201).json({
      message: "Registration successful.",
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        subject: newUser.subject,
        approval_status: newUser.approval_status,
        created_at: newUser.created_at,
      },
    });
  } catch (err) {
    console.error("❌ Registration error:", err);
    return res
      .status(500)
      .json({ error: "Registration failed. Please try again." });
  }
};

// 🔐 LOGIN
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ error: "Email and password are required." });
    }

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid credentials." });
    }

    // 🚫 Block login if not approved
    if (user.approval_status !== "approved") {
      return res.status(403).json({ error: "Account not approved yet." });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        subject: user.subject,
        approval_status: user.approval_status,
      },
    });
  } catch (err) {
    console.error("❌ Login error:", err);
    return res.status(500).json({ error: "Login failed. Please try again." });
  }
};
