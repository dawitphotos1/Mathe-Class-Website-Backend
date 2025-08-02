// // ✅ FULLY UPDATED ENROLLMENTS.JS with lessons in /my-courses and enrollment check

// const express = require("express");
// const router = express.Router();
// const { UserCourseAccess, User, Course, Lesson } = require("../models");
// const authMiddleware = require("../middleware/authMiddleware");
// const roleMiddleware = require("../middleware/roleMiddleware");
// const sendEmail = require("../utils/sendEmail");
// const fs = require("fs");
// const path = require("path");
// const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
// const courseEnrollmentPending = require("../utils/emails/courseEnrollmentPending");
// const courseEnrollmentApproved = require("../utils/emails/courseEnrollmentApproved");
// const courseEnrollmentRejected = require("../utils/emails/courseEnrollmentRejected");
// const { confirmEnrollment } = require("../controllers/enrollmentController");

// function appendToLogFile(message) {
//   const logDir = path.join(__dirname, "..", "logs");
//   const logFilePath = path.join(logDir, "enrollments.log");
//   try {
//     if (!fs.existsSync(logDir)) {
//       fs.mkdirSync(logDir, { recursive: true });
//     }
//     fs.appendFileSync(logFilePath, `${message}\n`);
//   } catch (err) {
//     console.error("Failed to write to log file:", err);
//   }
// }

// // ✅ GET check enrollment status for a course (student)
// router.get("/check/:courseId", authMiddleware, async (req, res) => {
//   try {
//     const userId = req.user?.id;
//     const courseId = parseInt(req.params.courseId, 10);

//     if (!userId) {
//       return res.status(401).json({ success: false, error: "Unauthorized: No user ID" });
//     }

//     if (isNaN(courseId)) {
//       return res.status(400).json({ success: false, error: "Invalid course ID" });
//     }

//     const enrollment = await UserCourseAccess.findOne({
//       where: { userId, courseId, approved: true },
//     });

//     const logMsg = `[CHECK_ENROLLMENT] ${new Date().toISOString()} - User ${userId} checked enrollment for course ${courseId}: ${enrollment ? "Enrolled" : "Not enrolled"}`;
//     appendToLogFile(logMsg);

//     res.json({ success: true, isEnrolled: !!enrollment });
//   } catch (err) {
//     console.error("Error checking enrollment:", err);
//     appendToLogFile(`[CHECK_ENROLLMENT_ERROR] ${new Date().toISOString()} - Error: ${err.message}`);
//     res.status(500).json({ success: false, error: "Failed to check enrollment", details: err.message });
//   }
// });

// // ✅ GET courses for logged-in student including lessons and teacher info
// router.get("/my-courses", authMiddleware, async (req, res) => {
//   try {
//     const userId = req.user?.id;
//     if (!userId) {
//       return res.status(401).json({ success: false, error: "Unauthorized: No user ID" });
//     }

//     const enrollments = await UserCourseAccess.findAll({
//       where: { userId },
//       include: [
//         {
//           model: Course,
//           as: "course",
//           required: true,
//           include: [
//             { model: Lesson, as: "lessons", order: [["orderIndex", "ASC"]] },
//             { model: User, as: "teacher", attributes: ["id", "name", "email"] },
//           ],
//         },
//       ],
//       order: [["accessGrantedAt", "DESC"]],
//     });

//     const formatted = enrollments.map((entry) => ({
//       id: entry.course.id,
//       slug: entry.course.slug,
//       title: entry.course.title,
//       description: entry.course.description,
//       price: parseFloat(entry.course.price) || 0,
//       category: entry.course.category || "Uncategorized",
//       enrolledAt: entry.accessGrantedAt,
//       status: entry.approved ? "approved" : "pending",
//       lessons: entry.course.lessons || [],
//       teacher: entry.course.teacher || {},
//     }));

//     res.json({ success: true, courses: formatted });
//   } catch (err) {
//     console.error("Error loading my courses:", err);
//     res.status(500).json({ success: false, error: "Failed to load enrolled courses" });
//   }
// });

// module.exports = router;




const express = require("express");
const router = express.Router();
const { UserCourseAccess, Course, User } = require("../models");
const authMiddleware = require("../middleware/authMiddleware");
const sendEmail = require("../utils/sendEmail");
const courseEnrollmentPending = require("../utils/emails/courseEnrollmentPending");
const enrollmentPendingAdmin = require("../utils/emails/enrollmentPendingAdmin");

// ✅ Confirm enrollment after payment
router.post("/confirm", authMiddleware, async (req, res) => {
  try {
    const userId = req.user?.id;
    const { courseId } = req.body;

    if (!userId || !courseId) {
      return res.status(400).json({
        success: false,
        error: "Missing userId or courseId",
      });
    }

    // ✅ Check if already enrolled or pending
    const existing = await UserCourseAccess.findOne({
      where: { userId, courseId },
    });
    if (existing) {
      return res.status(409).json({
        success: false,
        error: "Already enrolled or pending approval",
      });
    }

    // ✅ Validate course
    const course = await Course.findByPk(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        error: "Course not found",
      });
    }

    // ✅ Create enrollment (pending approval)
    const enrollment = await UserCourseAccess.create({
      userId,
      courseId,
      approved: false,
      accessGrantedAt: new Date(),
    });

    // ✅ Fetch student and send emails
    const student = await User.findByPk(userId);

    if (student && course) {
      // Email to student
      const { subject, html } = courseEnrollmentPending(student, course);
      await sendEmail(student.email, subject, html);

      // Email all admins
      const adminUsers = await User.findAll({ where: { role: "admin" } });
      for (const admin of adminUsers) {
        const adminEmailContent = enrollmentPendingAdmin(student, course);
        await sendEmail(
          admin.email,
          adminEmailContent.subject,
          adminEmailContent.html
        );
      }
    }

    return res.status(201).json({
      success: true,
      message: "Enrollment submitted and pending approval",
      enrollment,
    });
  } catch (error) {
    console.error("❌ Error confirming enrollment:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to confirm enrollment",
    });
  }
});

module.exports = router;
