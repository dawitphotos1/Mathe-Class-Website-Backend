// const fs = require("fs");
// const path = require("path");
// const Sequelize = require("sequelize");
// const sequelize = require("../config/db"); // your Sequelize instance

// const basename = path.basename(__filename);
// const db = {};

// // Load all model files in this folder (except index.js)
// fs.readdirSync(__dirname)
//   .filter((file) => file !== basename && file.endsWith(".js"))
//   .forEach((file) => {
//     const filePath = path.join(__dirname, file);
//     const importedModel = require(filePath);

//     // Support both class-style and function-style model definitions
//     const model =
//       typeof importedModel === "function"
//         ? importedModel(sequelize, Sequelize.DataTypes)
//         : importedModel.init
//         ? importedModel
//         : null;

//     if (model) {
//       db[model.name] = model;
//     } else {
//       console.warn(`⚠️ Could not load model from file: ${file}`);
//     }
//   });

// // Setup associations
// Object.values(db).forEach((model) => {
//   if (typeof model.associate === "function") {
//     model.associate(db);
//   }
// });

// // Add Sequelize instance to the db object
// db.sequelize = sequelize;
// db.Sequelize = Sequelize;

// module.exports = db;




// models/index.js
const fs = require("fs");
const path = require("path");
const Sequelize = require("sequelize");
const sequelize = require("../config/db");

const basename = path.basename(__filename);
const db = {};

// Load all models
fs.readdirSync(__dirname)
  .filter((file) => file !== basename && file.endsWith(".js"))
  .forEach((file) => {
    const modelDef = require(path.join(__dirname, file));
    const model =
      typeof modelDef === "function"
        ? modelDef(sequelize, Sequelize.DataTypes)
        : modelDef.init
        ? modelDef
        : null;

    if (model) {
      db[model.name] = model;
    } else {
      console.warn(`⚠️ Could not load model from file: ${file}`);
    }
  });

// =========================
// 🔗 Associations
// =========================
const { User, Course, UserCourseAccess } = db;

if (User && Course && UserCourseAccess) {
  // UserCourseAccess ↔ User (student)
  UserCourseAccess.belongsTo(User, {
    as: "student",
    foreignKey: "user_id",
  });
  User.hasMany(UserCourseAccess, {
    as: "enrollments",
    foreignKey: "user_id",
  });

  // UserCourseAccess ↔ Course
  UserCourseAccess.belongsTo(Course, {
    as: "course",
    foreignKey: "course_id",
  });
  Course.hasMany(UserCourseAccess, {
    as: "enrollments",
    foreignKey: "course_id",
  });

  // UserCourseAccess ↔ User (approver)
  UserCourseAccess.belongsTo(User, {
    as: "approver",
    foreignKey: "approved_by",
  });
}

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
