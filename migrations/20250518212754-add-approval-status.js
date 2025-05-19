"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Check if the ENUM type exists using a query
    const typeExists = await queryInterface.sequelize.query(
      `
      SELECT 1 FROM pg_type WHERE typname = 'enum_Users_approvalStatus';
    `,
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );

    // If the ENUM type does not exist, create it
    if (!typeExists || typeExists.length === 0) {
      await queryInterface.sequelize.query(`
        CREATE TYPE "public"."enum_Users_approvalStatus" AS ENUM('pending', 'approved', 'rejected');
      `);
    }

    // Check if the approvalStatus column exists before attempting to add it
    const tableDescription = await queryInterface.describeTable("Users");
    if (!tableDescription.hasOwnProperty("approvalStatus")) {
      // Add the approvalStatus column if it does not exist
      await queryInterface.addColumn("Users", "approvalStatus", {
        type: Sequelize.ENUM("pending", "approved", "rejected"),
        defaultValue: "approved",
      });
    }
  },

  down: async (queryInterface, Sequelize) => {
    // Remove the approvalStatus column if it exists
    const tableDescription = await queryInterface.describeTable("Users");
    if (tableDescription.hasOwnProperty("approvalStatus")) {
      await queryInterface.removeColumn("Users", "approvalStatus");
    }

    // Drop the ENUM type if it exists
    await queryInterface.sequelize.query(`
      DO $$ BEGIN
        IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_Users_approvalStatus') THEN
          DROP TYPE "public"."enum_Users_approvalStatus";
        END IF;
      END $$;
    `);
  },
};
