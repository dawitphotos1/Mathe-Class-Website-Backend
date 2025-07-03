// const path = require("path");
// const fs = require("fs");
// const slugify = require("slugify");
// const { Course, User } = require("../models");

// exports.createCourse = async (req, res) => {
//   try {
//     console.log("📥 CREATE COURSE request received.");
//     if (!req.user || req.user.role !== "teacher") {
//       return res.status(403).json({
//         success: false,
//         error: "Only teachers can create courses.",
//       });
//     }

//     let {
//       title,
//       description,
//       category,
//       slug,
//       price = 0,
//       materialUrl = null,
//     } = req.body;

//     if (!title || !description || !category) {
//       return res.status(400).json({
//         success: false,
//         error: "Missing required fields: title, description, category",
//       });
//     }

//     if (!slug) {
//       slug = slugify(title, { lower: true, strict: true });
//     }

//     price = parseFloat(price);
//     if (isNaN(price) || price < 0) {
//       return res.status(400).json({
//         success: false,
//         error: "Invalid course price. Must be a non-negative number.",
//       });
//     }

//     const attachmentUrls = [];
//     if (req.files?.attachments) {
//       const files = Array.isArray(req.files.attachments)
//         ? req.files.attachments
//         : [req.files.attachments];

//       const allowedExtensions = [
//         ".pdf",
//         ".docx",
//         ".mp4",
//         ".png",
//         ".jpg",
//         ".jpeg",
//       ];
//       const uploadsDir = path.join(__dirname, "..", "uploads");
//       if (!fs.existsSync(uploadsDir)) {
//         fs.mkdirSync(uploadsDir, { recursive: true });
//       }

//       const baseUrl = process.env.BASE_URL || "http://localhost:5000";

//       for (const file of files) {
//         const ext = path.extname(file.originalname).toLowerCase();
//         if (!allowedExtensions.includes(ext)) {
//           return res.status(400).json({
//             success: false,
//             error: `Unsupported file type: ${ext}`,
//           });
//         }

//         const fileName = `${Date.now()}_${file.originalname}`;
//         const filePath = path.join(uploadsDir, fileName);
//         fs.writeFileSync(filePath, file.buffer);
//         attachmentUrls.push(`${baseUrl}/uploads/${fileName}`);
//       }
//     }

//     const course = await Course.create({
//       title,
//       description,
//       category,
//       slug,
//       price,
//       materialUrl,
//       attachmentUrls,
//       teacherId: req.user.id,
//     });

//     return res.status(201).json({ success: true, course });
//   } catch (error) {
//     console.error("🔥 CREATE COURSE ERROR:", error.stack || error.message);
//     return res.status(500).json({
//       success: false,
//       error: "Failed to create course",
//       details: error.message,
//     });
//   }
// };

// exports.getAllCourses = async (req, res) => {
//   try {
//     const courses = await Course.findAll({
//       include: [
//         { model: User, as: "teacher", attributes: ["id", "name", "email"] },
//       ],
//     });
//     res.status(200).json({ success: true, courses });
//   } catch (error) {
//     res.status(500).json({ success: false, error: "Failed to fetch courses" });
//   }
// };

// exports.getCourseBySlug = async (req, res) => {
//   try {
//     const { slug } = req.params;
//     const course = await Course.findOne({
//       where: { slug },
//       include: [{ model: User, as: "teacher", attributes: ["id", "name"] }],
//     });

//     if (!course) {
//       return res
//         .status(404)
//         .json({ success: false, error: "Course not found" });
//     }

//     res.status(200).json({ success: true, course });
//   } catch (error) {
//     res.status(500).json({ success: false, error: "Failed to fetch course" });
//   }
// };



const path = require("path");
const fs = require("fs");
const { Course } = require("../models");

// Create new course (teacher only)
exports.createCourse = async (req, res) => {
  try {
    console.log("📥 CREATE COURSE request received.");
    console.log("🔐 Authenticated user:", req.user);
    console.log("📝 Incoming fields:", req.body);
    console.log("📎 Incoming files:", req.files);

    if (!req.user || req.user.role !== "teacher") {
      return res.status(403).json({
        success: false,
        error: "Only teachers can create courses.",
      });
    }

    const {
      title,
      description,
      category,
      slug,
      price = 0,
      materialUrl = null,
    } = req.body;

    if (!title || !slug || !description || !category) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields: title, slug, description, category",
      });
    }

    const attachmentUrls = [];
    if (req.files?.attachments) {
      const files = Array.isArray(req.files.attachments)
        ? req.files.attachments
        : [req.files.attachments];

      for (const file of files) {
        const fileName = `${Date.now()}_${file.originalname}`;
        const filePath = path.join(__dirname, "..", "uploads", fileName);
        fs.writeFileSync(filePath, file.buffer);
        attachmentUrls.push(`/uploads/${fileName}`);
      }
    }

    const course = await Course.create({
      title,
      description,
      category,
      slug,
      price: parseFloat(price),
      materialUrl,
      attachmentUrls,
      teacherId: req.user.id,
    });

    console.log("✅ Course created:", course.id);
    return res.status(201).json({ success: true, course });
  } catch (error) {
    console.error("🔥 CREATE COURSE ERROR:", error.stack || error.message);
    return res.status(500).json({
      success: false,
      error: "Failed to create course",
      details: error.message,
    });
  }
};
