// const express = require("express");
// const router = express.Router();
// const path = require("path");
// const fs = require("fs");
// const multer = require("multer");
// const { Course, Lesson } = require("../models");
// const authMiddleware = require("../middleware/authMiddleware");
// const roleMiddleware = require("../middleware/roleMiddleware");
// const lessonController = require("../controllers/lessonController");

// // Configure Multer for uploads
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     const uploadPath = path.join(__dirname, "..", "Uploads");
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
//   fileFilter: (req, file, cb) => {
//     if (file.mimetype === "application/pdf") {
//       cb(null, true);
//     } else {
//       cb(new Error("Only PDF files are allowed"), false);
//     }
//   },
// });

// // Logger
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

// // GET: Lessons by courseId (grouped by unitName)
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

// // Optional alias route to support /lessons/course/:id
// router.get(
//   "/course/:courseId",
//   authMiddleware,
//   lessonController.getLessonsByCourse
// );

// // POST: Create a lesson (teacher or admin only)
// router.post(
//   "/:courseId/lessons",
//   authMiddleware,
//   roleMiddleware(["teacher", "admin"]),
//   upload.single("file"),
//   lessonController.createLesson
// );

// // PATCH: Toggle lesson preview
// router.patch(
//   "/:lessonId/toggle-preview",
//   authMiddleware,
//   lessonController.toggleLessonPreview
// );

// module.exports = router;





const express = require("express");
const router = express.Router();
const lessonController = require("../controllers/lessonController");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const upload = require("../routes/upload"); // Use upload.js middleware

// GET: Lessons by courseId (grouped by unitName)
router.get(
  "/:courseId/lessons",
  authMiddleware,
  lessonController.getLessonsByCourse
);

// GET: Units by courseId (teachers only)
router.get(
  "/:courseId/units",
  authMiddleware,
  roleMiddleware(["teacher", "admin"]),
  lessonController.getUnitsByCourse
);

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
  roleMiddleware(["teacher", "admin"]),
  lessonController.toggleLessonPreview
);

// PUT: Update lesson
router.put(
  "/:lessonId",
  authMiddleware,
  roleMiddleware(["teacher", "admin"]),
  lessonController.updateLesson
);

// DELETE: Delete lesson
router.delete(
  "/:lessonId",
  authMiddleware,
  roleMiddleware(["teacher", "admin"]),
  lessonController.deleteLesson
);

module.exports = router;