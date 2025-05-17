const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const UserCourseAccess = sequelize.define(
    "UserCourseAccess",
    {
      userId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        references: { model: "Users", key: "id" },
        onDelete: "CASCADE",
      },
      courseId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        references: { model: "Courses", key: "id" },
        onDelete: "CASCADE",
      },
      accessGrantedAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      tableName: "UserCourseAccess",
      timestamps: false,
    }
  );
  return UserCourseAccess;
};
