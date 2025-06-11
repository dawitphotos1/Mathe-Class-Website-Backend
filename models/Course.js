// const { Model, DataTypes } = require("sequelize");

// class Course extends Model {
//   static associate(models) {
//     // Belongs to a teacher (User)
//     Course.belongsTo(models.User, {
//       foreignKey: "teacherId",
//       as: "teacher",
//     });

//     // Many-to-Many: Course <-> User (students) via UserCourseAccess
//     Course.belongsToMany(models.User, {
//       through: models.UserCourseAccess,
//       foreignKey: "courseId",
//       otherKey: "userId",
//     });

//     // Course has many lessons
//     Course.hasMany(models.Lesson, {
//       foreignKey: "courseId",
//       as: "lessons",
//     });
//   }
// }

// const initCourse = (sequelize) => {
//   Course.init(
//     {
//       id: {
//         type: DataTypes.INTEGER,
//         primaryKey: true,
//         autoIncrement: true,
//         allowNull: false,
//       },
//       title: {
//         type: DataTypes.STRING,
//         allowNull: false,
//       },
//       description: {
//         type: DataTypes.TEXT,
//         allowNull: true,
//       },
//       price: {
//         type: DataTypes.DECIMAL(10, 2),
//         allowNull: false,
//         defaultValue: 0.0,
//       },
//       teacherId: {
//         type: DataTypes.INTEGER,
//         allowNull: true,
//         references: {
//           model: "Users", // fixed from "teachers" to "Users"
//           key: "id",
//         },
//         onDelete: "SET NULL",
//       },
//     },
//     {
//       sequelize,
//       modelName: "Course",
//       tableName: "Courses",
//       timestamps: true,
//     }
//   );

//   return Course;
// };

// module.exports = initCourse;



// models/Course.js
const { Model, DataTypes } = require("sequelize");

class Course extends Model {
  static associate(models) {
    Course.belongsTo(models.User, {
      foreignKey: "teacherId",
      as: "teacher",
    });

    Course.belongsToMany(models.User, {
      through: models.UserCourseAccess,
      foreignKey: "courseId",
      otherKey: "userId",
    });

    Course.hasMany(models.Lesson, {
      foreignKey: "courseId",
      as: "lessons",
    });
  }
}

const initCourse = (sequelize) => {
  Course.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      slug: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      category: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.0,
      },
      teacherId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: "Users",
          key: "id",
        },
        onDelete: "SET NULL",
      },
    },
    {
      sequelize,
      modelName: "Course",
      tableName: "Courses",
      timestamps: true,
    }
  );

  return Course;
};

module.exports = initCourse;