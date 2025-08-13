const { User, UserCourseAccess, Course } = require("../models");
const sendEmail = require("../utils/sendEmail");

const getDashboardStats = async (req, res) => {
  try {
    const totalStudents = await User.count({ where: { role: "student" } });
    const pendingUsers = await User.count({
      where: { role: "student", approval_status: "pending" },
    });
    const pendingEnrollments = await UserCourseAccess.count({
      where: { approval_status: "pending", payment_status: "paid" },
    });
    const approvedEnrollments = await UserCourseAccess.count({
      where: { approval_status: "approved" },
    });

    res.status(200).json({
      totalStudents,
      pendingUsers,
      pendingEnrollments,
      approvedEnrollments,
    });
  } catch (error) {
    console.error("Dashboard error:", error);
    res.status(500).json({ error: "Failed to load dashboard stats" });
  }
};

const getPendingUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      where: { role: "student", approval_status: "pending" },
      attributes: ["id", "name", "email", "role", "subject", "approval_status"],
    });
    res.status(200).json(users);
  } catch (error) {
    console.error("Pending users error:", error);
    res.status(500).json({ error: "Failed to fetch pending users" });
  }
};

const getApprovedOrRejectedUsers = async (req, res) => {
  const status = req.query.status?.toLowerCase();
  try {
    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }
    const users = await User.findAll({
      where: { role: "student", approval_status: status },
      attributes: ["id", "name", "email", "role", "subject", "approval_status"],
    });
    res.status(200).json(users);
  } catch (error) {
    console.error("Users by status error:", error);
    res.status(500).json({ error: `Failed to fetch ${status} users` });
  }
};

const getEnrollments = async (req, res) => {
  const status = req.query.status?.toLowerCase();
  try {
    if (!["pending", "approved"].includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    const enrollments = await UserCourseAccess.findAll({
      where: { approval_status: status },
      include: [
        { model: User, as: "student", attributes: ["id", "name", "email"] },
        { model: Course, as: "course", attributes: ["id", "title"] },
        { model: User, as: "approver", attributes: ["id", "name"] }, // optional
      ],
    });

    res.status(200).json({ enrollments });
  } catch (error) {
    console.error("Enrollments error:", error);
    res.status(500).json({
      error: `Failed to fetch ${status || "requested"} enrollments`,
    });
  }
};

const approveUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByPk(id);
    if (!user || user.role !== "student") {
      return res.status(404).json({ error: "Student not found" });
    }
    await user.update({ approval_status: "approved" });

    await sendEmail(
      user.email,
      "Your MathClass account has been approved ✅",
      `<p>Hello ${user.name},</p><p>Your MathClass account has been approved. You may now <a href="${process.env.FRONTEND_URL}/login">log in</a>.</p>`
    );

    res.status(200).json({ message: "User approved" });
  } catch (error) {
    console.error("Approve user error:", error);
    res.status(500).json({ error: "Failed to approve user" });
  }
};

const rejectUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByPk(id);
    if (!user || user.role !== "student") {
      return res.status(404).json({ error: "Student not found" });
    }
    await user.update({ approval_status: "rejected" });

    await sendEmail(
      user.email,
      "Your MathClass account was rejected ❌",
      `<p>Hello ${user.name},</p><p>Unfortunately, your account has been rejected. If you believe this is a mistake, please contact support.</p>`
    );

    res.status(200).json({ message: "User rejected" });
  } catch (error) {
    console.error("Reject user error:", error);
    res.status(500).json({ error: "Failed to reject user" });
  }
};

module.exports = {
  getDashboardStats,
  getPendingUsers,
  getApprovedOrRejectedUsers,
  getEnrollments,
  approveUser,
  rejectUser,
};
