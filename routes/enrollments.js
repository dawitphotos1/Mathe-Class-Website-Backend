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

// ✅ GET /my-courses
router.get("/my-courses", authMiddleware, async (req, res) => {
  try {
    console.log("🔐 /my-courses route hit");
    console.log("🔑 Authenticated user:", req.user);

    const userId = req.user?.id;
    if (!userId) {
      console.error("❌ No user ID in request");
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
        },
      ],
      order: [["accessGrantedAt", "DESC"]],
    });

    if (!Array.isArray(enrollments)) {
      console.error("❌ enrollments is not an array:", enrollments);
      return res.status(500).json({ error: "Unexpected enrollments format" });
    }

    console.log("📦 Raw enrollments found:", enrollments.length);

    const formatted = enrollments
      .map((entry, i) => {
        const c = entry.course;
        console.log(`Enrollment ${i + 1}:`, {
          hasCourse: !!c,
          courseTitle: c?.title || "MISSING",
          approved: entry.approved,
        });

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

    console.log("✅ Returning courses:", formatted.length);
    res.json({ success: true, courses: formatted });
  } catch (err) {
    console.error("🔥 FATAL ERROR in /my-courses route", {
      message: err.message,
      stack: err.stack,
    });
    res.status(500).json({ error: "Failed to load enrolled courses" });
  }
});

// ✅ DELETE /:courseId
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
    res.json({ success: true, message: "Unenrolled successfully" });
  } catch (err) {
    console.error("🔥 FATAL ERROR in DELETE /enrollments/:courseId", {
      message: err.message,
      stack: err.stack,
    });
    res.status(500).json({ error: "Failed to unenroll from course" });
  }
});

module.exports = router;