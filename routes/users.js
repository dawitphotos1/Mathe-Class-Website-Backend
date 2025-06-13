
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
      where: {
        approvalStatus: "pending",
        role: "student",
      },
      attributes: ["id", "name", "email", "role", "subject", "createdAt"],
    });
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch pending users" });
  }
});

router.get("/approved", authMiddleware, isAdminOrTeacher, async (req, res) => {
  try {
    const approvedUsers = await User.findAll({
      where: {
        approvalStatus: "approved",
        role: "student",
      },
      attributes: ["id", "name", "email", "subject", "createdAt"],
    });
    res.json(users);
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
