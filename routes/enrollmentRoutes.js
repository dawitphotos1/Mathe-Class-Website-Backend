// routes/enrollmentRoutes.js
const express = require("express");
const router = express.Router();
const auth = require("../middleware/authenticateToken");
const {
  confirmEnrollment,
  checkEnrollmentStatus,
} = require("../controllers/enrollmentController");

// Confirm enrollment (student triggers this)
router.post("/confirm", auth, confirmEnrollment);

// Check if student is enrolled in a course (used to decide if 'Enroll Now' should be shown)
router.get("/check/:courseId", auth, checkEnrollmentStatus);

module.exports = router;
