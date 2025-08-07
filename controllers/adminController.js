
// const { User } = require("../models");

// // ✅ Dashboard Stats
// const getDashboardStats = async (req, res) => {
//   try {
//     const totalStudents = await User.count({ where: { role: "student" } });
//     const pendingUsers = await User.count({
//       where: { role: "student", approvalStatus: "pending" },
//     });

//     res.status(200).json({
//       totalStudents,
//       pendingUsers,
//       pendingEnrollments: 0,
//       approvedEnrollments: 0,
//     });
//   } catch (error) {
//     console.error("Dashboard error:", error);
//     res.status(500).json({ error: "Failed to load dashboard stats" });
//   }
// };

// // ✅ Get pending users
// const getPendingUsers = async (req, res) => {
//   try {
//     const users = await User.findAll({
//       where: { role: "student", approvalStatus: "pending" },
//       attributes: [
//         "id",
//         "name",
//         "email",
//         "role",
//         "approvalStatus",
//         "createdAt",
//       ],
//     });
//     res.status(200).json(users);
//   } catch (error) {
//     console.error("Pending users error:", error);
//     res.status(500).json({ error: "Failed to fetch pending users" });
//   }
// };

// // ✅ Get users by status
// const getUsersByStatus = async (req, res) => {
//   try {
//     const { status } = req.query;
//     if (!status || !["approved", "rejected"].includes(status)) {
//       return res.status(400).json({ error: "Invalid status" });
//     }
//     const users = await User.findAll({
//       where: { role: "student", approvalStatus: status },
//       attributes: [
//         "id",
//         "name",
//         "email",
//         "role",
//         "approvalStatus",
//         "createdAt",
//       ],
//     });
//     res.status(200).json(users);
//   } catch (error) {
//     console.error("Users by status error:", error);
//     res.status(500).json({ error: "Failed to fetch users" });
//   }
// };

// // ✅ Approve user
// const approveUser = async (req, res) => {
//   try {
//     const user = await User.findByPk(req.params.id);
//     if (!user) return res.status(404).json({ error: "User not found" });
//     if (user.role !== "student")
//       return res.status(400).json({ error: "Only students can be approved" });

//     user.approvalStatus = "approved";
//     await user.save();
//     res.json({ message: "User approved", user });
//   } catch (error) {
//     res.status(500).json({ error: "Failed to approve user" });
//   }
// };

// // ✅ Reject user
// const rejectUser = async (req, res) => {
//   try {
//     const user = await User.findByPk(req.params.id);
//     if (!user) return res.status(404).json({ error: "User not found" });
//     if (user.role !== "student")
//       return res.status(400).json({ error: "Only students can be rejected" });

//     user.approvalStatus = "rejected";
//     await user.save();
//     res.json({ message: "User rejected", user });
//   } catch (error) {
//     res.status(500).json({ error: "Failed to reject user" });
//   }
// };

// module.exports = {
//   getDashboardStats,
//   getPendingUsers,
//   getUsersByStatus,
//   approveUser,
//   rejectUser,
// };




const { User, UserCourseAccess, Course } = require("../models");

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

    console.log("Total students:", totalStudents);
    console.log("Pending users:", pendingUsers);
    console.log("Pending enrollments:", pendingEnrollments);
    console.log("Approved enrollments:", approvedEnrollments);

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

const getUsersByStatus = async (req, res) => {
  try {
    const { status } = req.query;
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
  try {
    const status = req.path.includes("pending") ? "pending" : "approved";
    const enrollments = await UserCourseAccess.findAll({
      where: { approval_status: status },
      include: [
        { model: User, attributes: ["name"] },
        { model: Course, attributes: ["title"] },
      ],
    });
    res.status(200).json({ enrollments });
  } catch (error) {
    console.error("Enrollments error:", error);
    res.status(500).json({ error: `Failed to fetch ${status} enrollments` });
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
    res.status(200).json({ message: "User rejected" });
  } catch (error) {
    console.error("Reject user error:", error);
    res.status(500).json({ error: "Failed to reject user" });
  }
};

module.exports = {
  getDashboardStats,
  getPendingUsers,
  getUsersByStatus,
  getEnrollments,
  approveUser,
  rejectUser,
};