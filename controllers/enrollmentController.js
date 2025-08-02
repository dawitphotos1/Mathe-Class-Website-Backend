// const { UserCourseAccess, Course, User } = require("../models");
// const sendEmail = require("../utils/sendEmail");
// const courseEnrollmentPending = require("../utils/emails/courseEnrollmentPending");
// const logEnrollmentAction = require("../utils/logEnrollmentAction");

// // ✅ Student confirms payment and enrollment is created
// exports.confirmEnrollment = async (req, res) => {
//   try {
//     const userId = req.user?.id;
//     const { courseId } = req.body;

//     if (!userId || !courseId) {
//       return res
//         .status(400)
//         .json({ success: false, error: "Missing userId or courseId" });
//     }

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

//     const enrollment = await UserCourseAccess.create({
//       userId,
//       courseId,
//       approved: false,
//       accessGrantedAt: new Date(),
//     });

//     const user = await User.findByPk(userId);
//     if (user && course) {
//       const { subject, html } = courseEnrollmentPending(user, course);
//       await sendEmail(user.email, subject, html);
//     }

//     // ✅ Log this action
//     logEnrollmentAction("REQUESTED", enrollment, req.user);

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





const { UserCourseAccess, Course, User } = require("../models");
const sendEmail = require("../utils/sendEmail");
const courseEnrollmentPending = require("../utils/emails/courseEnrollmentPending");
const courseEnrollmentApproved = require("../utils/emails/courseEnrollmentApproved");
const logEnrollmentAction = require("../utils/logEnrollmentAction");

// Normalize an entry for frontend consumption
const formatEnrollment = (entry) => ({
  userId: entry.userId,
  courseId: entry.courseId,
  accessGrantedAt: entry.accessGrantedAt,
  approved: entry.approved,
  user: entry.user
    ? {
        id: entry.user.id,
        name: entry.user.name,
        email: entry.user.email,
      }
    : null,
  course: entry.course
    ? {
        id: entry.course.id,
        title: entry.course.title,
      }
    : null,
  status: entry.approved ? "approved" : "pending",
});

// ✅ Student confirms payment and enrollment is created (pending)
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

    logEnrollmentAction("REQUESTED", enrollment, req.user);

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

// GET pending enrollments (admin/teacher)
exports.getPendingEnrollments = async (req, res) => {
  try {
    const entries = await UserCourseAccess.findAll({
      where: { approved: false },
      include: [
        { model: User, as: "user", attributes: ["id", "name", "email"] },
        { model: Course, as: "course", attributes: ["id", "title"] },
      ],
      order: [["accessGrantedAt", "DESC"]],
    });

    const formatted = entries.map(formatEnrollment);
    return res.json(formatted);
  } catch (err) {
    console.error("Error fetching pending enrollments:", err);
    return res.status(500).json({
      error: "Failed to fetch pending enrollments",
      details: err.message,
    });
  }
};

// GET approved enrollments (admin/teacher)
exports.getApprovedEnrollments = async (req, res) => {
  try {
    const entries = await UserCourseAccess.findAll({
      where: { approved: true },
      include: [
        { model: User, as: "user", attributes: ["id", "name", "email"] },
        { model: Course, as: "course", attributes: ["id", "title"] },
      ],
      order: [["accessGrantedAt", "DESC"]],
    });

    const formatted = entries.map(formatEnrollment);
    return res.json(formatted);
  } catch (err) {
    console.error("Error fetching approved enrollments:", err);
    return res.status(500).json({
      error: "Failed to fetch approved enrollments",
      details: err.message,
    });
  }
};

// Approve a pending enrollment
exports.approveEnrollment = async (req, res) => {
  try {
    const { userId, courseId } = req.body;
    if (!userId || !courseId) {
      return res.status(400).json({ error: "userId and courseId required" });
    }

    const access = await UserCourseAccess.findOne({
      where: { userId, courseId },
      include: [
        { model: User, as: "user", attributes: ["id", "name", "email"] },
        { model: Course, as: "course", attributes: ["id", "title"] },
      ],
    });

    if (!access) {
      return res.status(404).json({ error: "Enrollment record not found" });
    }

    if (access.approved) {
      return res.status(400).json({ error: "Already approved" });
    }

    access.approved = true;
    access.accessGrantedAt = new Date();
    await access.save();

    // Notify student
    if (access.user && access.course) {
      const { subject, html } = courseEnrollmentApproved(
        access.user,
        access.course
      );
      await sendEmail(access.user.email, subject, html);
    }

    logEnrollmentAction("APPROVED", access, req.user);

    const formatted = formatEnrollment(access);
    return res.json(formatted);
  } catch (err) {
    console.error("Error approving enrollment:", err);
    return res.status(500).json({
      error: "Failed to approve enrollment",
      details: err.message,
    });
  }
};
