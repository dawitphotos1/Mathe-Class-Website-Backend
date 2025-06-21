// require("dotenv").config();

// module.exports = {
//   development: {
//     username: "mathclass",
//     password: "fullpIXDDyw9PwQB6mOqczkt4AYIWhNO",
//     database: "mathclassdb",
//     host: "dpg-d0n5a095pdvs738a7isg-a.oregon-postgres.render.com",
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
//   test: {
//     username: "mathclass",
//     password: "fullpIXDDyw9PwQB6mOqczkt4AYIWhNO",
//     database: "mathclassdb_test",
//     host: "dpg-d0n5a095pdvs738a7isg-a.oregon-postgres.render.com",
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
    // You can leave this empty or point to Neon also, or keep local config
  },
  production: {
    use_env_variable: "DATABASE_URL",
    dialect: "postgres",
    logging: false,
  
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  },
};
