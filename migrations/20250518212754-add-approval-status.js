"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn("Users", "approvalStatus", {
      type: Sequelize.ENUM("pending", "approved", "rejected"),
      defaultValue: "approved",
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn("Users", "approvalStatus");
    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_Users_approvalStatus";'
    );
  },
};
