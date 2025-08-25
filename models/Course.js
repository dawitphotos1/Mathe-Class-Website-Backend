// const { DataTypes } = require("sequelize");

// module.exports = (sequelize) => {
//   const Course = sequelize.define(
//     "Course",
//     {
//       id: {
//         type: DataTypes.INTEGER,
//         primaryKey: true,
//         autoIncrement: true,
//       },
//       title: {
//         type: DataTypes.STRING(255),
//         allowNull: false,
//       },
//       slug: {
//         type: DataTypes.STRING(255),
//         allowNull: false,
//         unique: true,
//       },
//       description: {
//         type: DataTypes.TEXT,
//       },
//       teacher_id: {
//         type: DataTypes.INTEGER,
//         allowNull: true,
//       },
//       price: {
//         type: DataTypes.DECIMAL(10, 2),
//         allowNull: false,
//       },
//     },
//     {
//       tableName: "courses", // Match schema.sql
//       timestamps: true,
//       createdAt: "created_at",
//       updatedAt: "updated_at",
//       underscored: true,
//     }
//   );

//   Course.associate = (models) => {
//     Course.hasMany(models.Lesson, { foreignKey: "course_id", as: "lessons" });
//     Course.belongsTo(models.User, { foreignKey: "teacher_id", as: "teacher" });
//   };

//   return Course;
// };





// models/Course.js
module.exports = (sequelize, DataTypes) => {
  const Course = sequelize.define(
    "Course",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
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
      subject: {
        type: DataTypes.STRING,
      },
      teacher_id: {
        type: DataTypes.INTEGER,
      },
      price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      slug: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      attachment_urls: {
        type: DataTypes.JSONB,
        defaultValue: [],
      },
      thumbnail_url: {
        type: DataTypes.STRING,
      },
      intro_video_url: {
        type: DataTypes.STRING,
      },
    },
    {
      tableName: "courses",
      underscored: true,
      timestamps: true,
    }
  );

  return Course;
};
