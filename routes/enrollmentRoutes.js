
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
