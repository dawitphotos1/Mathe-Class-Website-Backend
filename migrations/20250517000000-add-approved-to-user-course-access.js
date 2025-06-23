// "use strict";

// module.exports = {
//   async up(queryInterface, Sequelize) {
//     await queryInterface.addColumn("UserCourseAccess", "approved", {
//       type: Sequelize.BOOLEAN,
//       defaultValue: false,
//     });
//   },

//   async down(queryInterface, Sequelize) {
//     await queryInterface.removeColumn("UserCourseAccess", "approved");
//   },
// };




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