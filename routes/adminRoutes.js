// const express = require("express");
// const router = express.Router();
// const {
//   getDashboardStats,
//   getPendingUsers,
//   approveUser,
//   rejectUser,
//   getUsersByStatus,
// } = require("../controllers/adminController");

// // ✅ Dashboard stats
// router.get("/dashboard", getDashboardStats);

// // ✅ Get all pending students
// router.get("/pending-users", getPendingUsers);

// // ✅ Get users by status (approved or rejected)
// router.get("/users", getUsersByStatus);

// // ✅ Approve a student
// router.patch("/approve/:id", approveUser);

// // ✅ Reject a student
// router.patch("/reject/:id", rejectUser);

// module.exports = router;




const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");

router.get("/dashboard", adminController.getDashboardStats);
router.get("/pending-users", adminController.getPendingUsers);
router.get("/users", adminController.getUsersByStatus);
router.get("/enrollments/pending", adminController.getEnrollments);
router.get("/enrollments/approved", adminController.getEnrollments);
router.patch("/approve/:id", adminController.approveUser);
router.patch("/reject/:id", adminController.rejectUser);

module.exports = router;