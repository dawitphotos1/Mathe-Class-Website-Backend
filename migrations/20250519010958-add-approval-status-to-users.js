"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Create the enum type
    await queryInterface.sequelize.query(`
      CREATE TYPE "public"."enum_Users_approvalStatus" AS ENUM('pending', 'approved', 'rejected');
    `);

    // Add the approvalStatus column to the Users table
    await queryInterface.addColumn("Users", "approvalStatus", {
      type: Sequelize.ENUM("pending", "approved", "rejected"),
      defaultValue: "approved",
      allowNull: false,
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Drop the column first (as we cannot drop an enum type that is in use)
    await queryInterface.removeColumn("Users", "approvalStatus");

    // Drop the enum type
    await queryInterface.sequelize.query(`
      DROP TYPE IF EXISTS "public"."enum_Users_approvalStatus";
    `);
  },
};
