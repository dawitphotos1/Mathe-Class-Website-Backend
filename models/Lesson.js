
module.exports = (sequelize, DataTypes) => {
  const Lesson = sequelize.define(
    "Lesson",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      content: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      contentType: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: "text",
      },
      contentUrl: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      videoUrl: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      isPreview: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      isUnitHeader: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      orderIndex: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      courseId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "Courses",
          key: "id",
        },
      },
      unitId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: "Lessons",
          key: "id",
        },
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: "Users",
          key: "id",
        },
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
      },
    },
    {
      tableName: "Lessons",
    }
  );

  Lesson.associate = (models) => {
    Lesson.belongsTo(models.Course, {
      foreignKey: "courseId",
      as: "course",
    });
    Lesson.belongsTo(models.User, {
      foreignKey: "userId",
      as: "user",
    });
    Lesson.belongsTo(models.Lesson, {
      foreignKey: "unitId",
      as: "unitHeader",
    });

    Lesson.hasMany(models.Lesson, {
      foreignKey: "unitId",
      as: "subLessons",
    });
  };

  return Lesson;
};