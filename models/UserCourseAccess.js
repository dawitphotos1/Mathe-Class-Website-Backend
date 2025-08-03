
// module.exports = (sequelize, DataTypes) => {
//   const UserCourseAccess = sequelize.define("UserCourseAccess", {
//     id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
//     userId: { type: DataTypes.INTEGER, allowNull: false },
//     courseId: { type: DataTypes.INTEGER, allowNull: false },
//     approved: { type: DataTypes.BOOLEAN, defaultValue: false },
//     accessGrantedAt: { type: DataTypes.DATE, allowNull: true },
//   });

//   UserCourseAccess.associate = (models) => {
//     // Each enrollment belongs to one user
//     UserCourseAccess.belongsTo(models.User, { foreignKey: "userId" });

//     // Each enrollment belongs to one course
//     UserCourseAccess.belongsTo(models.Course, { foreignKey: "courseId" });
//   };

//   return UserCourseAccess;
// };



// models/UserCourseAccess.js
module.exports = (sequelize, DataTypes) => {
  const UserCourseAccess = sequelize.define(
    "UserCourseAccess",
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      userId: { type: DataTypes.INTEGER, allowNull: false },
      courseId: { type: DataTypes.INTEGER, allowNull: false },
      paymentStatus: {
        type: DataTypes.ENUM("pending", "paid", "failed"),
        allowNull: false,
        defaultValue: "pending",
      },
      approvalStatus: {
        type: DataTypes.ENUM("pending", "approved", "rejected"),
        allowNull: false,
        defaultValue: "pending",
      },
      approvedBy: { type: DataTypes.INTEGER, allowNull: true }, // user ID of approving admin/teacher
      approvedAt: { type: DataTypes.DATE, allowNull: true },
      accessGrantedAt: { type: DataTypes.DATE, allowNull: true },
    },
    {
      timestamps: true,
      underscored: true,
      tableName: "UserCourseAccess",
    }
  );

  UserCourseAccess.associate = (models) => {
    UserCourseAccess.belongsTo(models.User, { foreignKey: "userId", as: "User" });
    UserCourseAccess.belongsTo(models.Course, { foreignKey: "courseId", as: "Course" });
    UserCourseAccess.belongsTo(models.User, { foreignKey: "approvedBy", as: "Approver" });
  };

  return UserCourseAccess;
};
