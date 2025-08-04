// // controllers/enrollmentController.js
// const { UserCourseAccess, Course, User } = require("../models");
// const sendEmail = require("../utils/sendEmail");
// const courseEnrollmentPending = require("../utils/emails/courseEnrollmentPending");
// const enrollmentPendingAdmin = require("../utils/emails/enrollmentPendingAdmin");
// const logEnrollmentAction = require("../utils/logEnrollmentAction");

// // Student confirms payment and enrollment is created (pending approval)
// exports.confirmEnrollment = async (req, res) => {
//   try {
//     const userId = req.user?.id;
//     const { courseId } = req.body;

//     if (!userId || !courseId) {
//       return res
//         .status(400)
//         .json({ success: false, error: "Missing userId or courseId" });
//     }

//     // Prevent duplicate/pending
//     const existing = await UserCourseAccess.findOne({
//       where: { userId, courseId },
//     });
//     if (existing) {
//       return res.status(409).json({
//         success: false,
//         error: "Already enrolled or pending approval",
//       });
//     }

//     const course = await Course.findByPk(courseId);
//     if (!course) {
//       return res
//         .status(404)
//         .json({ success: false, error: "Course not found" });
//     }

//     // Create enrollment with pending approval and mark payment as done (you can adjust payment tracking elsewhere)
//     const enrollment = await UserCourseAccess.create({
//       userId,
//       courseId,
//       paymentStatus: "paid", // assuming you track this
//       approvalStatus: "pending",
//       accessGrantedAt: new Date(),
//     });

//     // Notify student
//     const student = await User.findByPk(userId);
//     if (student && course) {
//       const { subject, html } = courseEnrollmentPending(student, course);
//       await sendEmail(student.email, subject, html);
//     }

//     // Notify all admins and teachers (optional: you could restrict to teachers of that course)
//     const adminAndTeacherUsers = await User.findAll({
//       where: {
//         role: ["admin", "teacher"],
//       },
//     });
//     for (const notifier of adminAndTeacherUsers) {
//       const emailContent = enrollmentPendingAdmin(student, course);
//       await sendEmail(notifier.email, emailContent.subject, emailContent.html);
//     }

//     // Log action
//     await logEnrollmentAction("REQUESTED", enrollment, req.user);

//     res.status(201).json({
//       success: true,
//       message: "Enrollment submitted and pending approval",
//       enrollment,
//     });
//   } catch (error) {
//     console.error("Error confirming enrollment:", error);
//     res.status(500).json({
//       success: false,
//       error: "Failed to confirm enrollment",
//       details: error.message,
//     });
//   }
// };



// controllers/enrollmentController.js
const { UserCourseAccess, Course, User } = require("../models");
const sendEmail = require("../utils/sendEmail");
const courseEnrollmentPending = require("../utils/emails/courseEnrollmentPending");
const enrollmentPendingAdmin = require("../utils/emails/enrollmentPendingAdmin");
const logEnrollmentAction = require("../utils/logEnrollmentAction");

// ✅ Confirm enrollment
exports.confirmEnrollment = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { courseId } = req.body;

    if (!userId || !courseId) {
      return res.status(400).json({ success: false, error: "Missing userId or courseId" });
    }

    const existing = await UserCourseAccess.findOne({ where: { userId, courseId } });
    if (existing) {
      return res.status(409).json({
        success: false,
        error: "Already enrolled or pending approval",
      });
    }

    const course = await Course.findByPk(courseId);
    if (!course) {
      return res.status(404).json({ success: false, error: "Course not found" });
    }

    const enrollment = await UserCourseAccess.create({
      userId,
      courseId,
      paymentStatus: "paid",
      approvalStatus: "pending",
      accessGrantedAt: new Date(),
    });

    const student = await User.findByPk(userId);
    if (student && course) {
      const { subject, html } = courseEnrollmentPending(student, course);
      await sendEmail(student.email, subject, html);
    }

    const adminAndTeacherUsers = await User.findAll({ where: { role: ["admin", "teacher"] } });
    for (const notifier of adminAndTeacherUsers) {
      const emailContent = enrollmentPendingAdmin(student, course);
      await sendEmail(notifier.email, emailContent.subject, emailContent.html);
    }

    await logEnrollmentAction("REQUESTED", enrollment, req.user);

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

// ✅ Check if user is enrolled in a course (approved + paid)
exports.checkEnrollmentStatus = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { courseId } = req.params;

    console.log(
      "🔎 Checking enrollment for user:",
      userId,
      "course:",
      courseId
    );

    if (!userId || !courseId) {
      console.error("❌ Missing userId or courseId");
      return res
        .status(400)
        .json({ success: false, error: "Missing user or courseId" });
    }

    const enrollment = await UserCourseAccess.findOne({
      where: {
        userId,
        courseId,
        approvalStatus: "approved",
        paymentStatus: "paid",
      },
    });

    if (!enrollment) {
      console.log("❌ Not enrolled or not approved");
      return res.status(404).json({ success: false, enrolled: false });
    }

    console.log("✅ Enrolled and approved!");
    return res.json({ success: true, enrolled: true });
  } catch (error) {
    console.error("❌ Enrollment check error:", error);
    res
      .status(500)
      .json({
        success: false,
        error: "Failed to check enrollment",
        details: error.message,
      });
  }
};
