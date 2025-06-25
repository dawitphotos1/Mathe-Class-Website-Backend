
// models/index.js
const { Sequelize } = require("sequelize");
const sequelize = require("../config/db");

const initUser = require("./User");
const initLesson = require("./Lesson");
const initCourse = require("./Course");
const initUserCourseAccess = require("./UserCourseAccess");

const models = {};
LessonCompletion: require("./lessoncompletion")(sequelize, DataTypes),
  // Sequelize setup
  (models.Sequelize = Sequelize);
models.sequelize = sequelize;

// Initialize models
models.User = initUser(sequelize);
models.Lesson = initLesson(sequelize);
models.Course = initCourse(sequelize);
models.UserCourseAccess = initUserCourseAccess(sequelize);

// 🔐 Setup associations (after models are initialized)
if (models.User.associate) models.User.associate(models);
if (models.Lesson.associate) models.Lesson.associate(models);
if (models.Course.associate) models.Course.associate(models);
if (models.UserCourseAccess.associate) models.UserCourseAccess.associate(models);

module.exports = models;

