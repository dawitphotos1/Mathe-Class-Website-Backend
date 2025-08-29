// 'use strict';

// /** @type {import('sequelize-cli').Migration} */
// module.exports = {
//   async up (queryInterface, Sequelize) {
//     /**
//      * Add altering commands here.
//      *
//      * Example:
//      * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
//      */
//   },

//   async down (queryInterface, Sequelize) {
//     /**
//      * Add reverting commands here.
//      *
//      * Example:
//      * await queryInterface.dropTable('users');
//      */
//   }
// };




"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    // First update any existing data
    await queryInterface.sequelize.query(`
      ALTER TABLE users 
      ALTER COLUMN role TYPE TEXT;
    `);

    // Drop the old enum
    await queryInterface.sequelize.query(`
      DROP TYPE IF EXISTS user_role_enum;
    `);

    // Create the new enum
    await queryInterface.sequelize.query(`
      CREATE TYPE enum_users_role AS ENUM ('student', 'teacher', 'admin');
    `);

    // Update the column to use the new enum
    await queryInterface.sequelize.query(`
      ALTER TABLE users 
      ALTER COLUMN role TYPE enum_users_role USING role::enum_users_role;
    `);
  },

  async down(queryInterface, Sequelize) {
    // Reverse the process
    await queryInterface.sequelize.query(`
      ALTER TABLE users 
      ALTER COLUMN role TYPE TEXT;
    `);

    await queryInterface.sequelize.query(`
      DROP TYPE IF EXISTS enum_users_role;
    `);

    await queryInterface.sequelize.query(`
      CREATE TYPE user_role_enum AS ENUM ('student', 'teacher', 'admin');
    `);

    await queryInterface.sequelize.query(`
      ALTER TABLE users 
      ALTER COLUMN role TYPE user_role_enum USING role::user_role_enum;
    `);
  },
};