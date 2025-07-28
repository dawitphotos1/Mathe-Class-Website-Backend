const path = require("path");
const fs = require("fs");
const { Course, Lesson, User } = require("../models");

// Ensure Uploads directory exists
const uploadsDir = path.join(__dirname, "..", "Uploads");
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

/**
 * ✅ Create Course
 */
exports.createCourse = async (req, res) => {
  try {
    if (!req.user || req.user.role !== "teacher") {
      return res
        .status(403)
        .json({ error: "Only teachers can create courses." });
    }

    const { title, description, category } = req.body;
    if (!title || !description || !category) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const slug = title.toLowerCase().replace(/\s+/g, "-").slice(0, 100);
    const existing = await Course.findOne({ where: { slug } });
    const uniqueSlug = existing ? `${slug}-${Date.now()}` : slug;

    // Handle file uploads
    const attachments = req.files?.attachments || [];
    const thumbnail = req.files?.thumbnail?.[0];
    const introVideo = req.files?.introVideo?.[0];

    const attachmentUrls = [];
    for (const file of attachments) {
      const filename = `${Date.now()}-${file.originalname.replace(
        /\s+/g,
        "_"
      )}`;
      fs.writeFileSync(path.join(uploadsDir, filename), file.buffer);
      attachmentUrls.push(`/Uploads/${filename}`);
    }

    let thumbnailUrl = null;
    if (thumbnail) {
      const filename = `${Date.now()}-${thumbnail.originalname.replace(
        /\s+/g,
        "_"
      )}`;
      fs.writeFileSync(path.join(uploadsDir, filename), thumbnail.buffer);
      thumbnailUrl = `/Uploads/${filename}`;
    }

    let introVideoUrl = null;
    if (introVideo) {
      const filename = `${Date.now()}-${introVideo.originalname.replace(
        /\s+/g,
        "_"
      )}`;
      fs.writeFileSync(path.join(uploadsDir, filename), introVideo.buffer);
      introVideoUrl = `/Uploads/${filename}`;
    }

    const course = await Course.create({
      title,
      description,
      category,
      slug: uniqueSlug,
      teacherId: req.user.id,
      attachmentUrls,
      thumbnailUrl,
      introVideoUrl,
    });

    res.status(201).json({ success: true, course });
  } catch (error) {
    console.error("🔥 CREATE COURSE ERROR:", error);
    res
      .status(500)
      .json({ error: "Failed to create course", details: error.message });
  }
};

/**
 * ✅ Delete Course
 */
exports.deleteCourse = async (req, res) => {
  try {
    const courseId = req.params.id;
    const course = await Course.findByPk(courseId);

    if (!course) {
      return res.status(404).json({ error: "Course not found" });
    }

    // 🔒 Only allow teacher-owner or admin to delete
    if (req.user.role !== "admin" && course.teacherId !== req.user.id) {
      return res
        .status(403)
        .json({ error: "You are not authorized to delete this course" });
    }

    await course.destroy();
    res.json({ success: true, message: "Course deleted successfully" });
  } catch (error) {
    console.error("❌ deleteCourse error:", error);
    res
      .status(500)
      .json({ error: "Failed to delete course", details: error.message });
  }
};

/**
 * ✅ Get Course by Slug
 */
exports.getCourseBySlug = async (req, res) => {
  try {
    const course = await Course.findOne({
      where: { slug: req.params.slug },
      include: [
        { model: Lesson, as: "lessons", order: [["orderIndex", "ASC"]] },
        { model: User, as: "teacher", attributes: ["id", "name", "email"] },
      ],
    });

    if (!course) return res.status(404).json({ error: "Course not found" });
    res.json({ success: true, course });
  } catch (error) {
    console.error("❌ Fetch course by slug error:", error);
    res
      .status(500)
      .json({ error: "Failed to fetch course", details: error.message });
  }
};

/**
 * ✅ Get Lessons by Course ID
 */
exports.getLessonsByCourse = async (req, res) => {
  try {
    const lessons = await Lesson.findAll({
      where: { courseId: req.params.courseId },
      order: [["orderIndex", "ASC"]],
    });

    res.json({ success: true, lessons });
  } catch (error) {
    console.error("❌ Fetch lessons error:", error);
    res
      .status(500)
      .json({ error: "Failed to fetch lessons", details: error.message });
  }
};

/**
 * ✅ Get Teacher's Courses
 */
exports.getTeacherCourses = async (req, res) => {
  try {
    const teacherId = req.user.id;
    const courses = await Course.findAll({
      where: { teacherId },
      order: [["createdAt", "DESC"]],
    });

    res.json({ success: true, courses });
  } catch (err) {
    console.error("❌ Fetch teacher courses error:", err);
    res.status(500).json({ error: "Failed to fetch courses" });
  }
};
