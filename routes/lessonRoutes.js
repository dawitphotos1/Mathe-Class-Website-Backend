
const express = require("express");
const router = express.Router();
const { Course, Lesson } = require("../models");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { toggleLessonPreview } = require("../controllers/lessonController");


router.patch("/:lessonId/toggle-preview", authenticate, toggleLessonPreview);
// Configure Multer for file uploads (disk storage for consistency with courses.js)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, "..", "uploads");
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const unique = `${Date.now()}-${file.originalname.replace(/\s+/g, "_")}`;
    cb(null, unique);
  },
});

const upload = multer({ storage, limits: { fileSize: 100 * 1024 * 1024 } });

// Logger
const appendToLogFile = (message) => {
  const logDir = path.join(__dirname, "..", "logs");
  const logFile = path.join(logDir, "lessons.log");
  try {
    if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true });
    fs.appendFileSync(logFile, `${new Date().toISOString()} - ${message}\n`);
  } catch (err) {
    console.error("❌ Log error:", err.message);
  }
};

// GET /:courseId/lessons - Get lessons by course
router.get("/:courseId/lessons", authMiddleware, async (req, res) => {
  try {
    const courseId = req.params.courseId;

    // Verify course exists
    const course = await Course.findByPk(courseId);
    if (!course) {
      appendToLogFile(`❌ Course not found for ID: ${courseId}`);
      return res
        .status(404)
        .json({ success: false, error: "Course not found" });
    }

    // Fetch lessons
    const lessons = await Lesson.findAll({
      where: { courseId },
      order: [["orderIndex", "ASC"]],
    });

    // Group lessons by unit for the frontend
    const unitMap = {};
    lessons.forEach((lesson) => {
      const unitName = lesson.unitName || "General";
      if (!unitMap[unitName]) {
        unitMap[unitName] = { unitName, lessons: [] };
      }
      unitMap[unitName].lessons.push(lesson);
    });
    const units = Object.values(unitMap);

    appendToLogFile(
      `✅ Fetched ${lessons.length} lessons for course ID: ${courseId}`
    );
    res.json({ success: true, units });
  } catch (error) {
    console.error("❌ Fetch lessons error:", error.message);
    appendToLogFile(
      `❌ Fetch lessons error for course ID ${req.params.courseId}: ${error.message}`
    );
    res.status(500).json({
      success: false,
      error: "Failed to fetch lessons",
      details: error.message,
    });
  }
});

// POST /:courseId/lessons - Create a lesson (restricted to teacher/admin roles)
router.post(
  "/:courseId/lessons",
  authMiddleware,
  roleMiddleware(["teacher", "admin"]),
  upload.fields([
    { name: "contentFile", maxCount: 1 },
    { name: "videoFile", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const { courseId } = req.params;
      const { title, unitName, content, order } = req.body;

      if (!title || !unitName) {
        return res.status(400).json({
          success: false,
          error: "Missing required fields: title, unitName",
        });
      }

      // Verify course exists and user has permission
      const course = await Course.findByPk(courseId);
      if (!course) {
        appendToLogFile(`❌ Course not found for ID: ${courseId}`);
        return res
          .status(404)
          .json({ success: false, error: "Course not found" });
      }
      if (course.teacherId !== req.user.id && req.user.role !== "admin") {
        return res.status(403).json({
          success: false,
          error: "Unauthorized to create lessons for this course",
        });
      }

      // Handle file uploads
      const contentFile = req.files?.contentFile?.[0];
      const videoFile = req.files?.videoFile?.[0];
      const contentUrl = contentFile
        ? `/uploads/${contentFile.filename}`
        : null;
      const videoUrl = videoFile ? `/uploads/${videoFile.filename}` : null;

      // Create lesson
      const lesson = await Lesson.create({
        title,
        unitName,
        content,
        order: parseInt(order) || 0,
        courseId,
        contentUrl,
        videoUrl,
      });

      appendToLogFile(`✅ Lesson created: ${title} for course ID: ${courseId}`);
      res.status(201).json({ success: true, lesson });
    } catch (error) {
      console.error("❌ Create lesson error:", error.message);
      appendToLogFile(
        `❌ Create lesson error for course ID ${req.params.courseId}: ${error.message}`
      );
      res.status(500).json({
        success: false,
        error: "Failed to create lesson",
        details: error.message,
      });
    }
  }
);

module.exports = router;