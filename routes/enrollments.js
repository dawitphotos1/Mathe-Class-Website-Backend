
// routes/enrollmentRoutes.js
const express = require("express");
const router = express.Router();
const authenticateToken = require("../middleware/authenticateToken");
const enrollmentController = require("../controllers/enrollmentController");

// Check if the student is enrolled and approved
router.get("/check/:courseId", authenticateToken, enrollmentController.checkEnrollment);

// You can add more routes here if needed (e.g., enroll, approve, etc.)

module.exports = router;
