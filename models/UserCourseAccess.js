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


const { Model, DataTypes } = require("sequelize");

class UserCourseAccess extends Model {
  static associate(models) {
    UserCourseAccess.belongsTo(models.User, {
      foreignKey: "userId",
      as: "user",
    });
    UserCourseAccess.belongsTo(models.Course, {
      foreignKey: "courseId",
      as: "course",
    });
  }
}

const initUserCourseAccess = (sequelize) => {
  UserCourseAccess.init(
    {
      userId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        references: { model: "Users", key: "id" },
        onDelete: "CASCADE",
      },
      courseId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        references: { model: "Courses", key: "id" },
        onDelete: "CASCADE",
      },
      accessGrantedAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
      approved: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
    },
    {
      sequelize,
      modelName: "UserCourseAccess",
      tableName: "UserCourseAccess",
      timestamps: false,
    }
  );
  return UserCourseAccess;
};

module.exports = initUserCourseAccess;
