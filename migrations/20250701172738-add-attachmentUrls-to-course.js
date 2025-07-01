"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const tableDescription = await queryInterface.describeTable("Courses");

    if (!tableDescription.attachmentUrls) {
      await queryInterface.addColumn("Courses", "attachmentUrls", {
        type: Sequelize.ARRAY(Sequelize.STRING),
        allowNull: true,
      });
    }
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn("Courses", "attachmentUrls");
  },
};
