// // controllers/enrollmentController.js

// const { UserCourseAccess, Course, User } = require("../models");
// const sendEmail = require("../utils/sendEmail");
// const courseEnrollmentPending = require("../utils/emails/courseEnrollmentPending");
// const enrollmentPendingAdmin = require("../utils/emails/enrollmentPendingAdmin");
// const logEnrollmentAction = require("../utils/logEnrollmentAction");

// // ✅ Confirm enrollment (student)
// exports.confirmEnrollment = async (req, res) => {
//   try {
//     const userId = req.user?.id;
//     const { courseId } = req.body;

//     if (!userId || !courseId) {
//       return res.status(400).json({ success: false, error: "Missing userId or courseId" });
//     }

//     const existing = await UserCourseAccess.findOne({ where: { userId, courseId } });
//     if (existing) {
//       return res.status(409).json({
//         success: false,
//         error: "Already enrolled or pending approval",
//       });
//     }

//     const course = await Course.findByPk(courseId);
//     if (!course) {
//       return res.status(404).json({ success: false, error: "Course not found" });
//     }

//     const enrollment = await UserCourseAccess.create({
//       userId,
//       courseId,
//       paymentStatus: "paid",
//       approvalStatus: "pending",
//       accessGrantedAt: new Date(),
//     });

//     const student = await User.findByPk(userId);
//     if (student && course) {
//       const { subject, html } = courseEnrollmentPending(student, course);
//       await sendEmail(student.email, subject, html);
//     }

//     const adminAndTeacherUsers = await User.findAll({ where: { role: ["admin", "teacher"] } });
//     for (const notifier of adminAndTeacherUsers) {
//       const emailContent = enrollmentPendingAdmin(student, course);
//       await sendEmail(notifier.email, emailContent.subject, emailContent.html);
//     }

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

// // ✅ Check if student is enrolled in a course
// exports.checkEnrollmentStatus = async (req, res) => {
//   try {
//     const userId = req.user?.id;
//     const { courseId } = req.params;

//     if (!userId || !courseId) {
//       return res.status(400).json({ success: false, error: "Missing userId or courseId" });
//     }

//     const enrollment = await UserCourseAccess.findOne({
//       where: {
//         userId: parseInt(userId),
//         courseId: parseInt(courseId),
//         approvalStatus: "approved",
//         paymentStatus: "paid",
//       },
//     });

//     if (!enrollment) {
//       return res.status(404).json({ success: false, enrolled: false });
//     }

//     return res.json({ success: true, enrolled: true });
//   } catch (error) {
//     console.error("Enrollment check error:", error);
//     res.status(500).json({
//       success: false,
//       error: "Failed to check enrollment",
//       details: error.message,
//     });
//   }
// };

// // ✅ Admin: get pending enrollments
// exports.getPendingEnrollments = async (req, res) => {
//   try {
//     const enrollments = await UserCourseAccess.findAll({
//       where: { approvalStatus: "pending" },
//       include: [User, Course],
//     });

//     res.json({ success: true, enrollments });
//   } catch (error) {
//     console.error("Error fetching pending enrollments:", error);
//     res.status(500).json({ success: false, error: "Failed to get pending enrollments" });
//   }
// };

// // ✅ Admin: get approved enrollments
// exports.getApprovedEnrollments = async (req, res) => {
//   try {
//     const enrollments = await UserCourseAccess.findAll({
//       where: { approvalStatus: "approved" },
//       include: [User, Course],
//     });

//     res.json({ success: true, enrollments });
//   } catch (error) {
//     console.error("Error fetching approved enrollments:", error);
//     res.status(500).json({ success: false, error: "Failed to get approved enrollments" });
//   }
// };

// // ✅ Admin: approve enrollment
// exports.approveEnrollment = async (req, res) => {
//   try {
//     const { id } = req.params;

//     const enrollment = await UserCourseAccess.findByPk(id, {
//       include: [User, Course],
//     });

//     if (!enrollment) {
//       return res.status(404).json({ success: false, error: "Enrollment not found" });
//     }

//     enrollment.approvalStatus = "approved";
//     enrollment.accessGrantedAt = new Date();
//     await enrollment.save();

//     await logEnrollmentAction("APPROVED", enrollment, req.user);

//     res.json({ success: true, message: "Enrollment approved", enrollment });
//   } catch (error) {
//     console.error("Error approving enrollment:", error);
//     res.status(500).json({ success: false, error: "Failed to approve enrollment" });
//   }
// };

