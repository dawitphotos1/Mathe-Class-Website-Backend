// const path = require("path");
// const fs = require("fs");
// const { Course, Lesson, User } = require("../models");

// // Ensure Uploads directory exists
// const uploadsDir = path.join(__dirname, "..", "Uploads");
// if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

// /**
//  * ✅ Create Course
//  */
// exports.createCourse = async (req, res) => {
//   try {
//     if (!req.user || req.user.role !== "teacher") {
//       return res
//         .status(403)
//         .json({ error: "Only teachers can create courses." });
//     }

//     const { title, description, category } = req.body;
//     if (!title || !description || !category) {
//       return res.status(400).json({ error: "Missing required fields" });
//     }

//     const slug = title.toLowerCase().replace(/\s+/g, "-").slice(0, 100);
//     const existing = await Course.findOne({ where: { slug } });
//     const uniqueSlug = existing ? `${slug}-${Date.now()}` : slug;

//     // Handle file uploads
//     const attachments = req.files?.attachments || [];
//     const thumbnail = req.files?.thumbnail?.[0];
//     const introVideo = req.files?.introVideo?.[0];

//     const attachmentUrls = [];
//     for (const file of attachments) {
//       const filename = `${Date.now()}-${file.originalname.replace(
//         /\s+/g,
//         "_"
//       )}`;
//       fs.writeFileSync(path.join(uploadsDir, filename), file.buffer);
//       attachmentUrls.push(`/Uploads/${filename}`);
//     }

//     let thumbnailUrl = null;
//     if (thumbnail) {
//       const filename = `${Date.now()}-${thumbnail.originalname.replace(
//         /\s+/g,
//         "_"
//       )}`;
//       fs.writeFileSync(path.join(uploadsDir, filename), thumbnail.buffer);
//       thumbnailUrl = `/Uploads/${filename}`;
//     }

//     let introVideoUrl = null;
//     if (introVideo) {
//       const filename = `${Date.now()}-${introVideo.originalname.replace(
//         /\s+/g,
//         "_"
//       )}`;
//       fs.writeFileSync(path.join(uploadsDir, filename), introVideo.buffer);
//       introVideoUrl = `/Uploads/${filename}`;
//     }

//     const course = await Course.create({
//       title,
//       description,
//       category,
//       slug: uniqueSlug,
//       teacherId: req.user.id,
//       attachmentUrls,
//       thumbnailUrl,
//       introVideoUrl,
//     });

//     res.status(201).json({ success: true, course });
//   } catch (error) {
//     console.error("🔥 CREATE COURSE ERROR:", error);
//     res
//       .status(500)
//       .json({ error: "Failed to create course", details: error.message });
//   }
// };

// /**
//  * ✅ Delete Course
//  */
// exports.deleteCourse = async (req, res) => {
//   try {
//     const courseId = req.params.id;
//     const course = await Course.findByPk(courseId);

//     if (!course) {
//       return res.status(404).json({ error: "Course not found" });
//     }

//     // 🔒 Only allow teacher-owner or admin to delete
//     if (req.user.role !== "admin" && course.teacherId !== req.user.id) {
//       return res
//         .status(403)
//         .json({ error: "You are not authorized to delete this course" });
//     }

//     await course.destroy();
//     res.json({ success: true, message: "Course deleted successfully" });
//   } catch (error) {
//     console.error("❌ deleteCourse error:", error);
//     res
//       .status(500)
//       .json({ error: "Failed to delete course", details: error.message });
//   }
// };

// /**
//  * ✅ Get Course by Slug
//  */
// // controllers/courseController.js

// exports.getCourseBySlug = async (req, res) => {
//   try {
//     console.log("🔍 Slug requested:", req.params.slug); // Optional for debug

//     const course = await Course.findOne({
//       where: { slug: req.params.slug },
//       include: [
//         {
//           model: Lesson,
//           as: "lessons",
//           order: [["orderIndex", "ASC"]],
//         },
//         {
//           model: User,
//           as: "teacher",
//           attributes: ["id", "name", "email"],
//         },
//       ],
//     });

//     if (!course) return res.status(404).json({ error: "Course not found" });

//     res.json({ success: true, course });
//   } catch (error) {
//     console.error("❌ Fetch course by slug error:", error);
//     res.status(500).json({
//       error: "Failed to fetch course",
//       details: error.message,
//     });
//   }
// };

// /**
//  * ✅ Get Lessons by Course ID
//  */
// exports.getLessonsByCourse = async (req, res) => {
//   try {
//     const lessons = await Lesson.findAll({
//       where: { courseId: req.params.courseId },
//       order: [["orderIndex", "ASC"]],
//     });

//     res.json({ success: true, lessons });
//   } catch (error) {
//     console.error("❌ Fetch lessons error:", error);
//     res
//       .status(500)
//       .json({ error: "Failed to fetch lessons", details: error.message });
//   }
// };

