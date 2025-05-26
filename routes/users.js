
// const express = require("express");
// const router = express.Router();
// const bcrypt = require("bcrypt");
// const jwt = require("jsonwebtoken");
// const { User } = require("../models");
// const authMiddleware = require("../middleware/authMiddleware");
// const sendEmail = require("../utils/sendEmail");

// // Middleware: only admin/teacher
// function isAdminOrTeacher(req, res, next) {
//   if (req.user && ["admin", "teacher"].includes(req.user.role)) {
//     return next();
//   }
//   return res.status(403).json({ error: "Forbidden" });
// }

// // GET /api/v1/users/me
// router.get("/me", authMiddleware, async (req, res) => {
//   try {
//     console.log("Users/me: Fetching user with id:", req.user.id);
//     const user = await User.findByPk(req.user.id, {
//       attributes: [
//         "id",
//         "name",
//         "email",
//         "role",
//         "subject",
//         "approvalStatus",
//         "createdAt",
//         "lastLogin",
//       ],
//     });

//     if (!user) {
//       console.log("Users/me: User not found for id:", req.user.id);
//       return res.status(404).json({ error: "User not found" });
//     }
//     console.log("Users/me: User found:", {
//       id: user.id,
//       email: user.email,
//       role: user.role,
//     });
//     res.json(user);
//   } catch (err) {
//     console.error("Users/me: Failed to fetch user profile:", {
//       message: err.message,
//       id: req.user.id,
//     });
//     res.status(500).json({ error: "Internal server error" });
//   }
// });

// // GET /api/v1/users/pending
// router.get("/pending", authMiddleware, isAdminOrTeacher, async (req, res) => {
//   try {
//     const pendingUsers = await User.findAll({
//       where: { approvalStatus: "pending" },
//       attributes: ["id", "name", "email", "role", "subject", "createdAt"],
//     });

//     res.json(pendingUsers);
//   } catch (err) {
//     console.error("Error fetching pending users:", err);
//     res.status(500).json({ error: "Failed to fetch pending users" });
//   }
// });

// // POST /api/v1/users/approve/:id
// router.post(
//   "/approve/:id",
//   authMiddleware,
//   isAdminOrTeacher,
//   async (req, res) => {
//     try {
//       const user = await User.findByPk(req.params.id);
//       if (!user) return res.status(404).json({ error: "User not found" });

//       user.approvalStatus = "approved";
//       await user.save();

//       // Send approval email
//       await sendEmail(
//         user.email,
//         "Your MathClass account has been approved ✅",
//         `<p>Hello ${user.name},</p><p>Your account has been approved. You may now <a href="${process.env.FRONTEND_URL}/login">log in</a>.</p>`
//       );

//       res.json({ message: "User approved successfully" });
//     } catch (err) {
//       console.error("Error approving user:", err);
//       res.status(500).json({ error: "Failed to approve user" });
//     }
//   }
// );

// // POST /api/v1/users/reject/:id
// router.post(
//   "/reject/:id",
//   authMiddleware,
//   isAdminOrTeacher,
//   async (req, res) => {
//     try {
//       const user = await User.findByPk(req.params.id);
//       if (!user) return res.status(404).json({ error: "User not found" });

//       user.approvalStatus = "rejected";
//       await user.save();

//       // Send rejection email
//       await sendEmail(
//         user.email,
//         "Your MathClass account was rejected ❌",
//         `<p>Hello ${user.name},</p><p>Unfortunately, your account has been rejected. If you believe this is a mistake, please contact support.</p>`
//       );

//       res.json({ message: "User rejected successfully" });
//     } catch (err) {
//       console.error("Error rejecting user:", err);
//       res.status(500).json({ error: "Failed to reject user" });
//     }
//   }
// );

// // POST /api/v1/users/login
// router.post("/login", async (req, res) => {
//   try {
//     let { email, password } = req.body;
//     if (!email || !password) {
//       return res.status(400).json({ error: "Email and password are required" });
//     }

//     email = email.toLowerCase().trim();
//     console.log("Login attempt for email:", email);

