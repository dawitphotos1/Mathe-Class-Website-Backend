// // routes/adminRoutes.js

// const express = require("express");
// const router = express.Router();
// const { User, UserCourseAccess, Course } = require("../models");
// const authenticate = require("../middleware/authenticate");
// const isAdmin = require("../middleware/isAdmin"); // ✅ Use external version

// // 🔹 GET /admin/dashboard
// router.get("/dashboard", authenticate, isAdmin, async (req, res) => {
//   try {
//     const totalUsers = await User.count();
//     const totalStudents = await User.count({ where: { role: "student" } });
//     const totalCourses = await Course.count();
//     const totalEnrollments = await UserCourseAccess.count({
//       where: { approved: true },
//     });

//     res.json({
//       totalUsers,
//       totalStudents,
//       totalCourses,
//       totalEnrollments,
//     });
//   } catch (err) {
//     console.error("Dashboard error:", err);
//     res.status(500).json({ error: "Failed to load dashboard stats" });
//   }
// });

// // 🔹 GET /admin/pending-users
// router.get("/pending-users", authenticate, isAdmin, async (req, res) => {
//   try {
//     const users = await User.findAll({ where: { approval_status: "pending" } });
//     res.json(users);
//   } catch (err) {
//     res.status(500).json({ error: "Failed to fetch pending users" });
//   }
// });

// // 🔹 GET /admin/users?status=approved|rejected
// router.get("/users", authenticate, isAdmin, async (req, res) => {
//   try {
//     const status = req.query.status;
//     const users = await User.findAll({ where: { approval_status: status } });
//     res.json(users);
//   } catch (err) {
//     res.status(500).json({ error: "Failed to fetch users" });
//   }
// });

// // 🔹 GET /admin/enrollments/pending
// router.get("/enrollments/pending", authenticate, isAdmin, async (req, res) => {
//   try {
//     const pendingEnrollments = await UserCourseAccess.findAll({
//       where: { approved: false },
//       include: [User, Course],
//     });
//     res.json(pendingEnrollments);
//   } catch (err) {
//     res.status(500).json({ error: "Failed to fetch pending enrollments" });
//   }
// });

// // 🔹 GET /admin/enrollments/approved
// router.get("/enrollments/approved", authenticate, isAdmin, async (req, res) => {
//   try {
//     const approvedEnrollments = await UserCourseAccess.findAll({
//       where: { approved: true },
//       include: [User, Course],
//     });
//     res.json(approvedEnrollments);
//   } catch (err) {
//     res.status(500).json({ error: "Failed to fetch approved enrollments" });
//   }
// });

// module.exports = router;



const express = require("express");
const router = express.Router();

const {
  getDashboardStats,
  getPendingUsers,
  getApprovedOrRejectedUsers,
  getEnrollments,
  approveUser,
  rejectUser,
} = require("../controllers/adminController");

const {
  approveEnrollment,
  rejectEnrollment,
} = require("../controllers/enrollmentController");

const { authMiddleware, checkTeacherOrAdmin } = require("../middleware/auth");

// ✅ Protect all admin routes
router.use(authMiddleware, checkTeacherOrAdmin);

// =========================
// 📊 Dashboard
// =========================
router.get("/dashboard", getDashboardStats);

// =========================
// 👤 User Management
// =========================
router.get("/pending-users", getPendingUsers);
router.get("/users", getApprovedOrRejectedUsers);
router.patch("/approve/:id", approveUser);
router.patch("/reject/:id", rejectUser);

// =========================
// 📘 Enrollment Management
// =========================
router.get("/enrollments", getEnrollments); // expects ?status=pending or approved
router.put("/enrollments/:id/approve", approveEnrollment);
router.delete("/enrollments/:id/reject", rejectEnrollment);

module.exports = router;
