"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("Courses", "price", {
      type: Sequelize.FLOAT,
      allowNull: true,
      defaultValue: 0.0,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("Courses", "price");
  },
};
