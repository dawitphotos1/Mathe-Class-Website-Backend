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
const { login, register } = require("../controllers/authController");

router.post("/login", login);
router.post("/register", register);

module.exports = router;
