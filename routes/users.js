const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { User, UserCourseAccess, Course } = require("../models");
const authMiddleware = require("../middleware/authMiddleware");
const sendEmail = require("../utils/sendEmail");
const Stripe = require("stripe");
const courseEnrollmentApproved = require("../utils/emails/courseEnrollmentApproved");
const fs = require("fs");
const path = require("path");

const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

function appendToLogFile(message) {
  const logDir = path.join(__dirname, "..", "logs");
  const logFilePath = path.join(logDir, "users.log");
  try {
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
    fs.appendFileSync(logFilePath, `${message}\n`);
  } catch (err) {
    console.error("Failed to write to log file:", err);
  }
}

function isAdminOrTeacher(req, res, next) {
  if (req.user && ["admin", "teacher"].includes(req.user.role)) {
    return next();
  }
  appendToLogFile(
    `[ERROR] ${new Date().toISOString()} - Forbidden access for user ${
      req.user?.id
    }`
  );
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
    if (!user) {
      appendToLogFile(
        `[ERROR] ${new Date().toISOString()} - User not found: ${req.user.id}`
      );
      return res.status(404).json({ error: "User not found" });
    }
    appendToLogFile(
      `[SUCCESS] ${new Date().toISOString()} - Fetched user: ${req.user.id}`
    );
    res.json({ success: true, user });
  } catch (err) {
    console.error("Error fetching user profile:", err);
    appendToLogFile(
      `[ERROR] ${new Date().toISOString()} - Fetch user ${req.user.id}: ${
        err.message
      }`
    );
    res
      .status(500)
      .json({ error: "Internal server error", details: err.message });
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
    appendToLogFile(
      `[SUCCESS] ${new Date().toISOString()} - Fetched ${
        pendingUsers.length
      } pending users`
    );
    res.json({ success: true, users: pendingUsers });
  } catch (err) {
    console.error("Error fetching pending users:", err);
    appendToLogFile(
      `[ERROR] ${new Date().toISOString()} - Fetch pending users: ${
        err.message
      }`
    );
    res
      .status(500)
      .json({ error: "Failed to fetch pending users", details: err.message });
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
    appendToLogFile(
      `[SUCCESS] ${new Date().toISOString()} - Fetched ${
        approvedUsers.length
      } approved users`
    );
    res.json({ success: true, users: approvedUsers });
  } catch (err) {
    console.error("Error fetching approved users:", err);
    appendToLogFile(
      `[ERROR] ${new Date().toISOString()} - Fetch approved users: ${
        err.message
      }`
    );
    res
      .status(500)
      .json({ error: "Failed to fetch approved users", details: err.message });
  }
});

router.get("/rejected", authMiddleware, isAdminOrTeacher, async (req, res) => {
  try {
    const rejectedUsers = await User.findAll({
      where: { approvalStatus: "rejected", role: "student" },
      attributes: ["id", "name", "email", "subject", "createdAt"],
    });
    appendToLogFile(
      `[SUCCESS] ${new Date().toISOString()} - Fetched ${
        rejectedUsers.length
      } rejected users`
    );
    res.json({ success: true, users: rejectedUsers });
  } catch (err) {
    console.error("Error fetching rejected users:", err);
    appendToLogFile(
      `[ERROR] ${new Date().toISOString()} - Fetch rejected users: ${
        err.message
      }`
    );
    res
      .status(500)
      .json({ error: "Failed to fetch rejected users", details: err.message });
  }
});

