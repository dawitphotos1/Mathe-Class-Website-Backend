const express = require("express");
const router = express.Router();
const courseController = require("../controllers/courseController");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const multer = require("multer");

// ✅ Multer memory storage
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100 MB max
});

// ✅ Multer fields for multiple types of uploads
const uploadFields = upload.fields([
  { name: "attachments", maxCount: 10 }, // multiple PDFs or docs
  { name: "thumbnail", maxCount: 1 }, // single image
  { name: "introVideo", maxCount: 1 }, // single video
]);

// === Routes ===

// ✅ Create course (teachers/admin only)
router.post(
  "/create",
  authMiddleware,
  roleMiddleware(["teacher", "admin"]),
  uploadFields,
  courseController.createCourse
);

// ✅ Delete course
router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware(["teacher", "admin"]),
  courseController.deleteCourse
);

// ✅ Get course by slug
router.get("/slug/:slug", courseController.getCourseBySlug);

// ✅ Get lessons for course
router.get("/:courseId/lessons", courseController.getLessonsByCourse);

module.exports = router;
