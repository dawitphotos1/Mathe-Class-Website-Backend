
"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      // 1. First, check if the default constraint exists and remove it
      const [constraints] = await queryInterface.sequelize.query(
        `
        SELECT conname 
        FROM pg_constraint 
        WHERE conrelid = 'users'::regclass 
        AND conname LIKE '%_role_%'
      `,
        { transaction }
      );

      if (constraints.length > 0) {
        await queryInterface.sequelize.query(
          `
          ALTER TABLE users 
          ALTER COLUMN role DROP DEFAULT
        `,
          { transaction }
        );
      }

      // 2. Convert to text
      await queryInterface.sequelize.query(
        `
        ALTER TABLE users 
        ALTER COLUMN role TYPE TEXT
      `,
        { transaction }
      );

      // 3. Drop old enum
      await queryInterface.sequelize.query(
        `
        DROP TYPE IF EXISTS user_role_enum
      `,
        { transaction }
      );

      // 4. Create new enum
      await queryInterface.sequelize.query(
        `
        CREATE TYPE enum_users_role AS ENUM ('student', 'teacher', 'admin')
      `,
        { transaction }
      );

      // 5. Convert to new enum
      await queryInterface.sequelize.query(
        `
        ALTER TABLE users 
        ALTER COLUMN role TYPE enum_users_role 
        USING (
          CASE role
            WHEN 'student' THEN 'student'::enum_users_role
            WHEN 'teacher' THEN 'teacher'::enum_users_role
            WHEN 'admin' THEN 'admin'::enum_users_role
            ELSE 'student'::enum_users_role
          END
        )
      `,
        { transaction }
      );

      // 6. Add default value
      await queryInterface.sequelize.query(
        `
        ALTER TABLE users 
        ALTER COLUMN role SET DEFAULT 'student'
      `,
        { transaction }
      );

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },

  async down(queryInterface, Sequelize) {
    // Similar reverse logic
    const transaction = await queryInterface.sequelize.transaction();

    try {
      // Remove default
      await queryInterface.sequelize.query(
        `
        ALTER TABLE users 
        ALTER COLUMN role DROP DEFAULT
      `,
        { transaction }
      );

      // Convert to text
      await queryInterface.sequelize.query(
        `
        ALTER TABLE users 
        ALTER COLUMN role TYPE TEXT
      `,
        { transaction }
      );

      // Drop new enum
      await queryInterface.sequelize.query(
        `
        DROP TYPE IF EXISTS enum_users_role
      `,
        { transaction }
      );

      // Create old enum
      await queryInterface.sequelize.query(
        `
        CREATE TYPE user_role_enum AS ENUM ('student', 'teacher', 'admin')
      `,
        { transaction }
      );

      // Convert to old enum
      await queryInterface.sequelize.query(
        `
        ALTER TABLE users 
        ALTER COLUMN role TYPE user_role_enum 
        USING (
          CASE role
            WHEN 'student' THEN 'student'::user_role_enum
            WHEN 'teacher' THEN 'teacher'::user_role_enum
            WHEN 'admin' THEN 'admin'::user_role_enum
            ELSE 'student'::user_role_enum
          END
        )
      `,
        { transaction }
      );

      // Add default
      await queryInterface.sequelize.query(
        `
        ALTER TABLE users 
        ALTER COLUMN role SET DEFAULT 'student'
      `,
        { transaction }
      );

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },
};