// const path = require("path");
// const fs = require("fs");
// const { Course, Lesson, User, UserCourseAccess } = require("../models");

// const uploadsDir = path.join(__dirname, "..", "Uploads");
// if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

// /**
//  * Create a new course
//  */
// exports.createCourse = async (req, res) => {
//   try {
//     if (!req.user || !["teacher", "admin"].includes(req.user.role)) {
//       return res
//         .status(403)
//         .json({ error: "Only teachers or admins can create courses" });
//     }

//     const { title, description, category, price, subject } = req.body;
//     if (!title || !description || !category || !price || !subject) {
//       return res.status(400).json({ error: "Missing required fields" });
//     }

//     const slugBase = title
//       .toLowerCase()
//       .trim()
//       .replace(/\s+/g, "-")
//       .slice(0, 100);
//     const existing = await Course.findOne({ where: { slug: slugBase } });
//     const slug = existing ? `${slugBase}-${Date.now()}` : slugBase;

//     // File uploads
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
//       price,
//       subject,
//       slug,
//       teacher_id: req.user.id,
//       attachmentUrls,
//       thumbnailUrl,
//       introVideoUrl,
//     });

//     res.status(201).json({ success: true, course });
//   } catch (error) {
//     console.error("🔥 Create course error:", error);
//     res
//       .status(500)
//       .json({ error: "Failed to create course", details: error.message });
//   }
// };

// /**
//  * Delete a course
//  */
// exports.deleteCourse = async (req, res) => {
//   try {
//     const courseId = req.params.id;
//     const course = await Course.findByPk(courseId);

//     if (!course) return res.status(404).json({ error: "Course not found" });

//     if (req.user.role !== "admin" && course.teacher_id !== req.user.id) {
//       return res
//         .status(403)
//         .json({ error: "Unauthorized to delete this course" });
//     }

//     await Lesson.destroy({ where: { course_id: courseId } });
//     await course.destroy();

//     res.json({ success: true, message: "Course deleted successfully" });
//   } catch (error) {
//     console.error("🔥 Delete course error:", error);
//     res
//       .status(500)
//       .json({ error: "Failed to delete course", details: error.message });
//   }
// };

// /**
//  * Public course view (with lessons, but not content)
//  */
// exports.getCourseBySlug = async (req, res) => {
//   try {
//     const { slug } = req.params;
//     if (!slug)
//       return res.status(400).json({ error: "Course slug is required" });

//     const course = await Course.findOne({
//       where: { slug },
//       include: [
//         {
//           model: Lesson,
//           as: "lessons",
//           attributes: ["id", "title", "order_index"],
//           required: false,
//         },
//         {
//           model: User,
//           as: "teacher",
//           attributes: ["id", "name", "email"],
//           required: false,
//         },
//       ],
//       order: [[{ model: Lesson, as: "lessons" }, "order_index", "ASC"]],
//     });

//     if (!course) return res.status(404).json({ error: "Course not found" });

//     let isEnrolled = false;
//     if (req.user) {
//       const enrollment = await UserCourseAccess.findOne({
//         where: {
//           user_id: req.user.id,
//           course_id: course.id,
//           approval_status: "approved",
//         },
//       });
//       isEnrolled = !!enrollment;
//     }

//     res.json({ success: true, course, isEnrolled });
//   } catch (error) {
//     console.error("🔥 Get course by slug error:", error);
//     res
//       .status(500)
//       .json({ error: "Failed to fetch course", details: error.message });
//   }
// };

// /**
//  * Enrolled student course view (with full lesson content)
//  */
// exports.getEnrolledCourseBySlug = async (req, res) => {
//   try {
//     const { slug } = req.params;
//     const userId = req.user?.id;

//     if (!slug)
//       return res.status(400).json({ error: "Course slug is required" });
//     if (!userId)
//       return res.status(401).json({ error: "Authentication required" });

//     const course = await Course.findOne({
//       where: { slug },
//       include: [
//         {
//           model: Lesson,
//           as: "lessons",
//           attributes: ["id", "title", "content", "order_index"],
//           required: false,
//         },
//         {
//           model: User,
//           as: "teacher",
//           attributes: ["id", "name", "email"],
//           required: false,
//         },
//       ],
//       order: [[{ model: Lesson, as: "lessons" }, "order_index", "ASC"]],
//     });

//     if (!course) return res.status(404).json({ error: "Course not found" });

//     const access = await UserCourseAccess.findOne({
//       where: {
//         course_id: course.id,
//         user_id: userId,
//         approval_status: "approved",
//       },
//     });

//     if (!access) {
//       return res
//         .status(403)
//         .json({ error: "Access denied: Not enrolled or not approved" });
//     }

//     res.json({ success: true, course });
//   } catch (error) {
//     console.error("🔥 Get enrolled course error:", error);
//     res
//       .status(500)
//       .json({ error: "Failed to fetch course", details: error.message });
//   }
// };

// /**
//  * Fetch lessons by course
//  */
// exports.getLessonsByCourse = async (req, res) => {
//   try {
//     const lessons = await Lesson.findAll({
//       where: { course_id: req.params.courseId },
//       order: [["order_index", "ASC"]],
//     });

