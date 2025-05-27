// const express = require("express");
// const router = express.Router();
// const { UserCourseAccess, User, Course } = require("../models");
// const authMiddleware = require("../middleware/authMiddleware");

// // Only allow admins and teachers
// function isAdminOrTeacher(req, res, next) {
//   if (req.user && ["admin", "teacher"].includes(req.user.role)) {
//     return next();
//   }
//   return res.status(403).json({ error: "Forbidden" });
// }

// // GET /api/v1/admin/enrollments/pending
// router.get(
//   "/admin/enrollments/pending",
//   authMiddleware,
//   isAdminOrTeacher,
//   async (req, res) => {
//     try {
//       const pending = await UserCourseAccess.findAll({
//         where: { approved: false },
//         include: [
//           { model: User, as: "user", attributes: ["id", "name", "email"] },
//           { model: Course, as: "course", attributes: ["id", "title"] },
//         ],
//         order: [["accessGrantedAt", "DESC"]],
//       });
//       res.json(pending);
//     } catch (err) {
//       console.error("Error fetching pending enrollments:", err);
//       res.status(500).json({ error: "Failed to fetch pending enrollments" });
//     }
//   }
// );

// // GET /api/v1/admin/enrollments/approved
// router.get(
//   "/admin/enrollments/approved",
//   authMiddleware,
//   isAdminOrTeacher,
//   async (req, res) => {
//     try {
//       const approved = await UserCourseAccess.findAll({
//         where: { approved: true },
//         include: [
//           { model: User, as: "user", attributes: ["id", "name", "email"] },
//           { model: Course, as: "course", attributes: ["id", "title"] },
//         ],
//         order: [["accessGrantedAt", "DESC"]],
//       });
//       res.json(approved);
//     } catch (err) {
//       console.error("Error fetching approved enrollments:", err);
//       res.status(500).json({ error: "Failed to fetch approved enrollments" });
//     }
//   }
// );

// // POST /api/v1/enrollments/approve
// router.post(
//   "/enrollments/approve",
//   authMiddleware,
//   isAdminOrTeacher,
//   async (req, res) => {
//     const { userId, courseId } = req.body;
//     try {
//       const access = await UserCourseAccess.findOne({
//         where: { userId, courseId },
//       });
//       if (!access)
//         return res.status(404).json({ error: "Enrollment not found" });

//       access.approved = true;
//       await access.save();

//       res.json({ message: "Enrollment approved" });
//     } catch (err) {
//       console.error("Error approving enrollment:", err);
//       res.status(500).json({ error: "Failed to approve enrollment" });
//     }
//   }
// );

// // POST /api/v1/enrollments/reject
// router.post(
//   "/enrollments/reject",
//   authMiddleware,
//   isAdminOrTeacher,
//   async (req, res) => {
//     const { userId, courseId } = req.body;
//     try {
//       const access = await UserCourseAccess.findOne({
//         where: { userId, courseId },
//       });
//       if (!access)
//         return res.status(404).json({ error: "Enrollment not found" });

//       await access.destroy();
//       res.json({ message: "Enrollment rejected and removed" });
//     } catch (err) {
//       console.error("Error rejecting enrollment:", err);
//       res.status(500).json({ error: "Failed to reject enrollment" });
//     }
//   }
// );

// module.exports = router;


const express = require("express");
const router = express.Router();
const { UserCourseAccess, User, Course } = require("../models");
const authMiddleware = require("../middleware/authMiddleware");
const sendEmail = require("../utils/sendEmail");
const fs = require("fs");
const path = require("path");

// Middleware: Only allow admins and teachers
function isAdminOrTeacher(req, res, next) {
  if (req.user && ["admin", "teacher"].includes(req.user.role)) {
    return next();
  }
  return res.status(403).json({ error: "Forbidden" });
}

// GET pending enrollments
router.get(
  "/enrollments/pending",
  authMiddleware,
  isAdminOrTeacher,
  async (req, res) => {
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
  }
);

// GET approved enrollments
router.get(
  "/enrollments/approved",
  authMiddleware,
  isAdminOrTeacher,
  async (req, res) => {
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
  }
);

// POST approve enrollment
router.post(
  "/enrollments/approve",
  authMiddleware,
  isAdminOrTeacher,
  async (req, res) => {
    const { userId, courseId } = req.body;

    try {
      const access = await UserCourseAccess.findOne({
        where: { userId, courseId },
        include: [
          { model: User, as: "user" },
          { model: Course, as: "course" },
        ],
      });

      if (!access)
        return res.status(404).json({ error: "Enrollment not found" });

      access.approved = true;
      await access.save();

      // Log approval
      const logMsg = `[APPROVED] ${new Date().toISOString()} - ${
        access.user.email
      } for "${access.course.title}"\n`;
      fs.appendFileSync(
        path.join(__dirname, "../logs/enrollments.log"),
        logMsg
      );

      // Send approval email
      await sendEmail(
        access.user.email,
        `✅ Enrollment Approved for ${access.course.title}`,
        `<p>Hello ${access.user.name},</p>
       <p>Your enrollment in <strong>${access.course.title}</strong> has been <strong>approved</strong>.</p>
       <p>You may now access the course materials.</p>`
      );

      res.json({ message: "Enrollment approved and email sent" });
    } catch (err) {
      console.error("Error approving enrollment:", err);
      res.status(500).json({ error: "Failed to approve enrollment" });
    }
  }
);

// POST reject enrollment
router.post(
  "/enrollments/reject",
  authMiddleware,
  isAdminOrTeacher,
  async (req, res) => {
    const { userId, courseId } = req.body;

    try {
      const access = await UserCourseAccess.findOne({
        where: { userId, courseId },
        include: [
          { model: User, as: "user" },
          { model: Course, as: "course" },
        ],
      });

      if (!access)
        return res.status(404).json({ error: "Enrollment not found" });

      await access.destroy();

      // Log rejection
      const logMsg = `[REJECTED] ${new Date().toISOString()} - ${
        access.user.email
      } from "${access.course.title}"\n`;
      fs.appendFileSync(
        path.join(__dirname, "../logs/enrollments.log"),
        logMsg
      );

      // Send rejection email
      await sendEmail(
        access.user.email,
        `❌ Enrollment Rejected for ${access.course.title}`,
        `<p>Hello ${access.user.name},</p>
       <p>Your enrollment request for <strong>${access.course.title}</strong> has been <strong>rejected</strong>.</p>
       <p>If you believe this was a mistake, please contact your instructor.</p>`
      );

      res.json({ message: "Enrollment rejected and email sent" });
    } catch (err) {
      console.error("Error rejecting enrollment:", err);
      res.status(500).json({ error: "Failed to reject enrollment" });
    }
  }
);

module.exports = router;

