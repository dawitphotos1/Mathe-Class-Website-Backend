
// // routes/lessons.js
// const express = require("express");
// const router = express.Router();
// const { Lesson } = require("../models");
// const authMiddleware = require("../middleware/authMiddleware");
// const checkTeacherOrAdmin = require("../middleware/checkTeacherOrAdmin");
// const lessonController = require("../controllers/lessonController");


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



// // ✅ Add this for students to get lessons by course ID
// router.get(
//   "/:courseId/lessons",
//   authMiddleware,
//   lessonController.getLessonsByCourse
// );

// module.exports = router;




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