// // ✅ Admin: reject (delete) enrollment
// exports.rejectEnrollment = async (req, res) => {
//   try {
//     const { id } = req.params;

//     const enrollment = await UserCourseAccess.findByPk(id);
//     if (!enrollment) {
//       return res.status(404).json({ success: false, error: "Enrollment not found" });
//     }

//     await logEnrollmentAction("REJECTED", enrollment, req.user);
//     await enrollment.destroy();

//     res.json({ success: true, message: "Enrollment rejected and deleted" });
//   } catch (error) {
//     console.error("Error rejecting enrollment:", error);
//     res.status(500).json({ success: false, error: "Failed to reject enrollment" });
//   }
// };



// controllers/enrollmentController.js

const { UserCourseAccess, Course, User } = require("../models");

exports.getPendingEnrollments = async (req, res) => {
  try {
    const pending = await UserCourseAccess.findAll({
      where: {
        approvalStatus: "pending",
        paymentStatus: "paid",
      },
      include: [
        { model: User, as: "User", attributes: ["id", "name", "email"] },
        { model: Course, as: "Course", attributes: ["id", "title"] },
      ],
      order: [["createdAt", "DESC"]],
    });
    res.json({ enrollments: pending });
  } catch (error) {
    console.error("🔴 Error in getPendingEnrollments:", error);
    res.status(500).json({ error: "Failed to fetch pending enrollments" });
  }
};

exports.getApprovedEnrollments = async (req, res) => {
  try {
    const approved = await UserCourseAccess.findAll({
      where: {
        approvalStatus: "approved",
      },
      include: [
        { model: User, as: "User", attributes: ["id", "name", "email"] },
        { model: Course, as: "Course", attributes: ["id", "title"] },
      ],
      order: [["accessGrantedAt", "DESC"]],
    });
    res.json({ enrollments: approved });
  } catch (error) {
    console.error("🔴 Error in getApprovedEnrollments:", error);
    res.status(500).json({ error: "Failed to fetch approved enrollments" });
  }
};

exports.approveEnrollment = async (req, res) => {
  try {
    const { id } = req.params;
    const enrollment = await UserCourseAccess.findByPk(id);
    if (!enrollment) {
      return res.status(404).json({ error: "Enrollment not found" });
    }
    enrollment.approvalStatus = "approved";
    enrollment.accessGrantedAt = new Date();
    await enrollment.save();
    res.json({ message: "Enrollment approved", enrollment });
  } catch (error) {
    console.error("🔴 Error in approveEnrollment:", error);
    res.status(500).json({ error: "Failed to approve enrollment" });
  }
};

exports.rejectEnrollment = async (req, res) => {
  try {
    const { id } = req.params;
    const enrollment = await UserCourseAccess.findByPk(id);
    if (!enrollment) {
      return res.status(404).json({ error: "Enrollment not found" });
    }
    await enrollment.destroy();
    res.json({ message: "Enrollment rejected and deleted" });
  } catch (error) {
    console.error("🔴 Error in rejectEnrollment:", error);
    res.status(500).json({ error: "Failed to reject enrollment" });
  }
};

exports.createEnrollment = async (req, res) => {
  try {
    const { courseId } = req.body;
    const userId = req.user.id;

    // Prevent duplicate
    const existing = await UserCourseAccess.findOne({
      where: { userId, courseId },
    });

    if (existing) {
      return res.status(409).json({ error: "Already enrolled or pending" });
    }

    const enrollment = await UserCourseAccess.create({
      userId,
      courseId,
      paymentStatus: "paid",
      approvalStatus: "pending",
    });

    res.status(201).json({ message: "Enrollment request sent", enrollment });
  } catch (err) {
    console.error("🔴 createEnrollment error:", err);
    res.status(500).json({ error: "Failed to create enrollment" });
  }
};

exports.getMyEnrollments = async (req, res) => {
  try {
    const userId = req.user.id;

    const enrollments = await UserCourseAccess.findAll({
      where: { userId },
      include: [
        {
          model: Course,
          as: "Course",
          attributes: ["id", "title", "description"],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    res.json({ enrollments });
  } catch (err) {
    console.error("🔴 getMyEnrollments error:", err);
    res.status(500).json({ error: "Failed to fetch enrollments" });
  }
};
