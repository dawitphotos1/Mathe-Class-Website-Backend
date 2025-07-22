
const express = require("express");
const router = express.Router();
const lessonController = require("../controllers/lessonController");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const upload = require("../middleware/uploadMiddleware");

// GET: Lessons by courseId
router.get(
  "/:courseId/lessons",
  authMiddleware,
  lessonController.getLessonsByCourse
);

// GET: Units
router.get(
  "/:courseId/units",
  authMiddleware,
  roleMiddleware(["teacher", "admin"]),
  lessonController.getUnitsByCourse
);

// POST: Create lesson
router.post(
  "/:courseId/lessons",
  authMiddleware,
  roleMiddleware(["teacher", "admin"]),
  upload.single("file"),
  lessonController.createLesson
);

// PUT: Update lesson
router.put(
  "/:lessonId",
  authMiddleware,
  roleMiddleware(["teacher", "admin"]),
  lessonController.updateLesson
);

// DELETE: Delete lesson
router.delete(
  "/:lessonId",
  authMiddleware,
  roleMiddleware(["teacher", "admin"]),
  lessonController.deleteLesson
);

// PATCH: Toggle lesson preview
router.patch(
  "/:lessonId/toggle-preview",
  authMiddleware,
  roleMiddleware(["teacher", "admin"]),
  lessonController.toggleLessonPreview
);

// POST: Track view
router.post(
  "/:lessonId/track-view",
  authMiddleware,
  lessonController.trackLessonView
);

module.exports = router;
