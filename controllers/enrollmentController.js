// controllers/enrollmentController.js

const { UserCourseAccess, Course, User } = require("../models");

exports.getPendingEnrollments = async (req, res) => {
  try {
    const pending = await UserCourseAccess.findAll({
      where: {
        approval_status: "pending",
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
        approval_status: "approved",
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
    enrollment.approval_status = "approved";
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
      approval_status: "pending",
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
