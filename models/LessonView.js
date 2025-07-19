module.exports = (sequelize, DataTypes) => {
  const LessonView = sequelize.define(
    "LessonView",
    {
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      lessonId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      viewedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      timestamps: false,
      indexes: [
        {
          unique: true,
          fields: ["userId", "lessonId"],
        },
      ],
    }
  );

  return LessonView;
};
