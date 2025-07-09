
const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const checkTeacherOrAdmin = require("../middleware/checkTeacherOrAdmin");
const lessonController = require("../controllers/lessonController");

// ✅ GET /api/v1/courses/:courseId/lessons — for enrolled students
router.get(
  "/:courseId/lessons",
  authMiddleware,
  lessonController.getLessonsByCourse
);

// ✅ POST /api/v1/courses/:courseId/lessons — for teachers/admins
router.post(
  "/:courseId/lessons",
  authMiddleware,
  checkTeacherOrAdmin,
  lessonController.createLesson
);
router.put(
  "/:lessonId",
  authMiddleware,
  checkTeacherOrAdmin,
  lessonController.updateLesson
);

router.delete(
  "/:lessonId",
  authMiddleware,
  checkTeacherOrAdmin,
  lessonController.deleteLesson
);


module.exports = router;
