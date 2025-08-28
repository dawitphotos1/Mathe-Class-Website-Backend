// // controllers/adminController.js
// const { User, UserCourseAccess, Course } = require("../models");
// const sendEmail = require("../utils/sendEmail");

// // =======================
// // DASHBOARD STATS
// // =======================
// const getDashboardStats = async (req, res) => {
//   try {
//     console.log("Fetching dashboard stats...");

//     const totalStudents = await User.count({ where: { role: "student" } });
//     const pendingUsers = await User.count({
//       where: { role: "student", approval_status: "pending" },
//     });
//     const pendingEnrollments = await UserCourseAccess.count({
//       where: { approval_status: "pending", payment_status: "paid" },
//     });
//     const approvedEnrollments = await UserCourseAccess.count({
//       where: { approval_status: "approved" },
//     });

//     res.status(200).json({
//       totalStudents,
//       pendingUsers,
//       pendingEnrollments,
//       approvedEnrollments,
//     });
//   } catch (error) {
//     console.error("🔥 Dashboard error:", error.message);
//     res.status(500).json({
//       error: "Failed to load dashboard stats",
//       details: error.message,
//     });
//   }
// };

// // =======================
// // PENDING USERS
// // =======================
// const getPendingUsers = async (req, res) => {
//   try {
//     const users = await User.findAll({
//       where: { role: "student", approval_status: "pending" },
//       attributes: ["id", "name", "email", "role", "subject", "approval_status"],
//     });
//     res.status(200).json(users);
//   } catch (error) {
//     console.error("🔥 Pending users error:", error.message);
//     res.status(500).json({
//       error: "Failed to fetch pending users",
//       details: error.message,
//     });
//   }
// };

// // =======================
// // APPROVED / REJECTED USERS
// // =======================
// const getApprovedOrRejectedUsers = async (req, res) => {
//   try {
//     const status = req.query.status?.toLowerCase();
//     if (!["approved", "rejected"].includes(status)) {
//       return res
//         .status(400)
//         .json({ error: "Invalid status, must be 'approved' or 'rejected'" });
//     }

//     const users = await User.findAll({
//       where: { role: "student", approval_status: status },
//       attributes: ["id", "name", "email", "role", "subject", "approval_status"],
//     });
//     res.status(200).json(users);
//   } catch (error) {
//     console.error(`🔥 Users by status (${status}) error:`, error.message);
//     res.status(500).json({
//       error: `Failed to fetch ${status} users`,
//       details: error.message,
//     });
//   }
// };

// // =======================
// // ENROLLMENTS
// // =======================
// const getEnrollments = async (req, res) => {
//   try {
//     const status = req.query.status?.toLowerCase();
//     if (!["pending", "approved"].includes(status)) {
//       return res
//         .status(400)
//         .json({ error: "Invalid status, must be 'pending' or 'approved'" });
//     }

//     const enrollments = await UserCourseAccess.findAll({
//       where: { approval_status: status },
//       include: [
//         { model: User, as: "student", attributes: ["id", "name", "email"] },
//         { model: Course, as: "course", attributes: ["id", "title"] },
//         { model: User, as: "approver", attributes: ["id", "name"], required: false },
//       ],
//     });

//     res.status(200).json({ enrollments });
//   } catch (error) {
//     console.error(`🔥 Enrollments (${status}) error:`, error.message);
//     res.status(500).json({
//       error: `Failed to fetch ${status || "requested"} enrollments`,
//       details: error.message,
//     });
//   }
// };

// // =======================
// // APPROVE USER
// // =======================
// const approveUser = async (req, res) => {
//   const transaction = await User.sequelize.transaction();
//   try {
//     const { id } = req.params;
//     const user = await User.findByPk(id, { transaction });

//     if (!user || user.role !== "student") {
//       await transaction.rollback();
//       return res.status(404).json({ error: "Student not found" });
//     }

//     try {
//       await sendEmail(
//         user.email,
//         "Your MathClass account has been approved ✅",
//         `<p>Hello ${user.name},</p><p>Your MathClass account has been approved. You may now <a href="${process.env.FRONTEND_URL}/login">log in</a>.</p>`
//       );
//       console.log(`✅ Approval email sent to ${user.email}`);
//     } catch (err) {
//       console.error(`❌ Error sending approval email to ${user.email}:`, err.message);
//     }

//     await user.update({ approval_status: "approved" }, { transaction });

//     await transaction.commit();
//     res.status(200).json({ message: "User approved" });
//   } catch (error) {
//     await transaction.rollback();
//     console.error("🔥 Approve user error:", error.message);
//     res.status(500).json({ error: "Failed to approve user", details: error.message });
//   }
// };

// // =======================
// // REJECT USER
// // =======================
// const rejectUser = async (req, res) => {
//   const transaction = await User.sequelize.transaction();
//   try {
//     const { id } = req.params;
//     const user = await User.findByPk(id, { transaction });

//     if (!user || user.role !== "student") {
//       await transaction.rollback();
//       return res.status(404).json({ error: "Student not found" });
//     }

//     try {
//       await sendEmail(
//         user.email,
//         "Your MathClass account was rejected ❌",
//         `<p>Hello ${user.name},</p><p>Unfortunately, your account has been rejected. If you believe this is a mistake, please contact support.</p>`
//       );
//       console.log(`✅ Rejection email sent to ${user.email}`);
//     } catch (err) {
//       console.error(`❌ Error sending rejection email to ${user.email}:`, err.message);
//     }

