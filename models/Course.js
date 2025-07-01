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



// module.exports = (sequelize, DataTypes) => {
//   const Course = sequelize.define("Course", {
//     title: {
//       type: DataTypes.STRING,
//       allowNull: false,
//     },
//     description: {
//       type: DataTypes.TEXT,
//       allowNull: false,
//     },
//     category: {
//       type: DataTypes.STRING,
//       allowNull: true,
//     },
//     slug: {
//       type: DataTypes.STRING,
//       unique: true,
//     },
//     thumbnail: {
//       type: DataTypes.STRING,
//     },
//     introVideoUrl: {
//       type: DataTypes.STRING,
//     },
//     teacherId: {
//       type: DataTypes.INTEGER,
//       allowNull: false,
//     },
//     attachmentUrls: {
//       type: DataTypes.TEXT, // Stored as JSON string
//       allowNull: true,
//       get() {
//         const raw = this.getDataValue("attachmentUrls");
//         return raw ? JSON.parse(raw) : [];
//       },
//       set(value) {
//         this.setDataValue("attachmentUrls", JSON.stringify(value));
//       },
//     },
//   });

//   Course.associate = (models) => {
//     Course.belongsTo(models.User, { foreignKey: "teacherId", as: "teacher" });
//     Course.hasMany(models.Lesson, { foreignKey: "courseId", as: "lessons" });
//   };

//   return Course;
// };

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
