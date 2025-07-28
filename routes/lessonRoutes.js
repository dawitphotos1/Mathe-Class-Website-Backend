
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
const router = express.Router();
const lessonController = require("../controllers/lessonController");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const upload = require("../middleware/uploadMiddleware");

/**
 * ✅ Create a new lesson for a course (clean route)
 * POST /api/v1/lessons/course/:courseId
 */
router.post(
  "/course/:courseId",
  authMiddleware,
  roleMiddleware(["teacher", "admin"]),
  upload.single("file"),
  lessonController.createLesson
);

/**
 * ✅ Get all lessons for a course
 * GET /api/v1/lessons/course/:courseId
 */
router.get(
  "/course/:courseId",
  authMiddleware,
  lessonController.getLessonsByCourse
);

/**
 * ✅ Get units by course ID
 * GET /api/v1/lessons/course/:courseId/units
 */
router.get(
  "/course/:courseId/units",
  authMiddleware,
  roleMiddleware(["teacher", "admin"]),
  lessonController.getUnitsByCourse
);

/**
 * ✅ Update a lesson
 * PUT /api/v1/lessons/:lessonId
 */
router.put(
  "/:lessonId",
  authMiddleware,
  roleMiddleware(["teacher", "admin"]),
  lessonController.updateLesson
);

/**
 * ✅ Delete a lesson
 * DELETE /api/v1/lessons/:lessonId
 */
router.delete(
  "/:lessonId",
  authMiddleware,
  roleMiddleware(["teacher", "admin"]),
  lessonController.deleteLesson
);

/**
 * ✅ Toggle lesson preview
 * PATCH /api/v1/lessons/:lessonId/toggle-preview
 */
router.patch(
  "/:lessonId/toggle-preview",
  authMiddleware,
  roleMiddleware(["teacher", "admin"]),
  lessonController.toggleLessonPreview
);

/**
 * ✅ Track a lesson view
 * POST /api/v1/lessons/:lessonId/track-view
 */
router.post(
  "/:lessonId/track-view",
  authMiddleware,
  lessonController.trackLessonView
);

module.exports = router;
