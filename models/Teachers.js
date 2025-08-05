// module.exports = (sequelize, DataTypes) => {
//   const Teachers = sequelize.define(
//     "Teachers",
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
//         type: DataTypes.STRING(191),
//         allowNull: false,
//         unique: true,
//       },
//       createdAt: {
//         type: DataTypes.DATE,
//         allowNull: false,
//       },
//       updatedAt: {
//         type: DataTypes.DATE,
//         allowNull: false,
//       },
//     },
//     {
//       tableName: "Teachers",
//     }
//   );

//   Teachers.associate = (models) => {
//     Teachers.hasMany(models.Courses, {
//       foreignKey: "teacherId",
//       as: "courses",
//     });
//   };

//   return Teachers;
// };


// models/Teachers.js

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
