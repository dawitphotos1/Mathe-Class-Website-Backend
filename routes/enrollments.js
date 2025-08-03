
const express = require("express");
const router = express.Router();
const { UserCourseAccess, Course, User } = require("../models");
const authMiddleware = require("../middleware/authMiddleware");
const sendEmail = require("../utils/sendEmail");
const courseEnrollmentPending = require("../utils/emails/courseEnrollmentPending");
const enrollmentPendingAdmin = require("../utils/emails/enrollmentPendingAdmin");

// ✅ Confirm enrollment after payment
router.post("/confirm", authMiddleware, async (req, res) => {
  try {
    const userId = req.user?.id;
    const { courseId } = req.body;

    if (!userId || !courseId) {
      return res.status(400).json({
        success: false,
        error: "Missing userId or courseId",
      });
    }

    // ✅ Check if already enrolled or pending
    const existing = await UserCourseAccess.findOne({
      where: { userId, courseId },
    });
    if (existing) {
      return res.status(409).json({
        success: false,
        error: "Already enrolled or pending approval",
      });
    }

    // ✅ Validate course
    const course = await Course.findByPk(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        error: "Course not found",
      });
    }

    // ✅ Create enrollment (pending approval)
    const enrollment = await UserCourseAccess.create({
      userId,
      courseId,
      approved: false,
      accessGrantedAt: new Date(),
    });

    // ✅ Fetch student and send emails
    const student = await User.findByPk(userId);

    if (student && course) {
      // Email to student
      const { subject, html } = courseEnrollmentPending(student, course);
      await sendEmail(student.email, subject, html);

      // Email all admins
      const adminUsers = await User.findAll({ where: { role: "admin" } });
      for (const admin of adminUsers) {
        const adminEmailContent = enrollmentPendingAdmin(student, course);
        await sendEmail(
          admin.email,
          adminEmailContent.subject,
          adminEmailContent.html
        );
      }
    }

    return res.status(201).json({
      success: true,
      message: "Enrollment submitted and pending approval",
      enrollment,
    });
  } catch (error) {
    console.error("❌ Error confirming enrollment:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to confirm enrollment",
    });
  }
});

module.exports = router;
