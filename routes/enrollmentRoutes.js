// const express = require("express");
// const router = express.Router();
// const enrollmentController = require("../controllers/enrollmentController");
// const authenticate = require("../middleware/authenticate");

// // Protect all routes
// router.use(authenticate);

// /**
//  * Student routes
//  */

// // Create a new enrollment request
// router.post("/", enrollmentController.createEnrollment);

// // Get all enrollments for the logged-in student
// router.get("/my-enrollments", enrollmentController.getMyEnrollments);

// // ✅ Get only approved courses for the logged-in student
// router.get("/my-courses", enrollmentController.getMyCourses);

// // Check if the student is enrolled & approved in a course
// router.get("/check/:courseId", enrollmentController.checkEnrollment);

// /**
//  * Admin / Teacher routes
//  */

// // Get all pending enrollments (paid but not approved yet)
// router.get("/pending", enrollmentController.getPendingEnrollments);

// // Get all approved enrollments
// router.get("/approved", enrollmentController.getApprovedEnrollments);

// // Approve a specific enrollment
// router.put("/approve/:id", enrollmentController.approveEnrollment);

// // Reject and delete a specific enrollment
// router.delete("/reject/:id", enrollmentController.rejectEnrollment);

// module.exports = router;




const { UserCourseAccess } = require("../models");

exports.checkEnrollment = async (req, res) => {
  try {
    const { courseId } = req.params;
    const user = req.user;
    console.log(`Checking enrollment for user ${user.id}, course ${courseId}`);

    const enrollment = await UserCourseAccess.findOne({
      where: {
        user_id: user.id, // Use snake_case
        course_id: courseId, // Use snake_case
        approval_status: "approved",
      },
    });

    res.json({ isEnrolled: !!enrollment });
  } catch (error) {
    console.error("🔥 Check enrollment error:", error.message, error.stack);
    res
      .status(500)
      .json({ error: "Failed to check enrollment", details: error.message });
  }
};

// Placeholder for other controller methods
exports.createEnrollment = async (req, res) => {
  // Implement as needed
};
exports.getMyEnrollments = async (req, res) => {
  // Implement as needed
};
exports.getMyCourses = async (req, res) => {
  // Implement as needed
};
exports.getPendingEnrollments = async (req, res) => {
  // Implement as needed
};
exports.getApprovedEnrollments = async (req, res) => {
  // Implement as needed
};
exports.approveEnrollment = async (req, res) => {
  // Implement as needed
};
exports.rejectEnrollment = async (req, res) => {
  // Implement as needed
};

module.exports = exports;