
"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const tableInfo = await queryInterface.describeTable("Users");

    if (tableInfo.approved) {
      console.log("🧹 Removing 'approved' column from Users table...");
      await queryInterface.removeColumn("Users", "approved");
    }
  },

  down: async (queryInterface, Sequelize) => {
    console.log("🔁 Re-adding 'approved' column to Users table...");
    await queryInterface.addColumn("Users", "approved", {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    });
  },
};
