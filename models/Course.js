module.exports = (sequelize, DataTypes) => {
  const Course = sequelize.define("Course", {
    title: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: false },
    category: { type: DataTypes.STRING, allowNull: false },
    slug: { type: DataTypes.STRING, unique: true },
    thumbnail: { type: DataTypes.STRING },
    introVideoUrl: { type: DataTypes.STRING },
    teacherId: { type: DataTypes.INTEGER, allowNull: false },

    // Change from TEXT to ARRAY of STRING for attachment URLs
    attachmentUrls: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: true,
      defaultValue: [],
    },
  });

  Course.associate = (models) => {
    Course.belongsTo(models.User, { foreignKey: "teacherId", as: "teacher" });
    Course.hasMany(models.Lesson, { foreignKey: "courseId", as: "lessons" });
  };

  return Course;
};
