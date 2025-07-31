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
 * ✅ Get a specific course by slug (canonical public route)
 * GET /api/v1/courses/slug/:slug
 */
router.get("/slug/:slug", courseController.getCourseBySlug);

/**
 * ✅ Get a specific course by slug (legacy / fallback)
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
