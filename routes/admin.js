// routes/admin.js

const express = require("express");
const router = express.Router();

const adminController = require("../controllers/adminController");
const enrollmentController = require("../controllers/enrollmentController");
const authenticate = require("../middleware/authenticate");
const authorize = require("../middleware/authorize");

// Middleware: Only allow authenticated admin
router.use(authenticate);
router.use(authorize("admin"));

// User approval routes
router.get("/pending-users", adminController.getPendingUsers);
router.patch("/approve-user/:id", adminController.approveUser);
router.patch("/reject-user/:id", adminController.rejectUser);

// Enrollment approval routes
router.get("/enrollments/pending", enrollmentController.getPendingEnrollments);
router.get("/enrollments/approved", enrollmentController.getApprovedEnrollments);
router.put("/enrollments/:id/approve", enrollmentController.approveEnrollment);
router.delete("/enrollments/:id", enrollmentController.rejectEnrollment);

module.exports = router;
