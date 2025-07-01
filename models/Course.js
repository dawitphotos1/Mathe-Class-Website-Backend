// module.exports = (sequelize, DataTypes) => {
//   const Course = sequelize.define(
//     "Course",
//     {
//       id: {
//         type: DataTypes.INTEGER,
//         primaryKey: true,
//         autoIncrement: true,
//         allowNull: false,
//       },
//       title: {
//         type: DataTypes.STRING,
//         allowNull: false,
//       },
//       slug: {
//         type: DataTypes.STRING,
//         allowNull: false,
//       },
//       description: {
//         type: DataTypes.TEXT,
//         allowNull: true,
//       },
//       price: {
//         type: DataTypes.DECIMAL(10, 2),
//         allowNull: false,
//       },
//       teacherId: {
//         type: DataTypes.INTEGER,
//         allowNull: true,
//         references: {
//           model: "Users",
//           key: "id",
//         },
//       },
//       studentCount: {
//         type: DataTypes.INTEGER,
//         allowNull: false,
//         defaultValue: 0,
//       },
//       introVideoUrl: {
//         type: DataTypes.STRING,
//         allowNull: true,
//       },
//       thumbnail: {
//         type: DataTypes.STRING,
//         allowNull: true,
//       },
//     },
//     {
//       tableName: "Courses",
//     }
//   );

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
//       as: "enrollments",
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
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    category: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    thumbnail: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    introVideoUrl: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    attachmentUrls: {
      type: DataTypes.TEXT, // Or JSONB if you're using Postgres
      allowNull: true,
    },
    teacherId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  });

  Course.associate = function (models) {
    Course.belongsTo(models.User, { as: "teacher", foreignKey: "teacherId" });
    Course.hasMany(models.Lesson, { as: "lessons", foreignKey: "courseId" });
  };

  return Course;
};
