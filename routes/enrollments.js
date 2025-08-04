
// const express = require("express");
// const router = express.Router();
// const authMiddleware = require("../middleware/authMiddleware");
// const enrollmentController = require("../controllers/enrollmentController");

// // Confirm enrollment after payment (protected route)
// router.post("/confirm", authMiddleware, enrollmentController.confirmEnrollment);

// module.exports = router;



// routes/enrollmentRoutes.js
const express = require("express");
const router = express.Router();
const authenticateToken = require("../middleware/authenticateToken");
const enrollmentController = require("../controllers/enrollmentController");

// Check if the student is enrolled and approved
router.get("/check/:courseId", authenticateToken, enrollmentController.checkEnrollment);

// You can add more routes here if needed (e.g., enroll, approve, etc.)

module.exports = router;
