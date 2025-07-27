// const express = require("express");
// const fs = require("fs");
// const path = require("path");
// const multer = require("multer");
// const router = express.Router();
// const auth = require("../middleware/auth");
// const roleMiddleware = require("../middleware/roleMiddleware");
// const authenticateToken = require("../middleware/authenticateToken");
// const checkTeacherOrAdmin = require("../middleware/checkTeacherOrAdmin");
// const courseController = require("../controllers/courseController");
// const { Lesson, Course, User } = require("../models");

// // === Multer Setup ===
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     const uploadPath = path.join(__dirname, "..", "uploads");
//     if (!fs.existsSync(uploadPath))
//       fs.mkdirSync(uploadPath, { recursive: true });
//     cb(null, uploadPath);
//   },
//   filename: (req, file, cb) => {
//     const unique = `${Date.now()}-${file.originalname.replace(/\s+/g, "_")}`;
//     cb(null, unique);
//   },
// });
// const upload = multer({ storage, limits: { fileSize: 100 * 1024 * 1024 } });

// // === Routes ===

// // Create course
// router.post(
//   "/",
//   auth,
//   roleMiddleware(["teacher"]),
//   upload.fields([
//     { name: "thumbnail", maxCount: 1 },
//     { name: "introVideo", maxCount: 1 },
//     { name: "attachments", maxCount: 10 },
//   ]),
//   courseController.createCourse
// );

// // Fetch all courses
// router.get("/", auth, async (req, res) => {
//   try {
//     const filter =
//       req.user.role === "teacher" ? { teacherId: req.user.id } : {};
//     const courses = await Course.findAll({
//       where: filter,
//       include: [
//         { model: User, as: "teacher", attributes: ["id", "name", "email"] },
//       ],
//     });
//     res.json(courses);
//   } catch (err) {
//     res
//       .status(500)
//       .json({ error: "Failed to load courses", details: err.message });
//   }
// });

// // Public fetch by slug
// router.get("/slug/:slug", courseController.getCourseBySlug);

// // Lessons by course (auth required)
// router.get("/:courseId/lessons", auth, courseController.getLessonsByCourse);

// // Delete course
// router.delete(
//   "/:id",
//   auth,
//   roleMiddleware(["teacher", "admin"]),
//   async (req, res) => {
//     try {
//       const courseId = parseInt(req.params.id);
//       const course = await Course.findByPk(courseId);
//       if (!course) return res.status(404).json({ error: "Course not found" });
//       if (course.teacherId !== req.user.id && req.user.role !== "admin") {
//         return res.status(403).json({ error: "Unauthorized" });
//       }
//       await Lesson.destroy({ where: { courseId } });
//       await course.destroy();
//       res.json({ success: true, message: "Course and its lessons deleted" });
//     } catch (err) {
//       res
//         .status(500)
//         .json({ error: "Failed to delete course", details: err.message });
//     }
//   }
// );

// // Rename attachment
// router.patch(
//   "/:courseId/attachments/:index/rename",
//   authenticateToken,
//   checkTeacherOrAdmin,
//   async (req, res) => {
//     const { courseId, index } = req.params;
//     const { newName } = req.body;
//     if (!newName)
//       return res.status(400).json({ error: "New name is required" });

//     try {
//       const course = await Course.findByPk(courseId);
//       if (!course) return res.status(404).json({ error: "Course not found" });
//       if (req.user.role !== "admin" && req.user.id !== course.teacherId) {
//         return res.status(403).json({ error: "Unauthorized" });
//       }

//       const attachments = course.attachmentUrls || [];
//       const oldUrl = attachments[+index];
//       if (!oldUrl)
//         return res.status(404).json({ error: "Attachment not found" });

//       const oldPath = path.join(__dirname, "../", oldUrl);
//       const ext = path.extname(oldPath);
//       const newFileName = `${Date.now()}-${newName}${ext}`;
//       const newPath = path.join(__dirname, "../uploads", newFileName);
//       const newUrl = `/uploads/${newFileName}`;

