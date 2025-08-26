// models/UserCourseAccess.js
module.exports = (sequelize, DataTypes) => {
  const UserCourseAccess = sequelize.define(
    "UserCourseAccess",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      course_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      payment_status: {
        type: DataTypes.ENUM("pending", "paid", "failed"),
        defaultValue: "pending",
      },
      approval_status: {
        type: DataTypes.ENUM("pending", "approved", "rejected"),
        defaultValue: "pending",
      },
      approved_by: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      approved_at: {
        type: DataTypes.DATE,
      },
      access_granted_at: {
        type: DataTypes.DATE,
      },
    },
    {
      tableName: "usercourseaccess",
      underscored: true,
      timestamps: true,
    }
  );

  return UserCourseAccess;
};
