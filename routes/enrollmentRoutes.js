// const express = require("express");
// const router = express.Router();
// const enrollmentController = require("../controllers/enrollmentController");
// const authenticate = require("../middleware/authenticate");

// // Confirm enrollment
// router.post("/confirm", authenticate, enrollmentController.confirmEnrollment);

// // Get current student's enrolled courses
// router.get("/my-courses", authenticate, enrollmentController.getMyCourses);

// module.exports = router;


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
