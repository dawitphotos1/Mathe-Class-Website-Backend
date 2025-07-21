// const path = require("path");
// const fs = require("fs");
// const { Course } = require("../models");

// // Create new course (teacher only)
// exports.createCourse = async (req, res) => {
//   try {
//     console.log("📥 CREATE COURSE request received.");
//     console.log("🔐 Authenticated user:", req.user);
//     console.log("📝 Incoming fields:", req.body);
//     console.log("📎 Incoming files:", req.files);

//     if (!req.user || req.user.role !== "teacher") {
//       return res
//         .status(403)
//         .json({ success: false, error: "Only teachers can create courses." });
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

//     console.log("✅ Course created:", course.id);
//     return res.status(201).json({ success: true, course });
//   } catch (error) {
//     console.error("🔥 CREATE COURSE ERROR:", error.stack || error.message);
//     return res.status(500).json({
//       success: false,
//       error: "Failed to create course",
//       details: error.message,
//     });
//   }
// };




const path = require("path");
const fs = require("fs");
const { Course, Lesson } = require("../models");

exports.createCourse = async (req, res) => {
  try {
    if (!req.user || req.user.role !== "teacher") {
      return res.status(403).json({
        success: false,
        error: "Only teachers can create courses.",
      });
    }

    const {
      title,
      description,
      category,
      slug,
      price = 0,
      materialUrl = null,
    } = req.body;

    if (!title || !slug || !description || !category) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields: title, slug, description, category",
      });
    }

    const attachmentUrls = [];
    if (req.files?.attachments) {
      const files = Array.isArray(req.files.attachments)
        ? req.files.attachments
        : [req.files.attachments];

      for (const file of files) {
        const fileName = `${Date.now()}_${file.originalname}`;
        const filePath = path.join(__dirname, "..", "Uploads", fileName);
        fs.writeFileSync(filePath, file.buffer);
        attachmentUrls.push(`/Uploads/${fileName}`);
      }
    }

    const course = await Course.create({
      title,
      description,
      category,
      slug,
      price: parseFloat(price),
      materialUrl,
      attachmentUrls,
      teacherId: req.user.id,
    });

    return res.status(201).json({ success: true, course });
  } catch (error) {
    console.error("🔥 CREATE COURSE ERROR:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to create course",
      details: error.message,
    });
  }
};

// ✅ SAFE DELETE
exports.deleteCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    console.log("🗑️ Attempting to delete course ID:", courseId);
    console.log("🔐 Authenticated user:", req.user);
    
    const course = await Course.findByPk(courseId);
    if (!course) {
      return res.status(404).json({ error: "Course not found" });
    }

    if (course.teacherId !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ error: "Unauthorized" });
    }

    // ⛔️ Ensure lessons are deleted (just in case onDelete doesn't fire)
    await Lesson.destroy({ where: { courseId } });

    await course.destroy();
    return res.json({ success: true, message: "Course deleted successfully" });
  } catch (error) {
    console.error("❌ deleteCourse error:", error);
    return res.status(500).json({
      error: "Failed to delete course",
      details: error.message,
    });
  }
};
