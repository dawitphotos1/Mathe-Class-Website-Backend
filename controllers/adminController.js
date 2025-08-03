const { UserCourseAccess, User, Course } = require("../models");

exports.getPendingEnrollments = async (req, res) => {
  try {
    const enrollments = await UserCourseAccess.findAll({
      where: { approved: false },
      include: [
        { model: User, attributes: ["id", "name", "email"] },
        { model: Course, attributes: ["id", "title", "slug"] },
      ],
      order: [["createdAt", "DESC"]],
    });

    return res.json({ success: true, enrollments });
  } catch (error) {
    console.error("🔥 Get pending enrollments error:", {
      message: error.message,
      stack: error.stack,
      userId: req.user?.id,
    });
    if (error.name === "SequelizeDatabaseError") {
      return res
        .status(500)
        .json({ error: "Database error fetching pending enrollments" });
    }
    return res
      .status(500)
      .json({
        error: "Failed to fetch pending enrollments",
        details: error.message,
      });
  }
};

exports.getApprovedEnrollments = async (req, res) => {
  try {
    const enrollments = await UserCourseAccess.findAll({
      where: { approved: true },
      include: [
        { model: User, attributes: ["id", "name", "email"] },
        { model: Course, attributes: ["id", "title", "slug"] },
      ],
      order: [["accessGrantedAt", "DESC"]],
    });

    return res.json({ success: true, enrollments });
  } catch (error) {
    console.error("🔥 Get approved enrollments error:", {
      message: error.message,
      stack: error.stack,
      userId: req.user?.id,
    });
    if (error.name === "SequelizeDatabaseError") {
      return res
        .status(500)
        .json({ error: "Database error fetching approved enrollments" });
    }
    return res
      .status(500)
      .json({
        error: "Failed to fetch approved enrollments",
        details: error.message,
      });
  }
};

exports.approveEnrollment = async (req, res) => {
  try {
    const { id } = req.params;

    const enrollment = await UserCourseAccess.findByPk(id, {
      include: [
        { model: User, attributes: ["id", "name", "email"] },
        { model: Course, attributes: ["id", "title", "slug"] },
      ],
    });

    if (!enrollment) {
      return res.status(404).json({ error: "Enrollment not found" });
    }

    enrollment.approved = true;
    enrollment.accessGrantedAt = new Date();
    await enrollment.save();

    return res.json({
      success: true,
      message: "Enrollment approved",
      enrollment,
    });
  } catch (error) {
    console.error("🔥 Approve enrollment error:", {
      message: error.message,
      stack: error.stack,
      enrollmentId: req.params.id,
      userId: req.user?.id,
    });
    return res
      .status(500)
      .json({ error: "Failed to approve enrollment", details: error.message });
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

    return res.json({
      success: true,
      message: "Enrollment rejected and removed",
    });
  } catch (error) {
    console.error("🔥 Reject enrollment error:", {
      message: error.message,
      stack: error.stack,
      enrollmentId: req.params.id,
      userId: req.user?.id,
    });
    return res
      .status(500)
      .json({ error: "Failed to reject enrollment", details: error.message });
  }
};