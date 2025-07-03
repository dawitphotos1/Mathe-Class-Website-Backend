
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

// ✅ Step 2: Automatically apply all associations
Object.values(models).forEach((model) => {
  if (typeof model.associate === "function") {
    model.associate(models);
  }
});

// Step 3: Add sequelize and Sequelize to export
models.sequelize = sequelize;
models.Sequelize = Sequelize;

// Step 4: Export all models
module.exports = models;
