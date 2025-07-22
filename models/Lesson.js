
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
        defaultValue: "text",
      },
      contentUrl: {
        type: DataTypes.STRING,
      },
      videoUrl: {
        type: DataTypes.STRING,
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
        onDelete: "CASCADE",
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
        allowNull: false,
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
      underscored: false,
    }
  );

  Lesson.associate = (models) => {
    Lesson.belongsTo(models.Course, {
      foreignKey: "courseId",
      as: "course",
      onDelete: "CASCADE",
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
