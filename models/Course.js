
// module.exports = (sequelize, DataTypes) => {
//   const Course = sequelize.define("Course", {
//     id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
//     title: { type: DataTypes.STRING, allowNull: false },
//     slug: { type: DataTypes.STRING, allowNull: false, unique: true },
//     description: { type: DataTypes.TEXT, allowNull: true },
//     price: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
//     subject: { type: DataTypes.STRING, allowNull: false },
//     category: { type: DataTypes.STRING, allowNull: false },
//     teacherId: { type: DataTypes.INTEGER, allowNull: true }, // Allow null
//     studentCount: {
//       type: DataTypes.INTEGER,
//       allowNull: false,
//       defaultValue: 0,
//     },
//     thumbnail: { type: DataTypes.STRING, allowNull: true },
//     materialUrl: { type: DataTypes.STRING, allowNull: true },
//     createdAt: { type: DataTypes.DATE, allowNull: false },
//     updatedAt: { type: DataTypes.DATE, allowNull: false },
//   });

//   Course.associate = (models) => {
//     Course.hasMany(models.Lesson, { as: "lessons", foreignKey: "courseId" });
//     Course.belongsTo(models.User, { as: "teacher", foreignKey: "teacherId" });
//     Course.hasMany(models.UserCourseAccess, { foreignKey: "courseId" });
//   };

//   return Course;
// };




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
