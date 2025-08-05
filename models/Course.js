
// models/Course.js

const { Model, DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  class Course extends Model {}

  Course.init(
    {
      title: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      category: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      subject: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      slug: {
        type: DataTypes.STRING,
        unique: true,
      },
      teacherId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      attachmentUrls: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        allowNull: true,
      },
      thumbnailUrl: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      introVideoUrl: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: "Course",
      tableName: "Courses",
      timestamps: true,
    }
  );

  return Course;
};
