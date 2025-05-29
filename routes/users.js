// const express = require("express");
// const router = express.Router();
// const bcrypt = require("bcrypt");
// const jwt = require("jsonwebtoken");
// const { User, UserCourseAccess, Course } = require("../models");
// const authMiddleware = require("../middleware/authMiddleware");
// const sendEmail = require("../utils/sendEmail");
// const Stripe = require("stripe");
// const courseEnrollmentApproved = require("../utils/emails/courseEnrollmentApproved");

// const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

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

// // GET /api/v1/users/approved
// router.get("/approved", authMiddleware, isAdminOrTeacher, async (req, res) => {
//   try {
//     const approvedUsers = await User.findAll({
//       where: { approvalStatus: "approved", role: "student" },
//       attributes: ["id", "name", "email", "subject", "createdAt"],
//     });
//     res.json(approvedUsers);
//   } catch (err) {
//     console.error("Error fetching approved users:", err);
//     res.status(500).json({ error: "Failed to fetch approved users" });
//   }
// });

// // GET /api/v1/users/rejected
// router.get("/rejected", authMiddleware, isAdminOrTeacher, async (req, res) => {
//   try {
//     const rejectedUsers = await User.findAll({
//       where: { approvalStatus: "rejected", role: "student" },
//       attributes: ["id", "name", "email", "subject", "createdAt"],
//     });
//     res.json(rejectedUsers);
//   } catch (err) {
//     console.error("Error fetching rejected users:", err);
//     res.status(500).json({ error: "Failed to fetch rejected users" });
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

//     console.log("User found:", user.email, "Comparing passwords...");
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

// // POST /api/v1/users/confirm-enrollment

// // POST /api/v1/users/confirm-enrollment
// router.post("/confirm-enrollment", authMiddleware, async (req, res) => {
//   try {
//     const { session_id } = req.body;

//     console.log("🧪 Received session_id:", session_id);
//     console.log("🧪 Authenticated user ID:", req.user?.id);

//     if (!session_id) {
//       console.log("❌ No session_id in request body.");
//       return res.status(400).json({ error: "Session ID is required" });
//     }

//     let session;
//     try {
//       const session = await stripe.checkout.sessions.retrieve(session_id);
//       console.log("✅ Stripe session:", {
//         id: session.id,
//         payment_status: session.payment_status,
//         metadata: session.metadata,
//       });

//       const courseId = parseInt(session.metadata?.courseId, 10);
//       // ...rest of your logic
//     } catch (err) {
//       console.log("❌ Stripe session retrieval failed:", err.message);
//       return res.status(400).json({ error: "Invalid session ID" });
//     }
    

//     if (session.payment_status !== "paid") {
//       console.log("❌ Session not paid:", session.payment_status);
//       return res.status(400).json({ error: "Payment not completed" });
//     }

//     const courseId = parseInt(session.metadata?.courseId, 10);
//     if (!courseId || isNaN(courseId)) {
//       console.log(
//         "❌ Missing or invalid courseId in metadata:",
//         session.metadata
//       );
//       return res
//         .status(400)
//         .json({ error: "Course ID not found in session metadata" });
//     }
//     // Continue as before...

//     // Verify Stripe session
//     let session;
//     try {
//       session = await stripe.checkout.sessions.retrieve(session_id);
//       console.log("Stripe session retrieved:", {
//         id: session.id,
//         payment_status: session.payment_status,
//         metadata: session.metadata,
//       });
//     } catch (err) {
//       console.log("Invalid session_id:", session_id, err.message);
//       return res.status(400).json({ error: "Invalid session ID" });
//     }

//     if (session.payment_status !== "paid") {
//       console.log("Payment not completed:", session.payment_status);
//       return res.status(400).json({ error: "Payment not completed" });
//     }

//     const userId = req.user.id;
//     const courseId = parseInt(session.metadata.courseId, 10);

//     if (!courseId || isNaN(courseId)) {
//       console.log("Invalid or missing courseId in metadata:", session.metadata);
//       return res
//         .status(400)
//         .json({ error: "Course ID not found in session metadata" });
//     }

