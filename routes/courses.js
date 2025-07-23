const express = require("express");
const fs = require("fs");
const path = require("path");
const multer = require("multer");
const router = express.Router();
const auth = require("../middleware/auth");
const roleMiddleware = require("../middleware/roleMiddleware");
const courseController = require("../controllers/courseController");
const { Lesson, Course, User } = require("../models");

// === Multer Setup ===
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, "..", "uploads");
    if (!fs.existsSync(uploadPath)) fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const unique = `${Date.now()}-${file.originalname.replace(/\s+/g, "_")}`;
    cb(null, unique);
  },
});
const upload = multer({ storage, limits: { fileSize: 100 * 1024 * 1024 } });

// === Routes ===

// Create course
router.post(
  "/",
  auth,
  roleMiddleware(["teacher"]),
  upload.fields([
    { name: "thumbnail", maxCount: 1 },
    { name: "introVideo", maxCount: 1 },
    { name: "attachments", maxCount: 10 },
  ]),
  courseController.createCourse
);

// Fetch all courses (admin, teacher-specific, etc.)
router.get("/", auth, async (req, res) => {
  try {
    const filter = req.user.role === "teacher" ? { teacherId: req.user.id } : {};
    const courses = await Course.findAll({
      where: filter,
      include: [{ model: User, as: "teacher", attributes: ["id", "name", "email"] }],
    });
    res.json(courses);
  } catch (err) {
    res.status(500).json({ error: "Failed to load courses", details: err.message });
  }
});

// Public fetch by slug
router.get("/slug/:slug", courseController.getCourseBySlug);

// Lessons by course (auth required)
router.get("/:courseId/lessons", auth, courseController.getLessonsByCourse);

// Delete course (with logging)
router.delete("/:id", auth, roleMiddleware(["teacher", "admin"]), async (req, res) => {
  try {
    const courseId = parseInt(req.params.id);
    console.log("🗑️ Attempting to delete course ID:", courseId);
    console.log("🔐 Authenticated user:", req.user);

    const course = await Course.findByPk(courseId);
    if (!course) {
      return res.status(404).json({ error: "Course not found" });
    }

    if (course.teacherId !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ error: "Unauthorized" });
    }

    const deletedLessons = await Lesson.destroy({ where: { courseId } });
    console.log("📕 Deleted lessons count:", deletedLessons);

    await course.destroy();
    console.log("✅ Course deleted:", course.title);

    res.json({ success: true, message: "Course and its lessons deleted successfully" });
  } catch (err) {
    console.error("❌ Delete course error:", err.stack || err.message);
    res.status(500).json({ error: "Failed to delete course", details: err.message });
  }
});

module.exports = router;