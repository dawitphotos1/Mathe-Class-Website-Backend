
// const express = require("express");
// const router = express.Router();
// const { UserCourseAccess, User, Course } = require("../models");
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
//       return res
//         .status(401)
//         .json({ success: false, error: "Unauthorized: No user ID" });
//     }

//     if (isNaN(courseId)) {
//       return res
//         .status(400)
//         .json({ success: false, error: "Invalid course ID" });
//     }

//     const enrollment = await UserCourseAccess.findOne({
//       where: { userId, courseId, approved: true },
//     });

//     const logMsg = `[CHECK_ENROLLMENT] ${new Date().toISOString()} - User ${userId} checked enrollment for course ${courseId}: ${
//       enrollment ? "Enrolled" : "Not enrolled"
//     }`;
//     appendToLogFile(logMsg);

//     res.json({ success: true, isEnrolled: !!enrollment });
//   } catch (err) {
//     console.error("Error checking enrollment:", err);
//     appendToLogFile(
//       `[CHECK_ENROLLMENT_ERROR] ${new Date().toISOString()} - Error checking enrollment for user ${
//         req.user?.id
//       }, course ${req.params.courseId}: ${err.message}`
//     );
//     res.status(500).json({
//       success: false,
//       error: "Failed to check enrollment",
//       details: err.message,
//     });
//   }
// });

// // ✅ GET pending enrollments (admin/teacher only)
// router.get(
//   "/pending",
//   authMiddleware,
//   roleMiddleware(["admin", "teacher"]),
//   async (req, res) => {
//     try {
//       console.log("Fetching pending enrollments...");
//       const enrollments = await UserCourseAccess.findAll({
//         where: { approved: false },
//         include: [
//           { model: User, as: "user", attributes: ["id", "name", "email"] },
//           {
//             model: Course,
//             as: "course",
//             attributes: ["id", "title", "description", "price", "slug"],
//           },
//         ],
//         order: [["accessGrantedAt", "DESC"]],
//       });
//       console.log("Found enrollments:", enrollments.length);
//       res.json({ success: true, enrollments });
//     } catch (err) {
//       console.error("Error fetching pending enrollments:", err);
//       res
//         .status(500)
//         .json({ success: false, error: "Failed to fetch pending enrollments" });
//     }
//   }
// );

// // ✅ GET approved enrollments
// router.get(
//   "/approved",
//   authMiddleware,
//   roleMiddleware(["admin", "teacher"]),
//   async (req, res) => {
//     try {
//       const enrollments = await UserCourseAccess.findAll({
//         where: { approved: true },
//         include: [
//           { model: User, as: "user", attributes: ["id", "name", "email"] },
//           {
//             model: Course,
//             as: "course",
//             attributes: ["id", "title", "description", "price", "slug"],
//           },
//         ],
//         order: [["accessGrantedAt", "DESC"]],
//       });
//       res.json({ success: true, enrollments });
//     } catch (err) {
//       console.error("Error fetching approved enrollments:", err);
//       res.status(500).json({
//         success: false,
//         error: "Failed to fetch approved enrollments",
//       });
//     }
//   }
// );

// // ✅ GET courses for logged-in student
// router.get("/my-courses", authMiddleware, async (req, res) => {
//   try {
//     const userId = req.user?.id;
//     if (!userId) {
//       return res
//         .status(401)
//         .json({ success: false, error: "Unauthorized: No user ID" });
//     }

//     const enrollments = await UserCourseAccess.findAll({
//       where: { userId },
//       include: [
//         {
//           model: Course,
//           as: "course",
//           attributes: [
//             "id",
//             "slug",
//             "title",
//             "description",
//             "price",
//             "category",
//           ],
//           required: true,
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
//     }));

//     res.json({ success: true, courses: formatted });
//   } catch (err) {
//     console.error("Error loading my courses:", err);
//     res
//       .status(500)
//       .json({ success: false, error: "Failed to load enrolled courses" });
//   }
// });

// // ✅ DELETE enrollment (student)
// router.delete("/:courseId", authMiddleware, async (req, res) => {
//   const userId = req.user.id;
//   const courseId = parseInt(req.params.courseId, 10);

//   if (isNaN(courseId)) {
//     return res.status(400).json({ success: false, error: "Invalid course ID" });
//   }

//   try {
//     const access = await UserCourseAccess.findOne({
//       where: { userId, courseId },
//     });
//     if (!access) {
//       return res
//         .status(404)
//         .json({ success: false, error: "Enrollment not found" });
//     }

//     await access.destroy();

//     const logMsg = `[UNENROLLED] ${new Date().toISOString()} - User ${userId} unenrolled from course ${courseId}`;
//     appendToLogFile(logMsg);

//     res.json({ success: true, message: "Unenrolled successfully" });
//   } catch (err) {
//     console.error("Error unenrolling from course:", err);
//     res
//       .status(500)
//       .json({ success: false, error: "Failed to unenroll from course" });
//   }
// });

// // ✅ POST approve enrollment (admin/teacher)
// router.post(
//   "/approve",
//   authMiddleware,
//   roleMiddleware(["admin", "teacher"]),
//   async (req, res) => {
//     try {
//       const { userId, courseId } = req.body;
//       if (!userId || !courseId) {
//         return res
//           .status(400)
//           .json({ success: false, error: "userId and courseId are required" });
//       }