//     await user.update({ approval_status: "rejected" }, { transaction });

//     await transaction.commit();
//     res.status(200).json({ message: "User rejected" });
//   } catch (error) {
//     await transaction.rollback();
//     console.error("🔥 Reject user error:", error.message);
//     res.status(500).json({ error: "Failed to reject user", details: error.message });
//   }
// };

// module.exports = {
//   getDashboardStats,
//   getPendingUsers,
//   getApprovedOrRejectedUsers,
//   getEnrollments,
//   approveUser,
//   rejectUser,
// };





// controllers/adminController.js
const { User, UserCourseAccess, Course } = require("../models");
const sendEmail = require("../utils/sendEmail");

// =======================
// DASHBOARD STATS
// =======================
const getDashboardStats = async (req, res) => {
  try {
    console.log("Fetching dashboard stats...");

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
    console.error("🔥 Dashboard error:", error.message, error.stack);
    res.status(500).json({
      error: "Failed to load dashboard stats",
      details: error.message,
    });
  }
};

// =======================
// PENDING USERS
// =======================
const getPendingUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      where: { role: "student", approval_status: "pending" },
      attributes: ["id", "name", "email", "role", "subject", "approval_status"],
    });
    res.status(200).json(users);
  } catch (error) {
    console.error("🔥 Pending users error:", error.message, error.stack);
    res.status(500).json({
      error: "Failed to fetch pending users",
      details: error.message,
    });
  }
};

// =======================
// APPROVED / REJECTED USERS
// =======================
const getApprovedOrRejectedUsers = async (req, res) => {
  try {
    const status = req.query.status?.toLowerCase();
    if (!["approved", "rejected"].includes(status)) {
      return res
        .status(400)
        .json({ error: "Invalid status, must be 'approved' or 'rejected'" });
    }

    const users = await User.findAll({
      where: { role: "student", approval_status: status },
      attributes: ["id", "name", "email", "role", "subject", "approval_status"],
    });
    res.status(200).json(users);
  } catch (error) {
    console.error("🔥 Users by status error:", error.message, error.stack);
    res.status(500).json({
      error: "Failed to fetch users",
      details: error.message,
    });
  }
};

// =======================
// ENROLLMENTS
// =======================
const getEnrollments = async (req, res) => {
  try {
    const status = req.query.status?.toLowerCase();
    if (!["pending", "approved"].includes(status)) {
      return res
        .status(400)
        .json({ error: "Invalid status, must be 'pending' or 'approved'" });
    }

    const enrollments = await UserCourseAccess.findAll({
      where: { approval_status: status },
      include: [
        { model: User, as: "student", attributes: ["id", "name", "email"] },
        { model: Course, as: "course", attributes: ["id", "title"] },
        { model: User, as: "approver", attributes: ["id", "name"], required: false },
      ],
    });

    res.status(200).json({ enrollments });
  } catch (error) {
    console.error("🔥 Enrollments error:", error.message, error.stack);
    res.status(500).json({
      error: "Failed to fetch enrollments",
      details: error.message,
    });
  }
};

// =======================
// APPROVE USER
// =======================
const approveUser = async (req, res) => {
  const transaction = await User.sequelize.transaction();
  try {
    const { id } = req.params;
    const user = await User.findByPk(id, { transaction });

    if (!user || user.role !== "student") {
      await transaction.rollback();
      return res.status(404).json({ error: "Student not found" });
    }

    try {
      await sendEmail(
        user.email,
        "Your MathClass account has been approved ✅",
        `<p>Hello ${user.name},</p><p>Your MathClass account has been approved. You may now <a href="${process.env.FRONTEND_URL}/login">log in</a>.</p>`
      );
      console.log(`✅ Approval email sent to ${user.email}`);
    } catch (err) {
      console.error(`❌ Error sending approval email to ${user.email}:`, err.message);
    }

    await user.update({ approval_status: "approved" }, { transaction });

    await transaction.commit();
    res.status(200).json({ message: "User approved" });
  } catch (error) {
    await transaction.rollback();
    console.error("🔥 Approve user error:", error.message, error.stack);
    res.status(500).json({ error: "Failed to approve user", details: error.message });
  }
};

// =======================
// REJECT USER
// =======================
const rejectUser = async (req, res) => {
  const transaction = await User.sequelize.transaction();
  try {
    const { id } = req.params;
    const user = await User.findByPk(id, { transaction });

    if (!user || user.role !== "student") {
      await transaction.rollback();
      return res.status(404).json({ error: "Student not found" });
    }

    try {
      await sendEmail(
        user.email,
        "Your MathClass account was rejected ❌",
        `<p>Hello ${user.name},</p><p>Unfortunately, your account has been rejected. If you believe this is a mistake, please contact support.</p>`
      );
      console.log(`✅ Rejection email sent to ${user.email}`);
    } catch (err) {
      console.error(`❌ Error sending rejection email to ${user.email}:`, err.message);
    }

    await user.update({ approval_status: "rejected" }, { transaction });

    await transaction.commit();
    res.status(200).json({ message: "User rejected" });
  } catch (error) {
    await transaction.rollback();
    console.error("🔥 Reject user error:", error.message, error.stack);
    res.status(500).json({ error: "Failed to reject user", details: error.message });
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
