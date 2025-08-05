// // routes/admin.js
// const express = require("express");
// const router = express.Router();
// const adminController = require("../controllers/adminController");
// const authenticate = require("../middleware/authenticate"); // ✅ correct import
// const checkTeacherOrAdmin = require("../middleware/checkTeacherOrAdmin");

// // Fetch pending enrollments
// router.get(
//   "/enrollments/pending",
//   authenticate,
//   checkTeacherOrAdmin,
//   adminController.getPendingEnrollments
// );

// // Fetch approved enrollments
// router.get(
//   "/enrollments/approved",
//   authenticate,
//   checkTeacherOrAdmin,
//   adminController.getApprovedEnrollments
// );

// // Approve an enrollment
// router.put(
//   "/enrollments/:id/approve",
//   authenticate,
//   checkTeacherOrAdmin,
//   adminController.approveEnrollment
// );

// // Reject an enrollment
// router.delete(
//   "/enrollments/:id",
//   authenticate,
//   checkTeacherOrAdmin,
//   adminController.rejectEnrollment
// );

// module.exports = router;




// routes/admin.js

const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const enrollmentController = require("../controllers/enrollmentController");
const authenticate = require("../middleware/authenticate");
const authorize = require("../middleware/authorize");

// Admin routes
router.use(authenticate);
router.use(authorize("admin"));

// User approval endpoints
router.get("/pending-users", adminController.getPendingUsers);
router.patch("/approve-user/:id", adminController.approveUser);
router.patch("/reject-user/:id", adminController.rejectUser);

// Enrollment approval endpoints
router.get("/enrollments/pending", enrollmentController.getPendingEnrollments);
router.get("/enrollments/approved", enrollmentController.getApprovedEnrollments);
router.put("/enrollments/:id/approve", enrollmentController.approveEnrollment);
router.delete("/enrollments/:id", enrollmentController.rejectEnrollment);

module.exports = router;
