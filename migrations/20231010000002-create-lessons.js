
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("lessons", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      courseId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: "courses", key: "id" },
      },
      title: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      orderIndex: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      isUnitHeader: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      unitId: {
        type: Sequelize.INTEGER,
      },
      contentType: {
        type: Sequelize.STRING,
      },
      contentUrl: {
        type: Sequelize.STRING,
      },
      isPreview: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable("lessons");
  },
};