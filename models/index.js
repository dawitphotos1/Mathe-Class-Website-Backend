const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../config/db");

// Importing models with correct filenames (case-sensitive)
const User = require("./User")(sequelize, DataTypes);
const Lesson = require("./Lesson")(sequelize, DataTypes);
const Course = require("./Course")(sequelize, DataTypes);
const UserCourseAccess = require("./UserCourseAccess")(sequelize, DataTypes);

// Define associations
User.belongsToMany(Course, {
  through: UserCourseAccess,
  foreignKey: "userId",
  otherKey: "courseId",
});

Course.belongsToMany(User, {
  through: UserCourseAccess,
  foreignKey: "courseId",
  otherKey: "userId",
});

Lesson.belongsTo(Course, { foreignKey: "courseId" });
Lesson.belongsTo(User, { foreignKey: "userId" });

module.exports = { sequelize, User, Lesson, Course, UserCourseAccess };
