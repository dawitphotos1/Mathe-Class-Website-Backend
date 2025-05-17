"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("UserCourseAccess", {
      userId: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        allowNull: false,
        references: {
          model: "Users",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      courseId: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        allowNull: false,
        references: {
          model: "Courses",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      accessGrantedAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("UserCourseAccess");
  },
};
