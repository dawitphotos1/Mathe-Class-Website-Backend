// models/Lesson.js

const { Model, DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  class Lesson extends Model {}

  Lesson.init(
    {
      courseId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      content: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      contentType: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: "text",
      },
      contentUrl: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      videoUrl: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      isPreview: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      isUnitHeader: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      orderIndex: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      unitId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: "Lesson",
      tableName: "Lessons",
      timestamps: true,
    }
  );

  return Lesson;
};
