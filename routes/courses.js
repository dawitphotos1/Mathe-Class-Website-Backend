// const express = require("express");
// const fs = require("fs");
// const path = require("path");
// const multer = require("multer");
// const { Course, Lesson, User } = require("../models");
// const auth = require("../middleware/auth");
// const roleMiddleware = require("../middleware/roleMiddleware");

// const router = express.Router();

// const slugify = (text) => text.toLowerCase().replace(/\s+/g, "-").slice(0, 100);

// const generateUniqueSlug = async (title) => {
//   const baseSlug = slugify(title);
//   let slug = baseSlug;
//   let counter = 1;
//   while (await Course.findOne({ where: { slug } })) {
//     slug = `${baseSlug}-${counter++}`;
//   }
//   return slug;
// };

// // File upload config
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

// // Logger
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

// // ✅ Create Course
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

//       const slug = await generateUniqueSlug(title);
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
//         attachmentUrls,
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

// // ✅ Get All Courses
// router.get("/", async (req, res) => {
//   try {
//     const courses = await Course.findAll({
//       include: [
//         { model: User, as: "teacher", attributes: ["id", "name", "email"] },
//       ],
//     });
//     res.status(200).json(courses);
//   } catch (err) {
//     console.error("❌ Fetch courses error:", err.message);
//     appendToLogFile(`❌ Fetch courses error: ${err.message}`);
//     res.status(500).json({ error: "Failed to load courses" });
//   }
// });

// // ✅ Get Course by Slug (with Lessons)
// router.get("/slug/:slug", async (req, res) => {
//   try {
//     const { slug } = req.params;
//     const course = await Course.findOne({
//       where: { slug },
//       include: [
//         {
//           model: Lesson,
//           as: "lessons",
//           separate: true,
//           order: [["orderIndex", "ASC"]],
//         },
//         {
//           model: User,
//           as: "teacher",
//           attributes: ["id", "name", "email"],
//         },
//       ],
//     });

//     if (!course) {
//       appendToLogFile(`❌ Course not found for slug: ${slug}`);
//       return res
//         .status(404)
//         .json({ success: false, error: "Course not found" });
//     }

//     appendToLogFile(`✅ Fetched course: ${course.title} (slug: ${slug})`);
//     res.status(200).json(course);
//   } catch (error) {
//     console.error("❌ Fetch course by slug error:", error.message);
//     appendToLogFile(`❌ Fetch course by slug error: ${error.message}`);
//     res.status(500).json({
//       success: false,
//       error: "Failed to fetch course",
//       details: error.message,
//     });
//   }
// });


// module.exports = router;



const express = require("express");
const fs = require("fs");
const path = require("path");
const multer = require("multer");
const { Course, Lesson, User } = require("../models");
const auth = require("../middleware/auth");
const roleMiddleware = require("../middleware/roleMiddleware");

const router = express.Router();

const slugify = (text) => text.toLowerCase().replace(/\s+/g, "-").slice(0, 100);

const generateUniqueSlug = async (title) => {
  const baseSlug = slugify(title);
  let slug = baseSlug;
  let counter = 1;
  while (await Course.findOne({ where: { slug } })) {
    slug = `${baseSlug}-${counter++}`;
  }
  return slug;
};

// File Upload Config
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

// Logger
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
      res.status(201).json({ success: true, course: newCourse });
    } catch (err) {
      console.error("❌ Create course error:", err);
      appendToLogFile(`❌ Create course error: ${err.message}`);
      res.status(500).json({
        success: false,
        error: "Failed to create course",
        details: err.message,
      });
    }
  }
);

// ✅ GET /api/v1/courses
router.get("/", async (req, res) => {
  try {
    const courses = await Course.findAll({
      include: [
        { model: User, as: "teacher", attributes: ["id", "name", "email"] },
      ],
    });
    res.status(200).json(courses);
  } catch (err) {
    console.error("❌ Fetch courses error:", err.message);
    appendToLogFile(`❌ Fetch courses error: ${err.message}`);
    res.status(500).json({ error: "Failed to load courses" });
  }
});

// ✅ GET /api/v1/courses/slug/:slug
router.get("/slug/:slug", async (req, res) => {
  try {
    const { slug } = req.params;

    const course = await Course.findOne({
      where: { slug },
      include: [
        {
          model: Lesson,
          as: "lessons",
          separate: true,
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
      appendToLogFile(`❌ Course not found for slug: ${slug}`);
      return res
        .status(404)
        .json({ success: false, error: "Course not found" });
    }

    appendToLogFile(`✅ Fetched course: ${course.title} (slug: ${slug})`);
    res.status(200).json(course);
  } catch (error) {
    console.error("❌ Fetch course by slug error:", error.message);
    appendToLogFile(`❌ Fetch course by slug error: ${error.message}`);
    res.status(500).json({
      success: false,
      error: "Failed to fetch course",
      details: error.message,
    });
  }
});

module.exports = router;
