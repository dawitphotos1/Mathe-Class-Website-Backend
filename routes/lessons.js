
// // routes/lessons.js
// const express = require("express");
// const router = express.Router();
// const { Lesson } = require("../models");
// const authMiddleware = require("../middleware/authMiddleware");
// const checkTeacherOrAdmin = require("../middleware/checkTeacherOrAdmin");

// router.post("/:courseId/lessons", authMiddleware, async (req, res) => {
//   try {
//     const { courseId } = req.params;
//     const {
//       title,
//       content,
//       contentType,
//       contentUrl,
//       videoUrl,
//       orderIndex,
//       isUnitHeader,
//       isPreview,
//       unitId
//     } = req.body;

//     const newLesson = await Lesson.create({
//       courseId: parseInt(courseId),
//       title,
//       content,
//       contentType,
//       contentUrl,
//       videoUrl,
//       orderIndex,
//       isUnitHeader,
//       isPreview,
//       unitId: unitId || null,
//       userId: req.user.id
//     });

//     res.status(201).json({ success: true, lesson: newLesson });
//   } catch (err) {
//     console.error("Lesson creation error:", err);
//     res.status(500).json({ success: false, error: "Failed to create lesson" });
//   }
// });

// module.exports = router;



const express = require("express");
const router = express.Router();
const {
  getLessonsByCourse,
  createLesson,
} = require("../controllers/lessonController");
const authMiddleware = require("../middleware/authMiddleware");
const checkTeacherOrAdmin = require("../middleware/checkTeacherOrAdmin");
const upload = require("../utils/upload");

router.get("/:courseId/lessons", authMiddleware, getLessonsByCourse);
router.post(
  "/:courseId/lessons",
  authMiddleware,
  checkTeacherOrAdmin,
  upload.single("file"),
  createLesson
);

module.exports = router;