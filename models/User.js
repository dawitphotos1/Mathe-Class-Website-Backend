
const { Model, DataTypes } = require("sequelize");

class User extends Model {
  static associate(models) {
    // Many-to-Many: User <-> Course through UserCourseAccess
    User.belongsToMany(models.Course, {
      through: models.UserCourseAccess,
      foreignKey: "userId",
      otherKey: "courseId",
    });

    // One-to-Many: User -> UserCourseAccess (reverse access)
    User.hasMany(models.UserCourseAccess, {
      foreignKey: "userId",
      as: "enrollments", // now you can do user.getEnrollments()
    });
  }
}

const initUser = (sequelize) => {
  User.init(
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },

      name: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "Unknown",
      },

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
        defaultValue: "approved",
      },

      lastLogin: { type: DataTypes.DATE, allowNull: true },

      profileImage: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null, // or provide a default URL string if needed
      },
    },
    {
      sequelize,
      modelName: "User",
      tableName: "Users",
      timestamps: true,
    }
  );

  return User;
};

module.exports = initUser;