//       fs.renameSync(oldPath, newPath);
//       attachments[+index] = newUrl;
//       course.attachmentUrls = attachments;
//       await course.save();

//       res.json({ success: true, updatedUrl: newUrl });
//     } catch (err) {
//       res.status(500).json({ error: "Failed to rename attachment" });
//     }
//   }
// );

// // Delete attachment
// router.patch(
//   "/:courseId/attachments/:index/delete",
//   authenticateToken,
//   checkTeacherOrAdmin,
//   async (req, res) => {
//     const { courseId, index } = req.params;
//     try {
//       const course = await Course.findByPk(courseId);
//       if (!course) return res.status(404).json({ error: "Course not found" });
//       if (req.user.role !== "admin" && req.user.id !== course.teacherId) {
//         return res.status(403).json({ error: "Unauthorized" });
//       }

//       const attachments = course.attachmentUrls || [];
//       const fileUrl = attachments[+index];
//       if (!fileUrl)
//         return res.status(404).json({ error: "Attachment not found" });

//       const filePath = path.join(__dirname, "../", fileUrl);
//       if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

//       attachments.splice(+index, 1);
//       course.attachmentUrls = attachments;
//       await course.save();

//       res.json({ success: true, message: "Attachment deleted" });
//     } catch (err) {
//       res.status(500).json({ error: "Failed to delete attachment" });
//     }
//   }
// );
// // Get course by ID
// router.get("/:id", auth, async (req, res) => {
//   try {
//     const courseId = parseInt(req.params.id);
//     const course = await Course.findByPk(courseId);

//     if (!course) {
//       return res.status(404).json({ error: "Course not found" });
//     }

//     // Optional: restrict access to course owner or admin
//     if (
//       req.user.role !== "admin" &&
//       course.teacherId !== req.user.id
//     ) {
//       return res.status(403).json({ error: "Forbidden" });
//     }

//     res.json(course);
//   } catch (err) {
//     console.error("Get course by ID error:", err.message);
//     res.status(500).json({ error: "Failed to fetch course" });
//   }
// });

// // Update course (title, description, etc.)
// router.patch(
//   "/:id",
//   auth,
//   roleMiddleware(["teacher", "admin"]),
//   upload.fields([
//     { name: "thumbnail", maxCount: 1 },
//     { name: "introVideo", maxCount: 1 },
//     { name: "attachments", maxCount: 10 },
//   ]),
//   async (req, res) => {
//     try {
//       const courseId = parseInt(req.params.id);
//       if (isNaN(courseId)) {
//         return res.status(400).json({ error: "Invalid course ID" });
//       }

//       const course = await Course.findByPk(courseId);
//       if (!course) {
//         return res.status(404).json({ error: "Course not found" });
//       }

//       // Only owner or admin can update
//       if (
//         req.user.role !== "admin" &&
//         req.user.id !== course.teacherId
//       ) {
//         return res.status(403).json({ error: "Unauthorized" });
//       }

//       // Extract fields
//       const {
//         title,
//         description,
//         category,
//         difficulty,
//         tags,
//       } = req.body;

//       // Update basic fields
//       if (title) course.title = title;
//       if (description) course.description = description;
//       if (category) course.category = category;
//       if (difficulty) course.difficulty = difficulty;
//       if (tags) course.tags = Array.isArray(tags) ? tags : tags.split(",");

//       // Handle files
//       const files = req.files || {};
//       if (files.thumbnail?.[0]) {
//         course.thumbnailUrl = `/uploads/${files.thumbnail[0].filename}`;
//       }
//       if (files.introVideo?.[0]) {
//         course.introVideoUrl = `/uploads/${files.introVideo[0].filename}`;
//       }
//       if (files.attachments?.length > 0) {
//         const uploaded = files.attachments.map((f) => `/uploads/${f.filename}`);
//         course.attachmentUrls = [...(course.attachmentUrls || []), ...uploaded];
//       }

