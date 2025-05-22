

require("dotenv").config();

const isProduction = process.env.NODE_ENV === "production";

module.exports = {
  [process.env.NODE_ENV || "development"]: {
    url: process.env.DATABASE_URL,
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
};
