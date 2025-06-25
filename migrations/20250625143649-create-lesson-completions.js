// "use strict";
// module.exports = {
//   up: async (queryInterface, Sequelize) => {
//     await queryInterface.createTable("LessonCompletions", {
//       id: {
//         type: Sequelize.INTEGER,
//         primaryKey: true,
//         autoIncrement: true,
//       },
//       userId: {
//         type: Sequelize.INTEGER,
//         allowNull: false,
//       },
//       lessonId: {
//         type: Sequelize.INTEGER,
//         allowNull: false,
//       },
//       completedAt: {
//         type: Sequelize.DATE,
//         defaultValue: Sequelize.NOW,
//       },
//       createdAt: Sequelize.DATE,
//       updatedAt: Sequelize.DATE,
//     });
//   },

//   down: async (queryInterface) => {
//     await queryInterface.dropTable("LessonCompletions");
//   },
// };



"use strict";
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("LessonCompletions", {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      lessonId: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      completedAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
      createdAt: Sequelize.DATE,
      updatedAt: Sequelize.DATE,
    });
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable("LessonCompletions");
  },
};
