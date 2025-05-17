const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const User = sequelize.define(
    "User",
    {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      role: {
        type: DataTypes.ENUM("student", "teacher", "admin"),
        allowNull: false,
        defaultValue: "student",
      },
    },
    {
      tableName: "Users",
      timestamps: true,
    }
  );
  return User;
};
