// // models/lessoncompletion.js

// module.exports = (sequelize, DataTypes) => {
//   const LessonCompletion = sequelize.define("LessonCompletion", {
//     userId: {
//       type: DataTypes.INTEGER,
//       allowNull: false,
//     },
//     lessonId: {
//       type: DataTypes.INTEGER,
//       allowNull: false,
//     },
//     completedAt: {
//       type: DataTypes.DATE,
//       allowNull: false,
//       defaultValue: DataTypes.NOW,
//     },
//   });

//   // Optional: associations
//   LessonCompletion.associate = (models) => {
//     LessonCompletion.belongsTo(models.User, { foreignKey: "userId" });
//     LessonCompletion.belongsTo(models.Lesson, { foreignKey: "lessonId" });
//   };

//   return LessonCompletion;
// };




// models/lessoncompletion.js

const { Model, DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  class LessonCompletion extends Model {}

  LessonCompletion.init(
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
      completedAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      sequelize,
      modelName: "LessonCompletion",
      tableName: "LessonCompletions",
      timestamps: false,
    }
  );

  return LessonCompletion;
};
