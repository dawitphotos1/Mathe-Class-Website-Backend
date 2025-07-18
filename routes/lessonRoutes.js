
// const express = require("express");
// const router = express.Router();
// const lessonController = require("../controllers/lessonController");
// const authMiddleware = require("../middleware/authMiddleware");
// const roleMiddleware = require("../middleware/roleMiddleware");
// const upload = require("../middleware/uploadMiddleware"); // Use new middleware

// // GET: Lessons by courseId
// router.get(
//   "/:courseId/lessons",
//   authMiddleware,
//   lessonController.getLessonsByCourse
// );

// // GET: Units by courseId (teachers only)
// router.get(
//   "/:courseId/units",
//   authMiddleware,
//   roleMiddleware(["teacher", "admin"]),
//   lessonController.getUnitsByCourse
// );

// // Optional alias route to support /lessons/course/:id
// router.get(
//   "/course/:courseId",
//   authMiddleware,
//   lessonController.getLessonsByCourse
// );

// // POST: Create a lesson (teacher or admin only)
// router.post(
//   "/:courseId/lessons",
//   authMiddleware,
//   roleMiddleware(["teacher", "admin"]),
//   upload.single("file"),
//   lessonController.createLesson
// );

// // PATCH: Toggle lesson preview
// router.patch(
//   "/:lessonId/toggle-preview",
//   authMiddleware,
//   roleMiddleware(["teacher", "admin"]),
//   lessonController.toggleLessonPreview
// );

// // PUT: Update lesson
// router.put(
//   "/:lessonId",
//   authMiddleware,
//   roleMiddleware(["teacher", "admin"]),
//   lessonController.updateLesson
// );

// // DELETE: Delete lesson
// router.delete(
//   "/:lessonId",
//   authMiddleware,
//   roleMiddleware(["teacher", "admin"]),
//   lessonController.deleteLesson
// );

// module.exports = router;




const express = require("express");
const router = express.Router();
const { Lesson, Course } = require("../models");
const authMiddleware = require("../middleware/authMiddleware");

router.get("/:courseId", authMiddleware, async (req, res) => {
  try {
    const lessons = await Lesson.findAll({
      where: { courseId: req.params.courseId },
      order: [["orderIndex", "ASC"]],
    });
    res.status(200).json(lessons);
  } catch (err) {
    console.error("Error fetching lessons:", err);
    res.status(500).json({ error: "Failed to fetch lessons" });
  }
});

router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const lesson = await Lesson.findByPk(req.params.id);
    if (!lesson) {
      return res.status(404).json({ error: "Lesson not found" });
    }
    const course = await Course.findByPk(lesson.courseId);
    if (course.teacherId !== req.user.id) {
      return res.status(403).json({ error: "Not authorized" });
    }
    await lesson.destroy();
    res.status(200).json({ message: "Lesson deleted" });
  } catch (err) {
    console.error("Error deleting lesson:", err);
    res.status(500).json({ error: "Failed to delete lesson" });
  }
});

router.patch("/:id/toggle-preview", authMiddleware, async (req, res) => {
  try {
    const lesson = await Lesson.findByPk(req.params.id);
    if (!lesson) {
      return res.status(404).json({ error: "Lesson not found" });
    }
    const course = await Course.findByPk(lesson.courseId);
    if (course.teacherId !== req.user.id) {
      return res.status(403).json({ error: "Not authorized" });
    }
    lesson.isPreview = !lesson.isPreview;
    await lesson.save();
    res.status(200).json({ isPreview: lesson.isPreview });
  } catch (err) {
    console.error("Error toggling preview:", err);
    res.status(500).json({ error: "Failed to toggle preview" });
  }
});

module.exports = router;