//     // Verify course exists
//     const course = await Course.findByPk(courseId);
//     if (!course) {
//       console.log("Course not found for ID:", courseId);
//       return res
//         .status(404)
//         .json({ error: `Course not found for ID ${courseId}` });
//     }

//     // Check if enrollment already exists
//     let enrollment = await UserCourseAccess.findOne({
//       where: { userId, courseId },
//     });

//     if (enrollment) {
//       if (enrollment.approved) {
//         console.log("User already enrolled:", { userId, courseId });
//         return res
//           .status(400)
//           .json({ error: "User already enrolled in this course" });
//       }
//       // Update existing enrollment
//       enrollment.approved = false; // Pending approval
//       enrollment.accessGrantedAt = new Date();
//       await enrollment.save();
//       console.log("Updated existing enrollment:", { userId, courseId });
//     } else {
//       // Create new enrollment (pending approval)
//       enrollment = await UserCourseAccess.create({
//         userId,
//         courseId,
//         approved: false,
//         accessGrantedAt: new Date(),
//       });
//       console.log("Created new enrollment:", { userId, courseId });
//     }

//     // Fetch user for email
//     const user = await User.findByPk(userId);
//     if (!user) {
//       console.log("User not found for ID:", userId);
//       return res.status(404).json({ error: "User not found" });
//     }

//     // Send enrollment confirmation email
//     try {
//       const { subject, html } = courseEnrollmentApproved(user, course);
//       await sendEmail(user.email, subject, html);
//       console.log("Enrollment confirmation email sent to:", user.email);
//     } catch (emailErr) {
//       console.error("Failed to send enrollment email:", emailErr.message);
//     }

//     res.json({
//       success: true,
//       message: "Enrollment confirmation received, pending approval",
//     });
//   } catch (err) {
//     console.error("Error confirming enrollment:", {
//       message: err.message,
//       stack: err.stack,
//       requestBody: req.body,
//       userId: req.user?.id,
//     });
//     res
//       .status(500)
//       .json({ error: "Failed to confirm enrollment", details: err.message });
//   }
// });

// module.exports = router;





const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { User, UserCourseAccess, Course } = require("../models");
const authMiddleware = require("../middleware/authMiddleware");
const sendEmail = require("../utils/sendEmail");
const Stripe = require("stripe");
const courseEnrollmentApproved = require("../utils/emails/courseEnrollmentApproved");

const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

function isAdminOrTeacher(req, res, next) {
  if (req.user && ["admin", "teacher"].includes(req.user.role)) {
    return next();
  }
  return res.status(403).json({ error: "Forbidden" });
}

