// const express = require("express");
// const router = express.Router();
// const adminController = require("../controllers/adminController");
// const authMiddleware = require("../middleware/authMiddleware");
// const checkTeacherOrAdmin = require("../middleware/checkTeacherOrAdmin");

// // ✅ Fetch pending enrollments
// router.get(
//   "/enrollments/pending",
//   authMiddleware,
//   checkTeacherOrAdmin,
//   adminController.getPendingEnrollments
// );

// // ✅ Fetch approved enrollments
// router.get(
//   "/enrollments/approved",
//   authMiddleware,
//   checkTeacherOrAdmin,
//   adminController.getApprovedEnrollments
// );

// // ✅ Approve an enrollment
// router.put(
//   "/enrollments/:id/approve",
//   authMiddleware,
//   checkTeacherOrAdmin,
//   adminController.approveEnrollment
// );

// // ✅ Reject an enrollment
// router.delete(
//   "/enrollments/:id",
//   authMiddleware,
//   checkTeacherOrAdmin,
//   adminController.rejectEnrollment
// );

// module.exports = router;




// routes/admin.js
const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const { authenticate } = require("../middleware/authenticate");
const checkTeacherOrAdmin = require("../middleware/checkTeacherOrAdmin";

// Fetch pending enrollments
router.get(
  "/enrollments/pending",
  authenticate,
  checkTeacherOrAdmin,
  adminController.getPendingEnrollments
);

// Fetch approved enrollments
router.get(
  "/enrollments/approved",
  authenticate,
  checkTeacherOrAdmin,
  adminController.getApprovedEnrollments
);

// Approve an enrollment
router.put(
  "/enrollments/:id/approve",
  authenticate,
  checkTeacherOrAdmin,
  adminController.approveEnrollment
);

// Reject an enrollment
router.delete(
  "/enrollments/:id",
  authenticate,
  checkTeacherOrAdmin,
  adminController.rejectEnrollment
);

module.exports = router;