//     res.json({ success: true, lessons });
//   } catch (error) {
//     console.error("🔥 Fetch lessons error:", error);
//     res
//       .status(500)
//       .json({ error: "Failed to fetch lessons", details: error.message });
//   }
// };

// /**
//  * Fetch teacher's own courses
//  */
// exports.getTeacherCourses = async (req, res) => {
//   try {
//     const filter =
//       req.user.role === "teacher" ? { teacher_id: req.user.id } : {};
//     const courses = await Course.findAll({
//       where: filter,
//       include: [
//         {
//           model: User,
//           as: "teacher",
//           attributes: ["id", "name", "email"],
//         },
//       ],
//       order: [["created_at", "DESC"]],
//     });

//     res.json({ success: true, courses });
//   } catch (error) {
//     console.error("🔥 Fetch teacher courses error:", error);
//     res
//       .status(500)
//       .json({ error: "Failed to fetch courses", details: error.message });
//   }
// };

// /**
//  * Fetch all courses (admin/public)
//  */
// exports.getAllCourses = async (req, res) => {
//   try {
//     const courses = await Course.findAll({
//       include: [
//         {
//           model: User,
//           as: "teacher",
//           attributes: ["id", "name", "email"],
//         },
//       ],
//       order: [["created_at", "DESC"]],
//     });
//     res.json({ success: true, courses });
//   } catch (error) {
//     console.error("🔥 Fetch all courses error:", error);
//     res
//       .status(500)
//       .json({ error: "Failed to fetch all courses", details: error.message });
//   }
// };

// /**
//  * Rename an attachment
//  */
// exports.renameAttachment = async (req, res) => {
//   try {
//     const { courseId, index } = req.params;
//     const { newName } = req.body;
//     if (!newName)
//       return res.status(400).json({ error: "New name is required" });

//     const course = await Course.findByPk(courseId);
//     if (!course) return res.status(404).json({ error: "Course not found" });

//     if (req.user.role !== "admin" && req.user.id !== course.teacher_id) {
//       return res.status(403).json({ error: "Unauthorized" });
//     }

//     const attachments = course.attachmentUrls || [];
//     const oldUrl = attachments[+index];
//     if (!oldUrl) return res.status(404).json({ error: "Attachment not found" });

//     const oldPath = path.join(__dirname, "..", oldUrl);
//     const ext = path.extname(oldPath);
//     const newFileName = `${Date.now()}-${newName}${ext}`;
//     const newPath = path.join(uploadsDir, newFileName);
//     const newUrl = `/Uploads/${newFileName}`;

//     if (!fs.existsSync(oldPath)) {
//       return res.status(404).json({ error: "Attachment file not found" });
//     }

//     fs.renameSync(oldPath, newPath);
//     attachments[+index] = newUrl;
//     course.attachmentUrls = attachments;
//     await course.save();

//     res.json({ success: true, updatedUrl: newUrl });
//   } catch (error) {
//     console.error("🔥 Rename attachment error:", error);
//     res
//       .status(500)
//       .json({ error: "Failed to rename attachment", details: error.message });
//   }
// };

// /**
//  * Delete an attachment
//  */
// exports.deleteAttachment = async (req, res) => {
//   try {
//     const { courseId, index } = req.params;

//     const course = await Course.findByPk(courseId);
//     if (!course) return res.status(404).json({ error: "Course not found" });

//     if (req.user.role !== "admin" && req.user.id !== course.teacher_id) {
//       return res.status(403).json({ error: "Unauthorized" });
//     }

//     const attachments = course.attachmentUrls || [];
//     const fileUrl = attachments[+index];
//     if (!fileUrl)
//       return res.status(404).json({ error: "Attachment not found" });

//     const filePath = path.join(__dirname, "..", fileUrl);
//     if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

//     attachments.splice(+index, 1);
//     course.attachmentUrls = attachments;
//     await course.save();

//     res.json({ success: true, message: "Attachment deleted" });
//   } catch (error) {
//     console.error("🔥 Delete attachment error:", error);
//     res
//       .status(500)
//       .json({ error: "Failed to delete attachment", details: error.message });
//   }
// };


const path = require("path");
const fs = require("fs");
const { Course, Lesson, User, UserCourseAccess } = require("../models");

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, "..", "Uploads");
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

/**
 * ✅ Create a new course (teacher/admin only)
 */
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

    // Generate unique slug
    const slugBase = title
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "-")
      .slice(0, 100);
    const existing = await Course.findOne({ where: { slug: slugBase } });
    const slug = existing ? `${slugBase}-${Date.now()}` : slugBase;

    // Handle files
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
      price,
      subject,
      slug,
      teacher_id: req.user.id,
      attachment_urls: attachmentUrls,
      thumbnail_url: thumbnailUrl,
      intro_video_url: introVideoUrl,
    });

    res.status(201).json({ success: true, course });
  } catch (error) {
    console.error("🔥 Create course error:", error);
    res
      .status(500)
      .json({ error: "Failed to create course", details: error.message });
  }
};