//     const user = await User.findOne({ where: { email } });
//     if (!user) {
//       console.log("Login failed: No user found for email:", email);
//       return res.status(401).json({ error: "No user found with this email" });
//     }

//     console.log("UserÑ found:", user.email, "Comparing passwords...");
//     const isPasswordValid = await bcrypt.compare(password, user.password);
//     if (!isPasswordValid) {
//       console.log("Login failed: Incorrect password for user:", user.email);
//       return res.status(401).json({ error: "Incorrect password" });
//     }

//     if (user.approvalStatus === "pending") {
//       console.log("User pending approval:", user.email);
//       return res
//         .status(403)
//         .json({ error: "Your account is pending approval" });
//     }

//     if (user.approvalStatus === "rejected") {
//       console.log("User rejected:", user.email);
//       return res.status(403).json({ error: "Your account has been rejected" });
//     }

//     if (!process.env.JWT_SECRET) {
//       return res
//         .status(500)
//         .json({ error: "Server error: missing JWT secret" });
//     }

//     // Update last login timestamp
//     user.lastLogin = new Date();
//     await user.save();

//     const token = jwt.sign(
//       {
//         id: user.id,
//         role: user.role,
//         email: user.email,
//       },
//       process.env.JWT_SECRET,
//       { expiresIn: process.env.JWT_EXPIRATION_TIME || "1h" }
//     );

//     console.log("Login successful for user ID:", user.id);
//     res.json({
//       token,
//       user: {
//         id: user.id,
//         name: user.name,
//         email: user.email,
//         role: user.role,
//         subject: user.subject,
//         approvalStatus: user.approvalStatus,
//         createdAt: user.createdAt,
//         lastLogin: user.lastLogin,
//       },
//     });
//   } catch (err) {
//     console.error("Login error:", err);
//     res.status(500).json({ error: "Failed to log in", details: err.message });
//   }
// });

// // DELETE /api/v1/users/:id
// router.delete("/:id", authMiddleware, isAdminOrTeacher, async (req, res) => {
//   try {
//     const user = await User.findByPk(req.params.id);
//     if (!user) return res.status(404).json({ error: "User not found" });

//     await user.destroy();
//     res.json({ message: "User deleted successfully" });
//   } catch (err) {
//     console.error("Error deleting user:", err);
//     res.status(500).json({ error: "Failed to delete user" });
//   }
// });

// module.exports = router;


// Mathe-Class-Website-Backend/routes/users.js
const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { User } = require("../models");
const authMiddleware = require("../middleware/authMiddleware");
const sendEmail = require("../utils/sendEmail");

// Validate JWT_SECRET
if (!process.env.JWT_SECRET) {
  console.error("FATAL: JWT_SECRET is not set in environment variables");
  process.exit(1);
}

// Middleware: only admin/teacher
function isAdminOrTeacher(req, res, next) {
  if (req.user && ["admin", "teacher"].includes(req.user.role)) {
    return next();
  }
  return res.status(403).json({ success: false, error: "Forbidden" });
}

// GET /api/v1/users/me
router.get("/me", authMiddleware, async (req, res) => {
  try {
    if (!req.user?.id) {
      console.error("Users/me: No user ID in request, invalid token");
      return res.status(401).json({ success: false, error: "Invalid token" });
    }

    console.log("Users/me: Fetching user with id:", req.user.id);
    const user = await User.findByPk(req.user.id, {
      attributes: [
        "id",
        "name",
        "email",
        "role",
        "subject",
        "approvalStatus",
        "createdAt",
        "lastLogin",
      ],
    });

    if (!user) {
      console.log("Users/me: User not found for id:", req.user.id);
      return res.status(404).json({ success: false, error: "User not found" });
    }

    console.log("Users/me: User found:", {
      id: user.id,
      email: user.email,
      role: user.role,
    });
    res.json({ success: true, user });
  } catch (err) {
    console.error("Users/me: Failed to fetch user profile:", {
      message: err.message,
      stack: err.stack,
      id: req.user?.id,
    });
    res.status(500).json({
      success: false,
      error: "Failed to fetch user",
      details: err.message,
    });
  }
});

