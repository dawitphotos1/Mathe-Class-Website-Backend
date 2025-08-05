// // models/UserCourseAccess.js
// module.exports = (sequelize, DataTypes) => {
//   const UserCourseAccess = sequelize.define(
//     "UserCourseAccess",
//     {
//       id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
//       userId: { type: DataTypes.INTEGER, allowNull: false },
//       courseId: { type: DataTypes.INTEGER, allowNull: false },
//       paymentStatus: {
//         type: DataTypes.ENUM("pending", "paid", "failed"),
//         allowNull: false,
//         defaultValue: "pending",
//       },
//       approvalStatus: {
//         type: DataTypes.ENUM("pending", "approved", "rejected"),
//         allowNull: false,
//         defaultValue: "pending",
//       },
//       approvedBy: { type: DataTypes.INTEGER, allowNull: true },
//       approvedAt: { type: DataTypes.DATE, allowNull: true },
//       accessGrantedAt: { type: DataTypes.DATE, allowNull: true },
//     },
//     {
//       timestamps: true,
//       underscored: true,
//       tableName: "UserCourseAccess",
//     }
//   );

//   UserCourseAccess.associate = (models) => {
//     UserCourseAccess.belongsTo(models.User, { foreignKey: "userId", as: "User" });
//     UserCourseAccess.belongsTo(models.Course, { foreignKey: "courseId", as: "Course" });
//     UserCourseAccess.belongsTo(models.User, { foreignKey: "approvedBy", as: "Approver" });
//   };

//   return UserCourseAccess;
// };



// models/UserCourseAccess.js

const { Model, DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  class UserCourseAccess extends Model {}

  UserCourseAccess.init(
    {
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
      },
      courseId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
      },
      paymentStatus: {
        type: DataTypes.ENUM("pending", "paid", "failed"),
        defaultValue: "pending",
        allowNull: false,
      },
      approvalStatus: {
        type: DataTypes.ENUM("pending", "approved", "rejected"),
        defaultValue: "pending",
        allowNull: false,
      },
      approvedBy: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      approvedAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      accessGrantedAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      approved: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "UserCourseAccess",
      tableName: "UserCourseAccess",
      timestamps: true,
    }
  );

  return UserCourseAccess;
};
