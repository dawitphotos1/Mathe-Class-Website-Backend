// const express = require("express");
// const router = express.Router();
// const { UserCourseAccess, User, Course } = require("../models");
// const authMiddleware = require("../middleware/authMiddleware");
// const sendEmail = require("../utils/sendEmail");
// const fs = require("fs");
// const path = require("path");
// const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
// const courseEnrollmentPending = require("../utils/emails/courseEnrollmentPending");
// const courseEnrollmentApproved = require("../utils/emails/courseEnrollmentApproved");
// const courseEnrollmentRejected = require("../utils/emails/courseEnrollmentRejected");

// function isAdminOrTeacher(req, res, next) {
//   if (req.user && ["admin", "teacher"].includes(req.user.role)) {
//     return next();
//   }
//   return res.status(403).json({ error: "Forbidden" });
// }

// // ✅ GET /pending enrollments
// router.get("/pending", authMiddleware, isAdminOrTeacher, async (req, res) => {
//   try {
//     const pending = await UserCourseAccess.findAll({
//       where: { approved: false },
//       include: [
//         { model: User, as: "user", attributes: ["id", "name", "email"] },
//         { model: Course, as: "course", attributes: ["id", "title"] },
//       ],
//       order: [["accessGrantedAt", "DESC"]],
//     });
//     res.json(pending);
//   } catch (err) {
//     console.error("Error fetching pending enrollments:", err);
//     res.status(500).json({ error: "Failed to fetch pending enrollments" });
//   }
// });

// // ✅ GET /approved enrollments
// router.get("/approved", authMiddleware, isAdminOrTeacher, async (req, res) => {
//   try {
//     const approved = await UserCourseAccess.findAll({
//       where: { approved: true },
//       include: [
//         { model: User, as: "user", attributes: ["id", "name", "email"] },
//         { model: Course, as: "course", attributes: ["id", "title"] },
//       ],
//       order: [["accessGrantedAt", "DESC"]],
//     });
//     res.json(approved);
//   } catch (err) {
//     console.error("Error fetching approved enrollments:", err);
//     res.status(500).json({ error: "Failed to fetch approved enrollments" });
//   }
// });

// // ✅ POST /approve
// router.post("/approve", authMiddleware, isAdminOrTeacher, async (req, res) => {
//   const { userId, courseId } = req.body;

//   try {
//     const access = await UserCourseAccess.findOne({
//       where: { userId, courseId },
//       include: [
//         { model: User, as: "user" },
//         { model: Course, as: "course" },
//       ],
//     });

//     if (!access) {
//       return res.status(404).json({ error: "Enrollment not found" });
//     }

//     access.approved = true;
//     await access.save();

//     const logMsg = `[APPROVED] ${new Date().toISOString()} - ${
//       access.user?.email || "unknown"
//     } for "${access.course?.title || "unknown"}"\n`;
//     fs.appendFileSync(path.join(__dirname, "../logs/enrollments.log"), logMsg);

//     const { subject, html } = courseEnrollmentApproved(
//       access.user,
//       access.course
//     );
//     await sendEmail(access.user.email, subject, html);

//     res.json({ success: true, message: "Enrollment approved" });
//   } catch (err) {
//     console.error("❌ Error in approve route:", err);
//     res.status(500).json({ error: "Something went wrong" });
//   }
// });

// // ✅ POST /reject
// router.post("/reject", authMiddleware, isAdminOrTeacher, async (req, res) => {
//   const { userId, courseId } = req.body;

//   try {
//     const access = await UserCourseAccess.findOne({
//       where: { userId, courseId },
//       include: [
//         { model: User, as: "user" },
//         { model: Course, as: "course" },
//       ],
//     });

//     if (!access) return res.status(404).json({ error: "Enrollment not found" });

//     const logMsg = `[REJECTED] ${new Date().toISOString()} - ${
//       access.user?.email || "unknown"
//     } from "${access.course?.title || "unknown"}"\n`;
//     fs.appendFileSync(path.join(__dirname, "../logs/enrollments.log"), logMsg);

