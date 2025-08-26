// const { DataTypes } = require("sequelize");

// module.exports = (sequelize) => {
//   const User = sequelize.define(
//     "User",
//     {
//       id: {
//         type: DataTypes.INTEGER,
//         primaryKey: true,
//         autoIncrement: true,
//       },
//       name: {
//         type: DataTypes.STRING(255),
//         allowNull: false,
//       },
//       email: {
//         type: DataTypes.STRING(100),
//         allowNull: false,
//         unique: true,
//       },
//       password: {
//         type: DataTypes.STRING(255),
//         allowNull: false,
//       },
//       role: {
//         type: DataTypes.ENUM("student", "teacher", "admin"),
//         allowNull: false,
//         defaultValue: "student",
//       },
//       subject: {
//         type: DataTypes.STRING(255),
//       },
//       approval_status: {
//         type: DataTypes.ENUM("pending", "approved", "rejected"),
//         allowNull: false,
//         defaultValue: "pending",
//       },
//       email_notification_status: {
//         type: DataTypes.STRING,
//         allowNull: false,
//         defaultValue: "pending",
//       },
//       last_login: {
//         type: DataTypes.DATE,
//       },
//     },
//     {
//       tableName: "users", // lowercase, matches migration + DB
//       timestamps: true,
//       createdAt: "created_at",
//       updatedAt: "updated_at",
//       underscored: true,
//     }
//   );

//   return User;
// };



// models/User.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const User = sequelize.define(
  "User",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
      validate: { isEmail: true },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    role: {
      type: DataTypes.ENUM("student", "teacher", "admin"),
      defaultValue: "student",
      allowNull: false,
    },
    subject: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    approval_status: {
      type: DataTypes.ENUM("pending", "approved", "rejected"),
      defaultValue: "pending",
    },
    lastLogin: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "users",   // ✅ match your DB schema
    timestamps: false,    // ✅ using created_at / updated_at manually
    underscored: true,    // ✅ makes Sequelize use snake_case in DB
  }
);

module.exports = User;
