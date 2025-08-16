"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("courses", "slug", {
      type: Sequelize.STRING(255),
      allowNull: false,
      unique: true,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("courses", "slug");
  },
};
