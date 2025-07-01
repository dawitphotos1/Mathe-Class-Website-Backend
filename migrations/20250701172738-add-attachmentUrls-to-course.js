// "use strict";

// module.exports = {
//   async up(queryInterface, Sequelize) {
//     await queryInterface.addColumn("Courses", "attachmentUrls", {
//       type: Sequelize.ARRAY(Sequelize.STRING), // match the model definition
//       allowNull: true,
//       defaultValue: [],
//     });
//   },

//   async down(queryInterface, Sequelize) {
//     await queryInterface.removeColumn("Courses", "attachmentUrls");
//   },
// };



"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const tableDescription = await queryInterface.describeTable("Courses");

    if (!tableDescription.attachmentUrls) {
      await queryInterface.addColumn("Courses", "attachmentUrls", {
        type: Sequelize.ARRAY(Sequelize.STRING),
        allowNull: true,
      });
    }
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn("Courses", "attachmentUrls");
  },
};
