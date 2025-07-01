// // ✅ FULL UPDATED `routes/courses.js` with thumbnail, video, and category support
// const express = require("express");
// const { Course, User, Lesson } = require("../models");
// const router = express.Router();
// const fs = require("fs");
// const path = require("path");
// const multer = require("multer");
// const auth = require("../middleware/auth");
// const roleMiddleware = require("../middleware/roleMiddleware");
// // ✅ File Upload Storage Config
// const upload = multer({
//   dest: "uploads/",
//   limits: { fileSize: 50 * 1024 * 1024 }, // 50MB max
// });

// function appendToLogFile(message) {
//   const logDir = path.join(__dirname, "..", "logs");
//   const logFilePath = path.join(logDir, "courses.log");
//   try {
//     if (!fs.existsSync(logDir)) {
//       fs.mkdirSync(logDir, { recursive: true });
//     }
//     fs.appendFileSync(logFilePath, `${message}\n`);
//   } catch (err) {
//     console.error("Failed to write to log file:", err);
//   }
// }

// // ✅ Create Course API with File Upload
// router.post(
//   "/",
//   auth, // ✅ Enforces JWT
//   roleMiddleware(["teacher"]), // ✅ Ensures only teachers can create courses
//   upload.fields([
//     { name: "thumbnail", maxCount: 1 },
//     { name: "introVideo", maxCount: 1 },
//   ]),
//   async (req, res) => {
//     try {
//       console.log("📥 Incoming create course request");
//       console.log("req.body:", req.body);
//       console.log("req.files:", req.files);
//       console.log("req.user:", req.user);

//       const { title, description, price, category } = req.body;
//       console.log("Incoming course data:", {
//         title,
//         description,
//         price,
//         category,
//         teacherId: req.user?.id,
//       });
      
//       const userId = req.user?.id;

//       if (!userId) {
//         return res.status(401).json({ success: false, error: "Unauthorized" });
//       }

//       const thumbnailFile = req.files?.thumbnail?.[0];
//       const introVideoFile = req.files?.introVideo?.[0];

//       const thumbnailUrl = thumbnailFile
//         ? `/uploads/${thumbnailFile.filename}`
//         : null;
//       const introVideoUrl = introVideoFile
//         ? `/uploads/${introVideoFile.filename}`
//         : null;

//       const newCourse = await Course.create({
//         title,
//         description,
//         price,
//         category,
//         teacherId: userId,
//         thumbnail: thumbnailUrl,
//         introVideoUrl,
//       });

//       appendToLogFile(
//         `[SUCCESS] ${new Date().toISOString()} - Created course ${title}`
//       );

//       res.status(201).json({ success: true, course: newCourse });
//     } catch (err) {
//       console.error("Error creating course:", err);
//       appendToLogFile(
//         `[ERROR] ${new Date().toISOString()} - Create course: ${err.message}`
//       );
//       res.status(500).json({
//         success: false,
//         error: "Failed to create course",
//         details: err.message,
//       });
//     }
//   }
// );

// // GET /api/v1/courses — list all courses
// router.get("/", async (req, res) => {
//   try {
//     const courses = await Course.findAll({
//       attributes: ["id", "title", "description", "price", "slug"],
//     });

//     const formattedCourses = courses.map((course) => ({
//       id: course.id,
//       title: course.title,
//       slug: course.slug,
//       description: course.description,
//       price: Number(course.price),
//     }));

//     appendToLogFile(
//       `[SUCCESS] ${new Date().toISOString()} - Fetched ${
//         courses.length
//       } courses`
//     );
//     res.json({ success: true, courses: formattedCourses });
//   } catch (err) {
//     console.error("Error fetching courses:", err);
//     appendToLogFile(
//       `[ERROR] ${new Date().toISOString()} - Fetch all courses: ${err.message}`
//     );
//     res.status(500).json({
//       success: false,
//       error: "Failed to fetch courses",
//       details: err.message,
//     });
//   }
// });

// // GET /api/v1/courses/slug/:slug — fetch course by slug (for viewer/enrollment)
// router.get("/slug/:slug", async (req, res) => {
//   try {
//     const course = await Course.findOne({
//       where: { slug: req.params.slug },
//       include: [
//         {
//           model: User,
//           as: "teacher",
//           attributes: ["id", "name", "email", "profileImage"],
//         },
//         {
//           model: Lesson,
//           as: "lessons",
//           attributes: [
//             "id",
//             "title",
//             "content",
//             "contentType",
//             "contentUrl",
//             "videoUrl",
//             "isUnitHeader",
//             "unitId",
//             "orderIndex",
//           ],
//           order: [["orderIndex", "ASC"]],
//         },
//       ],
//       order: [[{ model: Lesson, as: "lessons" }, "orderIndex", "ASC"]],
//     });

