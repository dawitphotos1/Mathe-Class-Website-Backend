"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("Courses", "thumbnail", {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn("Courses", "introVideoUrl", {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn("Courses", "category", {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("Courses", "thumbnail");
    await queryInterface.removeColumn("Courses", "introVideoUrl");
    await queryInterface.removeColumn("Courses", "category");
  },
};
