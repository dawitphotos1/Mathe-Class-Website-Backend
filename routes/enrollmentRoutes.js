
const express = require("express");
const router = express.Router();
const enrollmentController = require("../controllers/enrollmentController");
const authenticate = require("../middleware/authenticate");

// Protect all routes
router.use(authenticate);

// POST: create enrollment
router.post("/", enrollmentController.createEnrollment);

// GET: get student’s enrollments (optional)
router.get("/my-enrollments", enrollmentController.getMyEnrollments);

module.exports = router;
