// const { Sequelize, DataTypes } = require("sequelize");
// const sequelize = require("../config/db");

// // Import model definitions
// const initUser = require("./User");
// const initLesson = require("./Lesson");
// const initCourse = require("./Course");
// const initUserCourseAccess = require("./UserCourseAccess");
// const initLessonCompletion = require("./lessoncompletion");
// const initLessonProgress = require("./lessonProgress"); // ✅ Add this line

// const models = {};

// // Initialize models
// models.User = initUser(sequelize, DataTypes);
// models.Lesson = initLesson(sequelize, DataTypes);
// models.Course = initCourse(sequelize, DataTypes);
// models.UserCourseAccess = initUserCourseAccess(sequelize, DataTypes);
// models.LessonCompletion = initLessonCompletion(sequelize, DataTypes);
// models.LessonProgress = initLessonProgress(sequelize, DataTypes); // ✅ Register model

// // Apply associations
// Object.values(models).forEach((model) => {
//   if (typeof model.associate === "function") {
//     model.associate(models);
//   }
// });

// // Attach Sequelize instance and library
// models.sequelize = sequelize;
// models.Sequelize = Sequelize;

// module.exports = models;



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

// Step 3: Add sequelize references to the models object
models.sequelize = sequelize;
models.Sequelize = Sequelize;

// Step 4: Export the models object
module.exports = models;