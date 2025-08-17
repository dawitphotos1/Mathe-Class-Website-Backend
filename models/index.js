
const fs = require("fs");
const path = require("path");
const Sequelize = require("sequelize");
const basename = path.basename(__filename);
const sequelize = require("../config/db"); // Import the existing Sequelize instance
const db = {};

fs.readdirSync(__dirname)
  .filter((file) => file !== basename && file.endsWith(".js"))
  .forEach((file) => {
    const model = require(path.join(__dirname, file))(
      sequelize,
      Sequelize.DataTypes
    );
    db[model.name] = model;
  });

// Define associations
const { Course, Lesson, User, UserCourseAccess } = db;

if (Course && Lesson && User) {
  Course.belongsTo(User, {
    foreignKey: "teacher_id",
    as: "teacher",
  });

  Course.hasMany(Lesson, {
    foreignKey: "course_id",
    as: "lessons",
  });

  Lesson.belongsTo(Course, {
    foreignKey: "course_id",
    as: "course",
  });

  User.hasMany(Course, {
    foreignKey: "teacher_id",
    as: "courses",
  });

  User.belongsToMany(Course, {
    through: UserCourseAccess,
    foreignKey: "user_id",
    otherKey: "course_id",
    as: "enrolledCourses",
  });

  Course.belongsToMany(User, {
    through: UserCourseAccess,
    foreignKey: "course_id",
    otherKey: "user_id",
    as: "students",
  });
}

db.sequelize = sequelize; // Attach the Sequelize instance
db.Sequelize = Sequelize; // Attach Sequelize class for convenience

module.exports = db;
