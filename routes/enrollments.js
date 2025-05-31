const express = require("express");
const router = express.Router();
const { UserCourseAccess, User, Course } = require("../models");
const authMiddleware = require("../middleware/authMiddleware");
const sendEmail = require("../utils/sendEmail");
const fs = require("fs");
const path = require("path");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const courseEnrollmentPending = require("../utils/emails/courseEnrollmentPending");
const courseEnrollmentApproved = require("../utils/emails/courseEnrollmentApproved");
const courseEnrollmentRejected = require("../utils/emails/courseEnrollmentRejected");

function isAdminOrTeacher(req, res, next) {
  if (req.user && ["admin", "teacher"].includes(req.user.role)) {
    return next();
  }
  return res.status(403).json({ error: "Forbidden" });
}

// ✅ GET /pending enrollments (Admin/Teacher only)
router.get("/pending", authMiddleware, isAdminOrTeacher, async (req, res) => {
  try {
    const pending = await UserCourseAccess.findAll({
      where: { approved: false },
      include: [
        { model: User, as: "user", attributes: ["id", "name", "email"] },
        { model: Course, as: "course", attributes: ["id", "title"] },
      ],
      order: [["accessGrantedAt", "DESC"]],
    });
    res.json(pending);
  } catch (err) {
    console.error("Error fetching pending enrollments:", err);
    res.status(500).json({ error: "Failed to fetch pending enrollments" });
  }
});

// ✅ GET /approved enrollments (Admin/Teacher only)
router.get("/approved", authMiddleware, isAdminOrTeacher, async (req, res) => {
  try {
    const approved = await UserCourseAccess.findAll({
      where: { approved: true },
      include: [
        { model: User, as: "user", attributes: ["id", "name", "email"] },
        { model: Course, as: "course", attributes: ["id", "title"] },
      ],
      order: [["accessGrantedAt", "DESC"]],
    });
    res.json(approved);
  } catch (err) {
    console.error("Error fetching approved enrollments:", err);
    res.status(500).json({ error: "Failed to fetch approved enrollments" });
  }
});

// ✅ POST /approve enrollment
router.post("/approve", authMiddleware, isAdminOrTeacher, async (req, res) => {
  const { userId, courseId } = req.body;

  try {
    const access = await UserCourseAccess.findOne({
      where: { userId, courseId },
      include: [
        { model: User, as: "user" },
        { model: Course, as: "course" },
      ],
    });

    if (!access) return res.status(404).json({ error: "Enrollment not found" });

    access.approved = true;
    await access.save();

    const logMsg = `[APPROVED] ${new Date().toISOString()} - ${
      access.user.email
    } for "${access.course.title}"\n`;
    fs.appendFileSync(path.join(__dirname, "../logs/enrollments.log"), logMsg);
    console.log("📥 Received approval for:", req.body);
    const { subject, html } = courseEnrollmentApproved(
      access.user,
      access.course
    );
    await sendEmail(access.user.email, subject, html);

    res.json({ message: "Enrollment approved and email sent" });
  } catch (err) {
    console.error("Error approving enrollment:", err);
    res.status(500).json({ error: "Failed to approve enrollment" });
  }
});

// ✅ POST /reject enrollment
router.post("/reject", authMiddleware, isAdminOrTeacher, async (req, res) => {
  const { userId, courseId } = req.body;
  try {
    const access = await UserCourseAccess.findOne({
      where: { userId, courseId },
      include: [
        { model: User, as: "user" },
        { model: Course, as: "course" },
      ],
    });

    if (!access) return res.status(404).json({ error: "Enrollment not found" });

    const logMsg = `[REJECTED] ${new Date().toISOString()} - ${
      access.user?.email || "unknown"
    } from "${access.course?.title || "unknown"}"\n`;
    fs.appendFileSync(path.join(__dirname, "../logs/enrollments.log"), logMsg);

    const { subject, html } = courseEnrollmentRejected(
      access.user,
      access.course
    );
    await sendEmail(access.user.email, subject, html);

    await access.destroy();
    res.json({ message: "Enrollment rejected and email sent" });
  } catch (err) {
    console.error("Error rejecting enrollment:", err);
    res.status(500).json({ error: "Failed to reject enrollment" });
  }
});

// ✅ POST /confirm (Stripe confirmation)
router.post("/confirm", authMiddleware, async (req, res) => {
  try {
    const { session_id } = req.body;
    const userId = req.user.id;

    if (!session_id) {
      return res.status(400).json({ error: "Missing session_id" });
    }

    const session = await stripe.checkout.sessions.retrieve(session_id);
    if (!session) {
      return res.status(400).json({ error: "Stripe session not found" });
    }

    if (session.payment_status !== "paid") {
      return res.status(400).json({ error: "Payment not completed" });
    }

    const { courseId } = session.metadata || {};
    if (!courseId) {
      return res
        .status(400)
        .json({ error: "Missing course ID in session metadata" });
    }

    let enrollment = await UserCourseAccess.findOne({
      where: { userId, courseId },
      include: [
        { model: User, as: "user" },
        { model: Course, as: "course" },
      ],
    });

    if (!enrollment) {
      enrollment = await UserCourseAccess.create({
        userId,
        courseId,
        approved: false,
        accessGrantedAt: new Date(),
      });

      enrollment = await UserCourseAccess.findOne({
        where: { userId, courseId },
        include: [
          { model: User, as: "user" },
          { model: Course, as: "course" },
        ],
      });
    }

    const logMsg = `[PENDING] ${new Date().toISOString()} - ${
      enrollment.user.email
    } for "${enrollment.course.title}"\n`;
    fs.appendFileSync(path.join(__dirname, "../logs/enrollments.log"), logMsg);

    const { subject, html } = courseEnrollmentPending(
      enrollment.user,
      enrollment.course
    );
    await sendEmail(enrollment.user.email, subject, html);

    res.json({
      success: true,
      message:
        "Enrollment confirmation received. Pending teacher/admin approval.",
    });
  } catch (error) {
    console.error("❌ Error confirming enrollment:", error);
    res.status(500).json({ error: "Failed to confirm enrollment" });
  }
});

module.exports = router;