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