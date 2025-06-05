// // routes/enrollmentRoutes.js
// const express = require("express");
// const router = express.Router();
// const { confirmEnrollment } = require("../controllers/enrollmentController");
// const authenticate = require("../middleware/auth");

// router.post("/confirm", authenticate, confirmEnrollment);

// module.exports = router;


const express = require("express");
const router = express.Router();
const {
  confirmEnrollment,
  approveEnrollment,
} = require("../controllers/enrollmentController");
const authenticate = require("../middleware/auth");

router.post("/confirm", authenticate, confirmEnrollment);
router.post("/approve", authenticate, approveEnrollment); // ✅ new route

module.exports = router;
