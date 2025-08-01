
// module.exports = (sequelize, DataTypes) => {
//   const Course = sequelize.define(
//     "Course",
//     {
//       title: {
//         type: DataTypes.STRING,
//         allowNull: false,
//       },
//       slug: {
//         type: DataTypes.STRING,
//         allowNull: false,
//         unique: true,
//       },
//       description: {
//         type: DataTypes.TEXT,
//         allowNull: false,
//       },
//       category: {
//         type: DataTypes.STRING,
//         allowNull: false,
//       },
//       price: {
//         type: DataTypes.FLOAT,
//         defaultValue: 0,
//       },
//       materialUrl: {
//         type: DataTypes.STRING,
//         allowNull: true,
//       },
//       attachmentUrls: {
//         type: DataTypes.ARRAY(DataTypes.STRING),
//         defaultValue: [],
//       },
//       thumbnailUrl: {
//         // ✅ Renamed from "thumbnail"
//         type: DataTypes.STRING,
//         allowNull: true,
//       },
//       introVideoUrl: {
//         type: DataTypes.STRING,
//         allowNull: true,
//       },
//       teacherId: {
//         type: DataTypes.INTEGER,
//         allowNull: false,
//         references: {
//           model: "Users",
//           key: "id",
//         },
//       },
//     },
//     {
//       tableName: "Courses",
//       underscored: false,
//     }
//   );

//   Course.associate = (models) => {
//     Course.belongsTo(models.User, {
//       foreignKey: "teacherId",
//       as: "teacher",
//       onDelete: "CASCADE",
//     });

//     Course.hasMany(models.Lesson, {
//       foreignKey: "courseId",
//       as: "lessons",
//       onDelete: "CASCADE",
//       hooks: true,
//     });

//     Course.hasMany(models.UserCourseAccess, {
//       foreignKey: "courseId",
//       as: "accesses",
//       onDelete: "CASCADE",
//     });
//   };

//   return Course;
// };



module.exports = (sequelize, DataTypes) => {
  const Course = sequelize.define("Course", {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    title: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: true },
    price: { type: DataTypes.FLOAT, allowNull: false, defaultValue: 0 },
    createdBy: { type: DataTypes.INTEGER, allowNull: false }, // Teacher/Admin ID
  });

  Course.associate = (models) => {
    // A course can have many enrollments
    Course.hasMany(models.UserCourseAccess, { foreignKey: "courseId" });

    // A course belongs to a teacher or admin
    Course.belongsTo(models.User, { foreignKey: "createdBy", as: "creator" });
  };

  return Course;
};
