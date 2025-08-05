// // models/index.js
// const { Sequelize, DataTypes } = require("sequelize");
// const sequelize = require("../config/db");

// // Import model initializers
// const initUser = require("./User");
// const initCourse = require("./Course");
// const initLesson = require("./Lesson");
// const initUserCourseAccess = require("./UserCourseAccess");
// const initLessonCompletion = require("./lessoncompletion");
// const initLessonProgress = require("./lessonProgress");
// const initLessonView = require("./LessonView");

// // Initialize all models
// const models = {
//   User: initUser(sequelize, DataTypes),
//   Course: initCourse(sequelize, DataTypes),
//   Lesson: initLesson(sequelize, DataTypes),
//   UserCourseAccess: initUserCourseAccess(sequelize, DataTypes),
//   LessonCompletion: initLessonCompletion(sequelize, DataTypes),
//   LessonProgress: initLessonProgress(sequelize, DataTypes),
//   LessonView: initLessonView(sequelize, DataTypes),
// };

// // Apply associations
// Object.values(models).forEach((model) => {
//   if (typeof model.associate === "function") {
//     model.associate(models);
//   }
// });

// // Attach Sequelize utilities
// models.sequelize = sequelize;
// models.Sequelize = Sequelize;

// module.exports = models;



// models/index.js

const fs = require("fs");
const path = require("path");
const Sequelize = require("sequelize");
const sequelize = require("../config/db");

const db = {};

// Dynamically load models
fs.readdirSync(__dirname)
  .filter((file) => file !== "index.js" && file.endsWith(".js"))
  .forEach((file) => {
    const model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes);
    db[model.name] = model;
  });

// Call associate methods (if any model defines db.Model.associate = function(db) { ... })
Object.keys(db).forEach((modelName) => {
  if ("associate" in db[modelName]) {
    db[modelName].associate(db);
  }
});

//
// ✅ Define associations explicitly (You can safely add here)
db.User.belongsToMany(db.Course, {
  through: db.UserCourseAccess,
  foreignKey: "userId",
  otherKey: "courseId",
  as: "enrolledCourses",
});

db.Course.belongsToMany(db.User, {
  through: db.UserCourseAccess,
  foreignKey: "courseId",
  otherKey: "userId",
  as: "students",
});

db.UserCourseAccess.belongsTo(db.User, { foreignKey: "userId", as: "User" });
db.UserCourseAccess.belongsTo(db.Course, { foreignKey: "courseId", as: "Course" });

//
// Add reverse optional if you want
// db.User.hasMany(db.UserCourseAccess, { foreignKey: "userId" });
// db.Course.hasMany(db.UserCourseAccess, { foreignKey: "courseId" });

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
