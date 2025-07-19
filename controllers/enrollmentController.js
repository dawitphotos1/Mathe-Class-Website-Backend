const { UserCourseAccess, Course, User } = require("../models");
const sendEmail = require("../utils/sendEmail");
const courseEnrollmentPending = require("../utils/emails/courseEnrollmentPending");
const logEnrollmentAction = require("../utils/logEnrollmentAction");

// ✅ Student confirms payment and enrollment is created
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

    // ✅ Log this action
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
