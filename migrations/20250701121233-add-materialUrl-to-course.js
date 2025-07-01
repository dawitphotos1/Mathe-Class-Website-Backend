module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn("Courses", "materialUrl", {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn("Courses", "materialUrl");
  },
};
