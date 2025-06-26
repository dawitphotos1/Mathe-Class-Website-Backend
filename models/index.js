const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../config/db");

// Import model definitions
const initUser = require("./User");
const initLesson = require("./Lesson");
const initCourse = require("./Course");
const initUserCourseAccess = require("./UserCourseAccess");
const initLessonCompletion = require("./lessoncompletion");

const models = {};

// Initialize models
models.User = initUser(sequelize, DataTypes);
models.Lesson = initLesson(sequelize, DataTypes);
models.Course = initCourse(sequelize, DataTypes);
models.UserCourseAccess = initUserCourseAccess(sequelize, DataTypes);
models.LessonCompletion = initLessonCompletion(sequelize, DataTypes);

// Apply associations
Object.values(models).forEach((model) => {
  if (typeof model.associate === "function") {
    model.associate(models);
  }
});

// Attach Sequelize instance and library
models.sequelize = sequelize;
models.Sequelize = Sequelize;

module.exports = models;
