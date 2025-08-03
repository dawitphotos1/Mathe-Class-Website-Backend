// const { UserCourseAccess, User, Course } = require("../models");

// exports.getPendingEnrollments = async (req, res) => {
//   try {
//     const enrollments = await UserCourseAccess.findAll({
//       where: { approved: false },
//       include: [
//         { model: User, attributes: ["id", "name", "email"] },
//         { model: Course, attributes: ["id", "title", "slug"] },
//       ],
//       order: [["createdAt", "DESC"]],
//     });

//     return res.json({ success: true, enrollments });
//   } catch (error) {
//     console.error("🔥 Get pending enrollments error:", {
//       message: error.message,
//       stack: error.stack,
//       userId: req.user?.id,
//     });
//     if (error.name === "SequelizeDatabaseError") {
//       return res
//         .status(500)
//         .json({ error: "Database error fetching pending enrollments" });
//     }
//     return res
//       .status(500)
//       .json({
//         error: "Failed to fetch pending enrollments",
//         details: error.message,
//       });
//   }
// };

// exports.getApprovedEnrollments = async (req, res) => {
//   try {
//     const enrollments = await UserCourseAccess.findAll({
//       where: { approved: true },
//       include: [
//         { model: User, attributes: ["id", "name", "email"] },
//         { model: Course, attributes: ["id", "title", "slug"] },
//       ],
//       order: [["accessGrantedAt", "DESC"]],
//     });

//     return res.json({ success: true, enrollments });
//   } catch (error) {
//     console.error("🔥 Get approved enrollments error:", {
//       message: error.message,
//       stack: error.stack,
//       userId: req.user?.id,
//     });
//     if (error.name === "SequelizeDatabaseError") {
//       return res
//         .status(500)
//         .json({ error: "Database error fetching approved enrollments" });
//     }
//     return res
//       .status(500)
//       .json({
//         error: "Failed to fetch approved enrollments",
//         details: error.message,
//       });
//   }
// };

// exports.approveEnrollment = async (req, res) => {
//   try {
//     const { id } = req.params;

//     const enrollment = await UserCourseAccess.findByPk(id, {
//       include: [
//         { model: User, attributes: ["id", "name", "email"] },
//         { model: Course, attributes: ["id", "title", "slug"] },
//       ],
//     });

//     if (!enrollment) {
//       return res.status(404).json({ error: "Enrollment not found" });
//     }

//     enrollment.approved = true;
//     enrollment.accessGrantedAt = new Date();
//     await enrollment.save();

//     return res.json({
//       success: true,
//       message: "Enrollment approved",
//       enrollment,
//     });
//   } catch (error) {
//     console.error("🔥 Approve enrollment error:", {
//       message: error.message,
//       stack: error.stack,
//       enrollmentId: req.params.id,
//       userId: req.user?.id,
//     });
//     return res
//       .status(500)
//       .json({ error: "Failed to approve enrollment", details: error.message });
//   }
// };

// exports.rejectEnrollment = async (req, res) => {
//   try {
//     const { id } = req.params;

//     const enrollment = await UserCourseAccess.findByPk(id);
//     if (!enrollment) {
//       return res.status(404).json({ error: "Enrollment not found" });
//     }

//     await enrollment.destroy();

//     return res.json({
//       success: true,
//       message: "Enrollment rejected and removed",
//     });
//   } catch (error) {
//     console.error("🔥 Reject enrollment error:", {
//       message: error.message,
//       stack: error.stack,
//       enrollmentId: req.params.id,
//       userId: req.user?.id,
//     });
//     return res
//       .status(500)
//       .json({ error: "Failed to reject enrollment", details: error.message });
//   }
// };



// controllers/adminController.js
const { UserCourseAccess, User, Course } = require("../models");
const sendEmail = require("../utils/sendEmail");

// Load email templates with fallback defaults
let enrollmentApprovedEmail = () => ({ subject: "", html: "" });
let enrollmentRejectedEmail = () => ({ subject: "", html: "" });
let userApprovalEmail = () => ({ subject: "", html: "" });

