
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




const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../config/db");

// Import model definitions
const initUser = require("./User");
const initLesson = require("./Lesson");
const initCourse = require("./Course");
const initUserCourseAccess = require("./UserCourseAccess");
const initLessonCompletion = require("./lessoncompletion");

const models = {};

// Initialize models
models.User = initUser(sequelize, DataTypes);
models.Lesson = initLesson(sequelize, DataTypes);
models.Course = initCourse(sequelize, DataTypes);
models.UserCourseAccess = initUserCourseAccess(sequelize, DataTypes);
models.LessonCompletion = initLessonCompletion(sequelize, DataTypes);

// Apply associations
Object.values(models).forEach((model) => {
  if (typeof model.associate === "function") {
    model.associate(models);
  }
});

// Export Sequelize instance and models
models.sequelize = sequelize;
models.Sequelize = Sequelize;

module.exports = models;

