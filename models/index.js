const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../config/db");

// Import model initializers
const initUser = require("./User");
const initCourse = require("./Course");
const initLesson = require("./Lesson");
const initUserCourseAccess = require("./UserCourseAccess");
const initLessonCompletion = require("./lessoncompletion");
const initLessonProgress = require("./lessonProgress");

// Step 1: Initialize all models
const models = {
  User: initUser(sequelize, DataTypes),
  Course: initCourse(sequelize, DataTypes),
  Lesson: initLesson(sequelize, DataTypes),
  UserCourseAccess: initUserCourseAccess(sequelize, DataTypes),
  LessonCompletion: initLessonCompletion(sequelize, DataTypes),
  LessonProgress: initLessonProgress(sequelize, DataTypes),
};

// ✅ Step 2: Apply associations here
Object.values(models).forEach((model) => {
  if (typeof model.associate === "function") {
    model.associate(models);
  }
});
// Add explicit associations for UserCourseAccess
models.UserCourseAccess.associate = (models) => {
  models.UserCourseAccess.belongsTo(models.Course, {
    foreignKey: "courseId",
    as: "course"
  });
  models.UserCourseAccess.belongsTo(models.User, {
    foreignKey: "userId",
    as: "user"
  });
};
// Step 3: Add sequelize references to the models object
models.sequelize = sequelize;
models.Sequelize = Sequelize;

// Step 4: Export the models object
module.exports = models;