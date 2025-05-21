// require("dotenv").config();

// module.exports = {
//   development: {
//     url: process.env.DATABASE_URL,
//     dialect: "postgres",
//     logging: false,
//     dialectOptions: {
//       ssl: {
//         require: true,
//         rejectUnauthorized: false,
//       },
//     },
//     pool: {
//       max: 10,
//       min: 0,
//       acquire: 30000,
//       idle: 10000,
//     },
//   },
//   production: {
//     url: process.env.DATABASE_URL,
//     dialect: "postgres",
//     logging: false,
//     dialectOptions: {
//       ssl: {
//         require: true,
//         rejectUnauthorized: false,
//       },
//     },
//     pool: {
//       max: 10,
//       min: 0,
//       acquire: 30000,
//       idle: 10000,
//     },
//   },
// };



require("dotenv").config();

module.exports = {
  development: {
    url: process.env.DATABASE_URL,
    dialect: "postgres",
    logging: false,
  },
  production: {
    url: process.env.DATABASE_URL,
    dialect: "postgres",
    logging: false,
    dialectOptions: {
      ssl: {
        require: true, // Ensure SSL is required
        rejectUnauthorized: false, // Do not reject unauthorized certificates
      },
    },
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  },
};
