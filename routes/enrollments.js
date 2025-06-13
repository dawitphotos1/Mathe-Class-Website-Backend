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

const THUMBNAIL_MAP = {
  Math: "/thumbs/math.jpg",
  Science: "/thumbs/science.jpg",
  English: "/thumbs/english.jpg",
  Uncategorized: "/thumbs/default.jpg",
};

function isAdminOrTeacher(req, res, next) {
  if (req.user && ["admin", "teacher"].includes(req.user.role)) {
    return next();
  }
  return res.status(403).json({ error: "Forbidden" });
}

function appendToLogFile(message) {
  const logDir = path.join(__dirname, "..", "logs");
  const logFilePath = path.join(logDir, "enrollments.log");
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir);
  }
  fs.appendFileSync(logFilePath, message);
}

// ✅ Get all pending enrollments
router.get("/pending", authMiddleware, isAdminOrTeacher, async (req, res) => {
  try {
    const enrollments = await UserCourseAccess.findAll({
      where: { approved: false },
      include: [
        { model: User, as: "user", attributes: ["id", "name", "email"] },
        {
          model: Course,
          as: "course",
          attributes: ["id", "title", "description", "price"],
        },
      ],
      order: [["accessGrantedAt", "DESC"]],
    });
    res.json(enrollments);
  } catch (err) {
    console.error("Error fetching pending enrollments:", err);
    res.status(500).json({ error: "Failed to fetch pending enrollments" });
  }
});

// ✅ Get all approved enrollments
router.get("/approved", authMiddleware, isAdminOrTeacher, async (req, res) => {
  try {
    const enrollments = await UserCourseAccess.findAll({
      where: { approved: true },
      include: [
        { model: User, as: "user", attributes: ["id", "name", "email"] },
        {
          model: Course,
          as: "course",
          attributes: ["id", "title", "description", "price"],
        },
      ],
      order: [["accessGrantedAt", "DESC"]],
    });
    res.json(enrollments);
  } catch (err) {
    console.error("Error fetching approved enrollments:", err);
    res.status(500).json({ error: "Failed to fetch approved enrollments" });
  }
});

// ✅ Get current user's enrolled courses
router.get("/my-courses", authMiddleware, async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized: No user ID" });
    }

    const enrollments = await UserCourseAccess.findAll({
      where: { userId },
      include: [
        {
          model: Course,
          as: "course",
          attributes: [
            "id",
            "slug",
            "title",
            "description",
            "price",
            "category",
          ],
          required: false,
        },
      ],
      order: [["accessGrantedAt", "DESC"]],
    });

    const formatted = enrollments
      .map((entry) => {
        const c = entry.course;
        if (!c) return null;

        const category = c.category || "Uncategorized";
        const thumbnail =
          THUMBNAIL_MAP[category] || THUMBNAIL_MAP["Uncategorized"];

        return {
          id: c.id,
          slug: c.slug,
          title: c.title,
          description: c.description,
          price: c.price,
          category,
          thumbnail,
          enrolledAt: entry.accessGrantedAt,
          status: entry.approved ? "approved" : "pending",
        };
      })
      .filter(Boolean);

    res.json({ success: true, courses: formatted });
  } catch (err) {
    console.error("Error loading my courses:", err);
    res.status(500).json({ error: "Failed to load enrolled courses" });
  }
});

// ✅ Unenroll from a course
router.delete("/:courseId", authMiddleware, async (req, res) => {
  const userId = req.user.id;
  const courseId = parseInt(req.params.courseId);

  try {
    const access = await UserCourseAccess.findOne({
      where: { userId, courseId },
    });
    if (!access) {
      return res.status(404).json({ error: "Enrollment not found" });
    }

    await access.destroy();

    const logMsg = `[UNENROLLED] ${new Date().toISOString()} - User ${userId} unenrolled from course ${courseId}\n`;
    appendToLogFile(logMsg);

    res.json({ success: true, message: "Unenrolled successfully" });
  } catch (err) {
    console.error("Error unenrolling from course:", err);
    res.status(500).json({ error: "Failed to unenroll from course" });
  }
});

// ✅ Approve an enrollment
router.post("/approve", authMiddleware, isAdminOrTeacher, async (req, res) => {
  try {
    const { userId, courseId } = req.body;

    if (!userId || !courseId) {
      return res
        .status(400)
        .json({ error: "userId and courseId are required" });
    }

    const enrollment = await UserCourseAccess.findOne({
      where: { userId, courseId },
      include: [
        { model: User, as: "user" },
        { model: Course, as: "course" },
      ],
    });

    if (!enrollment) {
      return res.status(404).json({ error: "Enrollment not found" });
    }

    enrollment.approved = true;
    await enrollment.save();

    const logMsg = `[APPROVED] ${new Date().toISOString()} - User ${userId} approved for course ${courseId}\n`;
    appendToLogFile(logMsg);

    if (enrollment.user && enrollment.course) {
      const { subject, html } = courseEnrollmentApproved(
        enrollment.user,
        enrollment.course
      );
      await sendEmail(enrollment.user.email, subject, html);
    }

    res.json({
      success: true,
      message: "Enrollment approved successfully",
      enrollment,
    });
  } catch (err) {
    console.error("Error approving enrollment:", err);
    res.status(500).json({ error: "Failed to approve enrollment" });
  }
});

module.exports = router;
