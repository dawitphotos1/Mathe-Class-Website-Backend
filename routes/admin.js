// // const express = require("express");
// // const fs = require("fs");
// // const path = require("path");
// // const router = express.Router();
// // const authenticate = require("../middleware/authenticate");

// // // Utility to filter log lines by action
// // const filterLogLines = (content, action) => {
// //   if (!action) return content;
// //   const lines = content.split("\n");
// //   return lines.filter((line) => line.includes(`] ${action}`)).join("\n");
// // };

// // // ✅ View lesson logs (plain text, optional ?action=DELETE)
// // router.get("/lesson-logs", authenticate, async (req, res) => {
// //   if (req.user.role !== "admin") {
// //     return res.status(403).json({ error: "Access denied" });
// //   }

// //   const action = req.query.action; // e.g., ?action=DELETE
// //   const logPath = path.join(__dirname, "../logs/lesson-actions.log");

// //   try {
// //     const content = fs.readFileSync(logPath, "utf8");
// //     const filtered = filterLogLines(content, action);
// //     res.setHeader("Content-Type", "text/plain");
// //     res.send(filtered || "📄 No matching logs.");
// //   } catch (err) {
// //     res
// //       .status(500)
// //       .json({ error: "Failed to read log file", details: err.message });
// //   }
// // });

// // // ✅ Download raw log file
// // router.get("/lesson-logs/download", authenticate, (req, res) => {
// //   if (req.user.role !== "admin") {
// //     return res.status(403).json({ error: "Access denied" });
// //   }

// //   const filePath = path.join(__dirname, "../logs/lesson-actions.log");
// //   if (!fs.existsSync(filePath)) {
// //     return res.status(404).json({ error: "Log file not found" });
// //   }

// //   res.download(filePath, "lesson-actions.log");
// // });

// // // ✅ Download filtered log as CSV
// // router.get("/lesson-logs/download.csv", authenticate, (req, res) => {
// //   if (req.user.role !== "admin")
// //     return res.status(403).json({ error: "Access denied" });

// //   const action = req.query.action;
// //   const logPath = path.join(__dirname, "../logs/lesson-actions.log");

// //   if (!fs.existsSync(logPath))
// //     return res.status(404).json({ error: "Log not found" });

// //   const raw = fs.readFileSync(logPath, "utf8");
// //   const lines = raw.split("\n").filter((line) => line.trim().length > 0);
// //   const filtered = action
// //     ? lines.filter((l) => l.includes(`] ${action}`))
// //     : lines;

// //   const csv = ["timestamp,action,email,title,lessonId"];
// //   for (const line of filtered) {
// //     const match = line.match(
// //       /\[(.*?)\] (\w+) by (.*?) on "(.*?)" \(ID: (\d+)\)/
// //     );
// //     if (match) {
// //       csv.push(`${match[1]},${match[2]},${match[3]},${match[4]},${match[5]}`);
// //     }
// //   }

// //   res.setHeader("Content-Type", "text/csv");
// //   res.setHeader(
// //     "Content-Disposition",
// //     "attachment; filename=lesson-actions.csv"
// //   );
// //   res.send(csv.join("\n"));
// // });

// // module.exports = router;




// const express = require("express");
// const router = express.Router();
// const { UserCourseAccess, User, Course } = require("../models");
// const { authMiddleware, checkTeacherOrAdmin } = require("../middleware/auth");

// // ✅ Fetch all pending enrollments
// router.get(
//   "/enrollments/pending",
//   authMiddleware,
//   checkTeacherOrAdmin,
//   async (req, res) => {
//     try {
//       const pendingEnrollments = await UserCourseAccess.findAll({
//         where: { approved: false },
//         include: [
//           { model: User, attributes: ["id", "name", "email"] },
//           { model: Course, attributes: ["id", "title"] },
//         ],
//       });

//       res.json({ success: true, enrollments: pendingEnrollments });
//     } catch (error) {
//       console.error("Error fetching pending enrollments:", error);
//       res
//         .status(500)
//         .json({ success: false, error: "Failed to fetch pending enrollments" });
//     }
//   }
// );

// // ✅ Fetch all approved enrollments
// router.get("/enrollments/approved", authMiddleware, checkTeacherOrAdmin, async (req, res) => {
//   try {
//     const approvedEnrollments = await UserCourseAccess.findAll({
//       where: { approved: true },
//       include: [
//         { model: User, attributes: ["id", "name", "email"] },
//         { model: Course, attributes: ["id", "title"] }
//       ],
//       order: [["accessGrantedAt", "DESC"]]
//     });

//     res.json({ success: true, enrollments: approvedEnrollments });
//   } catch (error) {
//     console.error("Error fetching approved enrollments:", error);
//     res.status(500).json({ success: false, error: "Failed to fetch approved enrollments" });
//   }
// });



// // ✅ Approve enrollment
// router.put(
//   "/enrollments/:id/approve",
//   authMiddleware,
//   checkTeacherOrAdmin,
//   async (req, res) => {
//     try {
//       const { id } = req.params;
//       const enrollment = await UserCourseAccess.findByPk(id);
//       if (!enrollment) {
//         return res
//           .status(404)
//           .json({ success: false, error: "Enrollment not found" });
//       }

//       enrollment.approved = true;
//       enrollment.accessGrantedAt = new Date();
//       await enrollment.save();

//       res.json({ success: true, message: "Enrollment approved", enrollment });
//     } catch (error) {
//       console.error("Error approving enrollment:", error);
//       res
//         .status(500)
//         .json({ success: false, error: "Failed to approve enrollment" });
//     }
//   }
// );

// // ✅ Reject enrollment
// router.delete(
//   "/enrollments/:id",
//   authMiddleware,
//   checkTeacherOrAdmin,
//   async (req, res) => {
//     try {
//       const { id } = req.params;
//       const enrollment = await UserCourseAccess.findByPk(id);
//       if (!enrollment) {
//         return res
//           .status(404)
//           .json({ success: false, error: "Enrollment not found" });
//       }

//       await enrollment.destroy();
//       res.json({
//         success: true,
//         message: "Enrollment request rejected and deleted",
//       });
//     } catch (error) {
//       console.error("Error rejecting enrollment:", error);
//       res
//         .status(500)
//         .json({ success: false, error: "Failed to reject enrollment" });
//     }
//   }
// );

// module.exports = router;




const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const authMiddleware = require("../middleware/authMiddleware");
const checkTeacherOrAdmin = require("../middleware/checkTeacherOrAdmin");

// ✅ Fetch pending enrollments
router.get(
  "/enrollments/pending",
  authMiddleware,
  checkTeacherOrAdmin,
  adminController.getPendingEnrollments
);

// ✅ Fetch approved enrollments
router.get(
  "/enrollments/approved",
  authMiddleware,
  checkTeacherOrAdmin,
  adminController.getApprovedEnrollments
);

// ✅ Approve an enrollment
router.put(
  "/enrollments/:id/approve",
  authMiddleware,
  checkTeacherOrAdmin,
  adminController.approveEnrollment
);

// ✅ Reject an enrollment
router.delete(
  "/enrollments/:id",
  authMiddleware,
  checkTeacherOrAdmin,
  adminController.rejectEnrollment
);

module.exports = router;