router.post(
  "/approve/:id",
  authMiddleware,
  isAdminOrTeacher,
  async (req, res) => {
    try {
      const user = await User.findByPk(req.params.id);
      if (!user) {
        appendToLogFile(
          `[ERROR] ${new Date().toISOString()} - User not found: ${
            req.params.id
          }`
        );
        return res.status(404).json({ error: "User not found" });
      }

      user.approvalStatus = "approved";
      await user.save();

      await sendEmail(
        user.email,
        "Your MathClass account has been approved ✅",
        `<p>Hello ${user.name},</p><p>Your account has been approved. You may now <a href="${process.env.FRONTEND_URL}/login">log in</a>.</p>`
      );

      appendToLogFile(
        `[SUCCESS] ${new Date().toISOString()} - Approved user: ${
          req.params.id
        }`
      );
      res.json({ success: true, message: "User approved successfully" });
    } catch (err) {
      console.error("Error approving user:", err);
      appendToLogFile(
        `[ERROR] ${new Date().toISOString()} - Approve user ${req.params.id}: ${
          err.message
        }`
      );
      res
        .status(500)
        .json({ error: "Failed to approve user", details: err.message });
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
      if (!user) {
        appendToLogFile(
          `[ERROR] ${new Date().toISOString()} - User not found: ${
            req.params.id
          }`
        );
        return res.status(404).json({ error: "User not found" });
      }

      user.approvalStatus = "rejected";
      await user.save();

      await sendEmail(
        user.email,
        "Your MathClass account was rejected ❌",
        `<p>Hello ${user.name},</p><p>Unfortunately, your account has been rejected. If you believe this is a mistake, please contact support.</p>`
      );

      appendToLogFile(
        `[SUCCESS] ${new Date().toISOString()} - Rejected user: ${
          req.params.id
        }`
      );
      res.json({ success: true, message: "User rejected successfully" });
    } catch (err) {
      console.error("Error rejecting user:", err);
      appendToLogFile(
        `[ERROR] ${new Date().toISOString()} - Reject user ${req.params.id}: ${
          err.message
        }`
      );
      res
        .status(500)
        .json({ error: "Failed to reject user", details: err.message });
    }
  }
);

router.post("/login", async (req, res) => {
  try {
    let { email, password } = req.body;
    if (!email || !password) {
      appendToLogFile(
        `[ERROR] ${new Date().toISOString()} - Missing email or password`
      );
      return res.status(400).json({ error: "Email and password are required" });
    }

    email = email.toLowerCase().trim();
    const user = await User.findOne({ where: { email } });
    if (!user) {
      appendToLogFile(
        `[ERROR] ${new Date().toISOString()} - No user found with email: ${email}`
      );
      return res.status(401).json({ error: "No user found with this email" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      appendToLogFile(
        `[ERROR] ${new Date().toISOString()} - Incorrect password for email: ${email}`
      );
      return res.status(401).json({ error: "Incorrect password" });
    }

    if (user.approvalStatus === "pending") {
      appendToLogFile(
        `[ERROR] ${new Date().toISOString()} - Pending approval for user: ${
          user.id
        }`
      );
      return res
        .status(403)
        .json({ error: "Your account is pending approval" });
    }
    if (user.approvalStatus === "rejected") {
      appendToLogFile(
        `[ERROR] ${new Date().toISOString()} - Rejected account for user: ${
          user.id
        }`
      );
      return res.status(403).json({ error: "Your account has been rejected" });
    }

    if (!process.env.JWT_SECRET) {
      appendToLogFile(
        `[ERROR] ${new Date().toISOString()} - Missing JWT_SECRET`
      );
      return res
        .status(500)
        .json({ error: "Server error: missing JWT secret" });
    }

    user.lastLogin = new Date();
    await user.save();

    const token = jwt.sign(
      { id: user.id, role: user.role, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRATION_TIME || "1h" }
    );

    appendToLogFile(
      `[SUCCESS] ${new Date().toISOString()} - Logged in user: ${user.id}`
    );
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
    console.error("Login error:", err);
    appendToLogFile(
      `[ERROR] ${new Date().toISOString()} - Login error: ${err.message}`
    );
    res.status(500).json({ error: "Failed to log in", details: err.message });
  }
});

router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) {
      appendToLogFile(
        `[SUCCESS] ${new Date().toISOString()} - User already deleted: ${
          req.params.id
        }`
      );
      return res.json({ success: true, message: "User deleted successfully" });
    }
    if (
      req.user.id !== parseInt(req.params.id) &&
      !["admin", "teacher"].includes(req.user.role)
    ) {
      appendToLogFile(
        `[ERROR] ${new Date().toISOString()} - Unauthorized delete attempt by user ${
          req.user.id
        } for ${req.params.id}`
      );
      return res.status(403).json({ error: "Unauthorized" });
    }

    await user.destroy();
    appendToLogFile(
      `[SUCCESS] ${new Date().toISOString()} - Deleted user: ${req.params.id}`
    );
    res.json({ success: true, message: "User deleted successfully" });
  } catch (err) {
    console.error("Error deleting user:", err);
    appendToLogFile(
      `[ERROR] ${new Date().toISOString()} - Delete user ${req.params.id}: ${
        err.message
      }`
    );
    res
      .status(500)
      .json({ error: "Failed to delete user", details: err.message });
  }
});

