
// const express = require("express");
// const router = express.Router();
// const path = require("path");
// const fs = require("fs");
// const multer = require("multer");

// const { Course, Lesson } = require("../models");
// const authMiddleware = require("../middleware/authMiddleware");
// const roleMiddleware = require("../middleware/roleMiddleware");
// const lessonController = require("../controllers/lessonController");

// // ✅ PATCH: Toggle lesson preview
// router.patch(
//   "/:lessonId/toggle-preview",
//   authMiddleware,
//   lessonController.toggleLessonPreview
// );

// // ✅ Configure Multer for uploads
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

// const upload = multer({
//   storage,
//   limits: { fileSize: 100 * 1024 * 1024 }, // 100MB max
// });

// // ✅ Logger
// const appendToLogFile = (message) => {
//   const logDir = path.join(__dirname, "..", "logs");
//   const logFile = path.join(logDir, "lessons.log");
//   try {
//     if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true });
//     fs.appendFileSync(logFile, `${new Date().toISOString()} - ${message}\n`);
//   } catch (err) {
//     console.error("❌ Log error:", err.message);
//   }
// };

// // ✅ GET: Lessons by courseId (grouped by unitName)
// router.get("/:courseId/lessons", authMiddleware, async (req, res) => {
//   try {
//     const courseId = req.params.courseId;
//     const course = await Course.findByPk(courseId);
//     if (!course) {
//       appendToLogFile(`❌ Course not found for ID: ${courseId}`);
//       return res
//         .status(404)
//         .json({ success: false, error: "Course not found" });
//     }

    
//     // ✅ Optional alias route to support /lessons/course/:id
//     router.get(
//       "/course/:courseId",
//       authMiddleware,
//       lessonController.getLessonsByCourse
//     );


//     const lessons = await Lesson.findAll({
//       where: { courseId },
//       order: [["orderIndex", "ASC"]],
//     });

//     const unitMap = {};
//     lessons.forEach((lesson) => {
//       const unit = lesson.unitName || "General";
//       if (!unitMap[unit]) unitMap[unit] = { unitName: unit, lessons: [] };
//       unitMap[unit].lessons.push(lesson);
//     });

//     appendToLogFile(
//       `✅ Fetched ${lessons.length} lessons for course ID: ${courseId}`
//     );
//     res.json({ success: true, units: Object.values(unitMap) });
//   } catch (error) {
//     appendToLogFile(`❌ Fetch lessons error: ${error.message}`);
//     res.status(500).json({
//       success: false,
//       error: "Failed to fetch lessons",
//       details: error.message,
//     });
//   }
// });

// // ✅ POST: Create a lesson (teacher or admin only)
// router.post(
//   "/:courseId/lessons",
//   authMiddleware,
//   roleMiddleware(["teacher", "admin"]),
//   upload.fields([
//     { name: "contentFile", maxCount: 1 },
//     { name: "videoFile", maxCount: 1 },
//   ]),
//   async (req, res) => {
//     try {
//       const { courseId } = req.params;
//       const { title, unitName, content, order } = req.body;

//       if (!title || !unitName) {
//         return res
//           .status(400)
//           .json({ success: false, error: "Missing title or unitName" });
//       }

//       const course = await Course.findByPk(courseId);
//       if (!course) {
//         appendToLogFile(`❌ Course not found: ${courseId}`);
//         return res
//           .status(404)
//           .json({ success: false, error: "Course not found" });
//       }

//       if (course.teacherId !== req.user.id && req.user.role !== "admin") {
//         return res.status(403).json({ error: "Unauthorized to create lesson" });
//       }

//       const contentFile = req.files?.contentFile?.[0];
//       const videoFile = req.files?.videoFile?.[0];

//       const lesson = await Lesson.create({
//         title,
//         unitName,
//         content,
//         orderIndex: parseInt(order) || 0,
//         courseId,
//         contentUrl: contentFile ? `/uploads/${contentFile.filename}` : null,
//         videoUrl: videoFile ? `/uploads/${videoFile.filename}` : null,
//         userId: req.user.id,
//       });

//       appendToLogFile(`✅ Lesson created: ${title} for course ${courseId}`);
//       res.status(201).json({ success: true, lesson });
//     } catch (error) {
//       appendToLogFile(`❌ Create lesson error: ${error.message}`);
//       res.status(500).json({
//         success: false,
//         error: "Failed to create lesson",
//         details: error.message,
//       });
//     }
//   }
// );

// module.exports = router;






const express = require("express");
const router = express.Router();
const path = require("path");
const fs = require("fs");
const multer = require("multer");
const { Course, Lesson } = require("../models");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const lessonController = require("../controllers/lessonController");

// Configure Multer for uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, "..", "Uploads");
    if (!fs.existsSync(uploadPath))
      fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const unique = `${Date.now()}-${file.originalname.replace(/\s+/g, "_")}`;
    cb(null, unique);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB max
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "application/pdf") {
      cb(null, true);
    } else {
      cb(new Error("Only PDF files are allowed"), false);
    }
  },
});

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

// GET: Lessons by courseId (grouped by unitName)
router.get("/:courseId/lessons", authMiddleware, async (req, res) => {
  try {
    const courseId = req.params.courseId;
    const course = await Course.findByPk(courseId);
    if (!course) {
      appendToLogFile(`❌ Course not found for ID: ${courseId}`);
      return res
        .status(404)
        .json({ success: false, error: "Course not found" });
    }

    const lessons = await Lesson.findAll({
      where: { courseId },
      order: [["orderIndex", "ASC"]],
    });

    const unitMap = {};
    lessons.forEach((lesson) => {
      const unit = lesson.unitName || "General";
      if (!unitMap[unit]) unitMap[unit] = { unitName: unit, lessons: [] };
      unitMap[unit].lessons.push(lesson);
    });

    appendToLogFile(
      `✅ Fetched ${lessons.length} lessons for course ID: ${courseId}`
    );
    res.json({ success: true, units: Object.values(unitMap) });
  } catch (error) {
    appendToLogFile(`❌ Fetch lessons error: ${error.message}`);
    res.status(500).json({
      success: false,
      error: "Failed to fetch lessons",
      details: error.message,
    });
  }
});

// Optional alias route to support /lessons/course/:id
router.get(
  "/course/:courseId",
  authMiddleware,
  lessonController.getLessonsByCourse
);

// POST: Create a lesson (teacher or admin only)
router.post(
  "/:courseId/lessons",
  authMiddleware,
  roleMiddleware(["teacher", "admin"]),
  upload.single("file"),
  lessonController.createLesson
);

// PATCH: Toggle lesson preview
router.patch(
  "/:lessonId/toggle-preview",
  authMiddleware,
  lessonController.toggleLessonPreview
);

module.exports = router;