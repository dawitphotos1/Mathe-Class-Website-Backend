"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("users", "email_notification_status", {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: "pending",
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn("users", "email_notification_status");
  },
};
