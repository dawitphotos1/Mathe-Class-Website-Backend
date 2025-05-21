// "use strict";

// module.exports = {
//   async up(queryInterface, Sequelize) {
//     await queryInterface.createTable("Users", {
//       id: {
//         allowNull: false,
//         autoIncrement: true,
//         primaryKey: true,
//         type: Sequelize.INTEGER,
//       },
//       email: {
//         type: Sequelize.STRING,
//         allowNull: false,
//         unique: true,
//       },
//       password: {
//         type: Sequelize.STRING,
//         allowNull: false,
//       },
//       role: {
//         type: Sequelize.ENUM("student", "teacher", "admin"),
//         allowNull: false,
//         defaultValue: "student",
//       },
//       createdAt: {
//         allowNull: false,
//         type: Sequelize.DATE,
//       },
//       updatedAt: {
//         allowNull: false,
//         type: Sequelize.DATE,
//       },
//     });

//     console.log("Checking lessons table for userId column...");
//     try {
//       const lessonTable = await queryInterface.describeTable("lessons");
//       if (!lessonTable.userId) {
//         await queryInterface.addColumn("lessons", "userId", {
//           type: Sequelize.INTEGER,
//           allowNull: true,
//           references: { model: "Users", key: "id" },
//           onDelete: "SET NULL",
//         });
//       }
//     } catch (error) {
//       console.error("Error in add-userId-to-lessons migration:", error);
//       throw error;
//     }
//   },

//   async down(queryInterface, Sequelize) {
//     await queryInterface.removeColumn("lessons", "userId");
//     await queryInterface.dropTable("Users");
//   },
// };


"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Users", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      password: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      role: {
        type: Sequelize.ENUM("student", "teacher", "admin"),
        allowNull: false,
        defaultValue: "student",
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("Users");
  },
};
