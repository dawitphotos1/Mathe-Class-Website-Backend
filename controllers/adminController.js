// const { User, UserCourseAccess, Course } = require("../models");
// const sendEmail = require("../utils/sendEmail");
// const { Sequelize } = require("sequelize");

// const getDashboardStats = async (req, res) => {
//   try {
//     console.log("Fetching dashboard stats...");
//     const totalStudents = await User.count({
//       where: { role: "student" },
//     });
//     const pendingUsers = await User.count({
//       where: { role: "student", approval_status: "pending" },
//     });
//     const pendingEnrollments = await UserCourseAccess.count({
//       where: { approval_status: "pending", payment_status: "paid" },
//     });
//     const approvedEnrollments = await UserCourseAccess.count({
//       where: { approval_status: "approved" },
//     });

//     console.log("Dashboard stats:", {
//       totalStudents,
//       pendingUsers,
//       pendingEnrollments,
//       approvedEnrollments,
//     });

//     res.status(200).json({
//       totalStudents,
//       pendingUsers,
//       pendingEnrollments,
//       approvedEnrollments,
//     });
//   } catch (error) {
//     console.error("🔥 Dashboard error:", error.message, error.stack);
//     res
//       .status(500)
//       .json({
//         error: "Failed to load dashboard stats",
//         details: error.message,
//       });
//   }
// };

// const getPendingUsers = async (req, res) => {
//   try {
//     console.log("Fetching pending users...");
//     const users = await User.findAll({
//       where: { role: "student", approval_status: "pending" },
//       attributes: [
//         "id",
//         "name",
//         "email",
//         "role",
//         "subject",
//         "approval_status",
//         "email_notification_status",
//       ],
//     });
//     console.log(`Found ${users.length} pending users`);
//     res.status(200).json(users);
//   } catch (error) {
//     console.error("🔥 Pending users error:", error.message, error.stack);
//     res
//       .status(500)
//       .json({ error: "Failed to fetch pending users", details: error.message });
//   }
// };

// const getApprovedOrRejectedUsers = async (req, res) => {
//   try {
//     const status = req.query.status?.toLowerCase();
//     console.log(`Fetching users with status: ${status}`);
//     if (!["approved", "rejected"].includes(status)) {
//       return res
//         .status(400)
//         .json({ error: "Invalid status, must be 'approved' or 'rejected'" });
//     }
//     const users = await User.findAll({
//       where: { role: "student", approval_status: status },
//       attributes: [
//         "id",
//         "name",
//         "email",
//         "role",
//         "subject",
//         "approval_status",
//         "email_notification_status",
//       ],
//     });
//     console.log(`Found ${users.length} ${status} users`);
//     res.status(200).json(users);
//   } catch (error) {
//     console.error(
//       `🔥 Users by status (${status}) error:`,
//       error.message,
//       error.stack
//     );
//     res
//       .status(500)
//       .json({
//         error: `Failed to fetch ${status} users`,
//         details: error.message,
//       });
//   }
// };

// const getEnrollments = async (req, res) => {
//   try {
//     const status = req.query.status?.toLowerCase();
//     console.log(`Fetching enrollments with status: ${status}`);
//     if (!["pending", "approved"].includes(status)) {
//       return res
//         .status(400)
//         .json({ error: "Invalid status, must be 'pending' or 'approved'" });
//     }

//     const enrollments = await UserCourseAccess.findAll({
//       where: { approval_status: status },
//       include: [
//         {
//           model: User,
//           as: "student",
//           attributes: ["id", "name", "email"],
//         },
//         {
//           model: Course,
//           as: "course",
//           attributes: ["id", "title"],
//         },
//         {
//           model: User,
//           as: "approver",
//           attributes: ["id", "name"],
//           required: false,
//         },
//       ],
//     });

//     console.log(`Found ${enrollments.length} ${status} enrollments`);
//     res.status(200).json({ enrollments });
//   } catch (error) {
//     console.error(
//       `🔥 Enrollments (${status}) error:`,
//       error.message,
//       error.stack
//     );
//     res.status(500).json({
//       error: `Failed to fetch ${status || "requested"} enrollments`,
//       details: error.message,
//     });
//   }
// };

