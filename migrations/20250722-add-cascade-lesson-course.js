// "use strict";

// module.exports = {
//   async up(queryInterface, Sequelize) {
//     // Remove existing FK constraint from Lessons → Courses
//     await queryInterface.removeConstraint("Lessons", "Lessons_courseId_fkey");

//     // Add new FK with ON DELETE CASCADE
//     await queryInterface.addConstraint("Lessons", {
//       fields: ["courseId"],
//       type: "foreign key",
//       name: "Lessons_courseId_fkey",
//       references: {
//         table: "Courses",
//         field: "id",
//       },
//       onDelete: "CASCADE",
//       onUpdate: "CASCADE",
//     });
//   },

//   async down(queryInterface, Sequelize) {
//     await queryInterface.removeConstraint("Lessons", "Lessons_courseId_fkey");

//     await queryInterface.addConstraint("Lessons", {
//       fields: ["courseId"],
//       type: "foreign key",
//       name: "Lessons_courseId_fkey",
//       references: {
//         table: "Courses",
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
    // Remove existing FK constraint from Lessons → Courses
    await queryInterface.removeConstraint("Lessons", "Lessons_courseId_fkey");

    // Add new FK with ON DELETE CASCADE
    await queryInterface.addConstraint("Lessons", {
      fields: ["courseId"],
      type: "foreign key",
      name: "Lessons_courseId_fkey",
      references: {
        table: "Courses",
        field: "id",
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeConstraint("Lessons", "Lessons_courseId_fkey");

    await queryInterface.addConstraint("Lessons", {
      fields: ["courseId"],
      type: "foreign key",
      name: "Lessons_courseId_fkey",
      references: {
        table: "Courses",
        field: "id",
      },
      onDelete: "NO ACTION",
      onUpdate: "CASCADE",
    });
  },
};
