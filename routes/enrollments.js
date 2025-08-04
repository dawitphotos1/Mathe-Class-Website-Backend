
// const express = require("express");
// const router = express.Router();
// const authMiddleware = require("../middleware/authMiddleware");
// const enrollmentController = require("../controllers/enrollmentController");

// // Confirm enrollment after payment (protected route)
// router.post("/confirm", authMiddleware, enrollmentController.confirmEnrollment);

// module.exports = router;




// routes/enrollments.js
const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const enrollmentController = require("../controllers/enrollmentController");

// Confirm enrollment after payment
router.post("/confirm", authMiddleware, enrollmentController.confirmEnrollment);

// ✅ Check enrollment status
router.get("/check/:courseId", authMiddleware, enrollmentController.checkEnrollmentStatus);

module.exports = router;
