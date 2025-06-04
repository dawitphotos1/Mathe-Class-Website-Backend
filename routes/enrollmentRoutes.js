// routes/enrollmentRoutes.js
const express = require("express");
const router = express.Router();
const { confirmEnrollment } = require("../controllers/enrollmentController");
const authenticate = require("../middleware/auth");

router.post("/confirm", authenticate, confirmEnrollment);

module.exports = router;
