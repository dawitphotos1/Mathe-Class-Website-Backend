"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("Courses", "attachmentUrls", {
      type: Sequelize.ARRAY(Sequelize.STRING), // match the model definition
      allowNull: true,
      defaultValue: [],
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("Courses", "attachmentUrls");
  },
};
