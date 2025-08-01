
require("dotenv").config();
const { Sequelize } = require("sequelize");
const config = require("./config");

const env = process.env.NODE_ENV || "development";
const dbConfig = config[env];

let sequelize;

if (dbConfig.use_env_variable && process.env[dbConfig.use_env_variable]) {
  sequelize = new Sequelize(process.env[dbConfig.use_env_variable], dbConfig);
} else if (dbConfig.url) {
  sequelize = new Sequelize(dbConfig.url, dbConfig);
} else {
  sequelize = new Sequelize(
    dbConfig.database,
    dbConfig.username,
    dbConfig.password,
    dbConfig
  );
}

// Optional: test DB connection
sequelize
  .authenticate()
  .then(() => console.log("✅ PostgreSQL connection established"))
  .catch((err) => {
    console.error("❌ Database connection failed:", err);
    process.exit(1);
  });

module.exports = sequelize;
