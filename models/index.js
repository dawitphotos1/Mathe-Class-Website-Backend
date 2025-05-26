
// const { Sequelize } = require("sequelize");
// const sequelize = require("../config/db");

// const initUser = require("./User");
// const initLesson = require("./Lesson");
// const initCourse = require("./Course");
// const initUserCourseAccess = require("./UserCourseAccess");

// const models = {};

// models.Sequelize = Sequelize;
// models.sequelize = sequelize;

// models.User = initUser(sequelize);
// models.Lesson = initLesson(sequelize);
// models.Course = initCourse(sequelize);
// models.UserCourseAccess = initUserCourseAccess(sequelize);

// // Setup associations
// models.User.associate(models);
// models.Lesson.associate(models);
// models.UserCourseAccess.associate(models);
// models.Course.associate(models);

// module.exports = models;



const { Sequelize, DataTypes } = require("sequelize"); // ✅ import DataTypes
const sequelize = require("../config/db");

const initUser = require("./User");
const initLesson = require("./Lesson");
const initCourse = require("./Course");
const initUserCourseAccess = require("./UserCourseAccess");

const models = {};

models.Sequelize = Sequelize;
models.sequelize = sequelize;

models.User = initUser(sequelize, DataTypes); // ✅ Pass DataTypes
models.Lesson = initLesson(sequelize, DataTypes); // ✅ Same here
models.Course = initCourse(sequelize, DataTypes); // ✅ Same here
models.UserCourseAccess = initUserCourseAccess(sequelize, DataTypes); // ✅ Same here

// Setup associations
models.User.associate(models);
models.Lesson.associate(models);
models.UserCourseAccess.associate(models);
models.Course.associate(models);

module.exports = models;
