const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
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
      },
      approval_status: {
        type: DataTypes.ENUM("pending", "approved", "rejected"),
        allowNull: false,
        defaultValue: "pending",
      },
      email_notification_status: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "pending",
      },
      last_login: {
        type: DataTypes.DATE,
      },
    },
    {
      tableName: "users", // lowercase, matches migration + DB
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
      underscored: true,
    }
  );

  return User;
};