// /**
//  * ✅ Get Teacher's Courses
//  */
// exports.getTeacherCourses = async (req, res) => {
//   try {
//     const teacherId = req.user.id;
//     const courses = await Course.findAll({
//       where: { teacherId },
//       order: [["createdAt", "DESC"]],
//     });

//     res.json({ success: true, courses });
//   } catch (err) {
//     console.error("❌ Fetch teacher courses error:", err);
//     res.status(500).json({ error: "Failed to fetch courses" });
//   }
// };



const path = require("path");
const fs = require("fs");
const { Course, Lesson, User, UserCourseAccess } = require("../models");

const uploadsDir = path.join(__dirname, "..", "Uploads");
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

exports.createCourse = async (req, res) => {
  try {
    if (!req.user || !["teacher", "admin"].includes(req.user.role)) {
      return res
        .status(403)
        .json({ error: "Only teachers or admins can create courses" });
    }

    const { title, description, category, price, subject } = req.body;
    if (!title || !description || !category || !price || !subject) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const slug = title.toLowerCase().replace(/\s+/g, "-").slice(0, 100);
    const existing = await Course.findOne({ where: { slug } });
    const uniqueSlug = existing ? `${slug}-${Date.now()}` : slug;

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
      fs.writeFileSync(path.join(UploadsDir, filename), thumbnail.buffer);
      thumbnailUrl = `/Uploads/${filename}`;
    }

    let introVideoUrl = null;
    if (introVideo) {
      const filename = `${Date.now()}-${introVideo.originalname.replace(
        /\s+/g,
        "_"
      )}`;
      fs.writeFileSync(path.join(UploadsDir, filename), introVideo.buffer);
      introVideoUrl = `/Uploads/${filename}`;
    }

    const course = await Course.create({
      title,
      description,
      category,
      price,
      subject,
      slug: uniqueSlug,
      teacherId: req.user.id,
      attachmentUrls,
      thumbnailUrl,
      introVideoUrl,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    res.status(201).json({ success: true, course });
  } catch (error) {
    console.error("🔥 Create course error:", {
      message: error.message,
      stack: error.stack,
      userId: req.user?.id,
      body: req.body,
    });
    res
      .status(500)
      .json({ error: "Failed to create course", details: error.message });
  }
};

exports.deleteCourse = async (req, res) => {
  try {
    const courseId = req.params.id;
    const course = await Course.findByPk(courseId);

    if (!course) {
      return res.status(404).json({ error: "Course not found" });
    }

    if (req.user.role !== "admin" && course.teacherId !== req.user.id) {
      return res
        .status(403)
        .json({ error: "Unauthorized to delete this course" });
    }

    await Lesson.destroy({ where: { courseId } });
    await course.destroy();
    res.json({ success: true, message: "Course deleted successfully" });
  } catch (error) {
    console.error("🔥 Delete course error:", {
      message: error.message,
      stack: error.stack,
      userId: req.user?.id,
      courseId: req.params.id,
    });
    res
      .status(500)
      .json({ error: "Failed to delete course", details: error.message });
  }
};

exports.getCourseBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    if (!slug) {
      return res.status(400).json({ error: "Course slug is required" });
    }

    console.log(
      "🔍 Fetching course with slug:",
      slug,
      "user:",
      req.user?.id || "unauthenticated"
    );

    const course = await Course.findOne({
      where: { slug },
      include: [
        {
          model: Lesson,
          as: "lessons",
          attributes: ["id", "title", "orderIndex"],
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
      console.log("🔍 Course not found for slug:", slug);
      return res.status(404).json({ error: "Course not found" });
    }

    let isEnrolled = false;
    if (req.user) {
      const enrollment = await UserCourseAccess.findOne({
        where: { userId: req.user.id, courseId: course.id, approved: true },
      });
      isEnrolled = !!enrollment;
    }

    res.json({ success: true, course, isEnrolled });
  } catch (error) {
    console.error("🔥 Get course by slug error:", {
      message: error.message,
      stack: error.stack,
      slug: req.params.slug,
      userId: req.user?.id,
      errorName: error.name,
      errorCode: error.code,
    });
    if (error.name === "SequelizeDatabaseError") {
      return res
        .status(500)
        .json({
          error: "Database error fetching course",
          details: error.message,
        });
    }
    if (error.name === "SequelizeValidationError") {
      return res
        .status(400)
        .json({
          error: "Validation error",
          details: error.errors.map((e) => e.message),
        });
    }
    res
      .status(500)
      .json({ error: "Failed to fetch course", details: error.message });
  }
};

exports.getEnrolledCourseBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const userId = req.user?.id;

    if (!slug) {
      return res.status(400).json({ error: "Course slug is required" });
    }

    if (!userId) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const course = await Course.findOne({
      where: { slug },
      include: [
        {
          model: Lesson,
          as: "lessons",
          attributes: ["id", "title", "content", "orderIndex"],
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
      return res.status(404).json({ error: "Course not found" });
    }

    const access = await UserCourseAccess.findOne({
      where: { courseId: course.id, userId, approved: true },
    });

    if (!access) {
      return res
        .status(403)
        .json({ error: "Access denied: Not enrolled or not approved" });
    }

    res.json({ success: true, course });
  } catch (error) {
    console.error("🔥 Get enrolled course error:", {
      message: error.message,
      stack: error.stack,
      slug: req.params.slug,
      userId: req.user?.id,
      errorName: error.name,
      errorCode: error.code,
    });
    if (error.name === "SequelizeDatabaseError") {
      return res
        .status(500)
        .json({
          error: "Database error fetching course",
          details: error.message,
        });
    }
    res
      .status(500)
      .json({ error: "Failed to fetch course", details: error.message });
  }
};

exports.getLessonsByCourse = async (req, res) => {
  try {
    const lessons = await Lesson.findAll({
      where: { courseId: req.params.courseId },
      order: [["orderIndex", "ASC"]],
    });

    res.json({ success: true, lessons });
  } catch (error) {
    console.error("🔥 Fetch lessons error:", {
      message: error.message,
      stack: error.stack,
      courseId: req.params.courseId,
      userId: req.user?.id,
    });
    res
      .status(500)
      .json({ error: "Failed to fetch lessons", details: error.message });
  }
};

exports.getTeacherCourses = async (req, res) => {
  try {
    const filter =
      req.user.role === "teacher" ? { teacherId: req.user.id } : {};
    const courses = await Course.findAll({
      where: filter,
      include: [
        { model: User, as: "teacher", attributes: ["id", "name", "email"] },
      ],
      order: [["createdAt", "DESC"]],
    });

    res.json({ success: true, courses });
  } catch (error) {
    console.error("🔥 Fetch teacher courses error:", {
      message: error.message,
      stack: error.stack,
      userId: req.user?.id,
    });
    res
      .status(500)
      .json({ error: "Failed to fetch courses", details: error.message });
  }
};

exports.getAllCourses = async (req, res) => {
  try {
    const courses = await Course.findAll({
      include: [
        { model: User, as: "teacher", attributes: ["id", "name", "email"] },
      ],
      order: [["createdAt", "DESC"]],
    });
    res.json({ success: true, courses });
  } catch (error) {
    console.error("🔥 Fetch all courses error:", {
      message: error.message,
      stack: error.stack,
      userId: req.user?.id,
    });
    res
      .status(500)
      .json({ error: "Failed to fetch all courses", details: error.message });
  }
};

exports.renameAttachment = async (req, res) => {
  try {
    const { courseId, index } = req.params;
    const { newName } = req.body;
    if (!newName) {
      return res.status(400).json({ error: "New name is required" });
    }

    const course = await Course.findByPk(courseId);
    if (!course) {
      return res.status(404).json({ error: "Course not found" });
    }

    if (req.user.role !== "admin" && req.user.id !== course.teacherId) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    const attachments = course.attachmentUrls || [];
    const oldUrl = attachments[+index];
    if (!oldUrl) {
      return res.status(404).json({ error: "Attachment not found" });
    }

    const oldPath = path.join(__dirname, "../", oldUrl);
    const ext = path.extname(oldPath);
    const newFileName = `${Date.now()}-${newName}${ext}`;
    const newPath = path.join(__dirname, "../Uploads", newFileName);
    const newUrl = `/Uploads/${newFileName}`;

    if (fs.existsSync(oldPath)) {
      fs.renameSync(oldPath, newPath);
    } else {
      return res.status(404).json({ error: "Attachment file not found" });
    }

    attachments[+index] = newUrl;
    course.attachmentUrls = attachments;
    await course.save();

    res.json({ success: true, updatedUrl: newUrl });
  } catch (error) {
    console.error("🔥 Rename attachment error:", {
      message: error.message,
      stack: error.stack,
      courseId: req.params.courseId,
      index: req.params.index,
      userId: req.user?.id,
    });
    res
      .status(500)
      .json({ error: "Failed to rename attachment", details: error.message });
  }
};

exports.deleteAttachment = async (req, res) => {
  try {
    const { courseId, index } = req.params;

    const course = await Course.findByPk(courseId);
    if (!course) {
      return res.status(404).json({ error: "Course not found" });
    }

    if (req.user.role !== "admin" && req.user.id !== course.teacherId) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    const attachments = course.attachmentUrls || [];
    const fileUrl = attachments[+index];
    if (!fileUrl) {
      return res.status(404).json({ error: "Attachment not found" });
    }

    const filePath = path.join(__dirname, "../", fileUrl);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    attachments.splice(+index, 1);
    course.attachmentUrls = attachments;
    await course.save();

    res.json({ success: true, message: "Attachment deleted" });
  } catch (error) {
    console.error("🔥 Delete attachment error:", {
      message: error.message,
      stack: error.stack,
      courseId: req.params.courseId,
      index: req.params.index,
      userId: req.user?.id,
    });
    res
      .status(500)
      .json({ error: "Failed to delete attachment", details: error.message });
  }
};