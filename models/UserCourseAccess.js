// // models / UserCourseAccess.js;

// const { Model, DataTypes } = require("sequelize");

// module.exports = (sequelize) => {
//   class UserCourseAccess extends Model {}

//   UserCourseAccess.init(
//     {
//       userId: {
//         type: DataTypes.INTEGER,
//         allowNull: false,
//         primaryKey: true,
//       },
//       courseId: {
//         type: DataTypes.INTEGER,
//         allowNull: false,
//         primaryKey: true,
//       },
//       paymentStatus: {
//         type: DataTypes.ENUM("pending", "paid", "failed"),
//         defaultValue: "pending",
//         allowNull: false,
//       },
//       approvalStatus: {
//         type: DataTypes.ENUM("pending", "approved", "rejected"),
//         defaultValue: "pending",
//         allowNull: false,
//       },
//       approvedBy: {
//         type: DataTypes.INTEGER,
//         allowNull: true,
//       },
//       approvedAt: {
//         type: DataTypes.DATE,
//         allowNull: true,
//       },
//       accessGrantedAt: {
//         type: DataTypes.DATE,
//         allowNull: true,
//       },
//       approved: {
//         type: DataTypes.BOOLEAN,
//         defaultValue: false,
//         allowNull: false,
//       },
//     },
//     {
//       sequelize,
//       modelName: "UserCourseAccess",
//       tableName: "UserCourseAccess",
//       timestamps: true,
//     }
//   );

//   return UserCourseAccess;
// };


const { Model, DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  class UserCourseAccess extends Model {}

  UserCourseAccess.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: "users", key: "id" },
      },
      course_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: "courses", key: "id" },
      },
      payment_status: {
        type: DataTypes.ENUM("pending", "paid", "failed"),
        allowNull: false,
        defaultValue: "pending",
      },
      approval_status: {
        type: DataTypes.ENUM("pending", "approved", "rejected"),
        allowNull: false,
        defaultValue: "pending",
      },
      approved_by: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: { model: "users", key: "id" },
      },
      approved_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      access_granted_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      updated_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      sequelize,
      modelName: "UserCourseAccess",
      tableName: "usercourseaccess",
      timestamps: true,
      underscored: true,
    }
  );

  return UserCourseAccess;
};