module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Comment this out or remove it if it already exists
    // await queryInterface.addColumn("Users", "name", {
    //   type: Sequelize.STRING,
    //   allowNull: false,
    //   defaultValue: "Unnamed",
    // });

    await queryInterface.addColumn("Users", "lastLogin", {
      type: Sequelize.DATE,
      allowNull: true,
    });
  },

  down: async (queryInterface, Sequelize) => {
    // await queryInterface.removeColumn("Users", "name");
    await queryInterface.removeColumn("Users", "lastLogin");
  },
};
