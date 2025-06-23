// const { Model, DataTypes } = require("sequelize");

// class Lesson extends Model {
//   static associate(models) {
//     Lesson.belongsTo(models.Course, { foreignKey: "courseId", as: "course" });
//     Lesson.belongsTo(models.User, { foreignKey: "userId", as: "user" });
//     Lesson.belongsTo(models.Lesson, { foreignKey: "unitId", as: "unit" });
//   }
// }

// const initLesson = (sequelize) => {
//   Lesson.init(
//     {
//       id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
//       title: { type: DataTypes.STRING, allowNull: false },
//       contentType: { type: DataTypes.STRING, defaultValue: "text" },
//       contentUrl: { type: DataTypes.STRING },
//       isPreview: { type: DataTypes.BOOLEAN, defaultValue: false },
//       isUnitHeader: { type: DataTypes.BOOLEAN, defaultValue: false },
//       orderIndex: {
//         type: DataTypes.INTEGER,
//         allowNull: false,
//         defaultValue: 0,
//       },
//       courseId: { type: DataTypes.INTEGER, allowNull: false },
//       unitId: {
//         type: DataTypes.INTEGER,
//         allowNull: true,
//         references: { model: "Lessons", key: "id" },
//       },
//     },
//     {
//       sequelize,
//       modelName: "Lesson",
//       tableName: "Lessons",
//       timestamps: true,
//       indexes: [{ fields: ["isUnitHeader"] }, { fields: ["unitId"] }],
//     }
//   );
//   return Lesson;
// };

// module.exports = initLesson;


const { Model, DataTypes } = require("sequelize");

class Lesson extends Model {
  static associate(models) {
    Lesson.belongsTo(models.Course, { foreignKey: "courseId", as: "course" });
    Lesson.belongsTo(models.User, { foreignKey: "userId", as: "user" });
    Lesson.belongsTo(models.Lesson, { foreignKey: "unitId", as: "unitHeader" });
    Lesson.hasMany(models.Lesson, { foreignKey: "unitId", as: "unitLessons" });
  }
}

const initLesson = (sequelize) => {
  Lesson.init(
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      title: { type: DataTypes.STRING, allowNull: false },
      content: { type: DataTypes.TEXT, allowNull: true },
      contentType: { type: DataTypes.STRING, defaultValue: "text" },
      contentUrl: { type: DataTypes.STRING, allowNull: true },
      isPreview: { type: DataTypes.BOOLEAN, defaultValue: false },
      isUnitHeader: { type: DataTypes.BOOLEAN, defaultValue: false },
      orderIndex: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      courseId: { type: DataTypes.INTEGER, allowNull: false },
      unitId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: { model: "Lessons", key: "id" },
      },
    },
    {
      sequelize,
      modelName: "Lesson",
      tableName: "Lessons",
      timestamps: true,
      indexes: [{ fields: ["isUnitHeader"] }, { fields: ["unitId"] }],
    }
  );
  return Lesson;
};

module.exports = initLesson;