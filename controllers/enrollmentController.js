// controllers/enrollmentController.js

const { UserCourseAccess, Course, User } = require("../models");
const sendEmail = require("../utils/sendEmail");
const courseEnrollmentPending = require("../utils/emails/courseEnrollmentPending");
const enrollmentPendingAdmin = require("../utils/emails/enrollmentPendingAdmin");
const logEnrollmentAction = require("../utils/logEnrollmentAction");

// ✅ Confirm enrollment (student)
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

// ✅ Check if student is enrolled in a course
exports.checkEnrollmentStatus = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { courseId } = req.params;

    if (!userId || !courseId) {
      return res.status(400).json({ success: false, error: "Missing userId or courseId" });
    }

    const enrollment = await UserCourseAccess.findOne({
      where: {
        userId: parseInt(userId),
        courseId: parseInt(courseId),
        approvalStatus: "approved",
        paymentStatus: "paid",
      },
    });

    if (!enrollment) {
      return res.status(404).json({ success: false, enrolled: false });
    }

    return res.json({ success: true, enrolled: true });
  } catch (error) {
    console.error("Enrollment check error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to check enrollment",
      details: error.message,
    });
  }
};

// ✅ Admin: get pending enrollments
exports.getPendingEnrollments = async (req, res) => {
  try {
    const enrollments = await UserCourseAccess.findAll({
      where: { approvalStatus: "pending" },
      include: [User, Course],
    });

    res.json({ success: true, enrollments });
  } catch (error) {
    console.error("Error fetching pending enrollments:", error);
    res.status(500).json({ success: false, error: "Failed to get pending enrollments" });
  }
};

// ✅ Admin: get approved enrollments
exports.getApprovedEnrollments = async (req, res) => {
  try {
    const enrollments = await UserCourseAccess.findAll({
      where: { approvalStatus: "approved" },
      include: [User, Course],
    });

    res.json({ success: true, enrollments });
  } catch (error) {
    console.error("Error fetching approved enrollments:", error);
    res.status(500).json({ success: false, error: "Failed to get approved enrollments" });
  }
};

// ✅ Admin: approve enrollment
exports.approveEnrollment = async (req, res) => {
  try {
    const { id } = req.params;

    const enrollment = await UserCourseAccess.findByPk(id, {
      include: [User, Course],
    });

    if (!enrollment) {
      return res.status(404).json({ success: false, error: "Enrollment not found" });
    }

    enrollment.approvalStatus = "approved";
    enrollment.accessGrantedAt = new Date();
    await enrollment.save();

    await logEnrollmentAction("APPROVED", enrollment, req.user);

    res.json({ success: true, message: "Enrollment approved", enrollment });
  } catch (error) {
    console.error("Error approving enrollment:", error);
    res.status(500).json({ success: false, error: "Failed to approve enrollment" });
  }
};

// ✅ Admin: reject (delete) enrollment
exports.rejectEnrollment = async (req, res) => {
  try {
    const { id } = req.params;

    const enrollment = await UserCourseAccess.findByPk(id);
    if (!enrollment) {
      return res.status(404).json({ success: false, error: "Enrollment not found" });
    }

    await logEnrollmentAction("REJECTED", enrollment, req.user);
    await enrollment.destroy();

    res.json({ success: true, message: "Enrollment rejected and deleted" });
  } catch (error) {
    console.error("Error rejecting enrollment:", error);
    res.status(500).json({ success: false, error: "Failed to reject enrollment" });
  }
};
