
// const fs = require("fs");
// const path = require("path");
// const Sequelize = require("sequelize");
// const basename = path.basename(__filename);
// const sequelize = require("../config/db"); // Import the existing Sequelize instance
// const db = {};

// fs.readdirSync(__dirname)
//   .filter((file) => file !== basename && file.endsWith(".js"))
//   .forEach((file) => {
//     const model = require(path.join(__dirname, file))(
//       sequelize,
//       Sequelize.DataTypes
//     );
//     db[model.name] = model;
//   });

// // Define associations
// const { Course, Lesson, User, UserCourseAccess } = db;

// if (Course && Lesson && User && UserCourseAccess) {
//   // Courses <-> Lessons
//   Course.belongsTo(User, {
//     foreignKey: "teacher_id",
//     as: "teacher",
//   });

//   Course.hasMany(Lesson, {
//     foreignKey: "course_id",
//     as: "lessons",
//   });

//   Lesson.belongsTo(Course, {
//     foreignKey: "course_id",
//     as: "course",
//   });

//   User.hasMany(Course, {
//     foreignKey: "teacher_id",
//     as: "courses",
//   });

//   // Many-to-Many (for enrolled courses)
//   User.belongsToMany(Course, {
//     through: UserCourseAccess,
//     foreignKey: "user_id",
//     otherKey: "course_id",
//     as: "enrolledCourses",
//   });

//   Course.belongsToMany(User, {
//     through: UserCourseAccess,
//     foreignKey: "course_id",
//     otherKey: "user_id",
//     as: "students",
//   });

//   // ✅ Fix for AdminController expectations:
//   UserCourseAccess.belongsTo(User, { foreignKey: "user_id", as: "student" });
//   UserCourseAccess.belongsTo(Course, { foreignKey: "course_id", as: "course" });
//   UserCourseAccess.belongsTo(User, {
//     foreignKey: "approved_by",
//     as: "approver",
//   });

//   User.hasMany(UserCourseAccess, { foreignKey: "user_id", as: "enrollments" });
//   Course.hasMany(UserCourseAccess, {
//     foreignKey: "course_id",
//     as: "enrollments",
//   });
//   User.hasMany(UserCourseAccess, {
//     foreignKey: "approved_by",
//     as: "approvedEnrollments",
//   });
// }

// db.sequelize = sequelize; // Attach the Sequelize instance
// db.Sequelize = Sequelize; // Attach Sequelize class for convenience

// module.exports = db;



const fs = require("fs");
const path = require("path");
const Sequelize = require("sequelize");
const sequelize = require("../config/db"); // your Sequelize instance

const basename = path.basename(__filename);
const db = {};

// Load all model files in this folder (except index.js)
fs.readdirSync(__dirname)
  .filter((file) => file !== basename && file.endsWith(".js"))
  .forEach((file) => {
    const filePath = path.join(__dirname, file);
    const importedModel = require(filePath);

    // Support both class-style and function-style model definitions
    const model =
      typeof importedModel === "function"
        ? importedModel(sequelize, Sequelize.DataTypes)
        : importedModel.init
        ? importedModel
        : null;

    if (model) {
      db[model.name] = model;
    } else {
      console.warn(`⚠️ Could not load model from file: ${file}`);
    }
  });

// Setup associations
Object.values(db).forEach((model) => {
  if (typeof model.associate === "function") {
    model.associate(db);
  }
});

// Add Sequelize instance to the db object
db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;



// // models/User.js
// module.exports = (sequelize, DataTypes) => {
//   const User = sequelize.define(
//     "User",
//     {
//       id: {
//         type: DataTypes.INTEGER,
//         autoIncrement: true,
//         primaryKey: true,
//       },
//       name: {
//         type: DataTypes.STRING,
//         allowNull: false,
//       },
//       email: {
//         type: DataTypes.STRING,
//         unique: true,
//         allowNull: false,
//         validate: { isEmail: true },
//       },
//       password: {
//         type: DataTypes.STRING,
//         allowNull: false,
//       },
//       role: {
//         type: DataTypes.ENUM("student", "teacher", "admin"),
//         defaultValue: "student",
//         allowNull: false,
//       },
//       subject: DataTypes.STRING,
//       approval_status: {
//         type: DataTypes.ENUM("pending", "approved", "rejected"),
//         defaultValue: "pending",
//       },
//       lastLogin: DataTypes.DATE,
//       created_at: {
//         type: DataTypes.DATE,
//         allowNull: false,
//         defaultValue: DataTypes.NOW,
//       },
//       updated_at: {
//         type: DataTypes.DATE,
//         allowNull: false,
//         defaultValue: DataTypes.NOW,
//       },
//     },
//     {
//       tableName: "users",
//       timestamps: false,
//       underscored: true,
//     }
//   );
//   return User;
// };
