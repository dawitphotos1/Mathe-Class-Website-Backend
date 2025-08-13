const fs = require("fs");
const path = require("path");
const Sequelize = require("sequelize");
const sequelize = require("../config/db");

const db = {};

// Dynamically load all models in /models
fs.readdirSync(__dirname)
  .filter((file) => file !== "index.js" && file.endsWith(".js"))
  .forEach((file) => {
    const model = require(path.join(__dirname, file))(
      sequelize,
      Sequelize.DataTypes
    );
    db[model.name] = model;
  });

// =========================
// Associations
// =========================

// Many-to-Many between User and Course through UserCourseAccess
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

// Enrollments (UserCourseAccess) relationships
db.UserCourseAccess.belongsTo(db.User, {
  foreignKey: "user_id",
  as: "student",
});
db.UserCourseAccess.belongsTo(db.Course, {
  foreignKey: "course_id",
  as: "course",
});
db.UserCourseAccess.belongsTo(db.User, {
  foreignKey: "approved_by",
  as: "approver",
});

// Teacher for a course
db.Course.belongsTo(db.User, { foreignKey: "teacher_id", as: "teacher" });

// Lesson relationships
if (db.Lesson) {
  db.Lesson.belongsTo(db.Course, { foreignKey: "course_id", as: "course" });
  db.Lesson.belongsTo(db.User, { foreignKey: "user_id", as: "creator" });
  db.Lesson.belongsTo(db.Lesson, { foreignKey: "unit_id", as: "unit" });
}

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
