// models / UserCourseAccess.js;

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
