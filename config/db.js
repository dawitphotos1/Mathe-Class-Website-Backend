
require("dotenv").config();
const { Sequelize } = require("sequelize");
const config = require("./config.js");

const env = process.env.NODE_ENV || "development";
const dbConfig = config[env];

// If use_env_variable is set, use that
if (dbConfig.use_env_variable) {
  var sequelize = new Sequelize(
    process.env[dbConfig.use_env_variable],
    dbConfig
  );
} else if (dbConfig.url) {
  var sequelize = new Sequelize(dbConfig.url, dbConfig);
} else {
  var sequelize = new Sequelize(
    dbConfig.database,
    dbConfig.username,
    dbConfig.password,
    dbConfig
  );
}

sequelize
  .authenticate()
  .then(() => console.log("✅ PostgreSQL connection established"))
  .catch((err) => {
    console.error("❌ Database connection failed:", err);
    process.exit(1);
  });

module.exports = sequelize;