/**
 * ✅ Delete a course (teacher/admin only)
 */
exports.deleteCourse = async (req, res) => {
  try {
    const courseId = req.params.id;
    const course = await Course.findByPk(courseId);

    if (!course) return res.status(404).json({ error: "Course not found" });

    if (req.user.role !== "admin" && course.teacher_id !== req.user.id) {
      return res
        .status(403)
        .json({ error: "Unauthorized to delete this course" });
    }

    await Lesson.destroy({ where: { course_id: courseId } });
    await course.destroy();
    res.json({ success: true, message: "Course deleted successfully" });
  } catch (error) {
    console.error("🔥 Delete course error:", error);
    res
      .status(500)
      .json({ error: "Failed to delete course", details: error.message });
  }
};

/**
 * ✅ Get course by slug with lessons + teacher
 *    (Lessons content limited unless student is enrolled/approved)
 */
exports.getCourseBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    if (!slug)
      return res.status(400).json({ error: "Course slug is required" });

    console.log("🔍 Fetching course by slug:", slug);

    const course = await Course.findOne({
      where: { slug },
      include: [
        {
          model: Lesson,
          as: "lessons",
          attributes: ["id", "title", "order_index", "is_preview"],
          required: false,
        },
        {
          model: User,
          as: "teacher",
          attributes: ["id", "name", "email"],
          required: false,
        },
      ],
      order: [[{ model: Lesson, as: "lessons" }, "order_index", "ASC"]],
    });

    if (!course) return res.status(404).json({ error: "Course not found" });

    // ✅ Check if logged-in user is enrolled
    let isEnrolled = false;
    if (req.user) {
      const enrollment = await UserCourseAccess.findOne({
        where: {
          user_id: req.user.id,
          course_id: course.id,
          approval_status: "approved",
        },
      });
      isEnrolled = !!enrollment;
    }

    res.json({ success: true, course, isEnrolled });
  } catch (error) {
    console.error("🔥 Get course by slug error:", error);
    res
      .status(500)
      .json({ error: "Failed to fetch course", details: error.message });
  }
};

/**
 * ✅ Get enrolled course by slug (full lessons, only if approved)
 */
exports.getEnrolledCourseBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const userId = req.user?.id;

    if (!slug)
      return res.status(400).json({ error: "Course slug is required" });
    if (!userId)
      return res.status(401).json({ error: "Authentication required" });

    console.log("🔍 Fetching enrolled course:", slug, "for user:", userId);

    const course = await Course.findOne({
      where: { slug },
      include: [
        {
          model: Lesson,
          as: "lessons",
          attributes: ["id", "title", "content", "order_index", "is_preview"],
          required: false,
        },
        {
          model: User,
          as: "teacher",
          attributes: ["id", "name", "email"],
          required: false,
        },
      ],
      order: [[{ model: Lesson, as: "lessons" }, "order_index", "ASC"]],
    });

    if (!course) return res.status(404).json({ error: "Course not found" });

    // ✅ Only approved students get access
    const access = await UserCourseAccess.findOne({
      where: {
        course_id: course.id,
        user_id: userId,
        approval_status: "approved",
      },
    });

    if (!access) {
      return res
        .status(403)
        .json({ error: "Access denied: Not enrolled or not approved" });
    }

    res.json({ success: true, course });
  } catch (error) {
    console.error("🔥 Get enrolled course error:", error);
    res
      .status(500)
      .json({ error: "Failed to fetch course", details: error.message });
  }
};

/**
 * ✅ Get all lessons for a course
 */
exports.getLessonsByCourse = async (req, res) => {
  try {
    const lessons = await Lesson.findAll({
      where: { course_id: req.params.courseId },
      order: [["order_index", "ASC"]],
    });
    res.json({ success: true, lessons });
  } catch (error) {
    console.error("🔥 Fetch lessons error:", error);
    res
      .status(500)
      .json({ error: "Failed to fetch lessons", details: error.message });
  }
};

/**
 * ✅ Get teacher's courses
 */
exports.getTeacherCourses = async (req, res) => {
  try {
    const filter =
      req.user.role === "teacher" ? { teacher_id: req.user.id } : {};
    const courses = await Course.findAll({
      where: filter,
      include: [
        {
          model: User,
          as: "teacher",
          attributes: ["id", "name", "email"],
          required: false,
        },
      ],
      order: [["created_at", "DESC"]],
    });
    res.json({ success: true, courses });
  } catch (error) {
    console.error("🔥 Fetch teacher courses error:", error);
    res
      .status(500)
      .json({ error: "Failed to fetch courses", details: error.message });
  }
};

/**
 * ✅ Get all courses
 */
exports.getAllCourses = async (req, res) => {
  try {
    const courses = await Course.findAll({
      include: [
        {
          model: User,
          as: "teacher",
          attributes: ["id", "name", "email"],
          required: false,
        },
      ],
      order: [["created_at", "DESC"]],
    });
    res.json({ success: true, courses });
  } catch (error) {
    console.error("🔥 Fetch all courses error:", error);
    res
      .status(500)
      .json({ error: "Failed to fetch all courses", details: error.message });
  }
};
