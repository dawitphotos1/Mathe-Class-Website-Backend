"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("users", "email_notification_status", {
      type: Sequelize.ENUM("sent", "failed"),
      defaultValue: "failed",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("users", "email_notification_status");
  },
};