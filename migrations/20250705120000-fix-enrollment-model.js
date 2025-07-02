// "use strict";

// module.exports = {
//   up: async (queryInterface, Sequelize) => {
//     await queryInterface.sequelize.query(`
//       ALTER TABLE "UserCourseAccess" 
//       ADD COLUMN IF NOT EXISTS "id" SERIAL PRIMARY KEY;
      
//       ALTER TABLE "UserCourseAccess" 
//       ALTER COLUMN "approved" SET DEFAULT false;
//     `);
//   },

//   down: async (queryInterface, Sequelize) => {
//     await queryInterface.sequelize.query(`
//       ALTER TABLE "UserCourseAccess" 
//       DROP COLUMN IF EXISTS "id";
//     `);
//   },
// };


"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Create new table with correct structure
    await queryInterface.sequelize.query(`
      CREATE TABLE "UserCourseAccess_new" (
        id SERIAL PRIMARY KEY,
        "userId" INTEGER NOT NULL REFERENCES "Users"(id) ON DELETE CASCADE,
        "courseId" INTEGER NOT NULL REFERENCES "Courses"(id) ON DELETE CASCADE,
        "accessGrantedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "approved" BOOLEAN NOT NULL DEFAULT false,
        UNIQUE ("userId", "courseId")
      );
    `);

    // Copy data from old table
    await queryInterface.sequelize.query(`
      INSERT INTO "UserCourseAccess_new" ("userId", "courseId", "accessGrantedAt", "approved")
      SELECT "userId", "courseId", "accessGrantedAt", COALESCE("approved", false)
      FROM "UserCourseAccess";
    `);

    // Drop old table
    await queryInterface.sequelize.query(`
      DROP TABLE "UserCourseAccess";
    `);

    // Rename new table
    await queryInterface.sequelize.query(`
      ALTER TABLE "UserCourseAccess_new" RENAME TO "UserCourseAccess";
    `);
  },

  down: async (queryInterface, Sequelize) => {
    // Reverse the process
    await queryInterface.sequelize.query(`
      CREATE TABLE "UserCourseAccess_old" (
        "userId" INTEGER NOT NULL REFERENCES "Users"(id) ON DELETE CASCADE,
        "courseId" INTEGER NOT NULL REFERENCES "Courses"(id) ON DELETE CASCADE,
        "accessGrantedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY ("userId", "courseId")
      );
    `);

    await queryInterface.sequelize.query(`
      INSERT INTO "UserCourseAccess_old" ("userId", "courseId", "accessGrantedAt")
      SELECT "userId", "courseId", "accessGrantedAt"
      FROM "UserCourseAccess";
    `);

    await queryInterface.sequelize.query(`
      DROP TABLE "UserCourseAccess";
    `);

    await queryInterface.sequelize.query(`
      ALTER TABLE "UserCourseAccess_old" RENAME TO "UserCourseAccess";
    `);
  },
};