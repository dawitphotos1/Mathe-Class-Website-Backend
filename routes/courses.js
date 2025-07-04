// const express = require("express");
// const fs = require("fs");
// const path = require("path");
// const multer = require("multer");
// const { Course, User, Lesson } = require("../models");
// const auth = require("../middleware/auth");
// const roleMiddleware = require("../middleware/roleMiddleware");

// const router = express.Router();

// // 📦 Slug helper
// const slugify = (text) => text.toLowerCase().replace(/\s+/g, "-").slice(0, 100);

// // 🗂️ File upload storage (disk-based)
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     const uploadPath = path.join(__dirname, "..", "uploads");
//     if (!fs.existsSync(uploadPath)) {
//       fs.mkdirSync(uploadPath, { recursive: true });
//     }
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

// // 📝 Logger utility
// const appendToLogFile = (message) => {
//   const logDir = path.join(__dirname, "..", "logs");
//   const logFile = path.join(logDir, "courses.log");
//   try {
//     if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true });
//     fs.appendFileSync(logFile, `${new Date().toISOString()} - ${message}\n`);
//   } catch (err) {
//     console.error("❌ Log error:", err.message);
//   }
// };

// // ✅ POST /api/v1/courses
// router.post(
//   "/",
//   auth,
//   roleMiddleware(["teacher"]),
//   upload.fields([
//     { name: "thumbnail", maxCount: 1 },
//     { name: "introVideo", maxCount: 1 },
//     { name: "attachments", maxCount: 10 },
//   ]),
//   async (req, res) => {
//     try {
//       const { title, description, category } = req.body;
//       const teacherId = req.user?.id;

//       if (!title || !description || !category) {
//         return res.status(400).json({ error: "Missing required fields" });
//       }

//       const slug = slugify(title);
//       const thumbnail = req.files?.thumbnail?.[0];
//       const introVideo = req.files?.introVideo?.[0];
//       const attachments = req.files?.attachments || [];

//       const thumbnailUrl = thumbnail ? `/uploads/${thumbnail.filename}` : null;
//       const introVideoUrl = introVideo
//         ? `/uploads/${introVideo.filename}`
//         : null;
//       const attachmentUrls = attachments.map(
//         (file) => `/uploads/${file.filename}`
//       );

//       const newCourse = await Course.create({
//         title,
//         description,
//         category,
//         slug,
//         teacherId,
//         thumbnail: thumbnailUrl,
//         introVideoUrl,
//         attachmentUrls, // stored as ARRAY
//       });

//       appendToLogFile(`✅ Course created: ${title} by user ${teacherId}`);
//       return res.status(201).json({ success: true, course: newCourse });
//     } catch (err) {
//       console.error("❌ Create course error:", err);
//       appendToLogFile(`❌ Create course error: ${err.message}`);
//       return res.status(500).json({
//         success: false,
//         error: "Failed to create course",
//         details: err.message,
//       });
//     }
//   }
// );

// // ✅ GET /api/v1/courses/slug/:slug
// router.get("/slug/:slug", async (req, res) => {
//   try {
//     const { slug } = req.params;
//     const course = await Course.findOne({
//       where: { slug },
//       include: [
//         { model: User, as: "teacher", attributes: ["id", "name", "email"] },
//         { model: Lesson, as: "lessons" },
//       ],
//     });

//     if (!course) {
//       return res
//         .status(404)
//         .json({ success: false, error: "Course not found" });
//     }

//     const grouped = {};
//     course.lessons.forEach((lesson) => {
//       const unitName = lesson.unitName || "Uncategorized";
//       if (!grouped[unitName]) grouped[unitName] = [];
//       grouped[unitName].push({
//         id: lesson.id,
//         title: lesson.title,
//         contentUrl: lesson.contentUrl,
//         videoUrl: lesson.videoUrl,
//       });
//     });

//     const units = Object.entries(grouped).map(([unitName, lessons]) => ({
//       unitName,
//       lessons,
//     }));

//     res.json({
//       success: true,
//       id: course.id,
//       title: course.title,
//       slug: course.slug,
//       category: course.category,
//       description: course.description,
//       thumbnail: course.thumbnail,
//       introVideoUrl: course.introVideoUrl,
//       materialUrl: course.attachmentUrls,
//       teacher: course.teacher,
//       units,
//     });
//   } catch (err) {
//     console.error("❌ Error fetching course by slug:", err);
//     res.status(500).json({
//       success: false,
//       error: "Failed to fetch course",
//       details: err.message,
//     });
//   }
// });

// // ✅ GET /api/v1/courses
// router.get("/", async (req, res) => {
//   try {
//     const where = {};
//     if (req.query.category) {
//       where.category = req.query.category;
//     }

//     const courses = await Course.findAll({
//       where,
//       include: [{ model: User, as: "teacher", attributes: ["id", "name"] }],
//       order: [["createdAt", "DESC"]],
//     });

//     res.json({ success: true, courses });
//   } catch (err) {
//     console.error("❌ Error listing courses:", err);
//     res.status(500).json({ success: false, error: "Failed to list courses" });
//   }
// });

// module.exports = router;




const express = require("express");
const fs = require("fs");
const path = require("path");
const multer = require("multer");
const { Course, User, Lesson } = require("../models");
const auth = require("../middleware/auth");
const roleMiddleware = require("../middleware/roleMiddleware");

const router = express.Router();

const slugify = (text) => text.toLowerCase().replace(/\s+/g, "-").slice(0, 100);

// 🔁 Auto-generate unique slug
const generateUniqueSlug = async (title) => {
  const baseSlug = slugify(title);
  let slug = baseSlug;
  let counter = 1;

  while (await Course.findOne({ where: { slug } })) {
    slug = `${baseSlug}-${counter++}`;
  }

  return slug;
};

// 🗂️ File upload config
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

// ✅ Logger
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

// ✅ POST /api/v1/courses
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

      const slug = await generateUniqueSlug(title);
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
        slug,
        teacherId,
        thumbnail: thumbnailUrl,
        introVideoUrl,
        attachmentUrls,
      });

      appendToLogFile(`✅ Course created: ${title} by user ${teacherId}`);
      return res.status(201).json({ success: true, course: newCourse });
    } catch (err) {
      console.error("❌ Create course error:", err);
      appendToLogFile(`❌ Create course error: ${err.message}`);
      return res.status(500).json({
        success: false,
        error: "Failed to create course",
        details: err.message,
      });
    }
  }
);

module.exports = router;
