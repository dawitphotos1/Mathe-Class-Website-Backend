
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("users", "email_notification_status", {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("users", "email_notification_status");
  },
};
