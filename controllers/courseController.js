const path = require("path");
const fs = require("fs");
const { Course, Lesson, User, UserCourseAccess } = require("../models");

const uploadsDir = path.join(__dirname, "..", "Uploads");
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

/**
 * Create a new course
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

    const slugBase = title
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "-")
      .slice(0, 100);
    const existing = await Course.findOne({ where: { slug: slugBase } });
    const slug = existing ? `${slugBase}-${Date.now()}` : slugBase;

    const attachments = req.files?.attachments || [];
    const thumbnail = req.files?.thumbnail?.[0];
    const introVideo = req.files?.introVideo?.[0];

    const attachmentUrls = attachments.map((file) => {
      const filename = `${Date.now()}-${file.originalname.replace(
        /\s+/g,
        "_"
      )}`;
      fs.writeFileSync(path.join(uploadsDir, filename), file.buffer);
      return `/Uploads/${filename}`;
    });

    const processFile = (file) => {
      const filename = `${Date.now()}-${file.originalname.replace(
        /\s+/g,
        "_"
      )}`;
      fs.writeFileSync(path.join(uploadsDir, filename), file.buffer);
      return `/Uploads/${filename}`;
    };

    const course = await Course.create({
      title,
      description,
      category,
      price,
      subject,
      slug,
      teacher_id: req.user.id,
      attachment_urls: attachmentUrls,
      thumbnail_url: thumbnail ? processFile(thumbnail) : null,
      intro_video_url: introVideo ? processFile(introVideo) : null,
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
 * Update an existing course
 */
exports.updateCourse = async (req, res) => {
  try {
    const courseId = req.params.id;
    const course = await Course.findByPk(courseId);
    if (!course) return res.status(404).json({ error: "Course not found" });

    if (req.user.role !== "admin" && course.teacher_id !== req.user.id) {
      return res
        .status(403)
        .json({ error: "Unauthorized to update this course" });
    }

    const { title, description, category, price, subject } = req.body;

    if (title && title !== course.title) {
      const slugBase = title
        .toLowerCase()
        .trim()
        .replace(/\s+/g, "-")
        .slice(0, 100);
      const existing = await Course.findOne({ where: { slug: slugBase } });
      course.slug = existing ? `${slugBase}-${Date.now()}` : slugBase;
    }

    course.title = title || course.title;
    course.description = description || course.description;
    course.category = category || course.category;
    course.price = price || course.price;
    course.subject = subject || course.subject;

    const attachments = req.files?.attachments || [];
    const thumbnail = req.files?.thumbnail?.[0];
    const introVideo = req.files?.introVideo?.[0];

    const processFile = (file) => {
      const filename = `${Date.now()}-${file.originalname.replace(
        /\s+/g,
        "_"
      )}`;
      fs.writeFileSync(path.join(uploadsDir, filename), file.buffer);
      return `/Uploads/${filename}`;
    };

    if (attachments.length > 0) {
      course.attachment_urls = attachments.map(processFile);
    }

    if (thumbnail) course.thumbnail_url = processFile(thumbnail);
    if (introVideo) course.intro_video_url = processFile(introVideo);

    await course.save();
    res.json({ success: true, course });
  } catch (error) {
    console.error("🔥 Update course error:", error);
    res
      .status(500)
      .json({ error: "Failed to update course", details: error.message });
  }
};

/**
 * Delete a course
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
 * Rename course attachment
 */
exports.renameAttachment = async (req, res) => {
  try {
    const { courseId, index } = req.params;
    const { newName } = req.body;

    const course = await Course.findByPk(courseId);
    if (!course) return res.status(404).json({ error: "Course not found" });

    const attachmentUrls = [...(course.attachment_urls || [])];
    const oldUrl = attachmentUrls[+index];
    if (!oldUrl) return res.status(404).json({ error: "Attachment not found" });

    const oldPath = path.join(__dirname, "..", oldUrl);
    const ext = path.extname(oldPath);
    const newFileName = `${Date.now()}-${newName.replace(/\s+/g, "_")}${ext}`;
    const newPath = path.join(uploadsDir, newFileName);

    fs.renameSync(oldPath, newPath);
    attachmentUrls[+index] = `/Uploads/${newFileName}`;
    course.attachment_urls = attachmentUrls;

    await course.save();
    res.json({ success: true, updatedUrl: `/Uploads/${newFileName}` });
  } catch (error) {
    console.error("🔥 Rename attachment error:", error);
    res.status(500).json({ error: "Failed to rename attachment" });
  }
};

