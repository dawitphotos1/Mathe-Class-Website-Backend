
// const express = require("express");
// const router = express.Router();
// const enrollmentController = require("../controllers/enrollmentController");
// const authenticate = require("../middleware/authenticate");

// // Confirm enrollment
// router.post("/confirm", authenticate, enrollmentController.confirmEnrollment);

// // Get current student's enrolled courses
// router.get("/my-courses", authenticate, enrollmentController.getMyCourses);

// module.exports = router;




const express = require("express");
const router = express.Router();
const {
  confirmEnrollment,
  getPendingEnrollments,
  getApprovedEnrollments,
  approveEnrollment,
} = require("../controllers/enrollmentController");

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

// Student confirms enrollment (payment already done elsewhere)
router.post("/api/v1/enrollments/confirm", authMiddleware, confirmEnrollment);

// Admin/teacher views pending/approved
router.get(
  "/admin/enrollments/pending",
  authMiddleware,
  roleMiddleware(["admin", "teacher"]),
  getPendingEnrollments
);
router.get(
  "/admin/enrollments/approved",
  authMiddleware,
  roleMiddleware(["admin", "teacher"]),
  getApprovedEnrollments
);

// Approve enrollment (admin/teacher)
router.post(
  "/api/v1/enrollments/approve",
  authMiddleware,
  roleMiddleware(["admin", "teacher"]),
  approveEnrollment
);

module.exports = router;
