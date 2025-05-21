// "use strict";
// const bcrypt = require("bcryptjs");

// module.exports = {
//   up: async (queryInterface) => {
//     // Seed Courses
//     await queryInterface.bulkInsert(
//       "Courses",
//       [
//         {
//           id: 7,
//           title: "Algebra 1",
//           price: 99.99,
//           createdAt: new Date(),
//           updatedAt: new Date(),
//         },
//         {
//           id: 8,
//           title: "Algebra 2",
//           price: 99.99,
//           createdAt: new Date(),
//           updatedAt: new Date(),
//         },
//         {
//           id: 9,
//           title: "Pre-Calculus",
//           price: 99.99,
//           createdAt: new Date(),
//           updatedAt: new Date(),
//         },
//         {
//           id: 10,
//           title: "Calculus",
//           price: 99.99,
//           createdAt: new Date(),
//           updatedAt: new Date(),
//         },
//         {
//           id: 11,
//           title: "Geometry & Trigonometry",
//           price: 99.99,
//           createdAt: new Date(),
//           updatedAt: new Date(),
//         },
//         {
//           id: 12,
//           title: "Statistics & Probability",
//           price: 99.99,
//           createdAt: new Date(),
//           updatedAt: new Date(),
//         },
//       ],
//       {}
//     );

//     // Seed Test User
//     const hashedPassword = await bcrypt.hash("password123", 10);
//     await queryInterface.bulkInsert(
//       "Users",
//       [
//         {
//           name: "Test Student",
//           email: "student@example.com",
//           password: hashedPassword,
//           role: "student",
//           approvalStatus: "approved",
//           createdAt: new Date(),
//           updatedAt: new Date(),
//         },
//       ],
//       {}
//     );
//   },
//   down: async (queryInterface) => {
//     await queryInterface.bulkDelete("Courses", null, {});
//     await queryInterface.bulkDelete("Users", null, {});
//   },
// };


"use strict";
const bcrypt = require("bcryptjs");

module.exports = {
  up: async (queryInterface) => {
    // Seed Courses
    await queryInterface.bulkInsert(
      "Courses",
      [
        {
          id: 7,
          title: "Algebra 1",
          price: 99.99,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 8,
          title: "Algebra 2",
          price: 99.99,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 9,
          title: "Pre-Calculus",
          price: 99.99,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 10,
          title: "Calculus",
          price: 99.99,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 11,
          title: "Geometry & Trigonometry",
          price: 99.99,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 12,
          title: "Statistics & Probability",
          price: 99.99,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      {}
    );

    // Seed Test User
    const hashedPassword = await bcrypt.hash("password123", 10);
    await queryInterface.bulkInsert(
      "Users",
      [
        {
          name: "Test Student",
          email: "student@example.com",
          password: hashedPassword,
          role: "student",
          approvalStatus: "approved",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      {}
    );
  },
  down: async (queryInterface) => {
    await queryInterface.bulkDelete("Courses", null, {});
    await queryInterface.bulkDelete("Users", null, {});
  },
};