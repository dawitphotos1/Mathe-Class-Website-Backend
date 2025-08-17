// models/UserCourseAccess.js
const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const UserCourseAccess = sequelize.define(
    "UserCourseAccess",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: "user_id",
      },
      course_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: "course_id",
      },
      payment_status: {
        type: DataTypes.ENUM("pending", "paid", "failed"),
        allowNull: false,
        defaultValue: "pending",
        field: "payment_status",
      },
      approval_status: {
        type: DataTypes.ENUM("pending", "approved", "rejected"),
        allowNull: false,
        defaultValue: "pending",
        field: "approval_status",
      },
      approved_by: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: "approved_by",
      },
      approved_at: {
        type: DataTypes.DATE,
        allowNull: true,
        field: "approved_at",
      },
      access_granted_at: {
        type: DataTypes.DATE,
        allowNull: true,
        field: "access_granted_at",
      },
    },
    {
      tableName: "usercourseaccess",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
      underscored: true,
    }
  );

  UserCourseAccess.associate = (models) => {
    UserCourseAccess.belongsTo(models.User, { foreignKey: "user_id", as: "student" });
    UserCourseAccess.belongsTo(models.Course, { foreignKey: "course_id", as: "course" });
    UserCourseAccess.belongsTo(models.User, { foreignKey: "approved_by", as: "approver" });
  };

  return UserCourseAccess;
};