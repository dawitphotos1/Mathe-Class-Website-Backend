// const path = require("path");
// const fs = require("fs");
// const { Course, Lesson } = require("../models");

// exports.createCourse = async (req, res) => {
//   try {
//     if (!req.user || req.user.role !== "teacher") {
//       return res.status(403).json({
//         success: false,
//         error: "Only teachers can create courses.",
//       });
//     }

//     const {
//       title,
//       description,
//       category,
//       slug,
//       price = 0,
//       materialUrl = null,
//     } = req.body;

//     if (!title || !slug || !description || !category) {
//       return res.status(400).json({
//         success: false,
//         error: "Missing required fields: title, slug, description, category",
//       });
//     }

//     const attachmentUrls = [];
//     if (req.files?.attachments) {
//       const files = Array.isArray(req.files.attachments)
//         ? req.files.attachments
//         : [req.files.attachments];

//       for (const file of files) {
//         const fileName = `${Date.now()}_${file.originalname}`;
//         const filePath = path.join(__dirname, "..", "Uploads", fileName);
//         fs.writeFileSync(filePath, file.buffer);
//         attachmentUrls.push(`/Uploads/${fileName}`);
//       }
//     }

//     const course = await Course.create({
//       title,
//       description,
//       category,
//       slug,
//       price: parseFloat(price),
//       materialUrl,
//       attachmentUrls,
//       teacherId: req.user.id,
//     });

//     return res.status(201).json({ success: true, course });
//   } catch (error) {
//     console.error("🔥 CREATE COURSE ERROR:", error);
//     return res.status(500).json({
//       success: false,
//       error: "Failed to create course",
//       details: error.message,
//     });
//   }
// };

// // ✅ SAFE DELETE
// exports.deleteCourse = async (req, res) => {
//   try {
//     const { courseId } = req.params;
//     console.log("🗑️ Attempting to delete course ID:", courseId);
//     console.log("🔐 Authenticated user:", req.user);

//     const course = await Course.findByPk(courseId);
//     if (!course) {
//       return res.status(404).json({ error: "Course not found" });
//     }

//     if (course.teacherId !== req.user.id && req.user.role !== "admin") {
//       return res.status(403).json({ error: "Unauthorized" });
//     }

//     // ⛔️ Ensure lessons are deleted (just in case onDelete doesn't fire)
//     await Lesson.destroy({ where: { courseId } });

//     await course.destroy();
//     return res.json({ success: true, message: "Course deleted successfully" });
//   } catch (error) {
//     console.error("❌ deleteCourse error:", error);
//     return res.status(500).json({
//       error: "Failed to delete course",
//       details: error.message,
//     });
//   }
// };


const path = require("path");
const fs = require("fs");
const { Course, Lesson, User } = require("../models");

// 🔹 Create course
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

    const attachments = req.files?.attachments || [];
    const thumbnail = req.files?.thumbnail?.[0];
    const introVideo = req.files?.introVideo?.[0];

    const attachmentUrls = attachments.map((f) => `/uploads/${f.filename}`);
    const thumbnailUrl = thumbnail ? `/uploads/${thumbnail.filename}` : null;
    const introVideoUrl = introVideo ? `/uploads/${introVideo.filename}` : null;

    const course = await Course.create({
      title,
      description,
      category,
      slug: uniqueSlug,
      teacherId: req.user.id,
      attachmentUrls,
      thumbnail: thumbnailUrl,
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

// 🔹 Delete course with cascade (no manual lesson deletion)
exports.deleteCourse = async (req, res) => {
  try {
    const { id } = req.params;
    console.log("🗑️ Attempting to delete course ID:", id);
    console.log("🔐 Authenticated user:", req.user);

    const course = await Course.findByPk(id);
    if (!course) return res.status(404).json({ error: "Course not found" });

    if (course.teacherId !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ error: "Unauthorized" });
    }

    await course.destroy(); // let onDelete: "CASCADE" handle dependent lessons

    return res.json({ success: true, message: "Course deleted successfully" });
  } catch (error) {
    console.error("❌ deleteCourse error stack:", error.stack);
    return res.status(500).json({
      error: "Failed to delete course",
      details: error.message || "Unknown error",
    });
  }
};

// 🔹 Get course by slug
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
    res.json(course);
  } catch (err) {
    console.error("❌ Fetch course by slug error:", err.message);
    res
      .status(500)
      .json({ error: "Failed to fetch course", details: err.message });
  }
};

// 🔹 Get lessons by course
exports.getLessonsByCourse = async (req, res) => {
  try {
    const courseId = parseInt(req.params.courseId);
    if (isNaN(courseId))
      return res.status(400).json({ error: "Invalid course ID" });

    const lessons = await Lesson.findAll({
      where: { courseId },
      order: [["orderIndex", "ASC"]],
    });
    res.json({ success: true, lessons });
  } catch (err) {
    res
      .status(500)
      .json({ error: "Failed to fetch lessons", details: err.message });
  }
};