// const approveUser = async (req, res) => {
//   const transaction = await User.sequelize.transaction();
//   try {
//     const { id } = req.params;
//     console.log(`Approving user with id: ${id}`);
//     const user = await User.findByPk(id, { transaction });
//     if (!user || user.role !== "student") {
//       await transaction.rollback();
//       console.log(`User not found or not a student: id=${id}`);
//       return res.status(404).json({ error: "Student not found" });
//     }

//     let emailSent = false;
//     try {
//       await sendEmail(
//         user.email,
//         "Your MathClass account has been approved ✅",
//         `<p>Hello ${user.name},</p><p>Your MathClass account has been approved. You may now <a href="${process.env.FRONTEND_URL}/login">log in</a>.</p>`
//       );
//       emailSent = true;
//       console.log(`Approval email sent to ${user.email}`);
//     } catch (err) {
//       console.error(
//         `❌ Error sending approval email to ${user.email}:`,
//         err.message
//       );
//     }

//     await user.update(
//       {
//         approval_status: "approved",
//         email_notification_status: emailSent ? "sent" : "failed",
//       },
//       { transaction }
//     );

//     await transaction.commit();
//     res.status(200).json({ message: "User approved", emailSent });
//   } catch (error) {
//     await transaction.rollback();
//     console.error("🔥 Approve user error:", error.message, error.stack);
//     res
//       .status(500)
//       .json({ error: "Failed to approve user", details: error.message });
//   }
// };

// const rejectUser = async (req, res) => {
//   const transaction = await User.sequelize.transaction();
//   try {
//     const { id } = req.params;
//     console.log(`Rejecting user with id: ${id}`);
//     const user = await User.findByPk(id, { transaction });
//     if (!user || user.role !== "student") {
//       await transaction.rollback();
//       console.log(`User not found or not a student: id=${id}`);
//       return res.status(404).json({ error: "Student not found" });
//     }

//     let emailSent = false;
//     try {
//       await sendEmail(
//         user.email,
//         "Your MathClass account was rejected ❌",
//         `<p>Hello ${user.name},</p><p>Unfortunately, your account has been rejected. If you believe this is a mistake, please contact support.</p>`
//       );
//       emailSent = true;
//       console.log(`Rejection email sent to ${user.email}`);
//     } catch (err) {
//       console.error(
//         `❌ Error sending rejection email to ${user.email}:`,
//         err.message
//       );
//     }

//     await user.update(
//       {
//         approval_status: "rejected",
//         email_notification_status: emailSent ? "sent" : "failed",
//       },
//       { transaction }
//     );

//     await transaction.commit();
//     res.status(200).json({ message: "User rejected", emailSent });
//   } catch (error) {
//     await transaction.rollback();
//     console.error("🔥 Reject user error:", error.message, error.stack);
//     res
//       .status(500)
//       .json({ error: "Failed to reject user", details: error.message });
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



const { User, UserCourseAccess, Course } = require("../models");
const sendEmail = require("../utils/sendEmail");

// ✅ Admin Dashboard Stats
const getDashboardStats = async (req, res) => {
  try {
    console.log("📥 Fetching dashboard stats...");

    const totalStudents = await User.count({ where: { role: "student" } });
    const pendingUsers = await User.count({
      where: { approval_status: "pending", role: "student" },
    });
    const pendingEnrollments = await UserCourseAccess.count({
      where: { approval_status: "pending" },
    });
    const approvedEnrollments = await UserCourseAccess.count({
      where: { approval_status: "approved" },
    });

    return res.status(200).json({
      totalStudents,
      pendingUsers,
      pendingEnrollments,
      approvedEnrollments,
    });
  } catch (error) {
    console.error("🔥 Dashboard stats error:", error);
    return res.status(500).json({
      message: "Failed to fetch dashboard stats",
      error: error.message,
    });
  }
};

