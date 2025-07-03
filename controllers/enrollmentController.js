
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




const { UserCourseAccess, Course, User } = require("../models");
const sendEmail = require("../utils/sendEmail");
const courseEnrollmentPending = require("../utils/emails/courseEnrollmentPending");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

// Student confirms payment and triggers enrollment
exports.confirmEnrollment = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { courseId } = req.body;

    if (!userId || !courseId) {
      return res
        .status(400)
        .json({ success: false, error: "Missing userId or courseId" });
    }

    const existing = await UserCourseAccess.findOne({
      where: { userId, courseId },
    });

    if (existing) {
      return res.status(409).json({
        success: false,
        error: "Already enrolled or pending approval",
      });
    }

    const course = await Course.findByPk(courseId);
    if (!course) {
      return res
        .status(404)
        .json({ success: false, error: "Course not found" });
    }

    const enrollment = await UserCourseAccess.create({
      userId,
      courseId,
      approved: false,
      accessGrantedAt: new Date(),
    });

    const user = await User.findByPk(userId);
    if (user && course) {
      const { subject, html } = courseEnrollmentPending(user, course);
      await sendEmail(user.email, subject, html);
    }

    res.status(201).json({
      success: true,
      message: "Enrollment submitted and pending approval",
      enrollment,
    });
  } catch (error) {
    console.error("Error confirming enrollment:", error);
    res.status(500).json({
      success: false,
      error: "Failed to confirm enrollment",
      details: error.message,
    });
  }
};
