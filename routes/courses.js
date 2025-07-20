const express = require("express");
const fs = require("fs");
const path = require("path");
const multer = require("multer");
const { Course, Lesson, User } = require("../models");
const auth = require("../middleware/auth");
const roleMiddleware = require("../middleware/roleMiddleware");

const router = express.Router();

const slugify = (text) => text.toLowerCase().replace(/\s+/g, "-").slice(0, 100);

const generateUniqueSlug = async (title) => {
  const baseSlug = slugify(title);
  let slug = baseSlug;
  let counter = 1;
  while (await Course.findOne({ where: { slug } })) {
    slug = `${baseSlug}-${counter++}`;
  }
  return slug;
};

// File Upload Config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, "..", "uploads");
    if (!fs.existsSync(uploadPath))
      fs.mkdirSync(uploadPath, { recursive: true });
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
  const logFile = path.join(logDir, "courses.log");
  try {
    if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true });
    fs.appendFileSync(logFile, `${new Date().toISOString()} - ${message}\n`);
  } catch (err) {
    console.error("❌ Log error:", err.message);
  }
};

// ✅ POST /api/v1/courses
router.post(
  "/",
  auth,
  roleMiddleware(["teacher"]),
  upload.fields([
    { name: "thumbnail", maxCount: 1 },
    { name: "introVideo", maxCount: 1 },
    { name: "attachments", maxCount: 10 },
  ]),
  async (req, res) => {
    try {
      const { title, description, category } = req.body;
      const teacherId = req.user?.id;

      if (!title || !description || !category) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      const slug = await generateUniqueSlug(title);
      const thumbnail = req.files?.thumbnail?.[0];
      const introVideo = req.files?.introVideo?.[0];
      const attachments = req.files?.attachments || [];

      const thumbnailUrl = thumbnail ? `/uploads/${thumbnail.filename}` : null;
      const introVideoUrl = introVideo
        ? `/uploads/${introVideo.filename}`
        : null;
      const attachmentUrls = attachments.map(
        (file) => `/uploads/${file.filename}`
      );

      const newCourse = await Course.create({
        title,
        description,
        category,
        slug,
        teacherId,
        thumbnail: thumbnailUrl,
        introVideoUrl,
        attachmentUrls,
      });

      appendToLogFile(`✅ Course created: ${title} by user ${teacherId}`);
      res.status(201).json({ success: true, course: newCourse });
    } catch (err) {
      console.error("❌ Create course error:", err);
      appendToLogFile(`❌ Create course error: ${err.message}`);
      res.status(500).json({
        success: false,
        error: "Failed to create course",
        details: err.message,
      });
    }
  }
);

// ✅ GET /api/v1/courses
router.get("/", auth, async (req, res) => {
  try {
    const user = req.user;
    const filter = {};

    if (user.role === "teacher") {
      filter.teacherId = user.id;
    }

    const courses = await Course.findAll({
      where: filter,
      include: [
        { model: User, as: "teacher", attributes: ["id", "name", "email"] },
      ],
    });

    res.status(200).json(courses);
  } catch (err) {
    console.error("❌ Fetch courses error:", err.message);
    res.status(500).json({ error: "Failed to load courses" });
  }
});

// ✅ GET /api/v1/courses/slug/:slug
router.get("/slug/:slug", async (req, res) => {
  try {
    const { slug } = req.params;

    const course = await Course.findOne({
      where: { slug },
      include: [
        {
          model: Lesson,
          as: "lessons",
          separate: true,
          order: [["orderIndex", "ASC"]],
        },
        {
          model: User,
          as: "teacher",
          attributes: ["id", "name", "email"],
        },
      ],
    });

    if (!course) {
      appendToLogFile(`❌ Course not found for slug: ${slug}`);
      return res
        .status(404)
        .json({ success: false, error: "Course not found" });
    }

    appendToLogFile(`✅ Fetched course: ${course.title} (slug: ${slug})`);
    res.status(200).json(course);
  } catch (error) {
    console.error("❌ Fetch course by slug error:", error.message);
    appendToLogFile(`❌ Fetch course by slug error: ${error.message}`);
    res.status(500).json({
      success: false,
      error: "Failed to fetch course",
      details: error.message,
    });
  }
});

// ✅ GET /api/v1/courses/:courseId/lessons
router.get("/:courseId/lessons", auth, async (req, res) => {
  try {
    const courseId = parseInt(req.params.courseId);

    const lessons = await Lesson.findAll({
      where: { courseId },
      order: [["orderIndex", "ASC"]],
    });

    if (!lessons || lessons.length === 0) {
      return res
        .status(404)
        .json({ message: "Lessons not found for this course." });
    }

    res.status(200).json({ lessons });
  } catch (error) {
    console.error("❌ Error fetching lessons:", error);
    res.status(500).json({ error: "Failed to load lessons" });
  }
});

// ✅ DELETE /api/v1/courses/:courseId
// ✅ DELETE /api/v1/courses/:courseId
router.delete(
  "/:courseId",
  auth,
  roleMiddleware(["teacher"]),
  async (req, res) => {
    try {
      const { courseId } = req.params;

      const course = await Course.findByPk(courseId);

      if (!course) {
        return res.status(404).json({ error: "Course not found" });
      }

      if (course.teacherId !== req.user.id) {
        return res.status(403).json({ error: "Unauthorized" });
      }

      // 🔥 Delete related lessons first to avoid foreign key constraint issues
      await Lesson.destroy({ where: { courseId } });

      // Then delete the course itself
      await course.destroy();

      appendToLogFile(
        `🗑 Course deleted: ${course.title} by user ${req.user.id}`
      );

      res.json({ success: true, message: "Course deleted successfully" });
    } catch (err) {
      console.error("❌ Delete course error:", err);
      res.status(500).json({
        error: "Failed to delete course",
        details: err.message,
      });
    }
  }
);

module.exports = router;