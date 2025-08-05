// // models/User.js
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



module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define(
    "User",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      name: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true,
        validate: { isEmail: true },
      },
      password: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      role: {
        type: DataTypes.ENUM("student", "teacher", "admin"),
        allowNull: false,
        defaultValue: "student",
      },
      subject: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      approvalStatus: {
        type: DataTypes.ENUM("pending", "approved", "rejected"),
        allowNull: false,
        defaultValue: "pending",
        field: "approval_status",
      },
      lastLogin: {
        type: DataTypes.DATE,
        allowNull: true,
        field: "last_login",
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
        field: "created_at",
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
        field: "updated_at",
      },
    },
    {
      tableName: "users",
      timestamps: true,
      underscored: true,
    }
  );

  return User;
};
