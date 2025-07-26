// // const express = require("express");
// // const router = express.Router();
// // const courseController = require("../controllers/courseController");
// // const authMiddleware = require("../middleware/authMiddleware");
// // const roleMiddleware = require("../middleware/roleMiddleware");
// // const multer = require("multer");

// // // ✅ Multer memory storage
// // const storage = multer.memoryStorage();
// // const upload = multer({
// //   storage,
// //   limits: { fileSize: 100 * 1024 * 1024 }, // 100 MB max
// // });

// // // ✅ Multer fields for multiple types of uploads
// // const uploadFields = upload.fields([
// //   { name: "attachments", maxCount: 10 }, // multiple PDFs or docs
// //   { name: "thumbnail", maxCount: 1 }, // single image
// //   { name: "introVideo", maxCount: 1 }, // single video
// // ]);

// // // === Routes ===

// // // ✅ Create course (teachers/admin only)
// // router.post(
// //   "/create",
// //   authMiddleware,
// //   roleMiddleware(["teacher", "admin"]),
// //   uploadFields,
// //   courseController.createCourse
// // );

// // // ✅ Delete course
// // router.delete(
// //   "/:id",
// //   authMiddleware,
// //   roleMiddleware(["teacher", "admin"]),
// //   courseController.deleteCourse
// // );

// // // ✅ Get course by slug
// // router.get("/slug/:slug", courseController.getCourseBySlug);

// // // ✅ Get lessons for course
// // router.get("/:courseId/lessons", courseController.getLessonsByCourse);

// // module.exports = router;





// const express = require("express");
// const router = express.Router();
// const courseController = require("../controllers/courseController");
// const authMiddleware = require("../middleware/authMiddleware");
// const roleMiddleware = require("../middleware/roleMiddleware");
// const multer = require("multer");

// // ✅ Multer memory storage
// const storage = multer.memoryStorage();
// const upload = multer({
//   storage,
//   limits: { fileSize: 100 * 1024 * 1024 }, // 100 MB max
// });

// // ✅ Multer fields for multiple types of uploads
// const uploadFields = upload.fields([
//   { name: "attachments", maxCount: 10 },
//   { name: "thumbnail", maxCount: 1 },
//   { name: "introVideo", maxCount: 1 },
// ]);

// // === Routes ===

// // ✅ Create course
// router.post(
//   "/create",
//   authMiddleware,
//   roleMiddleware(["teacher", "admin"]),
//   uploadFields,
//   courseController.createCourse
// );

// // ✅ Delete course
// router.delete(
//   "/:id",
//   authMiddleware,
//   roleMiddleware(["teacher", "admin"]),
//   courseController.deleteCourse
// );

// // ✅ Get course by slug
// router.get("/slug/:slug", courseController.getCourseBySlug);

// // ✅ Get lessons for a course
// router.get("/:courseId/lessons", courseController.getLessonsByCourse);
// router.get("/", async (req, res) => {
//   res.json({ message: "✅ Courses route working" });
// });


// module.exports = router; // ✅ Export router directly



const express = require("express");
const router = express.Router();
const courseController = require("../controllers/courseController");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const multer = require("multer");

// ✅ Multer setup for file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage });
const uploadFields = upload.fields([
  { name: "attachments", maxCount: 10 },
  { name: "thumbnail", maxCount: 1 },
  { name: "introVideo", maxCount: 1 },
]);

/**
 * ✅ Create a new course
 * POST /api/v1/courses/create
 */
router.post(
  "/create",
  authMiddleware,
  roleMiddleware(["teacher", "admin"]),
  uploadFields,
  courseController.createCourse
);

/**
 * ✅ Get all courses created by the logged-in teacher
 * GET /api/v1/courses
 */
router.get(
  "/",
  authMiddleware,
  roleMiddleware(["teacher", "admin"]),
  courseController.getTeacherCourses
);

/**
 * ✅ Get a specific course by slug (for course details page)
 * GET /api/v1/courses/:slug
 */
router.get("/:slug", courseController.getCourseBySlug);

/**
 * ✅ Delete a course by ID
 * DELETE /api/v1/courses/:id
 */
router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware(["teacher", "admin"]),
  courseController.deleteCourse
);

/**
 * ✅ (Optional) Admin: Get all courses
 * GET /api/v1/courses/all
 */
router.get(
  "/all",
  authMiddleware,
  roleMiddleware(["admin"]),
  async (req, res) => {
    try {
      const { Course } = require("../models");
      const courses = await Course.findAll();
      res.json({ success: true, courses });
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch all courses" });
    }
  }
);

module.exports = router;