//     const { subject, html } = courseEnrollmentRejected(
//       access.user,
//       access.course
//     );
//     await sendEmail(access.user.email, subject, html);

//     await access.destroy();
//     res.json({ message: "Enrollment rejected and email sent" });
//   } catch (err) {
//     console.error("Error rejecting enrollment:", err);
//     res.status(500).json({ error: "Failed to reject enrollment" });
//   }
// });

// // ✅ POST /confirm
// router.post("/confirm", authMiddleware, async (req, res) => {
//   try {
//     const { session_id } = req.body;
//     const userId = req.user.id;

//     if (!session_id) {
//       return res.status(400).json({ error: "Missing session_id" });
//     }

//     const session = await stripe.checkout.sessions.retrieve(session_id);

//     console.log("🔍 Stripe Session Fetched:", {
//       id: session.id,
//       payment_status: session.payment_status,
//       metadata: session.metadata,
//     });

//     if (!session || session.payment_status !== "paid") {
//       return res
//         .status(400)
//         .json({ error: "Invalid or incomplete payment session" });
//     }

//     const courseId = parseInt(session.metadata?.courseId);
//     if (!courseId) {
//       console.error(
//         "❌ Missing or invalid courseId in Stripe metadata:",
//         session.metadata
//       );
//       return res
//         .status(400)
//         .json({ error: "Missing or invalid course ID in metadata" });
//     }

//     // Find or create the enrollment
//     let enrollment = await UserCourseAccess.findOne({
//       where: { userId, courseId },
//       include: [
//         { model: User, as: "user" },
//         { model: Course, as: "course" },
//       ],
//     });

//     if (!enrollment) {
//       await UserCourseAccess.create({
//         userId,
//         courseId,
//         approved: false,
//         accessGrantedAt: new Date(),
//       });

//       // Re-fetch with associations
//       enrollment = await UserCourseAccess.findOne({
//         where: { userId, courseId },
//         include: [
//           { model: User, as: "user" },
//           { model: Course, as: "course" },
//         ],
//       });
//     }

//     // Fallback if associations failed
//     let user = enrollment.user;
//     let course = enrollment.course;

//     if (!user) user = await User.findByPk(userId);
//     if (!course) course = await Course.findByPk(courseId);

//     if (!user || !course) {
//       console.error("❌ Could not load user or course:", { user, course });
//       return res.status(500).json({ error: "Enrollment is incomplete" });
//     }

//     const logMsg = `[PENDING] ${new Date().toISOString()} - ${
//       user.email
//     } for "${course.title}"\n`;
//     fs.appendFileSync(path.join(__dirname, "../logs/enrollments.log"), logMsg);

//     const { subject, html } = courseEnrollmentPending(user, course);
//     await sendEmail(user.email, subject, html);

//     res.json({
//       success: true,
//       message:
//         "Enrollment confirmation received. Pending teacher/admin approval.",
//     });
//   } catch (error) {
//     console.error("❌ Error confirming enrollment:", {
//       message: error.message,
//       stack: error.stack,
//     });
//     res.status(500).json({ error: "Failed to confirm enrollment" });
//   }
// });

// // ✅ GET /my-courses
// router.get("/my-courses", authMiddleware, async (req, res) => {
//   try {
//     const userId = req.user.id;

//     const enrollments = await UserCourseAccess.findAll({
//       where: { userId, approved: true },
//       include: [{ model: Course, as: "course" }],
//       order: [["accessGrantedAt", "DESC"]],
//     });

//     const formatted = enrollments.map((entry) => ({
//       id: entry.course.id,
//       title: entry.course.title,
//       description: entry.course.description,
//       price: entry.course.price,
//       enrolledAt: entry.accessGrantedAt,
//     }));

//     res.json({ success: true, courses: formatted });
//   } catch (err) {
//     console.error("❌ Error fetching my courses:", err);
//     res.status(500).json({ error: "Failed to load enrolled courses" });
//   }
// });

