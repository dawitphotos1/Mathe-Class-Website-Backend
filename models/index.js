
// // const { Sequelize, DataTypes } = require("sequelize");
// // const sequelize = require("../config/db");

// // // Model initializers
// // const initUser = require("./User");
// // const initLesson = require("./Lesson");
// // const initCourse = require("./Course");
// // const initUserCourseAccess = require("./UserCourseAccess");
// // const initLessonCompletion = require("./lessoncompletion"); // ← Add this

// // const models = {};

// // // Initialize models
// // models.User = initUser(sequelize);
// // models.Lesson = initLesson(sequelize);
// // models.Course = initCourse(sequelize);
// // models.UserCourseAccess = initUserCourseAccess(sequelize);
// // models.LessonCompletion = initLessonCompletion(sequelize, DataTypes); // ← Corrected assignment

// // // Sequelize setup
// // models.Sequelize = Sequelize;
// // models.sequelize = sequelize;

// // // 🔐 Setup associations (after models are initialized)
// // if (models.User.associate) models.User.associate(models);
// // if (models.Lesson.associate) models.Lesson.associate(models);
// // if (models.Course.associate) models.Course.associate(models);
// // if (models.UserCourseAccess.associate) models.UserCourseAccess.associate(models);
// // if (models.LessonCompletion.associate) models.LessonCompletion.associate(models); // Optional

// // module.exports = models;


// const { Sequelize, DataTypes } = require("sequelize");
// const sequelize = require("../config/db");

// // Initialize model functions
// const initUser = require("./User");
// const initLesson = require("./Lesson");
// const initCourse = require("./Course");
// const initUserCourseAccess = require("./UserCourseAccess");
// const initLessonCompletion = require("./lessoncompletion");

// // Container for all models
// const models = {};

// // ✅ Initialize models
// models.User = initUser(sequelize);
// models.Lesson = initLesson(sequelize);
// models.Course = initCourse(sequelize);
// models.UserCourseAccess = initUserCourseAccess(sequelize);
// models.LessonCompletion = initLessonCompletion(sequelize, DataTypes); // <- pass DataTypes if used inside model

// // ✅ Sequelize instance and constructor
// models.Sequelize = Sequelize;
// models.sequelize = sequelize;

// // ✅ Setup associations (after initialization)
// Object.values(models).forEach((model) => {
//   if (typeof model.associate === "function") {
//     model.associate(models);
//   }
// });

// module.exports = models;




const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../config/db");

// Initialize model definitions
const initUser = require("./User");
const initLesson = require("./Lesson");
const initCourse = require("./Course");
const initUserCourseAccess = require("./UserCourseAccess");
const initLessonCompletion = require("./lessoncompletion");

// Create a models container
const models = {};

// Instantiate models
models.User = initUser(sequelize);
models.Lesson = initLesson(sequelize, DataTypes);
models.Course = initCourse(sequelize);
models.UserCourseAccess = initUserCourseAccess(sequelize);
models.LessonCompletion = initLessonCompletion(sequelize, DataTypes);

// Add Sequelize to models
models.Sequelize = Sequelize;
models.sequelize = sequelize;

// Apply associations
Object.values(models).forEach((model) => {
  if (typeof model.associate === "function") {
    model.associate(models);
  }
});

module.exports = models;