router.get("/me", authMiddleware, async (req, res) => {
  try {
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
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/pending", authMiddleware, isAdminOrTeacher, async (req, res) => {
  try {
    const pendingUsers = await User.findAll({
      where: { approvalStatus: "pending" },
      attributes: ["id", "name", "email", "role", "subject", "createdAt"],
    });
    res.json(pendingUsers);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch pending users" });
  }
});

router.get("/approved", authMiddleware, isAdminOrTeacher, async (req, res) => {
  try {
    const approvedUsers = await User.findAll({
      where: { approvalStatus: "approved", role: "student" },
      attributes: ["id", "name", "email", "subject", "createdAt"],
    });
    res.json(approvedUsers);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch approved users" });
  }
});

router.get("/rejected", authMiddleware, isAdminOrTeacher, async (req, res) => {
  try {
    const rejectedUsers = await User.findAll({
      where: { approvalStatus: "rejected", role: "student" },
      attributes: ["id", "name", "email", "subject", "createdAt"],
    });
    res.json(rejectedUsers);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch rejected users" });
  }
});

router.post(
  "/approve/:id",
  authMiddleware,
  isAdminOrTeacher,
  async (req, res) => {
    try {
      const user = await User.findByPk(req.params.id);
      if (!user) return res.status(404).json({ error: "User not found" });

      user.approvalStatus = "approved";
      await user.save();

      await sendEmail(
        user.email,
        "Your MathClass account has been approved ✅",
        `<p>Hello ${user.name},</p><p>Your account has been approved. You may now <a href="${process.env.FRONTEND_URL}/login">log in</a>.</p>`
      );

      res.json({ message: "User approved successfully" });
    } catch (err) {
      res.status(500).json({ error: "Failed to approve user" });
    }
  }
);

router.post(
  "/reject/:id",
  authMiddleware,
  isAdminOrTeacher,
  async (req, res) => {
    try {
      const user = await User.findByPk(req.params.id);
      if (!user) return res.status(404).json({ error: "User not found" });

      user.approvalStatus = "rejected";
      await user.save();

      await sendEmail(
        user.email,
        "Your MathClass account was rejected ❌",
        `<p>Hello ${user.name},</p><p>Unfortunately, your account has been rejected. If you believe this is a mistake, please contact support.</p>`
      );

      res.json({ message: "User rejected successfully" });
    } catch (err) {
      res.status(500).json({ error: "Failed to reject user" });
    }
  }
);

router.post("/login", async (req, res) => {
  try {
    let { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    email = email.toLowerCase().trim();
    const user = await User.findOne({ where: { email } });
    if (!user)
      return res.status(401).json({ error: "No user found with this email" });

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid)
      return res.status(401).json({ error: "Incorrect password" });

    if (user.approvalStatus === "pending")
      return res
        .status(403)
        .json({ error: "Your account is pending approval" });
    if (user.approvalStatus === "rejected")
      return res.status(403).json({ error: "Your account has been rejected" });

    if (!process.env.JWT_SECRET)
      return res
        .status(500)
        .json({ error: "Server error: missing JWT secret" });

    user.lastLogin = new Date();
    await user.save();

    const token = jwt.sign(
      { id: user.id, role: user.role, email: user.email },
      process.env.JWT_SECRET,
      {
        expiresIn: process.env.JWT_EXPIRATION_TIME || "1h",
      }
    );

    res.json({
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
    res.status(500).json({ error: "Failed to log in", details: err.message });
  }
});

router.delete("/:id", authMiddleware, isAdminOrTeacher, async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    await user.destroy();
    res.json({ message: "User deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete user" });
  }
});

router.post("/confirm-enrollment", authMiddleware, async (req, res) => {
  try {
    const { session_id } = req.body;
    console.log("🧪 Received session_id:", session_id);
    console.log("🧪 Authenticated user ID:", req.user?.id);

    if (!session_id)
      return res.status(400).json({ error: "Session ID is required" });

    const session = await stripe.checkout.sessions.retrieve(session_id);
    console.log("✅ Stripe session:", {
      id: session.id,
      payment_status: session.payment_status,
      metadata: session.metadata,
    });

    if (session.payment_status !== "paid")
      return res.status(400).json({ error: "Payment not completed" });

    const userId = req.user.id;
    const courseId = parseInt(session.metadata?.courseId, 10);

    if (!courseId || isNaN(courseId))
      return res
        .status(400)
        .json({ error: "Course ID not found in session metadata" });

    const course = await Course.findByPk(courseId);
    if (!course)
      return res
        .status(404)
        .json({ error: `Course not found for ID ${courseId}` });

    let enrollment = await UserCourseAccess.findOne({
      where: { userId, courseId },
    });

    if (enrollment) {
      if (enrollment.approved)
        return res
          .status(400)
          .json({ error: "User already enrolled in this course" });
      enrollment.approved = false;
      enrollment.accessGrantedAt = new Date();
      await enrollment.save();
    } else {
      enrollment = await UserCourseAccess.create({
        userId,
        courseId,
        approved: false,
        accessGrantedAt: new Date(),
      });
    }

    const user = await User.findByPk(userId);
    if (user) {
      const { subject, html } = courseEnrollmentApproved(user, course);
      await sendEmail(user.email, subject, html);
    }

    res.json({
      success: true,
      message: "Enrollment confirmation received, pending approval",
    });
  } catch (err) {
    console.error("💥 Error confirming enrollment:", {
      message: err.message,
      stack: err.stack,
      requestBody: req.body,
      userId: req.user?.id,
    });
    res
      .status(500)
      .json({ error: "Failed to confirm enrollment", details: err.message });
  }
});

module.exports = router;