router.post("/confirm-enrollment", authMiddleware, async (req, res) => {
  try {
    const { session_id } = req.body;
    if (!session_id) {
      appendToLogFile(
        `[ERROR] ${new Date().toISOString()} - Missing session_id for user ${
          req.user.id
        }`
      );
      return res.status(400).json({ error: "Session ID is required" });
    }

    const session = await stripe.checkout.sessions.retrieve(session_id);
    if (session.payment_status !== "paid") {
      appendToLogFile(
        `[ERROR] ${new Date().toISOString()} - Payment not completed for session ${session_id}`
      );
      return res.status(400).json({ error: "Payment not completed" });
    }

    const userId = req.user.id;
    const courseId = parseInt(session.metadata?.courseId, 10);
    if (!courseId || isNaN(courseId)) {
      appendToLogFile(
        `[ERROR] ${new Date().toISOString()} - Invalid course ID in session ${session_id}`
      );
      return res.status(400).json({ error: "Invalid course ID" });
    }

    const course = await Course.findByPk(courseId);
    if (!course) {
      appendToLogFile(
        `[ERROR] ${new Date().toISOString()} - Course not found: ${courseId}`
      );
      return res
        .status(404)
        .json({ error: `Course not found for ID ${courseId}` });
    }

    let enrollment = await UserCourseAccess.findOne({
      where: { userId, courseId },
    });

    if (enrollment) {
      if (enrollment.approved) {
        appendToLogFile(
          `[ERROR] ${new Date().toISOString()} - User ${userId} already enrolled in course ${courseId}`
        );
        return res.status(400).json({ error: "Already enrolled" });
      }

      enrollment.approved = true;
      enrollment.accessGrantedAt = new Date();
      await enrollment.save();
    } else {
      enrollment = await UserCourseAccess.create({
        userId,
        courseId,
        approved: true,
        accessGrantedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    const user = await User.findByPk(userId);
    if (user && course) {
      const { subject, html } = courseEnrollmentApproved(user, course);
      await sendEmail(user.email, subject, html);
      appendToLogFile(
        `[SUCCESS] ${new Date().toISOString()} - Sent enrollment email to ${
          user.email
        } for course ${courseId}`
      );
    } else {
      console.error(
        "Error: User or course not found during enrollment confirmation"
      );
      appendToLogFile(
        `[ERROR] ${new Date().toISOString()} - User or course not found: userId=${userId}, courseId=${courseId}`
      );
    }

    appendToLogFile(
      `[SUCCESS] ${new Date().toISOString()} - Confirmed enrollment for user ${userId} in course ${courseId}`
    );
    res.json({
      success: true,
      message: "Enrollment confirmed successfully",
    });
  } catch (err) {
    console.error("Error confirming enrollment:", err);
    appendToLogFile(
      `[ERROR] ${new Date().toISOString()} - Confirm enrollment for user ${
        req.user?.id
      }: ${err.message}`
    );
    res.status(500).json({
      success: false,
      error: "Failed to confirm enrollment",
      details: err.message,
    });
  }
});

module.exports = router;