//     if (!course) {
//       appendToLogFile(
//         `[ERROR] ${new Date().toISOString()} - Course not found for slug: ${
//           req.params.slug
//         }`
//       );
//       return res
//         .status(404)
//         .json({ success: false, error: "Course not found" });
//     }

//     const courseData = course.toJSON();

//     // Group lessons into units based on isUnitHeader and unitId
//     const lessons = courseData.lessons || [];
//     const units = [];
//     const unitMap = {};

//     for (const lesson of lessons) {
//       if (lesson.isUnitHeader) {
//         unitMap[lesson.id] = {
//           unitName: lesson.title,
//           lessons: [],
//         };
//         units.push(unitMap[lesson.id]);
//       } else if (lesson.unitId && unitMap[lesson.unitId]) {
//         unitMap[lesson.unitId].lessons.push({
//           id: lesson.id,
//           title: lesson.title,
//           content: lesson.content,
//           contentType: lesson.contentType,
//           contentUrl: lesson.contentUrl,
//           videoUrl: lesson.videoUrl,
//         });
//       }
//     }

//     const formatted = {
//       success: true,
//       id: courseData.id,
//       title: courseData.title,
//       slug: courseData.slug,
//       price: Number(courseData.price),
//       description: courseData.description,
//       teacher: {
//         name: courseData.teacher?.name || "Unknown Instructor",
//         profileImage: courseData.teacher?.profileImage || null,
//       },
//       units,
//     };

//     appendToLogFile(
//       `[SUCCESS] ${new Date().toISOString()} - Fetched course: ${
//         req.params.slug
//       }`
//     );
//     res.json(formatted);
//   } catch (err) {
//     console.error("Error fetching course by slug:", err);
//     appendToLogFile(
//       `[ERROR] ${new Date().toISOString()} - Fetch course by slug ${
//         req.params.slug
//       }: ${err.message}`
//     );
//     res.status(500).json({
//       success: false,
//       error: "Failed to fetch course",
//       details: err.message,
//     });
//   }
// });

// // GET /api/v1/courses/:id — fetch course by ID
// router.get("/:id", async (req, res) => {
//   try {
//     const courseId = parseInt(req.params.id, 10);
//     if (isNaN(courseId)) {
//       appendToLogFile(
//         `[ERROR] ${new Date().toISOString()} - Invalid course ID: ${
//           req.params.id
//         }`
//       );
//       return res
//         .status(400)
//         .json({ success: false, error: "Invalid course ID" });
//     }

//     const course = await Course.findByPk(courseId, {
//       include: [
//         {
//           model: User,
//           as: "teacher",
//           attributes: ["id", "name", "email"],
//         },
//         {
//           model: Lesson,
//           as: "lessons",
//           attributes: [
//             "id",
//             "title",
//             "content",
//             "contentType",
//             "contentUrl",
//             "videoUrl",
//             "isUnitHeader",
//             "unitId",
//             "orderIndex",
//           ],
//           order: [["orderIndex", "ASC"]],
//         },
//       ],
//     });

//     if (!course) {
//       appendToLogFile(
//         `[ERROR] ${new Date().toISOString()} - Course not found for ID: ${courseId}`
//       );
//       return res
//         .status(404)
//         .json({ success: false, error: "Course not found" });
//     }

//     const courseData = course.toJSON();

//     // Group lessons into units
//     const lessons = courseData.lessons || [];
//     const units = [];
//     const unitMap = {};

//     for (const lesson of lessons) {
//       if (lesson.isUnitHeader) {
//         unitMap[lesson.id] = {
//           unitName: lesson.title,
//           lessons: [],
//         };
//         units.push(unitMap[lesson.id]);
//       } else if (lesson.unitId && unitMap[lesson.unitId]) {
//         unitMap[lesson.unitId].lessons.push({
//           id: lesson.id,
//           title: lesson.title,
//           content: lesson.content,
//           contentType: lesson.contentType,
//           contentUrl: lesson.contentUrl,
//           videoUrl: lesson.videoUrl,
//         });
//       }
//     }

//     const formatted = {
//       success: true,
//       id: courseData.id,
//       title: courseData.title,
//       slug: courseData.slug,
//       price: Number(courseData.price),
//       description: courseData.description || "No description available",
//       teacher: {
//         name: courseData.teacher?.name || "Unknown",
//       },
//       units,
//       unitCount: units.length,
//       lessonCount: units.reduce(
//         (count, unit) => count + unit.lessons.length,
//         0
//       ),
//     };

//     appendToLogFile(
//       `[SUCCESS] ${new Date().toISOString()} - Fetched course by ID: ${courseId}`
//     );
//     res.json(formatted);
//   } catch (err) {
//     console.error("Error fetching course by ID:", err);
//     appendToLogFile(
//       `[ERROR] ${new Date().toISOString()} - Fetch course by ID ${
//         req.params.id
//       }: ${err.message}`
//     );
//     res.status(500).json({
//       success: false,
//       error: "Failed to fetch course",
//       details: err.message,
//     });
//   }
// });

