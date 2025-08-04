// routes/admin.js
const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const authenticate = require("../middleware/authenticate"); // ✅ correct import
const checkTeacherOrAdmin = require("../middleware/checkTeacherOrAdmin");

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
