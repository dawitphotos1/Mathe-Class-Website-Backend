
const { Model, DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  class Teachers extends Model {
    static associate(models) {
      Teachers.hasMany(models.Course, {
        foreignKey: "teacherId",
        as: "courses",
      });
    }
  }

  Teachers.init(
    {
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true,
      },
      bio: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      expertise: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: "Teachers",
      tableName: "Teachers",
      timestamps: true,
    }
  );

  return Teachers;
};
