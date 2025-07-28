
// const express = require("express");
// const router = express.Router();
// const lessonController = require("../controllers/lessonController");
// const authMiddleware = require("../middleware/authMiddleware");
// const roleMiddleware = require("../middleware/roleMiddleware");
// const upload = require("../middleware/uploadMiddleware");

// // GET: Lessons by courseId
// router.get(
//   "/:courseId/lessons",
//   authMiddleware,
//   lessonController.getLessonsByCourse
// );

// // GET: Units
// router.get(
//   "/:courseId/units",
//   authMiddleware,
//   roleMiddleware(["teacher", "admin"]),
//   lessonController.getUnitsByCourse
// );

// // ADD: Direct POST /lessons support (alternate route)
// // OLD (confusing double "lessons")
// router.post(
//   "/:courseId/lessons",
//   authMiddleware,
//   roleMiddleware(["teacher", "admin"]),
//   upload.single("file"),
//   lessonController.createLesson
// );

// // ✅ NEW: Cleaner URL like /api/v1/courses/:courseId/lessons
// router.post(
//   "/course/:courseId",
//   authMiddleware,
//   roleMiddleware(["teacher", "admin"]),
//   upload.single("file"),
//   lessonController.createLesson
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

// // PATCH: Toggle lesson preview
// router.patch(
//   "/:lessonId/toggle-preview",
//   authMiddleware,
//   roleMiddleware(["teacher", "admin"]),
//   lessonController.toggleLessonPreview
// );

// // POST: Track view
// router.post(
//   "/:lessonId/track-view",
//   authMiddleware,
//   lessonController.trackLessonView
// );

// module.exports = router;



const express = require("express");
const router = express.Router({ mergeParams: true });
const lessonController = require("../controllers/lessonController");
const authMiddleware = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware"); // if using multer

// Fetch all lessons for a course
router.get(
  "/:courseId/lessons",
  authMiddleware,
  lessonController.getLessonsByCourse
);

// Create a new lesson for a course
router.post(
  "/:courseId/lessons",
  authMiddleware,
  upload.single("file"), // optional: for file uploads
  lessonController.createLesson
);

// Get units for a course
router.get(
  "/:courseId/units",
  authMiddleware,
  lessonController.getUnitsByCourse
);

// Optional: Get a specific lesson
router.get(
  "/:courseId/lessons/:lessonId",
  authMiddleware,
  lessonController.getLessonById
);

// Optional: Update lesson
router.patch(
  "/:courseId/lessons/:lessonId",
  authMiddleware,
  lessonController.updateLesson
);

// Optional: Delete lesson
router.delete(
  "/:courseId/lessons/:lessonId",
  authMiddleware,
  lessonController.deleteLesson
);

module.exports = router;
