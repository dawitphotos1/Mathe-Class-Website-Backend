
// const { Sequelize, DataTypes } = require("sequelize");
// const sequelize = require("../config/db");

// // Initialize model definitions
// const initUser = require("./User");
// const initLesson = require("./Lesson");
// const initCourse = require("./Course");
// const initUserCourseAccess = require("./UserCourseAccess");
// const initLessonCompletion = require("./lessoncompletion");

// // Create a models container
// const models = {};

// // Instantiate models
// models.User = initUser(sequelize);
// models.Lesson = initLesson(sequelize, DataTypes);
// models.Course = initCourse(sequelize);
// models.UserCourseAccess = initUserCourseAccess(sequelize);
// models.LessonCompletion = initLessonCompletion(sequelize, DataTypes);

// // Add Sequelize to models
// models.Sequelize = Sequelize;
// models.sequelize = sequelize;

// // Apply associations
// Object.values(models).forEach((model) => {
//   if (typeof model.associate === "function") {
//     model.associate(models);
//   }
// });

// module.exports = models;


const fs = require("fs");
const path = require("path");
const Sequelize = require("sequelize");
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || "development";

let config;
try {
  config = require(path.join(__dirname, "../config/config.json"))[env];
} catch (err) {
  console.warn("config.json not found, falling back to environment variables");
  config = {
    use_env_variable: "DATABASE_URL",
    dialect: "postgres",
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    },
  };
}

const db = {};

let sequelize;
if (config.use_env_variable) {
  sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {
  sequelize = new Sequelize(
    config.database,
    config.username,
    config.password,
    config
  );
}

fs.readdirSync(__dirname)
  .filter((file) => {
    return (
      file.indexOf(".") !== 0 && file !== basename && file.slice(-3) === ".js"
    );
  })
  .forEach((file) => {
    const model = require(path.join(__dirname, file))(
      sequelize,
      Sequelize.DataTypes
    );
    db[model.name] = model;
  });

Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;