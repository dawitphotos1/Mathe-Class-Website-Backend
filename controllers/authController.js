const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { User } = require("../models");

const register = async (req, res) => {
  try {
    const { name, email, password, role, subject } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ error: "Email already registered" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Determine if user needs approval
    const approved = role === "student" ? false : true;

    // Create user
    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
      subject: role === "teacher" ? subject : null,
      approved,
    });

    // Create JWT token
    const token = jwt.sign(
      { id: newUser.id, role: newUser.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // Prepare user response
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
    console.error("🔴 Registration error:", error);
    res.status(500).json({ error: "Registration failed. Please try again." });
  }
};

module.exports = { register };



// const bcrypt = require("bcrypt");
// const jwt = require("jsonwebtoken");
// const { User } = require("../models");

// const register = async (req, res) => {
//   try {
//     const { name, email, password, role, subject } = req.body;

//     // Check if user already exists
//     const existingUser = await User.findOne({ where: { email } });
//     if (existingUser) {
//       return res.status(409).json({ error: "Email already registered" });
//     }

//     // Hash password
//     const hashedPassword = await bcrypt.hash(password, 10);

//     // Determine approval status
//     const approvalStatus = role === "student" ? "pending" : "approved";

//     // Create user
//     const newUser = await User.create({
//       name,
//       email,
//       password: hashedPassword,
//       role,
//       subject: role === "teacher" ? subject : null,
//       approvalStatus, // ✅ enum-based approval only
//     });

//     // Create JWT token
//     const token = jwt.sign(
//       { id: newUser.id, role: newUser.role },
//       process.env.JWT_SECRET,
//       { expiresIn: "7d" }
//     );

//     // Prepare response
//     const userResponse = {
//       id: newUser.id,
//       name: newUser.name,
//       email: newUser.email,
//       role: newUser.role,
//       subject: newUser.subject,
//       approvalStatus: newUser.approvalStatus,
//     };

//     res.status(201).json({
//       message: "Registration successful",
//       token,
//       user: userResponse,
//     });
//   } catch (error) {
//     console.error("🔴 Registration error:", error);
//     res.status(500).json({ error: "Registration failed. Please try again." });
//   }
// };

// module.exports = { register };
