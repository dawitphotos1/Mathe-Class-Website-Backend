// // models/index.js

// const fs = require("fs");
// const path = require("path");
// const Sequelize = require("sequelize");
// const sequelize = require("../config/db");

// const db = {};

// // Dynamically load models
// fs.readdirSync(__dirname)
//   .filter((file) => file !== "index.js" && file.endsWith(".js"))
//   .forEach((file) => {
//     const model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes);
//     db[model.name] = model;
//   });

// // Call associate methods (if any model defines db.Model.associate = function(db) { ... })
// Object.keys(db).forEach((modelName) => {
//   if ("associate" in db[modelName]) {
//     db[modelName].associate(db);
//   }
// });

// //
// // ✅ Define associations explicitly (You can safely add here)
// db.User.belongsToMany(db.Course, {
//   through: db.UserCourseAccess,
//   foreignKey: "userId",
//   otherKey: "courseId",
//   as: "enrolledCourses",
// });

// db.Course.belongsToMany(db.User, {
//   through: db.UserCourseAccess,
//   foreignKey: "courseId",
//   otherKey: "userId",
//   as: "students",
// });

// db.UserCourseAccess.belongsTo(db.User, { foreignKey: "userId", as: "User" });
// db.UserCourseAccess.belongsTo(db.Course, { foreignKey: "courseId", as: "Course" });

// //
// // Add reverse optional if you want
// // db.User.hasMany(db.UserCourseAccess, { foreignKey: "userId" });
// // db.Course.hasMany(db.UserCourseAccess, { foreignKey: "courseId" });

// db.sequelize = sequelize;
// db.Sequelize = Sequelize;

// module.exports = db;




const fs = require("fs");
const path = require("path");
const Sequelize = require("sequelize");
const sequelize = require("../config/db");

const db = {};

fs.readdirSync(__dirname)
  .filter((file) => file !== "index.js" && file.endsWith(".js"))
  .forEach((file) => {
    const model = require(path.join(__dirname, file))(
      sequelize,
      Sequelize.DataTypes
    );
    db[model.name] = model;
  });

Object.keys(db).forEach((modelName) => {
  if ("associate" in db[modelName]) {
    db[modelName].associate(db);
  }
});

db.User.belongsToMany(db.Course, {
  through: db.UserCourseAccess,
  foreignKey: "user_id",
  otherKey: "course_id",
  as: "enrolledCourses",
});

db.Course.belongsToMany(db.User, {
  through: db.UserCourseAccess,
  foreignKey: "course_id",
  otherKey: "user_id",
  as: "students",
});

db.UserCourseAccess.belongsTo(db.User, { foreignKey: "user_id", as: "User" });
db.UserCourseAccess.belongsTo(db.Course, {
  foreignKey: "course_id",
  as: "Course",
});
db.UserCourseAccess.belongsTo(db.User, {
  foreignKey: "approved_by",
  as: "ApprovedBy",
});

db.Course.belongsTo(db.User, { foreignKey: "teacher_id", as: "Teacher" });
db.Lesson.belongsTo(db.Course, { foreignKey: "course_id", as: "Course" });
db.Lesson.belongsTo(db.User, { foreignKey: "user_id", as: "User" });
db.Lesson.belongsTo(db.Lesson, { foreignKey: "unit_id", as: "Unit" });

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;