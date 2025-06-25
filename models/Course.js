
// const { Model, DataTypes } = require("sequelize");

// function generateSlug(title) {
//   return title
//     .toLowerCase()
//     .replace(/&/g, "and")
//     .replace(/[^a-z0-9\s-]/g, "")
//     .replace(/\s+/g, "-")
//     .replace(/-+/g, "-")
//     .trim();
// }

// class Course extends Model {
//   static associate(models) {
//     Course.belongsTo(models.User, {
//       foreignKey: "teacherId",
//       as: "teacher",
//     });

//     Course.belongsToMany(models.User, {
//       through: models.UserCourseAccess,
//       foreignKey: "courseId",
//       otherKey: "userId",
//     });

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
//       slug: {
//         type: DataTypes.STRING,
//         allowNull: false,
//         unique: true,
//       },
//       description: {
//         type: DataTypes.TEXT,
//         allowNull: true,
//       },
//       category: {
//         type: DataTypes.STRING,
//         allowNull: true,
//       },
//       price: {
//         type: DataTypes.DECIMAL(10, 2),
//         allowNull: false,
//         defaultValue: 0.0,
//       },
//       teacherId: {
//         type: DataTypes.INTEGER,
//         allowNull: false,
//         references: {
//           model: "Users",
//           key: "id",
//         },
//         onDelete: "SET NULL",
//       },
//       studentCount: {
//         type: DataTypes.INTEGER,
//         allowNull: true,
//         defaultValue: 0,
//       },
//       thumbnail: {
//         type: DataTypes.STRING,
//         allowNull: true,
//       },
//       introVideoUrl: {
//         type: DataTypes.STRING,
//         allowNull: true,
//       },
//     },
//     {
//       sequelize,
//       modelName: "Course",
//       tableName: "Courses",
//       timestamps: true,
//       hooks: {
//         beforeValidate: (course) => {
//           if (course.title) {
//             course.slug = generateSlug(course.title);
//           }
//         },
//       },
//     }
//   );

//   return Course;
// };




const { Model, DataTypes } = require("sequelize");

function generateSlug(title) {
  return title
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

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
        allowNull: false,
        references: {
          model: "Users",
          key: "id",
        },
        onDelete: "SET NULL",
      },
      studentCount: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0,
      },
      thumbnail: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      introVideoUrl: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: "Course",
      tableName: "Courses",
      timestamps: true,
      hooks: {
        beforeValidate: (course) => {
          if (course.title) {
            course.slug = generateSlug(course.title);
          }
        },
      },
    }
  );

  return Course;
};

module.exports = initCourse;
