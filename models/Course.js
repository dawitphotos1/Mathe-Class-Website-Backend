
// // models/Course.js

// const { Model, DataTypes } = require("sequelize");

// module.exports = (sequelize) => {
//   class Course extends Model {}

//   Course.init(
//     {
//       title: {
//         type: DataTypes.STRING,
//         allowNull: false,
//       },
//       description: {
//         type: DataTypes.TEXT,
//         allowNull: true,
//       },
//       category: {
//         type: DataTypes.STRING,
//         allowNull: true,
//       },
//       subject: {
//         type: DataTypes.STRING,
//         allowNull: true,
//       },
//       price: {
//         type: DataTypes.DECIMAL(10, 2),
//         allowNull: false,
//       },
//       slug: {
//         type: DataTypes.STRING,
//         unique: true,
//       },
//       teacherId: {
//         type: DataTypes.INTEGER,
//         allowNull: true,
//       },
//       attachmentUrls: {
//         type: DataTypes.ARRAY(DataTypes.STRING),
//         allowNull: true,
//       },
//       thumbnailUrl: {
//         type: DataTypes.STRING,
//         allowNull: true,
//       },
//       introVideoUrl: {
//         type: DataTypes.STRING,
//         allowNull: true,
//       },
//     },
//     {
//       sequelize,
//       modelName: "Course",
//       tableName: "Courses",
//       timestamps: true,
//     }
//   );

//   return Course;
// };




const { Model, DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  class Course extends Model {}

  Course.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      title: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      teacher_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: { model: "users", key: "id" },
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      updated_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      sequelize,
      modelName: "Course",
      tableName: "courses",
      timestamps: true,
      underscored: true,
    }
  );

  return Course;
};