/**
 * Delete course attachment
 */
exports.deleteAttachment = async (req, res) => {
  try {
    const { courseId, index } = req.params;

    const course = await Course.findByPk(courseId);
    if (!course) return res.status(404).json({ error: "Course not found" });

    const attachmentUrls = [...(course.attachment_urls || [])];
    const fileUrl = attachmentUrls[+index];
    if (!fileUrl)
      return res.status(404).json({ error: "Attachment not found" });

    const filePath = path.join(__dirname, "..", fileUrl);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

    attachmentUrls.splice(+index, 1);
    course.attachment_urls = attachmentUrls;
    await course.save();

    res.json({ success: true, message: "Attachment deleted successfully" });
  } catch (error) {
    console.error("🔥 Delete attachment error:", error);
    res.status(500).json({ error: "Failed to delete attachment" });
  }
};

/**
 * Get course by slug (public)
 */
exports.getCourseBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const course = await Course.findOne({
      where: { slug },
      include: [
        {
          model: Lesson,
          as: "lessons",
          attributes: ["id", "title", "order_index", "is_preview"],
        },
        { model: User, as: "teacher", attributes: ["id", "name", "email"] },
      ],
      order: [[{ model: Lesson, as: "lessons" }, "order_index", "ASC"]],
    });

    if (!course) return res.status(404).json({ error: "Course not found" });

    let isEnrolled = false;
    if (req.user) {
      const access = await UserCourseAccess.findOne({
        where: {
          user_id: req.user.id,
          course_id: course.id,
          approval_status: "approved",
        },
      });
      isEnrolled = !!access;
    }

    res.json({ success: true, course, isEnrolled });
  } catch (error) {
    console.error("🔥 Get course error:", error);
    res.status(500).json({ error: "Failed to fetch course" });
  }
};

/**
 * Get full course for enrolled students
 */
exports.getEnrolledCourseBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    const course = await Course.findOne({
      where: { slug },
      include: [
        {
          model: Lesson,
          as: "lessons",
          attributes: ["id", "title", "content", "order_index", "is_preview"],
        },
        {
          model: User,
          as: "teacher",
          attributes: ["id", "name", "email"],
        },
      ],
      order: [[{ model: Lesson, as: "lessons" }, "order_index", "ASC"]],
    });

    if (!course) return res.status(404).json({ error: "Course not found" });

    const access = await UserCourseAccess.findOne({
      where: {
        course_id: course.id,
        user_id: req.user.id,
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
    res.status(500).json({ error: "Failed to fetch course" });
  }
};

/**
 * Get lessons by course ID
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
    res.status(500).json({ error: "Failed to fetch lessons" });
  }
};

/**
 * Get teacher's courses
 */
exports.getTeacherCourses = async (req, res) => {
  try {
    const filter =
      req.user.role === "teacher" ? { teacher_id: req.user.id } : {};
    const courses = await Course.findAll({
      where: filter,
      include: [
        { model: User, as: "teacher", attributes: ["id", "name", "email"] },
      ],
      order: [["created_at", "DESC"]],
    });
    res.json({ success: true, courses });
  } catch (error) {
    console.error("🔥 Fetch teacher courses error:", error);
    res.status(500).json({ error: "Failed to fetch courses" });
  }
};

/**
 * Admin: Get all courses
 */
exports.getAllCourses = async (req, res) => {
  try {
    const courses = await Course.findAll({
      include: [
        { model: User, as: "teacher", attributes: ["id", "name", "email"] },
      ],
      order: [["created_at", "DESC"]],
    });
    res.json({ success: true, courses });
  } catch (error) {
    console.error("🔥 Fetch all courses error:", error);
    res.status(500).json({ error: "Failed to fetch all courses" });
  }
};

