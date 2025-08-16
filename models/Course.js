
// const { Model, DataTypes } = require("sequelize");

// module.exports = (sequelize) => {
//   class Course extends Model {}

//   Course.init(
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
//       description: {
//         type: DataTypes.TEXT,
//         allowNull: true,
//       },
//       price: {
//         type: DataTypes.DECIMAL(10, 2),
//         allowNull: false,
//       },
//       teacher_id: {
//         type: DataTypes.INTEGER,
//         allowNull: true,
//         references: { model: "users", key: "id" },
//       },
//       slug: {
//         type: DataTypes.STRING(255),
//         allowNull: false,
//         unique: true,
//       },
//       category: {
//         type: DataTypes.STRING(255),
//         allowNull: true,
//       },
//       subject: {
//         type: DataTypes.STRING(255),
//         allowNull: true,
//       },
//       attachmentUrls: {
//         type: DataTypes.ARRAY(DataTypes.STRING),
//         allowNull: true,
//         defaultValue: [],
//       },
//       thumbnailUrl: {
//         type: DataTypes.STRING,
//         allowNull: true,
//       },
//       introVideoUrl: {
//         type: DataTypes.STRING,
//         allowNull: true,
//       },
//       created_at: {
//         type: DataTypes.DATE,
//         allowNull: false,
//         defaultValue: DataTypes.NOW,
//       },
//       updated_at: {
//         type: DataTypes.DATE,
//         allowNull: false,
//         defaultValue: DataTypes.NOW,
//       },
//     },
//     {
//       sequelize,
//       modelName: "Course",
//       tableName: "courses",
//       timestamps: true,
//       underscored: true,
//     }
//   );

//   return Course;
// };



const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Course = sequelize.define(
    "Course",
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
      slug: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true,
      },
      description: {
        type: DataTypes.TEXT,
      },
      teacher_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
    },
    {
      tableName: "courses", // Match schema.sql
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
      underscored: true,
    }
  );

  Course.associate = (models) => {
    Course.hasMany(models.Lesson, { foreignKey: "course_id", as: "lessons" });
    Course.belongsTo(models.User, { foreignKey: "teacher_id", as: "teacher" });
  };

  return Course;
};