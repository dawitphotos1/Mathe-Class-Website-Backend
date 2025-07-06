
// module.exports = (sequelize, DataTypes) => {
//   const Course = sequelize.define("Course", {
//     title: {
//       type: DataTypes.STRING,
//       allowNull: false,
//     },
//     slug: {
//       type: DataTypes.STRING,
//       allowNull: false,
//       unique: true,
//     },
//     description: {
//       type: DataTypes.TEXT,
//       allowNull: false,
//     },
//     category: {
//       type: DataTypes.STRING,
//       allowNull: false,
//     },
//     price: {
//       type: DataTypes.FLOAT,
//       defaultValue: 0,
//     },
//     materialUrl: {
//       type: DataTypes.STRING,
//       allowNull: true,
//     },
//     attachmentUrls: {
//       type: DataTypes.ARRAY(DataTypes.STRING),
//       allowNull: true,
//       defaultValue: [],
//     },
//     teacherId: {
//       type: DataTypes.INTEGER,
//       allowNull: false,
//     },
//   });

//   Course.associate = (models) => {
//     Course.belongsTo(models.User, {
//       foreignKey: "teacherId",
//       as: "teacher",
//     });

//     Course.hasMany(models.Lesson, {
//       foreignKey: "courseId",
//       as: "lessons",
//     });

//     Course.hasMany(models.UserCourseAccess, {
//       foreignKey: "courseId",
//       as: "accesses",
//     });
//   };

//   return Course;
// };





module.exports = (sequelize, DataTypes) => {
  const Course = sequelize.define("Course", {
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    slug: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    category: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    price: {
      type: DataTypes.FLOAT,
      defaultValue: 0,
    },
    materialUrl: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    attachmentUrls: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      defaultValue: [],
    },
    teacherId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  });

  Course.associate = (models) => {
    Course.belongsTo(models.User, {
      foreignKey: "teacherId",
      as: "teacher",
      onDelete: "CASCADE",
    });

    Course.hasMany(models.Lesson, {
      foreignKey: "courseId",
      as: "lessons",
      onDelete: "CASCADE",
    });

    Course.hasMany(models.UserCourseAccess, {
      foreignKey: "courseId",
      as: "accesses",
      onDelete: "CASCADE",
    });
  };

  return Course;
};
