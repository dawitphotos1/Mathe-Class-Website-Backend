
const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const enrollmentController = require("../controllers/enrollmentController");

// Confirm enrollment after payment (protected route)
router.post("/confirm", authMiddleware, enrollmentController.confirmEnrollment);

module.exports = router;