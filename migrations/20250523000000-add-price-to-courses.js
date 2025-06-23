// module.exports = {
//   up: async (queryInterface, Sequelize) => {
//     await queryInterface.addColumn("Courses", "price", {
//       type: Sequelize.DECIMAL(10, 2),
//       allowNull: false,
//       defaultValue: 0.0,
//     });
//   },
//   down: async (queryInterface) => {
//     await queryInterface.removeColumn("Courses", "price");
//   },
// };



"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn("Courses", "price", {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.0,
    });
  },

  down: async (queryInterface) => {
    await queryInterface.removeColumn("Courses", "price");
  },
};
