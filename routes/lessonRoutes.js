
const express = require("express");
const router = express.Router();
const lessonController = require("../controllers/lessonController");
const authenticate = require("../middleware/authenticate");

// Fetch lessons for a specific course
router.get(
  "/courses/:courseId/lessons",
  authenticate,
  lessonController.getLessonsByCourse
);

module.exports = router;
