const express = require("express");
const fs = require("fs");
const path = require("path");
const multer = require("multer");
const router = express.Router();
const { Lesson, Course, User, UserCourseAccess } = require("../models");
const auth = require("../middleware/auth");
const roleMiddleware = require("../middleware/roleMiddleware");
const authenticateToken = require("../middleware/authenticateToken");
const checkTeacherOrAdmin = require("../middleware/checkTeacherOrAdmin");

// === Multer Setup ===
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

// ✅ Create course
router.post(
  "/",
  auth,
  roleMiddleware(["teacher"]),
  upload.fields([
    { name: "thumbnail", maxCount: 1 },
    { name: "introVideo", maxCount: 1 },
    { name: "attachments", maxCount: 10 },
  ]),
  require("../controllers/courseController").createCourse
);

// ✅ Fetch courses for logged-in user (teacher/admin)
router.get("/", auth, async (req, res) => {
  try {
    const filter =
      req.user.role === "teacher" ? { teacherId: req.user.id } : {};
    const courses = await Course.findAll({
      where: filter,
      include: [
        { model: User, as: "teacher", attributes: ["id", "name", "email"] },
      ],
    });
    res.json(courses);
  } catch (err) {
    res
      .status(500)
      .json({ error: "Failed to load courses", details: err.message });
  }
});

// ✅ Fetch full course by slug (requires enrollment)
router.get("/slug/:slug", auth, async (req, res) => {
  try {
    const { slug } = req.params;
    const userId = req.user?.id;

    const course = await Course.findOne({
      where: { slug },
      include: [
        { model: Lesson, as: "lessons", order: [["orderIndex", "ASC"]] },
        { model: User, as: "teacher", attributes: ["id", "name", "email"] },
      ],
    });

    if (!course)
      return res
        .status(404)
        .json({ success: false, error: "Course not found" });

    const access = await UserCourseAccess.findOne({
      where: { courseId: course.id, userId, approved: true },
    });

    if (!access) {
      return res.status(403).json({ success: false, error: "Access denied" });
    }

    res.json({ success: true, course });
  } catch (err) {
    res
      .status(500)
      .json({
        success: false,
        error: "Failed to fetch course",
        details: err.message,
      });
  }
});

// ✅ Get lessons by course (auth required)
router.get(
  "/:courseId/lessons",
  auth,
  require("../controllers/courseController").getLessonsByCourse
);

// ✅ Delete course
router.delete(
  "/:id",
  auth,
  roleMiddleware(["teacher", "admin"]),
  async (req, res) => {
    try {
      const courseId = parseInt(req.params.id);
      const course = await Course.findByPk(courseId);
      if (!course) return res.status(404).json({ error: "Course not found" });

      if (req.user.role !== "admin" && course.teacherId !== req.user.id) {
        return res.status(403).json({ error: "Unauthorized" });
      }

      await Lesson.destroy({ where: { courseId } });
      await course.destroy();

      res.json({ success: true, message: "Course and its lessons deleted" });
    } catch (err) {
      res
        .status(500)
        .json({ error: "Failed to delete course", details: err.message });
    }
  }
);

// ✅ Rename course attachment
router.patch(
  "/:courseId/attachments/:index/rename",
  authenticateToken,
  checkTeacherOrAdmin,
  async (req, res) => {
    const { courseId, index } = req.params;
    const { newName } = req.body;
    if (!newName)
      return res.status(400).json({ error: "New name is required" });

    try {
      const course = await Course.findByPk(courseId);
      if (!course) return res.status(404).json({ error: "Course not found" });

      if (req.user.role !== "admin" && req.user.id !== course.teacherId) {
        return res.status(403).json({ error: "Unauthorized" });
      }

      const attachments = course.attachmentUrls || [];
      const oldUrl = attachments[+index];
      if (!oldUrl)
        return res.status(404).json({ error: "Attachment not found" });

      const oldPath = path.join(__dirname, "../", oldUrl);
      const ext = path.extname(oldPath);
      const newFileName = `${Date.now()}-${newName}${ext}`;
      const newPath = path.join(__dirname, "../uploads", newFileName);
      const newUrl = `/uploads/${newFileName}`;

      fs.renameSync(oldPath, newPath);
      attachments[+index] = newUrl;
      course.attachmentUrls = attachments;
      await course.save();

      res.json({ success: true, updatedUrl: newUrl });
    } catch (err) {
      res.status(500).json({ error: "Failed to rename attachment" });
    }
  }
);

// ✅ Delete course attachment
router.patch(
  "/:courseId/attachments/:index/delete",
  authenticateToken,
  checkTeacherOrAdmin,
  async (req, res) => {
    const { courseId, index } = req.params;

    try {
      const course = await Course.findByPk(courseId);
      if (!course) return res.status(404).json({ error: "Course not found" });

      if (req.user.role !== "admin" && req.user.id !== course.teacherId) {
        return res.status(403).json({ error: "Unauthorized" });
      }

      const attachments = course.attachmentUrls || [];
      const fileUrl = attachments[+index];
      if (!fileUrl)
        return res.status(404).json({ error: "Attachment not found" });

      const filePath = path.join(__dirname, "../", fileUrl);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

      attachments.splice(+index, 1);
      course.attachmentUrls = attachments;
      await course.save();

      res.json({ success: true, message: "Attachment deleted" });
    } catch (err) {
      res.status(500).json({ error: "Failed to delete attachment" });
    }
  }
);

module.exports = router;
