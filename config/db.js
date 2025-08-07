
// require("dotenv").config();
// const { Sequelize } = require("sequelize");
// const config = require("./config");

// const env = process.env.NODE_ENV || "development";
// const dbConfig = config[env];

// let sequelize;

// if (dbConfig.use_env_variable && process.env[dbConfig.use_env_variable]) {
//   sequelize = new Sequelize(process.env[dbConfig.use_env_variable], dbConfig);
// } else if (dbConfig.url) {
//   sequelize = new Sequelize(dbConfig.url, dbConfig);
// } else {
//   sequelize = new Sequelize(
//     dbConfig.database,
//     dbConfig.username,
//     dbConfig.password,
//     dbConfig
//   );
// }

// // Optional: test DB connection
// sequelize
//   .authenticate()
//   .then(() => console.log("✅ PostgreSQL connection established"))
//   .catch((err) => {
//     console.error("❌ Database connection failed:", err);
//     process.exit(1);
//   });

// module.exports = sequelize;


require("dotenv").config();
const { Sequelize } = require("sequelize");

const sequelize = new Sequelize(
  process.env.DATABASE_URL ||
    "postgresql://neondb_owner:npg_txcaKvLwG34W@ep-mute-grass-a6zij8tz-pooler.us-west-2.aws.neon.tech/neondb?sslmode=require",
  {
    dialect: "postgres",
    logging: process.env.NODE_ENV === "development" ? console.log : false,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    },
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  }
);

sequelize
  .authenticate()
  .then(() => console.log("✅ PostgreSQL connection established"))
  .catch((err) => {
    console.error("❌ Database connection failed:", err);
    process.exit(1);
  });

module.exports = sequelize;