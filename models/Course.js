
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
