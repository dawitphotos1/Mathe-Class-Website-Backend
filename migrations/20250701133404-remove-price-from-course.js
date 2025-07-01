// module.exports = {
//   up: async (queryInterface, Sequelize) => {
//     await queryInterface.removeColumn("Courses", "price");
//   },
//   down: async (queryInterface, Sequelize) => {
//     await queryInterface.addColumn("Courses", "price", {
//       type: Sequelize.DECIMAL,
//       defaultValue: 0,
//     });
//   },
// };


"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Remove 'price' column from Courses table
    return queryInterface.removeColumn("Courses", "price");
  },

  down: async (queryInterface, Sequelize) => {
    // Re-add 'price' column in case of rollback
    return queryInterface.addColumn("Courses", "price", {
      type: Sequelize.DECIMAL,
      defaultValue: 0,
    });
  },
};
