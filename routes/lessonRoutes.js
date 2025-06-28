
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

router.get("/:lessonId", authMiddleware, async (req, res) => {
  const lesson = await Lesson.findByPk(req.params.lessonId);
  if (!lesson) return res.status(404).json({ error: "Lesson not found" });
  res.json({ success: true, lesson });
});

router.put(
  "/:lessonId",
  authMiddleware,
  checkTeacherOrAdmin,
  async (req, res) => {
    try {
      const updated = await Lesson.update(req.body, {
        where: { id: req.params.lessonId },
      });
      res.json({ success: true, updated });
    } catch (err) {
      res.status(500).json({ error: "Failed to update lesson" });
    }
  }
);

module.exports = router;