//       const enrollment = await UserCourseAccess.findOne({
//         where: { userId, courseId },
//         include: [
//           { model: User, as: "user", attributes: ["email", "name"] },
//           { model: Course, as: "course", attributes: ["title"] },
//         ],
//       });

//       if (!enrollment) {
//         return res
//           .status(404)
//           .json({ success: false, error: "Enrollment not found" });
//       }

//       if (enrollment.approved) {
//         return res
//           .status(400)
//           .json({ success: false, error: "Enrollment already approved" });
//       }

//       enrollment.approved = true;
//       enrollment.accessGrantedAt = new Date();
//       await enrollment.save();

//       appendToLogFile(
//         `[APPROVED] ${new Date().toISOString()} - User ${userId} approved for course ${courseId}`
//       );

//       if (enrollment.user && enrollment.course) {
//         const { subject, html } = courseEnrollmentApproved(
//           enrollment.user,
//           enrollment.course
//         );
//         await sendEmail(enrollment.user.email, subject, html);
//       }

//       res.json({
//         success: true,
//         message: "Enrollment approved successfully",
//         enrollment: {
//           userId,
//           courseId,
//           approved: true,
//           accessGrantedAt: enrollment.accessGrantedAt,
//         },
//       });
//     } catch (err) {
//       console.error("Error approving enrollment:", err);
//       res
//         .status(500)
//         .json({ success: false, error: "Failed to approve enrollment" });
//     }
//   }
// );

// // ✅ POST reject enrollment (admin/teacher)
// router.post(
//   "/reject",
//   authMiddleware,
//   roleMiddleware(["admin", "teacher"]),
//   async (req, res) => {
//     try {
//       const { userId, courseId } = req.body;
//       if (!userId || !courseId) {
//         return res
//           .status(400)
//           .json({ success: false, error: "userId and courseId are required" });
//       }

//       const enrollment = await UserCourseAccess.findOne({
//         where: { userId, courseId },
//         include: [
//           { model: User, as: "user", attributes: ["email", "name"] },
//           { model: Course, as: "course", attributes: ["title"] },
//         ],
//       });

//       if (!enrollment) {
//         return res
//           .status(404)
//           .json({ success: false, error: "Enrollment not found" });
//       }

//       await enrollment.destroy();

//       appendToLogFile(
//         `[REJECTED] ${new Date().toISOString()} - User ${userId} rejected for course ${courseId}`
//       );

//       if (enrollment.user && enrollment.course) {
//         const { subject, html } = courseEnrollmentRejected(
//           enrollment.user,
//           enrollment.course
//         );
//         await sendEmail(enrollment.user.email, subject, html);
//       }

//       res.json({ success: true, message: "Enrollment rejected successfully" });
//     } catch (err) {
//       console.error("Error rejecting enrollment:", err);
//       res
//         .status(500)
//         .json({ success: false, error: "Failed to reject enrollment" });
//     }
//   }
// );

// // ✅ POST confirm payment + create enrollment (called by student after payment)
// router.post("/confirm", authMiddleware, confirmEnrollment);

// module.exports = router;






// ✅ FULLY UPDATED ENROLLMENTS.JS with lessons in /my-courses

const express = require("express");
const router = express.Router();
const { UserCourseAccess, User, Course } = require("../models");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const sendEmail = require("../utils/sendEmail");
const fs = require("fs");
const path = require("path");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const courseEnrollmentPending = require("../utils/emails/courseEnrollmentPending");
const courseEnrollmentApproved = require("../utils/emails/courseEnrollmentApproved");
const courseEnrollmentRejected = require("../utils/emails/courseEnrollmentRejected");
const { confirmEnrollment } = require("../controllers/enrollmentController");

function appendToLogFile(message) {
  const logDir = path.join(__dirname, "..", "logs");
  const logFilePath = path.join(logDir, "enrollments.log");
  try {
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
    fs.appendFileSync(logFilePath, `${message}\n`);
  } catch (err) {
    console.error("Failed to write to log file:", err);
  }
}

// ✅ GET courses for logged-in student including lessons and teacher info
router.get("/my-courses", authMiddleware, async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, error: "Unauthorized: No user ID" });
    }

    const enrollments = await UserCourseAccess.findAll({
      where: { userId },
      include: [
        {
          model: Course,
          as: "course",
          required: true,
          include: [
            {
              model: require("../models").Lesson,
              as: "lessons",
              order: [["orderIndex", "ASC"]],
            },
            {
              model: require("../models").User,
              as: "teacher",
              attributes: ["id", "name", "email"],
            },
          ],
        },
      ],
      order: [["accessGrantedAt", "DESC"]],
    });

    const formatted = enrollments.map((entry) => ({
      id: entry.course.id,
      slug: entry.course.slug,
      title: entry.course.title,
      description: entry.course.description,
      price: parseFloat(entry.course.price) || 0,
      category: entry.course.category || "Uncategorized",
      enrolledAt: entry.accessGrantedAt,
      status: entry.approved ? "approved" : "pending",
      lessons: entry.course.lessons || [],
      teacher: entry.course.teacher || {},
    }));

    res.json({ success: true, courses: formatted });
  } catch (err) {
    console.error("Error loading my courses:", err);
    res.status(500).json({ success: false, error: "Failed to load enrolled courses" });
  }
});

module.exports = router;
