
// module.exports = (sequelize, DataTypes) => {
//   const LessonProgress = sequelize.define("LessonProgress", {
//     userId: {
//       type: DataTypes.INTEGER,
//       allowNull: false,
//     },
//     lessonId: {
//       type: DataTypes.INTEGER,
//       allowNull: false,
//     },
//     completed: {
//       type: DataTypes.BOOLEAN,
//       defaultValue: false,
//     },
//   });

//   return LessonProgress;
// };
  



// models/lessonProgress.js

const { Model, DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  class LessonProgress extends Model {}

  LessonProgress.init(
    {
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
      },
      lessonId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
      },
      progress: {
        type: DataTypes.FLOAT, // e.g., percentage complete
        defaultValue: 0,
      },
      lastViewedAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      sequelize,
      modelName: "LessonProgress",
      tableName: "LessonProgresses",
      timestamps: false,
    }
  );

  return LessonProgress;
};
