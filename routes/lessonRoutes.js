// const express = require("express");
// const router = express.Router();
// const lessonController = require("../controllers/lessonController");
// const authMiddleware = require("../middleware/authMiddleware");
// const checkTeacherOrAdmin = require("../middleware/checkTeacherOrAdmin");

// // Fetch lessons for a specific course
// router.get(
//   "/courses/:courseId/lessons",
//   authMiddleware,
//   lessonController.getLessonsByCourse
// );

// router.get("/:lessonId", authMiddleware, async (req, res) => {
//   const lesson = await Lesson.findByPk(req.params.lessonId);
//   if (!lesson) return res.status(404).json({ error: "Lesson not found" });
//   res.json({ success: true, lesson });
// });

// router.put(
//   "/:lessonId",
//   authMiddleware,
//   checkTeacherOrAdmin,
//   async (req, res) => {
//     try {
//       const updated = await Lesson.update(req.body, {
//         where: { id: req.params.lessonId },
//       });
//       res.json({ success: true, updated });
//     } catch (err) {
//       res.status(500).json({ error: "Failed to update lesson" });
//     }
//   }
// );

// module.exports = router;


const express = require("express");
const router = express.Router();
const {
  getLessonsByCourse,
  createLesson,
} = require("../controllers/lessonController");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const multer = require("multer");

// Configure Multer for file uploads
const upload = multer({ storage: multer.memoryStorage() });

router.get("/:courseId/lessons", authMiddleware, getLessonsByCourse);
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