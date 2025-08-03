
// module.exports = (sequelize, DataTypes) => {
//   const User = sequelize.define(
//     "User",
//     {
//       id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
//       name: { type: DataTypes.STRING, allowNull: false },
//       email: { type: DataTypes.STRING, allowNull: false, unique: true },
//       password: { type: DataTypes.STRING, allowNull: false },
//       role: {
//         type: DataTypes.ENUM("student", "teacher", "admin"),
//         allowNull: false,
//         defaultValue: "student",
//       },
//       subject: { type: DataTypes.STRING, allowNull: true },
//       approvalStatus: {
//         type: DataTypes.ENUM("pending", "approved", "rejected"),
//         allowNull: false,
//         defaultValue: "pending",
//       },
//       lastLogin: { type: DataTypes.DATE, allowNull: true },
//       created_at: { type: DataTypes.DATE, allowNull: false },
//       updated_at: { type: DataTypes.DATE, allowNull: false },
//       profileImage: { type: DataTypes.STRING, allowNull: true },
//     },
//     {
//       timestamps: true,
//       underscored: true,
//     }
//   );

//   User.associate = (models) => {
//     User.hasMany(models.Course, { foreignKey: "teacherId", as: "teacher" });
//     User.hasMany(models.UserCourseAccess, { foreignKey: "userId" });
//     User.hasMany(models.Lesson, { foreignKey: "userId" });
//   };

//   return User;
// };


// models/User.js
module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define(
    "User",
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      name: { type: DataTypes.STRING, allowNull: false },
      email: { type: DataTypes.STRING, allowNull: false, unique: true },
      password: { type: DataTypes.STRING, allowNull: false },
      role: {
        type: DataTypes.ENUM("student", "teacher", "admin"),
        allowNull: false,
        defaultValue: "student",
      },
      subject: { type: DataTypes.STRING, allowNull: true },
      approvalStatus: {
        type: DataTypes.ENUM("pending", "approved", "rejected"),
        allowNull: false,
        defaultValue: "pending",
      },
      lastLogin: { type: DataTypes.DATE, allowNull: true },
      profileImage: { type: DataTypes.STRING, allowNull: true },
    },
    {
      timestamps: true,
      underscored: true,
    }
  );

  User.associate = (models) => {
    User.hasMany(models.Course, { foreignKey: "teacherId", as: "teacher" });
    User.hasMany(models.UserCourseAccess, { foreignKey: "userId" });
    User.hasMany(models.Lesson, { foreignKey: "userId" });
  };

  return User;
};
