
"use strict";

module.exports = {
  async up(queryInterface, DataTypes) {
    const tableInfo = await queryInterface.describeTable("UserCourseAccess");
    if (!("approved" in tableInfo)) {
      console.log("Adding 'approved' column to UserCourseAccess...");
      await queryInterface.addColumn("UserCourseAccess", "approved", {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      });
    }
  },

  async down(queryInterface) {
    const tableInfo = await queryInterface.describeTable("UserCourseAccess");
    if ("approved" in tableInfo) {
      console.log("Removing 'approved' column from UserCourseAccess...");
      await queryInterface.removeColumn("UserCourseAccess", "approved");
    }
  },
};
