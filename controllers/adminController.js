// // controllers/adminController.js
// const { UserCourseAccess, User, Course } = require("../models");
// const sendEmail = require("../utils/sendEmail");

// // Load email templates with fallback defaults
// let enrollmentApprovedEmail = () => ({ subject: "", html: "" });
// let enrollmentRejectedEmail = () => ({ subject: "", html: "" });
// let userApprovalEmail = () => ({ subject: "", html: "" });

// try {
//   enrollmentApprovedEmail = require("../utils/emails/enrollmentApproved");
// } catch {
//   console.warn("⚠ enrollmentApprovedEmail module not found — using default.");
//   enrollmentApprovedEmail = (user, course) => ({
//     subject: "Enrollment Approved",
//     html: `<p>Hello ${user.name}, your enrollment in "${course.title}" has been approved.</p>`,
//   });
// }

// try {
//   enrollmentRejectedEmail = require("../utils/emails/enrollmentRejected");
// } catch {
//   console.warn("⚠ enrollmentRejectedEmail module not found — using default.");
//   enrollmentRejectedEmail = (user, course) => ({
//     subject: "Enrollment Rejected",
//     html: `<p>Hello ${user.name}, your enrollment in "${course.title}" was rejected.</p>`,
//   });
// }

// try {
//   userApprovalEmail = require("../utils/emails/userApprovalEmail");
// } catch {
//   console.warn("⚠ userApprovalEmail module not found — using default.");
//   userApprovalEmail = (user) => ({
//     subject: "Account Approved",
//     html: `<p>Hello ${user.name}, your account has been approved. You can now log in.</p>`,
//   });
// }

// const getPendingEnrollments = async (req, res) => {
//   try {
//     const pending = await UserCourseAccess.findAll({
//       where: { approvalStatus: "pending", paymentStatus: "paid" },
//       include: [
//         { model: User, as: "User" },
//         { model: Course, as: "Course" },
//       ],
//     });
//     return res.json({ pending });
//   } catch (err) {
//     console.error("Error fetching pending enrollments:", err);
//     return res.status(500).json({ error: "Failed to fetch pending enrollments" });
//   }
// };

// const getApprovedEnrollments = async (req, res) => {
//   try {
//     const approved = await UserCourseAccess.findAll({
//       where: { approvalStatus: "approved" },
//       include: [
//         { model: User, as: "User" },
//         { model: Course, as: "Course" },
//       ],
//     });
//     return res.json({ approved });
//   } catch (err) {
//     console.error("Error fetching approved enrollments:", err);
//     return res.status(500).json({ error: "Failed to fetch approved enrollments" });
//   }
// };

// const approveEnrollment = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const actor = req.user;

//     const enrollment = await UserCourseAccess.findByPk(id, {
//       include: [
//         { model: User, as: "User" },
//         { model: Course, as: "Course" },
//       ],
//     });

//     if (!enrollment) return res.status(404).json({ error: "Enrollment not found" });
//     if (enrollment.paymentStatus !== "paid") {
//       return res.status(400).json({ error: "Cannot approve unpaid enrollment" });
//     }

//     enrollment.approvalStatus = "approved";
//     enrollment.approvedBy = actor.id;
//     enrollment.approvedAt = new Date();
//     await enrollment.save();

//     if (enrollment.User && enrollment.Course) {
//       const { subject, html } = enrollmentApprovedEmail(enrollment.User, enrollment.Course);
//       await sendEmail(enrollment.User.email, subject, html);
//     }

//     return res.json({ message: "Enrollment approved", enrollment });
//   } catch (err) {
//     console.error("Error approving enrollment:", err);
//     return res.status(500).json({ error: "Failed to approve enrollment" });
//   }
// };

// const rejectEnrollment = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const actor = req.user;

//     const enrollment = await UserCourseAccess.findByPk(id, {
//       include: [
//         { model: User, as: "User" },
//         { model: Course, as: "Course" },
//       ],
//     });

//     if (!enrollment) return res.status(404).json({ error: "Enrollment not found" });

//     enrollment.approvalStatus = "rejected";
//     enrollment.approvedBy = actor.id;
//     enrollment.approvedAt = new Date();
//     await enrollment.save();

//     if (enrollment.User && enrollment.Course) {
//       const { subject, html } = enrollmentRejectedEmail(enrollment.User, enrollment.Course);
//       await sendEmail(enrollment.User.email, subject, html);
//     }

//     return res.json({ message: "Enrollment rejected", enrollment });
//   } catch (err) {
//     console.error("Error rejecting enrollment:", err);
//     return res.status(500).json({ error: "Failed to reject enrollment" });
//   }
// };

// module.exports = {
//   getPendingEnrollments,
//   getApprovedEnrollments,
//   approveEnrollment,
//   rejectEnrollment,
// };





// controllers/adminController.js

const { User } = require("../models");

// Get students pending approval
exports.getPendingUsers = async (req, res) => {
  try {
    const pendingUsers = await User.findAll({
      where: {
        role: "student",
        approved: false,
      },
      order: [["createdAt", "DESC"]],
    });
    res.status(200).json(pendingUsers);
  } catch (error) {
    console.error("Error fetching pending users:", error);
    res.status(500).json({ error: "Failed to fetch pending users." });
  }
};

// Approve student user
exports.approveUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByPk(id);

    if (!user || user.role !== "student") {
      return res.status(404).json({ error: "Student user not found" });
    }

    user.approved = true;
    await user.save();

    res.status(200).json({ message: "User approved" });
  } catch (error) {
    console.error("Error approving user:", error);
    res.status(500).json({ error: "Failed to approve user." });
  }
};

// Reject student user (delete)
exports.rejectUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByPk(id);

    if (!user || user.role !== "student") {
      return res.status(404).json({ error: "Student user not found" });
    }

    await user.destroy();

    res.status(200).json({ message: "User rejected and deleted" });
  } catch (error) {
    console.error("Error rejecting user:", error);
    res.status(500).json({ error: "Failed to reject user." });
  }
};
