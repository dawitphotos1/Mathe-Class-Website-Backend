

const express = require("express");
const router = express.Router();
const {
  getLessonsByCourse,
  createLesson,
} = require("../controllers/lessonController");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const multer = require("multer");

// Configure Multer for file uploads (memory storage)
const upload = multer({ storage: multer.memoryStorage() });

// GET /:courseId/lessons - Get lessons by course
router.get("/:courseId/lessons", authMiddleware, getLessonsByCourse);

// POST /:courseId/lessons - Create a lesson (restricted to teacher/admin roles)
router.post(
  "/:courseId/lessons",
  authMiddleware,
  roleMiddleware(["teacher", "admin"]),
  upload.fields([
    { name: "contentFile", maxCount: 1 },
    { name: "videoFile", maxCount: 1 },
  ]),
  createLesson
);

module.exports = router;
