
const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../config/db");

// Import model initializers
const initUser = require("./User");
const initCourse = require("./Course");
const initLesson = require("./Lesson");
const initUserCourseAccess = require("./UserCourseAccess");
const initLessonCompletion = require("./lessoncompletion");
const initLessonProgress = require("./lessonProgress");
const initLessonView = require("./LessonView"); // ✅ NEW

// Step 1: Initialize all models
const models = {
  User: initUser(sequelize, DataTypes),
  Course: initCourse(sequelize, DataTypes),
  Lesson: initLesson(sequelize, DataTypes),
  UserCourseAccess: initUserCourseAccess(sequelize, DataTypes),
  LessonCompletion: initLessonCompletion(sequelize, DataTypes),
  LessonProgress: initLessonProgress(sequelize, DataTypes),
  LessonView: initLessonView(sequelize, DataTypes), // ✅ NEW
};

// Step 2: Apply associations
Object.values(models).forEach((model) => {
  if (typeof model.associate === "function") {
    model.associate(models);
  }
});

// Step 3: Attach Sequelize utilities
models.sequelize = sequelize;
models.Sequelize = Sequelize;

module.exports = models;
