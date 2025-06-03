const express = require("express");
const router = express.Router();
const { confirmEnrollment } = require("../controllers/enrollmentController");
const authMiddleware = require("../middleware/auth"); // assumes you're protecting the route

router.post("/confirm", authMiddleware, confirmEnrollment);

module.exports = router;
