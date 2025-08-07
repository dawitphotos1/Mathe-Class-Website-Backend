
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

const register = async (req, res) => {
  try {
    const { name, email, password, role, subject } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const allowedRoles = ["student", "teacher", "admin"];
    if (!allowedRoles.includes(role)) {
      return res.status(400).json({ error: "Invalid role" });
    }

    if (role === "teacher" && !subject) {
      return res
        .status(400)
        .json({ error: "Subject is required for teachers" });
    }

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ error: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const approval_status = role === "student" ? "pending" : "approved";

    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
      subject: role === "teacher" ? subject : null,
      approval_status,
    });

    const token = jwt.sign(
      { id: newUser.id, role: newUser.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(201).json({
      message: "Registration successful",
      token,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        subject: newUser.subject,
        approval_status: newUser.approval_status,
      },
    });
  } catch (error) {
    console.error("🔴 Registration error:", error);
    res.status(500).json({ error: "Registration failed. Please try again." });
  }
};

module.exports = { register };