// // GET /api/v1/courses/:id/lessons — fetch lessons for a course
// router.get("/:id/lessons", async (req, res) => {
//   try {
//     const courseId = parseInt(req.params.id, 10);
//     if (isNaN(courseId)) {
//       appendToLogFile(
//         `[ERROR] ${new Date().toISOString()} - Invalid course ID: ${
//           req.params.id
//         }`
//       );
//       return res
//         .status(400)
//         .json({ success: false, error: "Invalid course ID" });
//     }

//     const course = await Course.findByPk(courseId);
//     if (!course) {
//       appendToLogFile(
//         `[ERROR] ${new Date().toISOString()} - Course not found for ID: ${courseId}`
//       );
//       return res
//         .status(404)
//         .json({ success: false, error: "Course not found" });
//     }

//     const lessons = await Lesson.findAll({
//       where: { courseId },
//       attributes: [
//         "id",
//         "title",
//         "content",
//         "contentType",
//         "contentUrl",
//         "videoUrl",
//         "isUnitHeader",
//         "unitId",
//         "orderIndex",
//       ],
//       order: [["orderIndex", "ASC"]],
//     });

//     // Group lessons into units
//     const units = [];
//     const unitMap = {};

//     for (const lesson of lessons) {
//       if (lesson.isUnitHeader) {
//         unitMap[lesson.id] = {
//           unitName: lesson.title,
//           lessons: [],
//         };
//         units.push(unitMap[lesson.id]);
//       } else if (lesson.unitId && unitMap[lesson.unitId]) {
//         unitMap[lesson.unitId].lessons.push({
//           id: lesson.id,
//           title: lesson.title,
//           content: lesson.content,
//           contentType: lesson.contentType,
//           contentUrl: lesson.contentUrl,
//           videoUrl: lesson.videoUrl,
//         });
//       }
//     }

//     appendToLogFile(
//       `[SUCCESS] ${new Date().toISOString()} - Fetched lessons for course ID: ${courseId}`
//     );
//     res.json({
//       success: true,
//       courseId,
//       units,
//     });
//   } catch (err) {
//     console.error("Error fetching lessons for course:", err);
//     appendToLogFile(
//       `[ERROR] ${new Date().toISOString()} - Fetch lessons for course ${
//         req.params.id
//       }: ${err.message}`
//     );
//     res.status(500).json({
//       success: false,
//       error: "Failed to fetch lessons",
//       details: err.message,
//     });
//   }
// });

// module.exports = router;



const express = require("express");
const router = express.Router();
const fs = require("fs");
const path = require("path");
const multer = require("multer");
const { Course, User, Lesson } = require("../models");
const auth = require("../middleware/auth");
const roleMiddleware = require("../middleware/roleMiddleware");

// Set up storage engine
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = "uploads/";
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const unique = `${Date.now()}-${file.originalname.replace(/\s+/g, "_")}`;
    cb(null, unique);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB
});

// Logging helper
const appendToLogFile = (message) => {
  const logDir = path.join(__dirname, "..", "logs");
  const logFile = path.join(logDir, "courses.log");
  try {
    if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true });
    fs.appendFileSync(logFile, `${new Date().toISOString()} - ${message}\n`);
  } catch (err) {
    console.error("❌ Log error:", err.message);
  }
};

// POST /api/v1/courses
router.post(
  "/",
  auth,
  roleMiddleware(["teacher"]),
  upload.fields([
    { name: "thumbnail", maxCount: 1 },
    { name: "introVideo", maxCount: 1 },
    { name: "attachments", maxCount: 10 },
  ]),
  async (req, res) => {
    try {
      const { title, description, category } = req.body;
      const teacherId = req.user?.id;

      if (!title || !description || !category) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      const thumbnail = req.files?.thumbnail?.[0];
      const introVideo = req.files?.introVideo?.[0];
      const attachments = req.files?.attachments || [];

      const thumbnailUrl = thumbnail ? `/uploads/${thumbnail.filename}` : null;
      const introVideoUrl = introVideo
        ? `/uploads/${introVideo.filename}`
        : null;

      const attachmentUrls = attachments.map(
        (file) => `/uploads/${file.filename}`
      );

      const newCourse = await Course.create({
        title,
        description,
        category,
        teacherId,
        thumbnail: thumbnailUrl,
        introVideoUrl,
        attachmentUrls: JSON.stringify(attachmentUrls),
      });

      appendToLogFile(`✅ Created course: ${title}`);
      res.status(201).json({ success: true, course: newCourse });
    } catch (err) {
      console.error("❌ Create course error:", err);
      appendToLogFile(`❌ Error creating course: ${err.message}`);
      res.status(500).json({
        success: false,
        error: "Failed to create course",
        details: err.message,
      });
    }
  }
);

module.exports = router;
