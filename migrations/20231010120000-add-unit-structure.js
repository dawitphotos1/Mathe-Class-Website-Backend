

// File: Backend/migrations/20231010120000-add-unit-structure.js
"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const tableInfo = await queryInterface.describeTable("lessons");

    // Add isUnitHeader only if it doesn't exist
    if (!tableInfo.isUnitHeader) {
      await queryInterface.addColumn("lessons", "isUnitHeader", {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      });
    }

    // Add unitId only if it doesn't exist
    if (!tableInfo.unitId) {
      await queryInterface.addColumn("lessons", "unitId", {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: "lessons",
          key: "id",
        },
      });
    }
  },

  down: async (queryInterface, Sequelize) => {
    const table = await queryInterface.describeTable("lessons");

    // Remove isUnitHeader if it exists
    if (table.isUnitHeader) {
      await queryInterface.removeColumn("lessons", "isUnitHeader");
    }

    // Remove unitId if it exists
    if (table.unitId) {
      await queryInterface.removeColumn("lessons", "unitId");
    }
  },
};
