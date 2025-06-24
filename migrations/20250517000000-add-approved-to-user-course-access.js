
"use strict";

module.exports = {
  async up(queryInterface, DataTypes) {
    const tableInfo = await queryInterface.describeTable("UserCourseAccess");
    if (!tableInfo.approved && !tableInfo.Approved) {
      await queryInterface.addColumn("UserCourseAccess", "approved", {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: false,
      });
    }
  },

  async down(queryInterface) {
    const tableInfo = await queryInterface.describeTable("UserCourseAccess");
    if (tableInfo.approved || tableInfo.Approved) {
      await queryInterface.removeColumn("UserCourseAccess", "approved");
    }
  },
};