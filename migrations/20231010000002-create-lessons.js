
// module.exports = {
//   up: async (queryInterface, Sequelize) => {
//     await queryInterface.createTable("lessons", {
//       id: {
//         allowNull: false,
//         autoIncrement: true,
//         primaryKey: true,
//         type: Sequelize.INTEGER,
//       },
//       courseId: {
//         type: Sequelize.INTEGER,
//         allowNull: false,
//         references: { model: "courses", key: "id" },
//       },
//       title: {
//         type: Sequelize.STRING,
//         allowNull: false,
//       },
//       orderIndex: {
//         type: Sequelize.INTEGER,
//         allowNull: false,
//       },
//       isUnitHeader: {
//         type: Sequelize.BOOLEAN,
//         defaultValue: false,
//       },
//       unitId: {
//         type: Sequelize.INTEGER,
//       },
//       contentType: {
//         type: Sequelize.STRING,
//       },
//       contentUrl: {
//         type: Sequelize.STRING,
//       },
//       isPreview: {
//         type: Sequelize.BOOLEAN,
//         defaultValue: false,
//       },
//       createdAt: {
//         type: Sequelize.DATE,
//         allowNull: false,
//       },
//       updatedAt: {
//         type: Sequelize.DATE,
//         allowNull: false,
//       },
//     });
//   },
//   down: async (queryInterface) => {
//     await queryInterface.dropTable("lessons");
//   },
// };


module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("Lessons", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      courseId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: "Courses", key: "id" },
        onUpdate: "CASCADE",
      },
      title: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      content: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      contentType: {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: "text",
      },
      contentUrl: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      videoUrl: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      isPreview: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      isUnitHeader: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      orderIndex: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      unitId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: "Lessons", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: "Users", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
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
    await queryInterface.dropTable("Lessons");
  },
};