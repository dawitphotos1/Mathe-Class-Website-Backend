// controllers/enrollmentController.js
const { UserCourseAccess, Course, User } = require("../models");

/**
 * Get pending enrollments (Admin/Teacher)
 */
exports.getPendingEnrollments = async (req, res) => {
  try {
    const pending = await UserCourseAccess.findAll({
      where: {
        approval_status: "pending",
        payment_status: "paid",
      },
      include: [
        { model: User, as: "student", attributes: ["id", "name", "email"] },
        { model: Course, as: "course", attributes: ["id", "title"] },
      ],
      order: [["createdAt", "DESC"]],
    });
    res.json({ enrollments: pending });
  } catch (error) {
    console.error("🔴 Error in getPendingEnrollments:", error);
    res.status(500).json({ error: "Failed to fetch pending enrollments" });
  }
};

/**
 * Get approved enrollments (Admin/Teacher)
 */
exports.getApprovedEnrollments = async (req, res) => {
  try {
    const approved = await UserCourseAccess.findAll({
      where: {
        approval_status: "approved",
      },
      include: [
        { model: User, as: "student", attributes: ["id", "name", "email"] },
        { model: Course, as: "course", attributes: ["id", "title"] },
      ],
      order: [["accessGrantedAt", "DESC"]],
    });
    res.json({ enrollments: approved });
  } catch (error) {
    console.error("🔴 Error in getApprovedEnrollments:", error);
    res.status(500).json({ error: "Failed to fetch approved enrollments" });
  }
};

/**
 * Approve enrollment (Admin/Teacher)
 */
exports.approveEnrollment = async (req, res) => {
  try {
    const { id } = req.params;
    const enrollment = await UserCourseAccess.findByPk(id);
    if (!enrollment) {
      return res.status(404).json({ error: "Enrollment not found" });
    }
    enrollment.approval_status = "approved";
    enrollment.accessGrantedAt = new Date();
    await enrollment.save();
    res.json({ message: "Enrollment approved", enrollment });
  } catch (error) {
    console.error("🔴 Error in approveEnrollment:", error);
    res.status(500).json({ error: "Failed to approve enrollment" });
  }
};

/**
 * Reject enrollment (Admin/Teacher)
 */
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

/**
 * Create new enrollment (Student)
 */
exports.createEnrollment = async (req, res) => {
  try {
    const { courseId } = req.body;
    const userId = req.user.id;

    // Prevent duplicate enrollments
    const existing = await UserCourseAccess.findOne({
      where: { userId, courseId },
    });

    if (existing) {
      return res.status(409).json({ error: "Already enrolled or pending" });
    }

    const enrollment = await UserCourseAccess.create({
      userId,
      courseId,
      payment_status: "paid",
      approval_status: "pending",
    });

    res.status(201).json({ message: "Enrollment request sent", enrollment });
  } catch (err) {
    console.error("🔴 createEnrollment error:", err);
    res.status(500).json({ error: "Failed to create enrollment" });
  }
};

/**
 * Get logged-in student's enrollments
 */
exports.getMyEnrollments = async (req, res) => {
  try {
    const userId = req.user.id;

    const enrollments = await UserCourseAccess.findAll({
      where: { userId },
      include: [
        {
          model: Course,
          as: "course",
          attributes: ["id", "title", "description", "slug"],
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

/**
 * Get only approved courses for logged-in student
 */
exports.getMyCourses = async (req, res) => {
  try {
    const userId = req.user.id;

    const enrollments = await UserCourseAccess.findAll({
      where: { userId, approval_status: "approved" },
      include: [
        {
          model: Course,
          as: "course",
          attributes: ["id", "title", "description", "slug", "thumbnailUrl"],
        },
      ],
    });

    res.json({
      courses: enrollments.map((e) => e.course),
    });
  } catch (error) {
    console.error("🔴 getMyCourses error:", error);
    res.status(500).json({ error: "Failed to fetch courses" });
  }
};

/**
 * Check if student is enrolled and approved in a course
 */
exports.checkEnrollment = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user.id;

    const enrollment = await UserCourseAccess.findOne({
      where: { userId, courseId, approval_status: "approved" },
    });

    res.json({ enrolled: !!enrollment });
  } catch (error) {
    console.error("🔴 checkEnrollment error:", error);
    res.status(500).json({ error: "Failed to check enrollment" });
  }
};
