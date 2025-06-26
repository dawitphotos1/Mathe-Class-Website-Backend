
require("dotenv").config();

module.exports = {
  production: {
    use_env_variable: "DATABASE_URL",
    dialect: "postgres",
    logging: false,
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
  },
  development: {
    use_env_variable: "DATABASE_URL",
    dialect: "postgres",
    logging: true,
  },
};
