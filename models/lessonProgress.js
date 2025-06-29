
module.exports = (sequelize, DataTypes) => {
  const LessonProgress = sequelize.define("LessonProgress", {
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    lessonId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    completed: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  });

  return LessonProgress;
};
  