// GET /api/v1/users/pending
router.get("/pending", authMiddleware, isAdminOrTeacher, async (req, res) => {
  try {
    const pendingUsers = await User.findAll({
      where: { approvalStatus: "pending" },
      attributes: ["id", "name", "email", "role", "subject", "createdAt"],
    });

    res.json({ success: true, users: pendingUsers });
  } catch (err) {
    console.error("Error fetching pending users:", err);
    res.status(500).json({
      success: false,
      error: "Failed to fetch pending users",
      details: err.message,
    });
  }
});

// POST /api/v1/users/approve/:id
router.post("/approve/:id", authMiddleware, isAdminOrTeacher, async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    user.approvalStatus = "approved";
    await user.save();

    // Send approval email
    await sendEmail(
      user.email,
      "Your MathClass account has been approved ✅",
      `<p>Hello ${user.name},</p><p>Your account has been approved. You may now <a href="${process.env.FRONTEND_URL}/login">log in</a>.</p>`
    );

    res.json({ success: true, message: "User approved successfully" });
  } catch (err) {
    console.error("Error approving user:", err);
    res.status(500).json({
      success: false,
      error: "Failed to approve user",
      details: err.message,
    });
  }
});

// POST /api/v1/users/reject/:id
router.post("/reject/:id", authMiddleware, isAdminOrTeacher, async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    user.approvalStatus = "rejected";
    await user.save();

    // Send rejection email
    await sendEmail(
      user.email,
      "Your MathClass account was rejected ❌",
      `<p>Hello ${user.name},</p><p>Unfortunately, your account has been rejected. If you believe this is a mistake, please contact support.</p>`
    );

    res.json({ success: true, message: "User rejected successfully" });
  } catch (err) {
    console.error("Error rejecting user:", err);
    res.status(500).json({
      success: false,
      error: "Failed to reject user",
      details: err.message,
    });
  }
});

// POST /api/v1/users/login
router.post("/login", async (req, res) => {
  try {
    let { email, password } = req.body;
    if (!email || !password) {
      return res
        .status(400)
        .json({ success: false, error: "Email and password are required" });
    }

    email = email.toLowerCase().trim();
    console.log("Login attempt for email:", email);

    const user = await User.findOne({ where: { email } });
    if (!user) {
      console.log("Login failed: No user found for email:", email);
      return res
        .status(401)
        .json({ success: false, error: "No user found with this email" });
    }

    console.log("User found:", user.email, "Comparing passwords...");
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      console.log("Login failed: Incorrect password for user:", user.email);
      return res
        .status(401)
        .json({ success: false, error: "Incorrect password" });
    }

    if (user.approvalStatus === "pending") {
      console.log("User pending approval:", user.email);
      return res.status(403).json({
        success: false,
        error: "Your account is pending approval",
      });
    }

    if (user.approvalStatus === "rejected") {
      console.log("User rejected:", user.email);
      return res
        .status(403)
        .json({ success: false, error: "Your account has been rejected" });
    }

    // Update last login timestamp
    user.lastLogin = new Date();
    await user.save();

    const token = jwt.sign(
      {
        id: user.id,
        role: user.role,
        email: user.email,
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRATION_TIME || "1h" }
    );

    console.log("Login successful for user ID:", user.id);
    res.json({
      success: true,
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
    console.error("Login error:", {
      message: err.message,
      stack: err.stack,
    });
    res.status(500).json({
      success: false,
      error: "Failed to log in",
      details: err.message,
    });
  }
});

// DELETE /api/v1/users/:id
router.delete("/:id", authMiddleware, isAdminOrTeacher, async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    await user.destroy();
    res.json({ success: true, message: "User deleted successfully" });
  } catch (err) {
    console.error("Error deleting user:", err);
    res.status(500).json({
      success: false,
      error: "Failed to delete user",
      details: err.message,
    });
  }
});

module.exports = router;