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
  up: async (queryInterface, DataTypes) {
    const tableInfo = await queryInterface.describeTable("Courses");
    if (!tableInfo.price) {
      await queryInterface.addColumn("Courses", "price", {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
        defaultValue: 0.00,
      });
    }
  },

  down: async (queryInterface) {
    const tableInfo = await queryInterface.describeTable("Courses");
    if (tableInfo.price) {
      await queryInterface.removeColumn("Courses", "price");
    }
  },
};