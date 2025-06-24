"use strict";

module.exports = {
  up: async (queryInterface, DataTypes) => {
    const tableInfo = await queryInterface.describeTable("Courses");
    if (!tableInfo.studentCount) {
      await queryInterface.addColumn("Courses", "studentCount", {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0,
      });
    }
    if (!tableInfo.thumbnail) {
      await queryInterface.addColumn("Courses", "thumbnail", {
        type: DataTypes.STRING,
        allowNull: true,
      });
    }
    if (!tableInfo.introVideoUrl) {
      await queryInterface.addColumn("Courses", "introVideoUrl", {
        type: DataTypes.STRING,
        allowNull: true,
      });
    }
  },

  down: async (queryInterface) => {
    const tableInfo = await queryInterface.describeTable("Courses");
    if (tableInfo.studentCount) {
      await queryInterface.removeColumn("Courses", "studentCount");
    }
    if (tableInfo.thumbnail) {
      await queryInterface.removeColumn("Courses", "thumbnail");
    }
    if (tableInfo.introVideoUrl) {
      await queryInterface.removeColumn("Courses", "introVideoUrl");
    }
  },
};