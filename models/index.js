
// const { Sequelize, DataTypes } = require("sequelize");
// const sequelize = require("../config/db");

// // Import model initializers
// const initUser = require("./User");
// const initCourse = require("./Course");
// const initLesson = require("./Lesson");
// const initUserCourseAccess = require("./UserCourseAccess");
// const initLessonCompletion = require("./lessoncompletion");
// const initLessonProgress = require("./lessonProgress");

// // Step 1: Initialize all models
// const models = {
//   User: initUser(sequelize, DataTypes),
//   Course: initCourse(sequelize, DataTypes),
//   Lesson: initLesson(sequelize, DataTypes),
//   UserCourseAccess: initUserCourseAccess(sequelize, DataTypes),
//   LessonCompletion: initLessonCompletion(sequelize, DataTypes),
//   LessonProgress: initLessonProgress(sequelize, DataTypes),
// };

// // ✅ Step 2: Automatically apply all associations
// Object.values(models).forEach((model) => {
//   if (typeof model.associate === "function") {
//     model.associate(models);
//   }
// });

// // Step 3: Add sequelize and Sequelize to export
// models.sequelize = sequelize;
// models.Sequelize = Sequelize;

// // Step 4: Export all models
// module.exports = models;



const { Sequelize, DataTypes } = require("sequelize");

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: "postgres",
  dialectOptions: { ssl: { require: true, rejectUnauthorized: false } },
});

const User = sequelize.define("User", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  role: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  subject: {
    type: DataTypes.STRING,
  },
});

const Course = sequelize.define("Course", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
  },
  category: {
    type: DataTypes.STRING,
  },
  slug: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  price: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  teacherId: {
    type: DataTypes.INTEGER,
    references: {
      model: User,
      key: "id",
    },
  },
  attachmentUrls: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: [],
  },
});

const Lesson = sequelize.define("Lesson", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  courseId: {
    type: DataTypes.INTEGER,
    references: {
      model: Course,
      key: "id",
    },
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  content: {
    type: DataTypes.TEXT,
  },
  contentType: {
    type: DataTypes.STRING,
    defaultValue: "text",
  },
  contentUrl: {
    type: DataTypes.STRING,
  },
  videoUrl: {
    type: DataTypes.STRING,
  },
  orderIndex: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  isUnitHeader: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  isPreview: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  unitId: {
    type: DataTypes.INTEGER,
  },
  userId: {
    type: DataTypes.INTEGER,
    references: {
      model: User,
      key: "id",
    },
  },
});

const UserCourseAccess = sequelize.define("UserCourseAccess", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    references: {
      model: User,
      key: "id",
    },
  },
  courseId: {
    type: DataTypes.INTEGER,
    references: {
      model: Course,
      key: "id",
    },
  },
  approved: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
});

Course.hasMany(Lesson, { foreignKey: "courseId" });
Lesson.belongsTo(Course, { foreignKey: "courseId" });
User.hasMany(Course, { foreignKey: "teacherId" });
Course.belongsTo(User, { foreignKey: "teacherId" });
User.hasMany(UserCourseAccess, { foreignKey: "userId" });
Course.hasMany(UserCourseAccess, { foreignKey: "courseId" });
UserCourseAccess.belongsTo(User, { foreignKey: "userId" });
UserCourseAccess.belongsTo(Course, { foreignKey: "courseId" });

module.exports = {
  sequelize,
  Sequelize,
  User,
  Course,
  Lesson,
  UserCourseAccess,
};