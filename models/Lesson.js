// const { Model, DataTypes } = require("sequelize");

// module.exports = (sequelize) => {
//   class Lesson extends Model {}

//   Lesson.init(
//     {
//       id: {
//         type: DataTypes.INTEGER,
//         primaryKey: true,
//         autoIncrement: true,
//       },
//       course_id: {
//         type: DataTypes.INTEGER,
//         allowNull: false,
//         references: { model: "courses", key: "id" },
//       },
//       title: {
//         type: DataTypes.STRING(255),
//         allowNull: false,
//       },
//       content: {
//         type: DataTypes.TEXT,
//         allowNull: true,
//       },
//       content_type: {
//         type: DataTypes.STRING(255),
//         allowNull: false,
//         defaultValue: "text",
//       },
//       content_url: {
//         type: DataTypes.STRING(255),
//         allowNull: true,
//       },
//       video_url: {
//         type: DataTypes.STRING(255),
//         allowNull: true,
//       },
//       is_preview: {
//         type: DataTypes.BOOLEAN,
//         allowNull: false,
//         defaultValue: false,
//       },
//       is_unit_header: {
//         type: DataTypes.BOOLEAN,
//         allowNull: false,
//         defaultValue: false,
//       },
//       order_index: {
//         type: DataTypes.INTEGER,
//         allowNull: false,
//         defaultValue: 0,
//         field: "order_index", // ✅ ensures Sequelize maps correctly
//       },
//       unit_id: {
//         type: DataTypes.INTEGER,
//         allowNull: true,
//         references: { model: "lessons", key: "id" },
//       },
//       user_id: {
//         type: DataTypes.INTEGER,
//         allowNull: true,
//         references: { model: "users", key: "id" },
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
//       modelName: "Lesson",
//       tableName: "lessons",
//       timestamps: true,
//       underscored: true,
//     }
//   );

//   return Lesson;
// };



const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Lesson = sequelize.define(
    "Lesson",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      course_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      title: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      content: {
        type: DataTypes.TEXT,
      },
      content_type: {
        type: DataTypes.STRING(255),
        defaultValue: "text",
      },
      content_url: {
        type: DataTypes.STRING(255),
      },
      video_url: {
        type: DataTypes.STRING(255),
      },
      is_preview: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      is_unit_header: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      order_index: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      unit_id: {
        type: DataTypes.INTEGER,
      },
      user_id: {
        type: DataTypes.INTEGER,
      },
    },
    {
      tableName: "lessons", // Match schema.sql
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
      underscored: true,
    }
  );

  Lesson.associate = (models) => {
    Lesson.belongsTo(models.Course, { foreignKey: "course_id" });
    Lesson.belongsTo(models.Lesson, { foreignKey: "unit_id" });
    Lesson.belongsTo(models.User, { foreignKey: "user_id" });
  };

  return Lesson;
};