//       await course.save();
//       res.json({ success: true, course });
//     } catch (err) {
//       console.error("Course update error:", err.message);
//       res.status(500).json({ error: "Failed to update course" });
//     }
//   }
// );

// module.exports = router;



const express = require("express");
const fs = require("fs");
const path = require("path");
const multer = require("multer");
const router = express.Router();
const auth = require("../middleware/auth");
const roleMiddleware = require("../middleware/roleMiddleware");
const authenticateToken = require("../middleware/authenticateToken");
const checkTeacherOrAdmin = require("../middleware/checkTeacherOrAdmin");
const courseController = require("../controllers/courseController");
const { Lesson, Course, User } = require("../models");

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

// Fetch all courses (authenticated)
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
    res.json({ success: true, courses });
  } catch (err) {
    res
      .status(500)
      .json({ error: "Failed to load courses", details: err.message });
  }
});

// Public fetch by slug
router.get("/slug/:slug", courseController.getCourseBySlug);

// Lessons by course (auth required)
router.get("/:courseId/lessons", auth, courseController.getLessonsByCourse);

// Delete course
router.delete(
  "/:id",
  auth,
  roleMiddleware(["teacher", "admin"]),
  async (req, res) => {
    try {
      const courseId = parseInt(req.params.id);
      const course = await Course.findByPk(courseId);
      if (!course) return res.status(404).json({ error: "Course not found" });

      if (course.teacherId !== req.user.id && req.user.role !== "admin") {
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

// Rename attachment
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

// Delete attachment
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

// ✅ FIXED: Get course by ID
router.get("/:id", auth, async (req, res) => {
  try {
    const courseId = parseInt(req.params.id);
    if (isNaN(courseId))
      return res.status(400).json({ error: "Invalid course ID" });

    const course = await Course.findByPk(courseId);

    if (!course) return res.status(404).json({ error: "Course not found" });

    if (req.user.role !== "admin" && course.teacherId !== req.user.id) {
      return res.status(403).json({ error: "Forbidden" });
    }

    res.json({ success: true, course });
  } catch (err) {
    console.error("Get course by ID error:", err.message);
    res.status(500).json({ error: "Failed to fetch course" });
  }
});

// Update course
router.patch(
  "/:id",
  auth,
  roleMiddleware(["teacher", "admin"]),
  upload.fields([
    { name: "thumbnail", maxCount: 1 },
    { name: "introVideo", maxCount: 1 },
    { name: "attachments", maxCount: 10 },
  ]),
  async (req, res) => {
    try {
      const courseId = parseInt(req.params.id);
      if (isNaN(courseId))
        return res.status(400).json({ error: "Invalid course ID" });

      const course = await Course.findByPk(courseId);
      if (!course) return res.status(404).json({ error: "Course not found" });

      if (req.user.role !== "admin" && req.user.id !== course.teacherId) {
        return res.status(403).json({ error: "Unauthorized" });
      }

      const { title, description, category, difficulty, tags } = req.body;

      if (title) course.title = title;
      if (description) course.description = description;
      if (category) course.category = category;
      if (difficulty) course.difficulty = difficulty;
      if (tags) course.tags = Array.isArray(tags) ? tags : tags.split(",");

      const files = req.files || {};
      if (files.thumbnail?.[0]) {
        course.thumbnailUrl = `/uploads/${files.thumbnail[0].filename}`;
      }
      if (files.introVideo?.[0]) {
        course.introVideoUrl = `/uploads/${files.introVideo[0].filename}`;
      }
      if (files.attachments?.length > 0) {
        const uploaded = files.attachments.map((f) => `/uploads/${f.filename}`);
        course.attachmentUrls = [...(course.attachmentUrls || []), ...uploaded];
      }

      await course.save();
      res.json({ success: true, course });
    } catch (err) {
      console.error("Course update error:", err.message);
      res.status(500).json({ error: "Failed to update course" });
    }
  }
);

module.exports = router;
