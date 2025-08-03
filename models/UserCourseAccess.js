
module.exports = (sequelize, DataTypes) => {
  const UserCourseAccess = sequelize.define("UserCourseAccess", {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    userId: { type: DataTypes.INTEGER, allowNull: false },
    courseId: { type: DataTypes.INTEGER, allowNull: false },
    approved: { type: DataTypes.BOOLEAN, defaultValue: false },
    accessGrantedAt: { type: DataTypes.DATE, allowNull: true },
  });

  UserCourseAccess.associate = (models) => {
    // Each enrollment belongs to one user
    UserCourseAccess.belongsTo(models.User, { foreignKey: "userId" });

    // Each enrollment belongs to one course
    UserCourseAccess.belongsTo(models.Course, { foreignKey: "courseId" });
  };

  return UserCourseAccess;
};
