// const { Model, DataTypes } = require("sequelize");

// class UserCourseAccess extends Model {
//   static associate(models) {
//     UserCourseAccess.belongsTo(models.User, {
//       foreignKey: "userId",
//       as: "user",
//     });
//     UserCourseAccess.belongsTo(models.Course, {
//       foreignKey: "courseId",
//       as: "course",
//     });
//   }
// }

// const initUserCourseAccess = (sequelize) => {
//   UserCourseAccess.init(
//     {
//       userId: {
//         type: DataTypes.INTEGER,
//         primaryKey: true,
//         references: { model: "Users", key: "id" },
//         onDelete: "CASCADE",
//       },
//       courseId: {
//         type: DataTypes.INTEGER,
//         primaryKey: true,
//         references: { model: "Courses", key: "id" },
//         onDelete: "CASCADE",
//       },
//       accessGrantedAt: {
//         type: DataTypes.DATE,
//         defaultValue: DataTypes.NOW,
//       },
//       approved: {
//         type: DataTypes.BOOLEAN,
//         defaultValue: false,
//       },
//     },
//     {
//       sequelize,
//       modelName: "UserCourseAccess",
//       tableName: "UserCourseAccess",
//       timestamps: false,
//     }
//   );
//   return UserCourseAccess;
// };

// module.exports = initUserCourseAccess;




module.exports = (sequelize, DataTypes) => {
  const UserCourseAccess = sequelize.define("UserCourseAccess", {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    userId: { type: DataTypes.INTEGER, allowNull: false },
    courseId: { type: DataTypes.INTEGER, allowNull: false },
    approved: { type: DataTypes.BOOLEAN, defaultValue: false },
    accessGrantedAt: { type: DataTypes.DATE, allowNull: true },
  });

  UserCourseAccess.associate = (models) => {
    // Each enrollment belongs to one user
    UserCourseAccess.belongsTo(models.User, { foreignKey: "userId" });

    // Each enrollment belongs to one course
    UserCourseAccess.belongsTo(models.Course, { foreignKey: "courseId" });
  };

  return UserCourseAccess;
};
