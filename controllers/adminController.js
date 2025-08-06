// // controllers/adminController.js
// const { User } = require("../models");

// // ✅ Get all pending student users
// exports.getPendingUsers = async (req, res) => {
//   try {
//     const pendingUsers = await User.findAll({
//       where: {
//         role: "student",
//         approvalStatus: "pending", // ✅ use correct enum field
//       },
//       order: [["createdAt", "DESC"]],
//     });

//     res.status(200).json(pendingUsers);
//   } catch (error) {
//     console.error("Error fetching pending users:", error);
//     res.status(500).json({ error: "Failed to fetch pending users." });
//   }
// };

// // ✅ Approve a student user
// exports.approveUser = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const user = await User.findByPk(id);

//     if (!user || user.role !== "student") {
//       return res.status(404).json({ error: "Student user not found" });
//     }

//     user.approvalStatus = "approved"; // ✅ set correct enum value
//     await user.save();

//     res.status(200).json({ message: "User approved" });
//   } catch (error) {
//     console.error("Error approving user:", error);
//     res.status(500).json({ error: "Failed to approve user." });
//   }
// };

// // ✅ Reject a student user (delete from DB)
// exports.rejectUser = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const user = await User.findByPk(id);

//     if (!user || user.role !== "student") {
//       return res.status(404).json({ error: "Student user not found" });
//     }

//     user.approvalStatus = "rejected"; // Optional: log rejection status
//     await user.save();
//     await user.destroy();

//     res.status(200).json({ message: "User rejected and deleted" });
//   } catch (error) {
//     console.error("Error rejecting user:", error);
//     res.status(500).json({ error: "Failed to reject user." });
//   }
// };


// const { User } = require("../models");

// // ✅ Dashboard Stats
// const getDashboardStats = async (req, res) => {
//   try {
//     const totalStudents = await User.count({ where: { role: "student" } });
//     const pendingUsers = await User.count({
//       where: { role: "student", approvalStatus: "pending" },
//     });

//     // Enrollment stats placeholders
//     const pendingEnrollments = 0;
//     const approvedEnrollments = 0;

//     res.status(200).json({
//       totalStudents,
//       pendingUsers,
//       pendingEnrollments,
//       approvedEnrollments,
//     });
//   } catch (error) {
//     console.error("🔴 Dashboard error:", error);
//     res.status(500).json({ error: "Failed to load dashboard stats" });
//   }
// };

// // ✅ Get all pending students
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
//     console.error("🔴 Fetch pending users error:", error);
//     res.status(500).json({ error: "Failed to fetch pending users" });
//   }
// };

// // ✅ Approve a student
// const approveUser = async (req, res) => {
//   try {
//     const { id } = req.params;

//     const user = await User.findByPk(id);
//     if (!user) {
//       return res.status(404).json({ error: "User not found" });
//     }

//     if (user.role !== "student") {
//       return res.status(400).json({ error: "Only students can be approved" });
//     }

//     user.approvalStatus = "approved";
//     await user.save();

//     res.status(200).json({ message: "User approved successfully", user });
//   } catch (error) {
//     console.error("🔴 Approve user error:", error);
//     res.status(500).json({ error: "Failed to approve user" });
//   }
// };

// // ✅ Reject a student
// const rejectUser = async (req, res) => {
//   try {
//     const { id } = req.params;

//     const user = await User.findByPk(id);
//     if (!user) {
//       return res.status(404).json({ error: "User not found" });
//     }

//     if (user.role !== "student") {
//       return res.status(400).json({ error: "Only students can be rejected" });
//     }

//     user.approvalStatus = "rejected";
//     await user.save();

//     res.status(200).json({ message: "User rejected successfully", user });
//   } catch (error) {
//     console.error("🔴 Reject user error:", error);
//     res.status(500).json({ error: "Failed to reject user" });
//   }
// };

// module.exports = {
//   getDashboardStats,
//   getPendingUsers,
//   approveUser,
//   rejectUser,
// };




const { User } = require("../models");

// ✅ Dashboard Stats
const getDashboardStats = async (req, res) => {
  try {
    const totalStudents = await User.count({ where: { role: "student" } });
    const pendingUsers = await User.count({
      where: { role: "student", approvalStatus: "pending" },
    });

    res.status(200).json({
      totalStudents,
      pendingUsers,
      pendingEnrollments: 0,
      approvedEnrollments: 0,
    });
  } catch (error) {
    console.error("🔴 Dashboard error:", error);
    res.status(500).json({ error: "Failed to load dashboard stats" });
  }
};

// ✅ Get pending students
const getPendingUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      where: { role: "student", approvalStatus: "pending" },
      attributes: [
        "id",
        "name",
        "email",
        "role",
        "approvalStatus",
        "createdAt",
      ],
    });

    res.status(200).json(users);
  } catch (error) {
    console.error("🔴 Fetch pending users error:", error);
    res.status(500).json({ error: "Failed to fetch pending users" });
  }
};

// ✅ Get users by approval status
const getUsersByStatus = async (req, res) => {
  try {
    const { status } = req.query; // approved or rejected
    if (!status || !["approved", "rejected"].includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    const users = await User.findAll({
      where: { role: "student", approvalStatus: status },
      attributes: [
        "id",
        "name",
        "email",
        "role",
        "approvalStatus",
        "createdAt",
      ],
    });

    res.status(200).json(users);
  } catch (error) {
    console.error("🔴 Fetch users by status error:", error);
    res.status(500).json({ error: "Failed to fetch users" });
  }
};

// ✅ Approve user
const approveUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByPk(id);
    if (!user) return res.status(404).json({ error: "User not found" });
    if (user.role !== "student")
      return res.status(400).json({ error: "Only students can be approved" });

    user.approvalStatus = "approved";
    await user.save();

    res.status(200).json({ message: "User approved successfully", user });
  } catch (error) {
    console.error("🔴 Approve user error:", error);
    res.status(500).json({ error: "Failed to approve user" });
  }
};

// ✅ Reject user
const rejectUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByPk(id);
    if (!user) return res.status(404).json({ error: "User not found" });
    if (user.role !== "student")
      return res.status(400).json({ error: "Only students can be rejected" });

    user.approvalStatus = "rejected";
    await user.save();

    res.status(200).json({ message: "User rejected successfully", user });
  } catch (error) {
    console.error("🔴 Reject user error:", error);
    res.status(500).json({ error: "Failed to reject user" });
  }
};

module.exports = {
  getDashboardStats,
  getPendingUsers,
  getUsersByStatus,
  approveUser,
  rejectUser,
};
