
const express = require("express");
const router = express.Router();
const enrollmentController = require("../controllers/enrollmentController");
const authenticate = require("../middleware/authenticate");

// Confirm enrollment
router.post("/confirm", authenticate, enrollmentController.confirmEnrollment);

// Get current student's enrolled courses
router.get("/my-courses", authenticate, enrollmentController.getMyCourses);

module.exports = router;
