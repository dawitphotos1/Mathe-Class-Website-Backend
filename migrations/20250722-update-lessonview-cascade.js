// "use strict";

// module.exports = {
//   async up(queryInterface, Sequelize) {
//     // Drop existing constraints (if any)
//     await queryInterface.removeConstraint(
//       "LessonViews",
//       "LessonViews_lessonId_fkey"
//     );
//     await queryInterface.removeConstraint(
//       "LessonViews",
//       "LessonViews_userId_fkey"
//     );

//     // Re-add with ON DELETE CASCADE
//     await queryInterface.addConstraint("LessonViews", {
//       fields: ["lessonId"],
//       type: "foreign key",
//       name: "LessonViews_lessonId_fkey",
//       references: {
//         table: "Lessons",
//         field: "id",
//       },
//       onDelete: "CASCADE",
//       onUpdate: "CASCADE",
//     });

//     await queryInterface.addConstraint("LessonViews", {
//       fields: ["userId"],
//       type: "foreign key",
//       name: "LessonViews_userId_fkey",
//       references: {
//         table: "Users",
//         field: "id",
//       },
//       onDelete: "CASCADE",
//       onUpdate: "CASCADE",
//     });
//   },

//   async down(queryInterface, Sequelize) {
//     // Optional: revert to non-cascading constraints (or drop entirely)
//     await queryInterface.removeConstraint(
//       "LessonViews",
//       "LessonViews_lessonId_fkey"
//     );
//     await queryInterface.removeConstraint(
//       "LessonViews",
//       "LessonViews_userId_fkey"
//     );

//     await queryInterface.addConstraint("LessonViews", {
//       fields: ["lessonId"],
//       type: "foreign key",
//       name: "LessonViews_lessonId_fkey",
//       references: {
//         table: "Lessons",
//         field: "id",
//       },
//       onDelete: "NO ACTION",
//       onUpdate: "CASCADE",
//     });

//     await queryInterface.addConstraint("LessonViews", {
//       fields: ["userId"],
//       type: "foreign key",
//       name: "LessonViews_userId_fkey",
//       references: {
//         table: "Users",
//         field: "id",
//       },
//       onDelete: "NO ACTION",
//       onUpdate: "CASCADE",
//     });
//   },
// };




"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    // Drop existing constraints (if any)
    await queryInterface.removeConstraint(
      "LessonViews",
      "LessonViews_lessonId_fkey"
    );
    await queryInterface.removeConstraint(
      "LessonViews",
      "LessonViews_userId_fkey"
    );

    // Re-add with ON DELETE CASCADE
    await queryInterface.addConstraint("LessonViews", {
      fields: ["lessonId"],
      type: "foreign key",
      name: "LessonViews_lessonId_fkey",
      references: {
        table: "Lessons",
        field: "id",
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    });

    await queryInterface.addConstraint("LessonViews", {
      fields: ["userId"],
      type: "foreign key",
      name: "LessonViews_userId_fkey",
      references: {
        table: "Users",
        field: "id",
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    });
  },

  async down(queryInterface, Sequelize) {
    // Optional: revert to non-cascading constraints (or drop entirely)
    await queryInterface.removeConstraint(
      "LessonViews",
      "LessonViews_lessonId_fkey"
    );
    await queryInterface.removeConstraint(
      "LessonViews",
      "LessonViews_userId_fkey"
    );

    await queryInterface.addConstraint("LessonViews", {
      fields: ["lessonId"],
      type: "foreign key",
      name: "LessonViews_lessonId_fkey",
      references: {
        table: "Lessons",
        field: "id",
      },
      onDelete: "NO ACTION",
      onUpdate: "CASCADE",
    });

    await queryInterface.addConstraint("LessonViews", {
      fields: ["userId"],
      type: "foreign key",
      name: "LessonViews_userId_fkey",
      references: {
        table: "Users",
        field: "id",
      },
      onDelete: "NO ACTION",
      onUpdate: "CASCADE",
    });
  },
};
