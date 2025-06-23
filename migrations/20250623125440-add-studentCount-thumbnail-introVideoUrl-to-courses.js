"use strict";

module.exports = {
  up: async (queryInterface, DataTypes) => {
    await queryInterface.addColumn("Courses", "studentCount", {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
    });
    await queryInterface.addColumn("Courses", "thumbnail", {
      type: DataTypes.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn("Courses", "introVideoUrl", {
      type: DataTypes.STRING,
      allowNull: true,
    });
  },

  down: async (queryInterface) => {
    await queryInterface.removeColumn("Courses", "studentCount");
    await queryInterface.removeColumn("Courses", "thumbnail");
    await queryInterface.removeColumn("Courses", "introVideoUrl");
  },
};