// module.exports = router;




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

// 🛠️ Ensure logs directory and write log
function appendToLogFile(message) {
  const logsDir = path.join(__dirname, "../logs");
  const logFilePath = path.join(logsDir, "enrollments.log");

  if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir);
  }

  fs.appendFileSync(logFilePath, message);
}

// ✅ GET /pending enrollments
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

// ✅ GET /approved enrollments
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

// ✅ POST /approve
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

    if (!access) {
      return res.status(404).json({ error: "Enrollment not found" });
    }

    access.approved = true;
    await access.save();

    const logMsg = `[APPROVED] ${new Date().toISOString()} - ${
      access.user?.email || "unknown"
    } for "${access.course?.title || "unknown"}"\n`;
    appendToLogFile(logMsg);

    const { subject, html } = courseEnrollmentApproved(
      access.user,
      access.course
    );
    await sendEmail(access.user.email, subject, html);

    res.json({ success: true, message: "Enrollment approved" });
  } catch (err) {
    console.error("❌ Error in approve route:", err);
    res.status(500).json({ error: "Something went wrong" });
  }
});

// ✅ POST /reject
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
    appendToLogFile(logMsg);

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

// ✅ POST /confirm
router.post("/confirm", authMiddleware, async (req, res) => {
  try {
    const { session_id } = req.body;
    const userId = req.user.id;

    if (!session_id) {
      return res.status(400).json({ error: "Missing session_id" });
    }

    const session = await stripe.checkout.sessions.retrieve(session_id);

    console.log("🔍 Stripe Session Fetched:", {
      id: session.id,
      payment_status: session.payment_status,
      metadata: session.metadata,
    });

    if (!session || session.payment_status !== "paid") {
      return res
        .status(400)
        .json({ error: "Invalid or incomplete payment session" });
    }

    const courseId = parseInt(session.metadata?.courseId);
    if (!courseId) {
      console.error(
        "❌ Missing or invalid courseId in Stripe metadata:",
        session.metadata
      );
      return res
        .status(400)
        .json({ error: "Missing or invalid course ID in metadata" });
    }

    let enrollment = await UserCourseAccess.findOne({
      where: { userId, courseId },
      include: [
        { model: User, as: "user" },
        { model: Course, as: "course" },
      ],
    });

    if (!enrollment) {
      await UserCourseAccess.create({
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

    let user = enrollment.user;
    let course = enrollment.course;

    if (!user) user = await User.findByPk(userId);
    if (!course) course = await Course.findByPk(courseId);

    if (!user || !course) {
      console.error("❌ Could not load user or course:", { user, course });
      return res.status(500).json({ error: "Enrollment is incomplete" });
    }

    const logMsg = `[PENDING] ${new Date().toISOString()} - ${
      user.email
    } for "${course.title}"\n`;
    appendToLogFile(logMsg);

    const { subject, html } = courseEnrollmentPending(user, course);
    await sendEmail(user.email, subject, html);

    res.json({
      success: true,
      message:
        "Enrollment confirmation received. Pending teacher/admin approval.",
    });
  } catch (error) {
    console.error("❌ Error confirming enrollment:", {
      message: error.message,
      stack: error.stack,
    });
    res.status(500).json({ error: "Failed to confirm enrollment" });
  }
});

// ✅ GET /my-courses
router.get("/my-courses", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;

    const enrollments = await UserCourseAccess.findAll({
      where: { userId, approved: true },
      include: [{ model: Course, as: "course" }],
      order: [["accessGrantedAt", "DESC"]],
    });

    const formatted = enrollments.map((entry) => ({
      id: entry.course.id,
      title: entry.course.title,
      description: entry.course.description,
      price: entry.course.price,
      enrolledAt: entry.accessGrantedAt,
    }));

    res.json({ success: true, courses: formatted });
  } catch (err) {
    console.error("❌ Error fetching my courses:", err);
    res.status(500).json({ error: "Failed to load enrolled courses" });
  }
});

module.exports = router;