try {
  enrollmentApprovedEmail = require("../utils/emails/enrollmentApproved");
} catch {
  console.warn("⚠ enrollmentApprovedEmail module not found — using default.");
  enrollmentApprovedEmail = (user, course) => ({
    subject: "Enrollment Approved",
    html: `<p>Hello ${user.name}, your enrollment in "${course.title}" has been approved.</p>`,
  });
}

try {
  enrollmentRejectedEmail = require("../utils/emails/enrollmentRejected");
} catch {
  console.warn("⚠ enrollmentRejectedEmail module not found — using default.");
  enrollmentRejectedEmail = (user, course) => ({
    subject: "Enrollment Rejected",
    html: `<p>Hello ${user.name}, your enrollment in "${course.title}" was rejected.</p>`,
  });
}

try {
  userApprovalEmail = require("../utils/emails/userApprovalEmail");
} catch {
  console.warn("⚠ userApprovalEmail module not found — using default.");
  userApprovalEmail = (user) => ({
    subject: "Account Approved",
    html: `<p>Hello ${user.name}, your account has been approved. You can now log in.</p>`,
  });
}

const getPendingEnrollments = async (req, res) => {
  try {
    const pending = await UserCourseAccess.findAll({
      where: { approvalStatus: "pending", paymentStatus: "paid" },
      include: [
        { model: User, as: "User" },
        { model: Course, as: "Course" },
      ],
    });
    return res.json({ pending });
  } catch (err) {
    console.error("Error fetching pending enrollments:", err);
    return res.status(500).json({ error: "Failed to fetch pending enrollments" });
  }
};

const getApprovedEnrollments = async (req, res) => {
  try {
    const approved = await UserCourseAccess.findAll({
      where: { approvalStatus: "approved" },
      include: [
        { model: User, as: "User" },
        { model: Course, as: "Course" },
      ],
    });
    return res.json({ approved });
  } catch (err) {
    console.error("Error fetching approved enrollments:", err);
    return res.status(500).json({ error: "Failed to fetch approved enrollments" });
  }
};

const approveEnrollment = async (req, res) => {
  try {
    const { id } = req.params;
    const actor = req.user;

    const enrollment = await UserCourseAccess.findByPk(id, {
      include: [
        { model: User, as: "User" },
        { model: Course, as: "Course" },
      ],
    });

    if (!enrollment) return res.status(404).json({ error: "Enrollment not found" });
    if (enrollment.paymentStatus !== "paid") {
      return res.status(400).json({ error: "Cannot approve unpaid enrollment" });
    }

    enrollment.approvalStatus = "approved";
    enrollment.approvedBy = actor.id;
    enrollment.approvedAt = new Date();
    await enrollment.save();

    if (enrollment.User && enrollment.Course) {
      const { subject, html } = enrollmentApprovedEmail(enrollment.User, enrollment.Course);
      await sendEmail(enrollment.User.email, subject, html);
    }

    return res.json({ message: "Enrollment approved", enrollment });
  } catch (err) {
    console.error("Error approving enrollment:", err);
    return res.status(500).json({ error: "Failed to approve enrollment" });
  }
};

const rejectEnrollment = async (req, res) => {
  try {
    const { id } = req.params;
    const actor = req.user;

    const enrollment = await UserCourseAccess.findByPk(id, {
      include: [
        { model: User, as: "User" },
        { model: Course, as: "Course" },
      ],
    });

    if (!enrollment) return res.status(404).json({ error: "Enrollment not found" });

    enrollment.approvalStatus = "rejected";
    enrollment.approvedBy = actor.id;
    enrollment.approvedAt = new Date();
    await enrollment.save();

    if (enrollment.User && enrollment.Course) {
      const { subject, html } = enrollmentRejectedEmail(enrollment.User, enrollment.Course);
      await sendEmail(enrollment.User.email, subject, html);
    }

    return res.json({ message: "Enrollment rejected", enrollment });
  } catch (err) {
    console.error("Error rejecting enrollment:", err);
    return res.status(500).json({ error: "Failed to reject enrollment" });
  }
};

module.exports = {
  getPendingEnrollments,
  getApprovedEnrollments,
  approveEnrollment,
  rejectEnrollment,
};
