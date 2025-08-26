// models/Lesson.js
module.exports = (sequelize, DataTypes) => {
  const Lesson = sequelize.define(
    "Lesson",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      course_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      content: {
        type: DataTypes.TEXT,
      },
      content_type: {
        type: DataTypes.STRING,
        defaultValue: "text",
      },
      content_url: {
        type: DataTypes.STRING,
      },
      video_url: {
        type: DataTypes.STRING,
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
      tableName: "lessons",
      underscored: true,
      timestamps: true,
    }
  );

  return Lesson;
};
