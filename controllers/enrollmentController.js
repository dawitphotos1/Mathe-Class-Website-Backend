
// const { UserCourseAccess, Course, Lesson, User } = require("../models");

// exports.createCourse = async (req, res) => {
//   try {
//     console.log("📥 CREATE COURSE request received.");
//     console.log("🔐 Authenticated user:", req.user);
//     console.log("📝 Incoming data:", req.body);

//     if (!req.user || req.user.role !== "teacher") {
//       console.warn("❌ User is not a teacher or not authenticated");
//       return res
//         .status(403)
//         .json({ success: false, error: "Only teachers can create courses." });
//     }

//     const {
//       title,
//       description,
//       category,
//       slug,
//       price = 0,
//       materialUrl = null,
//       attachmentUrls = [],
//     } = req.body;

//     if (!title || !slug || !description || !category) {
//       return res.status(400).json({
//         success: false,
//         error: "Missing required fields: title, slug, description, category",
//       });
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

//     console.log("✅ Course created:", course.id);

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
// // ✅ Add this function at the end of the file:
// exports.confirmEnrollment = async (req, res) => {
//   try {
//     const { courseId } = req.body;
//     const userId = req.user.id;

//     if (!courseId) {
//       return res
//         .status(400)
//         .json({ success: false, error: "courseId is required" });
//     }

//     const existing = await UserCourseAccess.findOne({
//       where: { userId, courseId },
//     });

//     if (existing) {
//       return res
//         .status(400)
//         .json({
//           success: false,
//           error: "Already enrolled or pending approval",
//         });
//     }

//     const newEnrollment = await UserCourseAccess.create({
//       userId,
//       courseId,
//       approved: false,
//       accessGrantedAt: new Date(),
//     });

//     return res.json({
//       success: true,
//       message: "Enrollment created and pending approval",
//       enrollment: newEnrollment,
//     });
//   } catch (error) {
//     console.error("🔥 Error in confirmEnrollment:", error);
//     return res.status(500).json({
//       success: false,
//       error: "Failed to confirm enrollment",
//       details: error.message,
//     });
//   }
// };




const path = require("path");
const fs = require("fs");
const { Course, UserCourseAccess, Lesson, User } = require("../models");

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

    // ✅ Handle attachments
    const attachmentUrls = [];
    if (req.files?.attachments) {
      const files = Array.isArray(req.files.attachments)
        ? req.files.attachments
        : [req.files.attachments];

      for (const file of files) {
        const fileName = `${Date.now()}_${file.originalname}`;
        const filePath = path.join(__dirname, "..", "uploads", fileName);

        fs.writeFileSync(filePath, file.buffer); // save file
        attachmentUrls.push(`/uploads/${fileName}`); // public URL
      }
    }

    // ✅ Save course
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