// ✅ Get Users by Status (approved / rejected)
const getApprovedOrRejectedUsers = async (req, res) => {
  try {
    const { status } = req.query;
    if (!["approved", "rejected"].includes(status)) {
      return res
        .status(400)
        .json({ message: "Status must be 'approved' or 'rejected'" });
    }

    console.log(`📥 Fetching users with status: ${status}`);
    const users = await User.findAll({ where: { approval_status: status } });

    return res.status(200).json(users); // ✅ Return array directly
  } catch (error) {
    console.error("🔥 Users by status error:", error);
    return res.status(500).json({
      message: "Failed to fetch users",
      error: error.message,
    });
  }
};

// ✅ Get Enrollments by Status
const getEnrollments = async (req, res) => {
  try {
    const { status } = req.query;
    if (!["pending", "approved"].includes(status)) {
      return res
        .status(400)
        .json({ message: "Status must be 'pending' or 'approved'" });
    }

    console.log(`📥 Fetching enrollments with status: ${status}`);
    const enrollments = await UserCourseAccess.findAll({
      where: { approval_status: status },
      include: [
        {
          model: User,
          as: "student",
          attributes: ["id", "name", "email"],
        },
        {
          model: Course,
          as: "course",
          attributes: ["id", "title"],
        },
        {
          model: User,
          as: "approver",
          attributes: ["id", "name"],
          required: false,
        },
      ],
    });

    return res.status(200).json(enrollments); // ✅ Return array directly
  } catch (error) {
    console.error("🔥 Enrollments error:", error);
    return res.status(500).json({
      message: "Failed to fetch enrollments",
      error: error.message,
    });
  }
};

// ✅ Get Pending Users
const getPendingUsers = async (req, res) => {
  try {
    console.log("📥 Fetching pending users...");
    const users = await User.findAll({
      where: { approval_status: "pending" },
      attributes: [
        "id",
        "name",
        "email",
        "role",
        "approval_status",
        "email_notification_status",
      ],
    });

    return res.status(200).json(users); // ✅ Return array directly
  } catch (error) {
    console.error("🔥 Pending users error:", error);
    return res.status(500).json({
      message: "Failed to fetch pending users",
      error: error.message,
    });
  }
};

// ✅ Approve User
const approveUser = async (req, res) => {
  const transaction = await User.sequelize.transaction();
  try {
    const { id } = req.params;
    console.log(`📥 Approving user with id: ${id}`);

    const user = await User.findByPk(id, { transaction });
    if (!user || user.role !== "student") {
      await transaction.rollback();
      return res.status(404).json({ error: "Student not found" });
    }

    let emailSent = false;
    try {
      await sendEmail(
        user.email,
        "Your account has been approved ✅",
        `<p>Hello ${user.name},</p><p>Your account has been approved.</p>`
      );
      emailSent = true;
    } catch (err) {
      console.error("❌ Error sending approval email:", err.message);
    }

    await user.update(
      {
        approval_status: "approved",
        email_notification_status: emailSent ? "sent" : "failed",
      },
      { transaction }
    );

    await transaction.commit();
    return res.status(200).json({ message: "User approved", emailSent });
  } catch (error) {
    await transaction.rollback();
    console.error("🔥 Approve user error:", error);
    return res.status(500).json({
      message: "Failed to approve user",
      error: error.message,
    });
  }
};

// ✅ Reject User
const rejectUser = async (req, res) => {
  const transaction = await User.sequelize.transaction();
  try {
    const { id } = req.params;
    console.log(`📥 Rejecting user with id: ${id}`);

    const user = await User.findByPk(id, { transaction });
    if (!user || user.role !== "student") {
      await transaction.rollback();
      return res.status(404).json({ error: "Student not found" });
    }

    let emailSent = false;
    try {
      await sendEmail(
        user.email,
        "Your account has been rejected ❌",
        `<p>Hello ${user.name},</p><p>Unfortunately, your account has been rejected.</p>`
      );
      emailSent = true;
    } catch (err) {
      console.error("❌ Error sending rejection email:", err.message);
    }

    await user.update(
      {
        approval_status: "rejected",
        email_notification_status: emailSent ? "sent" : "failed",
      },
      { transaction }
    );

    await transaction.commit();
    return res.status(200).json({ message: "User rejected", emailSent });
  } catch (error) {
    await transaction.rollback();
    console.error("🔥 Reject user error:", error);
    return res.status(500).json({
      message: "Failed to reject user",
      error: error.message,
    });
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
